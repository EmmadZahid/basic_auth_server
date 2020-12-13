const jwt = require('jsonwebtoken')
const db = require('../models')
const authConfig = require('../config/auth.config')

const User = db.user
const Role = db.role

verifyToken = async (req, res, next) =>{
    try {
        let token = req.headers['Authorization']
        if(!token){
            let error = new Error('No token provided!')
            error.statusCode = 403
            throw error
        }

        let decodedToken = await jwt.verify(token, authConfig.secret)
        req.userId = decodedToken.id
        next()
    } catch (error) {
        next(error)
    }    
}


isAdmin = async(req, res, next)=>{
    let user = await User.find({_id: req.userId})
    let roles = await Role.find({
        _id: {$in: user.roles}
    })

    let hasAdminRole = roles.find(role => {
        return role.name == 'admin'
    })

    if(hasAdminRole){
        next()
        return
    }

    let error = new Error('Require Admin Role!')
    error.statusCode = 403
    throw error
}

isModerator = async(req, res, next)=>{
    let user = await User.find({_id: req.userId})
    let roles = await Role.find({
        _id: {$in: user.roles}
    })

    let hasModeratorRole = roles.find(role => {
        return role.name == 'moderator'
    })

    if(hasModeratorRole){
        next()
        return
    }

    let error = new Error('Require Admin Role!')
    error.statusCode = 403
    throw error
}

module.exports = {
    verifyToken,
    isAdmin,
    isModerator
}