const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

const app = express()
const usersRouter = require('./routes/users')

//Middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())

//Routes
app.use('/user', usersRouter)

//Erro handling
app.use((err, req, res, next)=>{
    const statusCode = error.statusCode || 500
    
    res.status(statusCode).json({
        message: error.message,
        data: error.data
    })
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
