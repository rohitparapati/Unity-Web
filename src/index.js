
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


app.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    // Assuming you send the userId in the query parameters or find it via the token
    const userId = req.query.userId; // Make sure to send `userId` as a query parameter or decode it from the token

    if (!userId) {
        return res.status(404).send("Invalid request, user ID is required.");
    }

    res.render('reset-password', { token, userId });
});




const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
