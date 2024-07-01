//import modules
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const companyRoutes = require('./routes/companyRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const aliasRoutes = require('./routes/aliasRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const projectRoutes = require('./routes/projectRoutes');
const statusRoutes = require('./routes/statusRoutes');
const productRoutes = require('./routes/productRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
// Load the .env file
dotenv.config();

//create express app
const app = express();

//create middleware - Access to 'req' object and logs request url, request path and request method
app.use((req,res,next) => {
    console.log("Request URL:", req.url, '\n', "Request path:",req.path, '\n', "Request method:", req.method);
    next();
})

//create middleware - parse incoming requests with JSON payloads. 
//It parses the JSON string in the request body and converts it into a JavaScript object, which is then attached to the req.body property.
app.use(express.json());

//route handler
app.use('/api/company', companyRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/employee', aliasRoutes);
app.use('/api/employee', deliveryRoutes);
app.use('/api/employee', invoiceRoutes);
app.use('/api/employee', orderRoutes);
app.use('/api/employee', paymentRoutes);
app.use('/api/employee', productRoutes);
app.use('/api/employee', projectRoutes);
app.use('/api/employee', statusRoutes);
app.use('/api/employee', supplierRoutes);


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