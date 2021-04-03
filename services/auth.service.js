const User = require('../models/user.model')
const Role = require('../models/role.model')
const Token = require('../models/token.model')
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose')
const PubSub = require('pubsub-js');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const eventTypes = require('../subscribers/event-types')

class AuthService {
    async RegisterViaEmail(username, email) {
        const session = await mongoose.startSession()
        try {
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
            await session.withTransaction(async () => {
                let savedUser = await user.save({ session: session })
    
                let token = new Token({
                    userId: savedUser._id,
                    token: code,
                    type: 'registration'
                })
                await token.save({ session: session })
            })
    
            session.endSession()
            PubSub.publish(eventTypes.user.registerViaEmail, {code, username, email})
            
            return code
        } catch (error) {
            session.endSession()
            throw error
        }
    }

    async Register(email, password, username){
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

        return user.save()
    }

    async ConfirmRegistration(registrationKey, password, username){
        const session = await mongoose.startSession()
        try {
            let token = await Token.findOne({
                token: registrationKey
            })
    
            if (!token) {
                const error = new Error("Invalid registration key!")
                error.statusCode = 400
                throw error
                // return res.status(400).send("Invalid registration key!")
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
                const error = new Error("Registration key has expired!")
                error.statusCode = 400
                throw error
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
        } catch (error) {
            await session.abortTransaction()
            session.endSession()
            throw error
        }
    }

    async ResetPassword(email, oldPassword, newPassword){
        const user = await User.findOne({ email: email })
        if (user) {
            let isSamePassword = await bcrypt.compare(oldPassword, user.password)
            if (!isSamePassword) {
                const error = new Error("Wrong email or password")
                error.statusCode = 400
                throw error
            }
            const hashedPassword = await bcrypt.hash(newPassword, 12)
            user.password = hashedPassword
            await user.save()
        } else {
            const error = new Error("Wrong email or password")
            error.statusCode = 400
            throw error
        }
    }

    async Login(email, password){
        const user = await User.findOne({ email: email }).populate("roles")
        // console.error(user.roles.name);
        if (user) {
            let isSamePassword = await bcrypt.compare(password, user.password)
            if (!isSamePassword) {
                const error = new Error("Wrong email or password")
                error.statusCode = 400
                throw error
            }
            let token = jwt.sign({ id: user._id }, process.env.SECRET, {
                expiresIn: 86400 //24 hours
            })

            var authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
            }
            return {
                id: user._id,
                username: user.username,
                email: user.email,
                roles: authorities,
                accessToken: token
            }
        } else {
            const error = new Error("Wrong email or password")
            error.statusCode = 400
            throw error
        }
    }
}

module.exports = AuthService