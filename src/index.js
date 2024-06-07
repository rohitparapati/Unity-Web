const express = require('express');
const path = require("path");
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
    registerServiceProvider
} = require('./controller');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", renderLogin);
app.get("/signup", renderSignup);
app.post("/signup", signupUser);
app.post("/login", loginUser);
app.get('/forgot-password', renderForgotPassword);
app.post('/forgot-password', forgotPassword);
app.get('/reset-password/:token', renderResetPassword);
app.post('/reset-password', resetPassword);
app.get("/register", renderRegister);
app.post("/register", registerServiceProvider);

const port = 3002;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});