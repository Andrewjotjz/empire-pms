//import modules
const nodemailer = require('nodemailer');

// send email function
const sendEmail = (email, subject, message) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'joojoe15@gmail.com',
            pass: "dhce cqxb cpfj dhhx"
        }
    });

    const mailOptions = {
        from: 'joojoe15@gmail.com',
        to: email,
        subject: subject,
        html: message
    };

    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;