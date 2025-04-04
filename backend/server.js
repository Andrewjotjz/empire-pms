//import modules
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const moment = require('moment-timezone');
const { refreshToken } = require('./controllers/employeeController')
//import routers from routes folder
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
const productTypeRoutes = require('./routes/productTypeRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productPriceRoutes = require('./routes/productPriceRoutes');
const invoiceFileRoutes = require('./routes/invoiceFileRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
//import from importJSONtoDB file
const importJSONtoDB = require('./importJSONtoDB'); 


// Load the .env file
dotenv.config();
//create express app
const app = express();
//invoke CORS
app.use(cors({
    origin: 'https://empirecbs.onrender.com',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition'], // Expose the Content-Disposition header for Download Invoice Attachment
}))
//create middleware - Access to 'req' object and logs request url, request path and request method
app.use((req,res,next) => {
    console.log("Request URL:", req.url, '\n', "Request path:",req.path, '\n', "Request method:", req.method);
    next();})
//create middleware - parse incoming requests with JSON payloads. 
//It parses the JSON string in the request body and converts it into a JavaScript object, which is then attached to the req.body property.
app.use(express.json({ limit: '50mb' })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: '50mb', extended: true })) // Increase URL-encoded form data limit
//create middleware - cookie parser
app.use(cookieParser());





//route handler
app.get('*', refreshToken); //'*' means to apply to every single route
app.use('/api/company', companyRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/alias', aliasRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/product', productRoutes);
app.use('/api/product-type', productTypeRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/productprice', productPriceRoutes);
app.use('/api/invoice-file', invoiceFileRoutes);
app.use('/api/budget', budgetRoutes);



//Connect to DB - currently using MongoDB
mongoose.connect(process.env.MONG_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log("Connected to MongoDB. Listening to port", process.env.PORT, "for request...")
        })
    })
    .catch((error) => {
        console.log(error)
    });
