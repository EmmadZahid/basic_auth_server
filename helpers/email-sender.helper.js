const { model } = require('mongoose')
const nodemailer = require('nodemailer')
const sendgridTransporter = require('nodemailer-sendgrid-transport')
// const emailConfig = require('../config/email.config')

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: process.env.EMAIL_API_KEY
    }
}))

sendEmail = (to, subject, htmlBody) => {
    return transporter.sendMail({
        to: to,
        from: process.env.FROM_EMAIL,
        subject: subject,
        html: htmlBody
    })
}

module.exports = {
    sendEmail
}