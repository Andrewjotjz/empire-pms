//import modules
const dotenv = require('dotenv');
// Load the .env file first
dotenv.config();
// Load the .env.local file
dotenv.config({ path: '.env.local' });

const express = require('express');
const mongoose = require('mongoose');
const companyRoutes = require('./routes/companyRoutes');

//create express app
const app = express();


//create middleware - Access to 'req' object and logs request url, request path and request method
app.use((req,res,next) => {
    console.log("Request URL:", req.url, '\n', "Request path:",req.path, '\n', "Request method:", req.method);
    next();
})

//create middleware -  parse incoming requests with JSON payloads. 
//It parses the JSON string in the request body and converts it into a JavaScript object, which is then attached to the req.body property.
app.use(express.json());

//route handler
app.use('/api/company', companyRoutes);


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