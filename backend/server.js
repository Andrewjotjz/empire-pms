//import modules
require('dotenv').config()
const express = require('express');

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

//Connect to DB - currently using JSON
app.listen(process.env.PORT, () => {
    console.log("Connected to DB. Listening to port", process.env.PORT)
});