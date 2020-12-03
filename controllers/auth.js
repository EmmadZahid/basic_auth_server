const {validationResult} = require('express-validator')
const User = require('../models/user')
const bcrypt = require('bcryptjs')

exports.register = async (req, res, next)=>{
    try{
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            let error = new Error(errors.array()[0].msg)
            error.statusCode = 400 
            throw error
        }
        const {email, password} = req.body
    
        const foundUser = await User.findOne({email: email})
        if(foundUser){
            let error = new Error("User email already exists.")
            error.statusCode = 400 
            throw error
        } else{
            const hashedPassword = await bcrypt.hash(password, 12)
            const user = new User({
                email: email,
                password: hashedPassword
            })
    
            await user.save()
            return res.status(200).send("User created")
        }
    } catch(err){
        console.log(err)
        next(err)
    }    
}

exports.login = ()=>{

}

exports.secret = ()=>{

}