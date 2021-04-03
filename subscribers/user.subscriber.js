const eventTypes = require('./event-types')
const PubSub = require('pubsub-js');
const EmailService = require('../services/email.service')
class UserSubscriber {
    constructor() {
        PubSub.subscribe(eventTypes.user.registerViaEmail, this.onUserRegister)
    }

    async onUserRegister(event, { code, username, email }){
        let emailHtml = `Dear ${username},<br>Please click on the below link to complete your registration. <br><a href=${process.env.FRONT_END_HOST}/registerLink/${code}>Link</a>`
        await EmailService.sendEmail(email, 'Registration Link', emailHtml)
    }
}

module.exports = new UserSubscriber()