//import modules
const dotenv = require('dotenv');
// Load the .env file first
dotenv.config();
// Load the .env.local file
dotenv.config({ path: '.env.local' });

const express = require('express');
const mongoose = require('mongoose');

//create express app
const app = express();

//create middleware - logs request url, request path and request method
app.use((req,res,next) => {
    console.log("Request URL:", req.url, '\n', "Request path:",req.path, '\n', "Request method:", req.method);
    next();
})

//route handler
app.get('/', (req,res) => {
    const message = "Received json message from localhost " + process.env.PORT;
    res.json({msg: message})
});

//Connect to DB - currently using MongoDB
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Connected to MongoDB. Listening to port", process.env.PORT, " for request...")
        })
    })
    .catch((error) => {
        console.log(error)
    });