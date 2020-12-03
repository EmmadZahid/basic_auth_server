const {validationResult} = require('express-validator')
const User = require('../models/user')


exports.signUp = async (req, res, next)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        let error = new Error(errors.array()[0].msg)
        error.statusCode = 400 
        throw error
    }
    const {email, password} = req.body

    const foundUser = await User.findOne({email: email})

    return res.status(200)
    if(foundUser){

    }
}

exports.signIn = ()=>{

}

exports.secret = ()=>{

}