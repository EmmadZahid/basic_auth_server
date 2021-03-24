const fs = require('fs')
const path = require('path')
var sendgridApiKey = '', fromEmail = ''
console.log("Reading file");
let fileData = null


try {
    fileData = fs.readFileSync(path.join(__dirname, '../keys.txt'), { encoding: 'utf-8' })
    let dataLines = fileData.split('\r')
    let keys = {}
    for (let line of dataLines) {
        let keyValues = line.replace('\n', '').split('=')
        keys[keyValues[0]] = keyValues[1]
    }
    sendgridApiKey = keys['EMAIL_API_KEY']
    fromEmail = keys["FROM_EMAIL"]
} catch (err) {
    console.log(err, "Reading keys.txt failed")
}


getSendgridApiKey = () => {
    return sendgridApiKey
}

getFromEmail = () => {
    return fromEmail
}

module.exports = {
    getSendgridApiKey,
    getFromEmail
}