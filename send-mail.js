const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = function sendEmail({to, text}){
    const msg = {
        to,
        from: 'inabr.arm@gmail.com',
        subject: 'Sending with Twilio SendGrid is Fun',
        text,
    };
    return sgMail.send(msg);
}