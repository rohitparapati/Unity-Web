const nodemailer = require('nodemailer');



// Create reusable transporter object using the default SMTP transport with added security
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "reddyvenkatasatyasivanagendrak@gmail.com" ,// Environment variable for email
        pass: "wwjh nosu cvwo sqjz"  // Environment variable for password
    },
});




const sendConfirmationEmail = (email, name) => {
    const mailOptions = {
        from: `"Your Site Name" <${process.env.EMAIL_USERNAME}>`, // sender address
        to: email, // list of receivers
        subject: 'Welcome to Our App', // Subject line
        text: `Hi ${name}, thank you for registering at our site!`, // plain text body
        html: `<b>Hi ${name},</b><br>Thank you for registering at our site!` // html body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error('Failed to send email:', error);
            return;
        }
        console.log('Message sent: %s', info.messageId);
        // Implement further actions if necessary, like logging or additional notifications
    });
}

module.exports = { sendConfirmationEmail };