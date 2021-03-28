const moment = require('moment')
const { v4: uuidv4 } = require('uuid');
const db = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { authConfig, frontEndHost } = require('../config')
const { emailSenderHelper } = require('../helpers');
const mongoose = require('mongoose')

const User = db.user
const Role = db.role
const Token = db.token

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
    const session = await mongoose.startSession()
    try {
        const { email, username } = req.body

        let userRole = await Role.findOne({
            name: 'user'
        })

        let code = uuidv4()
        const user = new User({
            email: email,
            username: username,
            isRegistered: false,
            registrationDate: new Date(),
            roles: [userRole._id]
        })

        //Using transaction way #1
        await session.withTransaction(async()=>{
            let savedUser = await user.save({session: session})
            
            let token = new Token({
                userId: savedUser._id,
                token: code,
                type: 'registration'
            })
            await token.save({session: session})
        })
    
        session.endSession()
        res.status(200).send(code)
        let emailHtml = `Dear ${username},<br>Please click on the below link to complete your registration. <br><a href=${frontEndHost}/registerLink/${code}>Link</a>`
        await emailSenderHelper.sendEmail(email, 'Registration Link', emailHtml)
    } catch (err) {
        session.endSession()
        console.log(err)
        next(err)
    }
}

exports.confirmRegistration = async (req, res, next) => {
    const session = await mongoose.startSession()
    try {
        const { registrationKey, password, username } = req.body

        let token = await Token.findOne({
            token: registrationKey
        })

        if (!token) {
            return res.status(400).send("Invalid registration key!")
        } else if (!token.createdDate || moment(new Date()).diff(moment(token.createdDate), 'minutes') > (24 * 60)) {   //key is valid for 24 hours only
            session.startTransaction()
            await Token.deleteOne({
                token: registrationKey
            }).session(session)
            await User.deleteOne({
                _id: token.userId
            }).session(session)

            session.commitTransaction()
            session.endSession()
            return res.status(400).send("Registration key has expired!")
        }
        
        let user = await User.findOne({_id: token.userId})

        user.username = username
        user.isRegistered = true
        user.password = await bcrypt.hash(password, 12)

        //Using transaction way #2
        session.startTransaction()
        await user.save({session: session})

        await Token.deleteOne({
            token: registrationKey
        }).session(session)

        session.commitTransaction()
        session.endSession()

        return res.status(200).send("Registration successfull!")
    } catch (err) {
        await session.abortTransaction()
        session.endSession()
        console.log(err)
        next(err)
    }
}

exports.resetPassword = async (req, res, next) => {
    try {
        const { email, oldPassword, newPassword } = req.body

        const user = await User.findOne({ email: email })
        if (user) {
            let isSamePassword = await bcrypt.compare(oldPassword, user.password)
            if (!isSamePassword) {
                return res.status(400).send('Wrong email or password')
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12)
            user.password = hashedPassword
            await user.save()

            return res.status(200).send("Password changed successfully!");
        } else {
            return res.status(400).send('Wrong email or password!')
        }
    } catch (error) {
        next(error)
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