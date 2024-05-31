const express=require('express')
const path = require("path");
const bcrypt=require('bcrypt')

const app= express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

//use EJS as the view Engine
app.set('view engine','ejs');
//static file
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("login");
});
app.get("/signup", (req, res)=>{
    res.render("signup");
});
// Add route for home page
app.get("/home", (req, res) => {
    res.render("home");
});
const port=3001;
app.listen(port, () => {
    console.log(`Server Running on port: ${port}`);
})
