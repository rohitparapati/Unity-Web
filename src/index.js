const express = require('express');
const path = require("path");
const rateLimit = require('express-rate-limit');
const app = express();

const {
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
    verifyOtp, // New controller function for OTP verification
    renderVerifyOtp
} = require('./controller');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Rate limiter: max 5 login attempts per minute per IP
const loginLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many login attempts, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply rate limiter to login endpoint
app.get("/", renderLogin);
app.get("/signup", renderSignup);
app.post("/signup", signupUser);
app.post("/login", loginLimiter, loginUser);
app.get('/forgot-password', renderForgotPassword);
app.post('/forgot-password', forgotPassword);
app.get('/reset-password/:token', renderResetPassword);
app.post('/reset-password', resetPassword);
app.get("/register", renderRegister);
app.post("/register", registerServiceProvider);
app.get("/plumbing", plumbingservices);
app.get("/electrical", electricalservices);
app.get("/carpentry", carpentryservices);
app.get("/painting", paintingservices);
app.get("/cleaning", cleaningservices);
app.get("/moving", movingservices);
app.get("/landscaping", landscapingservices);
app.get("/roofing", roofingservices);
app.get("/other", otherservices);

app.get("/login", renderLogin);
app.get("/home", (req, res) => {
    res.render('home');
});

// New endpoint for OTP verification
app.get("/verify-otp", renderVerifyOtp); // Render OTP verification page
app.post("/verify-otp", verifyOtp);

const port = 3002;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});