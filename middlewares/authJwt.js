const jwt = require('jsonwebtoken')
const db = require('../models')
const authConfig = require('../config/auth.config')

const User = db.user
const Role = db.role

verifyToken = async (req, res, next) =>{
    try {
        let token = req.headers['authorization']
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
    try {
        let user = await User.findOne({_id: req.userId})
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
    } catch (error) {
        next(error)
    }
}

isModerator = async(req, res, next)=>{
    try {
        let user = await User.findOne({_id: req.userId})
        console.log('Roles:' , user.roles)
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
    
        let error = new Error('Require Moderator Role!')
        error.statusCode = 403
        throw error        
    } catch (error) {
        next(error)
    }
}

module.exports = {
    verifyToken,
    isAdmin,
    isModerator
}