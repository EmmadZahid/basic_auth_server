const authConfig  = require('./auth.config')
const dbConfig  = require('./db.config')
const emailConfig  = require('./email.config')

module.exports = {
    authConfig,
    dbConfig,
    emailConfig,
    frontEndHost: 'http://my-front-end.com'
}