const { sendConfirmationEmail } = require('./confirmationmail');
const express=require('express')
const path = require("path");
const bcrypt=require('bcrypt')
const User=require("./config");
const app= express();

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
    const existingUser = await User.findOne({ name: username });
    if (existingUser) {
        return res.status(409).send("User already exists. Please choose a different username.");
    } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name: username, email, password: hashedPassword });
        await newUser.save();
        sendConfirmationEmail(email, username);
        res.send("<script>alert('User created successfully, you can now login.'); window.location='/';</script>");
    }
});

app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ name: username });  // Use User model, not collection
        if (!user) {
            return res.status(404).send("<script>alert('Username not found. Please try again.'); window.location='/login';</script>");
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            res.render("home");  // Ensure you have a 'home.ejs' view setup
        } else {
            res.status(401).send("<script>alert('Password is incorrect. Please try again.'); window.location='/login';</script>");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('An error occurred. Please try again later.'); window.location='/login';</script>");
    }
});


const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});