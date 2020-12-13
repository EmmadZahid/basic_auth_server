const { validationResult } = require('express-validator')
const db = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authConfig = require('../config/auth.config')

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
            roles: [userRole._id,userRole._id]
        })

        await user.save()
        return res.status(200).send("User registered successfully!")
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