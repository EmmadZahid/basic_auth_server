const mongoose = require('mongoose')
const Role = require('./role.model')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{
        type:String
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String
    },
    isRegistered:{
        type: Boolean,
        default: false,
        required: true
    },
    registrationDate:{
        type: Date
    },
    roles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Role
    }]
})

module.exports = mongoose.model('user', userSchema)