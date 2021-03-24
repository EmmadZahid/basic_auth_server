const { validationResult } = require('express-validator')
const moment = require('moment')
const { v4: uuidv4 } = require('uuid');
const db = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {authConfig, frontEndHost} = require('../config')
const {emailSenderHelper} = require('../helpers')

const User = db.user
const Role = db.role

exports.register = async (req, res, next) => {
    try {
        const { email, password, username } = req.body
        const hashedPassword = await bcrypt.hash(password, 12)

        let userRole = await Role.findOne({
            name: 'user'
        })

        const user = new User({
            email: email,
            password: hashedPassword,
            username: username,
            roles: [userRole._id],
            isRegistered: true,
            registrationDate: new Date()
        })

        await user.save()
        return res.status(200).send("User registered successfully!")
    } catch (err) {
        console.log(err)
        next(err)
    }
}

exports.registerViaEmail = async (req, res, next) => {
    try {
        const { email, username } = req.body
        
        let userRole = await Role.findOne({
            name: 'user'
        })

        let regKey = uuidv4()
        const user = new User({
            email: email,
            username: username,
            isRegistered: false,
            registrationKey: regKey,
            registrationDate: new Date(),
            roles: [userRole._id]
        })

        await user.save()
        res.status(200).send(regKey)
        let emailHtml = `Dear ${username},<br>Please click on the below link to complete your registration. <br><a href=${frontEndHost}/registerLink/${regKey}>Link</a>`
        await emailSenderHelper.sendEmail(email, 'Registration Link', emailHtml)
    } catch (err) {
        console.log(err)
        next(err)
    }
}

exports.confirmRegistration = async (req, res, next) => {
    try {
        const { registrationKey, password } = req.body
        
        let user = await User.findOne({
            registrationKey: registrationKey
        })

        if(!user){
            return res.status(400).send("Invalid registration key!")
        } else if(!user.registrationDate || moment(new Date()).diff(moment(user.registrationDate), 'minutes') > (24 * 60)){   //key is valid for 24 hours only
            await User.deleteOne({
                registrationKey: registrationKey
            })
            return res.status(400).send("Registration key has expired!")
        }

        user.isRegistered = true
        user.password = await bcrypt.hash(password, 12)
        user.registrationDate = new Date()
        user.registrationKey = null

        await user.save()
        return res.status(200).send("Registration successfull!")
    } catch (err) {
        console.log(err)
        next(err)
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        const user = await User.findOne({ email: email }).populate("roles")
        console.error(user.roles.name);
        if (user) {
            let isSamePassword = await bcrypt.compare(password, user.password)
            if (!isSamePassword) {
                return res.status(400).send('Wrong email or password')
            }
            let token = jwt.sign({ id: user._id }, authConfig.secret, {
                expiresIn: 86400 //24 hours
            })

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            res.status(200).send({
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token
            });
        } else {
            return res.status(400).send('Wrong email or password')
        }
    } catch (error) {
        next(error)
    }

}

exports.secret = () => {

}