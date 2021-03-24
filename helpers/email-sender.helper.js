const { model } = require('mongoose')
const nodemailer = require('nodemailer')
const sendgridTransporter = require('nodemailer-sendgrid-transport')
const emailConfig = require('../config/email.config')

const transporter = nodemailer.createTransport(sendgridTransporter({
    auth: {
        api_key: emailConfig.getSendgridApiKey()
    }
}))

sendEmail = (to, subject, htmlBody) => {
    return transporter.sendMail({
        to: to,
        from: emailConfig.getFromEmail(),
        subject: subject,
        html: htmlBody
    })
}

module.exports = {
    sendEmail
}