const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, ServiceProvider, Plumbing, electrical, carpentry, painting, cleaning, moving, landscaping, Roofing, Other } = require('./config');
const { sendConfirmationEmail } = require('./confirmationmail');
const { sendRegistrationEmail } = require('./registrationmail');
const nodemailer = require('nodemailer');

// In-memory store for OTPs (use Redis or MongoDB in production)
const otpStore = new Map();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || "reddyvenkatasatyasivanagendrak@gmail.com",
        pass: process.env.EMAIL_PASS || "wwjh nosu cvwo sqjz"
    }
});

const renderLogin = (req, res) => {
    res.render('login');
};

const renderSignup = (req, res) => {
    res.render('signup');
};

const signupUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send("Email already in use. Please choose a different email.");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name: username, email, password: hashedPassword });
        await newUser.save();
        sendConfirmationEmail(email, username);
        res.send("<script>alert('User created successfully, you can now login.'); window.location='/';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while creating your account.");
    }
};

const loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ name: username });
        if (!user) {
            console.log(`Failed login attempt for username: ${username}`);
            return res.status(404).send("<script>alert('Username not found. Please try again.'); window.location='/login';</script>");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            console.log(`Invalid password for username: ${username}`);
            return res.status(401).send("<script>alert('Password is incorrect. Please try again.'); window.location='/login';</script>");
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes expiry

        // Store OTP with user ID
        otpStore.set(user._id.toString(), { otp, expiry: otpExpiry });

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER || "reddyvenkatasatyasivanagendrak@gmail.com",
            to: user.email,
            subject: 'Your Login One-Time Code',
            text: `Your one-time code is ${otp}. It expires in 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${user.email}`);

        // Return user ID for OTP verification
        res.status(200).send(`<script>localStorage.setItem('userId', '${user._id}'); window.location='/verify-otp';</script>`);
    } catch (error) {
        console.error(`Error during login for ${username}:`, error);
        res.status(500).send("<script>alert('An error occurred. Please try again later.'); window.location='/login';</script>");
    }
};

const renderVerifyOtp = (req, res) => {
    res.render('verify-otp');
};

const verifyOtp = async (req, res) => {
    const { userId, otp } = req.body;
    try {
        const storedOtp = otpStore.get(userId);
        if (!storedOtp) {
            return res.status(401).send("<script>alert('Invalid or expired OTP. Please try logging in again.'); window.location='/login';</script>");
        }

        if (storedOtp.expiry < Date.now()) {
            otpStore.delete(userId);
            return res.status(401).send("<script>alert('OTP has expired. Please try logging in again.'); window.location='/login';</script>");
        }

        if (storedOtp.otp !== otp) {
            console.log(`Invalid OTP attempt for userId: ${userId}`);
            return res.status(401).send("<script>alert('Invalid OTP. Please try again.'); window.location='/verify-otp';</script>");
        }

        // OTP is valid, clean up and proceed to home
        otpStore.delete(userId);
        res.send("<script>alert('Login successful!'); window.location='/home';</script>");
    } catch (error) {
        console.error(`Error verifying OTP for userId ${userId}:`, error);
        res.status(500).send("<script>alert('An error occurred. Please try again later.'); window.location='/login';</script>");
    }
};

const renderForgotPassword = (req, res) => {
    res.render('forgot-password');
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send("User with given email does not exist.");
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const hash = await bcrypt.hash(resetToken, 10);

        user.resetPasswordToken = hash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour to expire
        await user.save();

        const resetUrl = `http://${req.headers.host}/reset-password/${resetToken}?userId=${user._id}`;

        const mailOptions = {
            from: process.env.EMAIL_USER || "reddyvenkatasatyasivanagendrak@gmail.com",
            to: email,
            subject: 'Password Reset Link',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste it into your browser to complete the process within one hour of receiving it: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
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
};

const renderResetPassword = (req, res) => {
    const { token } = req.params;
    const userId = req.query.userId;
    if (!userId) {
        return res.status(404).send("Invalid request, user ID is required.");
    }
    res.render('reset-password', { token, userId });
};

const resetPassword = async (req, res) => {
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
};

const renderRegister = (req, res) => {
    res.render('register');
};

const registerServiceProvider = async (req, res) => {
    const { businessname, email, typeofservice, availability, location, contact, experience } = req.body;
    try {
        const existingProvider = await ServiceProvider.findOne({ email });
        if (existingProvider) {
            return res.status(409).send("Email already in use. Please choose a different email.");
        }

        const newProvider = new ServiceProvider({
            businessname,
            email,
            typeofservice,
            availability,
            location,
            contact,
            experience
        });

        await newProvider.save();
        sendConfirmationEmail(email, businessname);
        res.send("<script>alert('Registered successfully'); window.location='/login';</script>");
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while registering the service provider.");
    }
};

const plumbingservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const plumbers = await Plumbing.find(filter);
        const locations = await Plumbing.distinct("Location");
        const highlyRatedPlumbers = await Plumbing.find({ rating: { $gt: 4.0 } });

        console.log(plumbers);
        res.render("plumbing", {
            plumbers: plumbers,
            locations: locations,
            selectedLocation: location,
            highlyRatedPlumbers: highlyRatedPlumbers
        });
    } catch (error) {
        console.error("Failed to fetch plumbing data:", error);
        res.status(500).send("Failed to fetch plumbing data: " + error.message);
    }
};

const electricalservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const Electric = await electrical.find(filter);
        const locations = await electrical.distinct("Location");
        const highlyRatedElectric = await electrical.find({ rating: { $gt: 4.0 } });
        console.log(Electric);
        res.render("electrical", { Electric: Electric, locations: locations, selectedLocation: location, highlyRatedElectric: highlyRatedElectric });
    } catch (error) {
        console.error("Failed to fetch electric data:", error);
        res.status(500).send("Failed to fetch electric data: " + error.message);
    }
};

const carpentryservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const carpentries = await carpentry.find(filter);
        const highlyRatedCarpentries = await carpentry.find({ Rating: { $gt: 4.0 } });
        const locations = await carpentry.distinct("Location");
        console.log(carpentries);
        res.render("carpentry", { carpentries: carpentries, highlyRatedCarpentries: highlyRatedCarpentries, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch carpentry data:", error);
        res.status(500).send("Failed to fetch carpentry data: " + error.message);
    }
};

const paintingservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const paintvalue = await painting.find(filter);
        const highlyRatedPaint = await painting.find({ rating: { $gt: 4.0 } });
        const locations = await painting.distinct("Location");
        console.log(paintvalue);
        res.render("painting", { paintvalue: paintvalue, highlyRatedPaint: highlyRatedPaint, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch painting data:", error);
        res.status(500).send("Failed to fetch painting data: " + error.message);
    }
};

const cleaningservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const cleaners = await cleaning.find(filter);
        const highlyRatedCleaners = await cleaning.find({ Rating: { $gt: 4.0 } });
        const locations = await cleaning.distinct("Location");
        console.log(cleaners);
        res.render("cleaning", { cleaners: cleaners, highlyRatedCleaners: highlyRatedCleaners, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch cleaning data:", error);
        res.status(500).send("Failed to fetch cleaning data: " + error.message);
    }
};

const movingservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const movers = await moving.find(filter);
        const highlyRatedMovers = await moving.find({ Rating: { $gt: 4.0 } });
        const locations = await moving.distinct("Location");
        console.log(movers);
        res.render("moving", { movers: movers, highlyRatedMovers: highlyRatedMovers, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch Moving data:", error);
        res.status(500).send("Failed to fetch Moving data: " + error.message);
    }
};

const landscapingservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const lands = await landscaping.find(filter);
        const highlyRatedLands = await landscaping.find({ Rating: { $gt: 4.0 } });
        const locations = await landscaping.distinct("Location");
        console.log(lands);
        res.render("landscaping", { lands: lands, highlyRatedLands: highlyRatedLands, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch LandScaping data:", error);
        res.status(500).send("Failed to fetch landscaping data: " + error.message);
    }
};

const roofingservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const roofs = await Roofing.find(filter);
        const highlyRatedRoofs = await Roofing.find({ Rating: { $gt: 4.0 } });
        const locations = await Roofing.distinct("Location");
        console.log(roofs);
        res.render("roofing", { roofs: roofs, highlyRatedRoofs: highlyRatedRoofs, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch roofing data:", error);
        res.status(500).send("Failed to fetch roofing data: " + error.message);
    }
};

const otherservices = async (req, res) => {
    const { location } = req.query;
    try {
        let filter = {};
        if (location) {
            filter.Location = location;
        }
        const others = await Other.find(filter);
        const locations = await Other.distinct("Location");
        console.log(others);
        res.render("other", { others: others, locations: locations, selectedLocation: location });
    } catch (error) {
        console.error("Failed to fetch other service data:", error);
        res.status(500).send("Failed to fetch other service data: " + error.message);
    }
};

module.exports = {
    renderLogin,
    renderSignup,
    signupUser,
    loginUser,
    renderForgotPassword,
    forgotPassword,
    renderResetPassword,
    resetPassword,
    renderRegister,
    registerServiceProvider,
    plumbingservices,
    electricalservices,
    carpentryservices,
    paintingservices,
    cleaningservices,
    movingservices,
    landscapingservices,
    roofingservices,
    otherservices,
    verifyOtp,
    renderVerifyOtp
};