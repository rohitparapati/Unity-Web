const { sendConfirmationEmail } = require('./confirmationmail');
const path = require("path");

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require("./config"); // Make sure this module exports your Mongoose User model correctly
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "reddyvenkatasatyasivanagendrak@gmail.com",
        pass: "wwjh nosu cvwo sqjz"
    }
});

app.get("/", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).send("Email already in use. Please choose a different email.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name: username, email, password: hashedPassword });
        await newUser.save();
        sendConfirmationEmail(email, username);
        console.log('sendConfirmationEmail called for:', email);
        res.send("<script>alert('User created successfully, you can now login.'); window.location='/';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while creating your account.");
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            return res.status(404).send("<script>alert('Username not found. Please try again.'); window.location='/login';</script>");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            res.render("home"); // Assuming 'home.ejs' exists and is set up correctly
        } else {
            res.status(401).send("<script>alert('Password is incorrect. Please try again.'); window.location='/login';</script>");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('An error occurred. Please try again later.'); window.location='/login';</script>");
    }
});

app.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).send("User with given email does not exist.");
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const hash = await bcrypt.hash(resetToken, 10);

        user.resetPasswordToken = hash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour to expire
        await user.save();

        // Make sure to include the userId in the reset link
        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}?userId=${user._id}`;

        const mailOptions = {
            from: process.env.EMAIL_ADDRESS, // Sender address
            to: email, // Recipient's address
            subject: 'Password Reset Link',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
                return res.status(500).send('Error sending email');
            } else {
                console.log('Email sent: ' + info.response);
                res.send('A password reset link has been sent to your email.');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while processing your request.');
    }
});


app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    // Assuming you send the userId in the query parameters or find it via the token
    const userId = req.query.userId; // Make sure to send userId as a query parameter or decode it from the token

    if (!userId) {
        return res.status(404).send("Invalid request, user ID is required.");
    }

    res.render('reset-password', { token, userId });
});


app.post('/reset-password', async (req, res) => {
    const { userId, token, password } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.error("No user found with the given ID.");
            return res.status(404).send("User not found.");
        }

        const tokenIsValid = await bcrypt.compare(token, user.resetPasswordToken);
        if (!tokenIsValid || user.resetPasswordExpires < Date.now()) {
            console.error("Token is invalid or has expired.");
            return res.status(400).send("Password reset token is invalid or has expired.");
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log("Password has been successfully updated.");
        res.send("Your password has been updated successfully.");
    } catch (error) {
        console.error("Error updating password: ", error);
        res.status(500).send("An error occurred while updating your password.");
    }
});


const port = 3002;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});