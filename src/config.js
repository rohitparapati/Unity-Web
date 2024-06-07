const express = require('express');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://rgangineni:ravalihema@practicecluster.b6bg5cq.mongodb.net/Node-API?retryWrites=true&w=majority&appName=PracticeCluster")
.then(() => {
    console.log("Connected to database");
})
.catch((err) =>{
    console.error("Connection failed", err);
});

// Define Molecule Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetPasswordToken: String,  // Token used for resetting password
    resetPasswordExpires: Date   // Expiry date of the reset token
});


const serviceProviderSchema = new mongoose.Schema({
    businessname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    typeofservice: { type: String, required: true },  // changed field name to typeofservice
    availability: { type: String, required: true },
    location: { type: String, required: true },
    contact: { type: Number, required: true },
    experience: { type: Number, required: true }
});

const PlumbingSchema = new mongoose.Schema({
    BusinessName: String,
    Email: String,
    Availability: String,
    Location: String,
    Contact: String,
    Rating: String
}, {
    collection: 'plumbing'
});


const ElectricalSchema = new mongoose.Schema({
    BusinessName: String,
    Email: String,
    Contact: String,
    Location: String,
    Availability: String,
    Serviceinfo: String,
    rating:String
}, {
    collection: 'electrical'
});

// Create models
const User = mongoose.model("User", UserSchema);
const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);
const Plumbing = mongoose.model('Plumbing', PlumbingSchema);
const electrical = mongoose.model('electrical', ElectricalSchema);

module.exports = { User, ServiceProvider, Plumbing, electrical };