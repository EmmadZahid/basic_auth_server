const mongoose = require('mongoose')
const Role = require('./role.model')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username:{
        type:String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    roles:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: Role
    }]
})

module.exports = mongoose.model('user', userSchema)