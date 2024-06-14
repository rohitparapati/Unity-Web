const nodemailer = require('nodemailer');



// Create reusable transporter object using the default SMTP transport with added security
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "reddyvenkatasatyasivanagendrak@gmail.com" ,// Environment variable for email
        pass: "wwjh nosu cvwo sqjz"  // Environment variable for password
    },
});

