const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const dbconfig = require('./config/db.config')
const db = require('./models')

const app = express()
const authRouter = require('./routes/auth')

var corsOptions = {
    origin: "http://localhost:3001"
};

app.use(cors(corsOptions));
//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())

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

mongoose.connect(`mongodb://${dbconfig.HOST}:${dbconfig.PORT}/${dbconfig.DB}`).then(() => {
    initializeDbState().then(()=>{
        app.listen(port, () => {
            console.log(`Server started at ${port}`)
        })
    }, err =>{
        console.log(err)
    })
}).catch(() => {
    console.log("Error connecting db.")
})


initializeDbState = async () =>{
    let Role = db.role

    const count = await Role.estimatedDocumentCount()
    if(count == 0){
        new Role({
            name: "user"
        }).save()
        new Role({
            name: "admin"
        }).save()
        new Role({
            name: "moderator"
        }).save()
    }
}