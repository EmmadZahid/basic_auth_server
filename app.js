const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
// const {dbConfig} = require('./config')
const db = require('./models')
const path = require('path')

const app = express()
const bcrypt = require('bcryptjs')
const authRouter = require('./routes/auth.routes')
const userRouter = require('./routes/user.routes')

require('dotenv').config({path: path.join(__dirname, `.env.${process.env.NODE_ENV.trim()}`)})

var corsOptions = {
    origin: "http://localhost:3001"
};

app.use(cors(corsOptions));
//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())  // parse requests of content-type - application/json
app.use(bodyParser.urlencoded({ extended: true })); // parse requests of content-type - application/x-www-form-urlencoded
// app.use(function (req, res, next) {

//     // Website you wish to allow to connect
//     res.setHeader('Access-Control-Allow-Origin', '*');

//     // Request methods you wish to allow
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     // Pass to next layer of middleware
//     next();
// });

//Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to basic auth app." });
});

app.use('/auth', authRouter)
app.use('/user', userRouter)

//Error handling
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500

    res.status(statusCode).json({
        message: err.message,
        data: err.data
    }).send()
})


//Server
const port = process.env.PORT || 3001;

mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`).then(() => {
    initializeDbState().then(() => {
        app.listen(port, () => {
            console.log(`Server started at ${port}`)
        })
    }, err => {
        console.log(err)
    })
}).catch(() => {
    console.log("Error connecting db.")
})


initializeDbState = async () => {
    let Role = db.role
    let User = db.user

    const count = await Role.estimatedDocumentCount()
    if (count == 0) {

        let roleIds = await Role.insertMany([
            { name: "user" },
            { name: "moderator" },
            { name: "admin" },
        ])
    }

    let adminUser = await User.findOne({ email: db.adminUser.email })
    if (!adminUser) {
        const hashedPassword = await bcrypt.hash(db.adminUser.password, 12)

        let adminRole = await Role.findOne({name: 'admin'})
        db.adminUser.set('password',hashedPassword)
        db.adminUser.set('roles',[adminRole._id])

        await db.adminUser.save()
    }
}