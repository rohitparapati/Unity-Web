const nodemailer = require('nodemailer');



// Create reusable transporter object using the default SMTP transport with added security
let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "reddyvenkatasatyasivanagendrak@gmail.com" ,// Environment variable for email
        pass: "wwjh nosu cvwo sqjz"  // Environment variable for password
    },
});

const sendRegistrationEmail = (email, name) => {
    const mailOptions = {
        from: `"Unity-Web" <reddyvenkatasatyasivanagendrak@gmail.com>`, // sender address
        to: email, // list of receivers
        subject: 'Welcome to Our App', // Subject line
        text: `Hi ${name}, Thank You for your details , we will review and update`, // plain text body
        html: `<b>Hello ${name},</b><br>Thank you for providing details we will let You know` // html body
    };
    console.log('Sending email...');
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error('Failed to send email:', error);
            return;
        }
        console.log('Message sent: %s', info.messageId);
        // Implement further actions if necessary, like logging or additional notifications
    });
}

module.exports = { sendRegistrationEmail };