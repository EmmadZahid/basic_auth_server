const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()
const authRouter = require('./routes/auth')

//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Pass to next layer of middleware
    next();
});
//Routes
app.use('/auth', authRouter)

//Error handling
app.use((err, req, res, next)=>{
    const statusCode = err.statusCode || 500
    
    res.status(statusCode).json({
        message: err.message,
        data: err.data
    }).send()
})


//Server
const port = process.env.PORT || 3001;
const DB_NAME = "inventoryDB"
mongoose.connect(`mongodb://localhost:27017/${DB_NAME}`).then(()=>{
    app.listen(port, ()=>{
        console.log(`Server started at ${port}`)
    })
}).catch(()=>{
    console.log("Error connecting db.")
})
