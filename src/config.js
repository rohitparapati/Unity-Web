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
    rating: String
}, {
    collection: 'plumbing'
});


const ElectricalSchema = new mongoose.Schema({
    BussinessName: String,
    Email: String,
    Contact: String,
    Location: String,
    Availability: String,
    Serviceinfo: String,
    rating:String
}, {
    collection: 'electrical'
});
const carpentryschema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Serviceinformation: String,
    Location: String,
    Rating:String
}, {
    collection: 'carpentry'
});


const paintingschema = new mongoose.Schema({
    BussinessName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    rating:String
}, {
    collection: 'painting'
});

const cleaningschema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    Rating:String
}, {
    collection: 'cleaning'
});


const movingschema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    Rating:String
}, {
    collection: 'moving'
});


const landscapingschema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    Rating:String
}, {
    collection: 'landscaping'
});

const RoofingSchema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    Rating: String
}, {
    collection: 'roofing'
});

const OtherSchema = new mongoose.Schema({
    ServiceName: String,
    Email: String,
    Contact: String,
    Availability: String,
    Location: String,
    Rating: String
}, {
    collection: 'other'
});
// Create models
const User = mongoose.model("User", UserSchema);
const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);
const Plumbing = mongoose.model('Plumbing', PlumbingSchema);
const electrical = mongoose.model('electrical', ElectricalSchema);
const carpentry = mongoose.model('carpentry', carpentryschema);
const painting = mongoose.model('painting', paintingschema);
const cleaning = mongoose.model('cleaning', cleaningschema);
const moving = mongoose.model('moving', movingschema);
const landscaping = mongoose.model('landscaping', landscapingschema);
const Roofing = mongoose.model('Roofing', RoofingSchema);
const Other = mongoose.model('Other', OtherSchema);
module.exports = { User, ServiceProvider, Plumbing, electrical, carpentry, painting, cleaning, moving,landscaping,Roofing,Other };