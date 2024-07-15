//import modules
const mongoose = require('mongoose');
const fs = require('fs');

// const Alias = require('./models/AliasModel'); 

// const Employee = require('./models/EmployeeModel'); 

// const Project = require('./models/ProjectModel'); 

// const Product = require('./models/ProductModel'); 

const ProductPrice = require('./models/ProductPriceModel'); 

// console.log('./models/ProductModel');

// importJsonToDB();

// Insert JSON data into MongoDB
async function importJsonToDB() {
    
    // Read JSON file containing data to import
    const jsonFilePath = './data/Data_ProductPrice.json';  
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8')); 


    ProductPrice.insertMany(jsonData)
    .then((docs) => {
        console.log('Data imported successfully:', docs);
        mongoose.connection.close(); // Close MongoDB connection after importing
    })
    .catch((error) => {
        console.error('Error importing data:', error);
        mongoose.connection.close(); // Close MongoDB connection in case of error
    });
    
  }
  