const mongoose = require('mongoose')
const User = require('./user.model')
const Schema = mongoose.Schema


const tokenSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:User
    },
    token:{
        type: String,
        required: true
    },
    type:{
        type: String,
        enum: ['registration', 'password']
    },
    createdDate:{
        type: Date,
        default: Date.now,
        required: true
    }
})


module.exports = mongoose.model('token', tokenSchema)