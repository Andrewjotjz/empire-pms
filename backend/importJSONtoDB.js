//import modules
const mongoose = require('mongoose');
const fs = require('fs');
const Alias = require('./models/AliasModel'); 

// Insert JSON data into MongoDB
async function importJsonToDb() {
    
    // Read JSON file containing data to import
    const jsonFilePath = './data/Data_Alias.json';  
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8')); 


    Alias.insertMany(jsonData)
    .then((docs) => {
        console.log('Data imported successfully:', docs);
        mongoose.connection.close(); // Close MongoDB connection after importing
    })
    .catch((error) => {
        console.error('Error importing data:', error);
        mongoose.connection.close(); // Close MongoDB connection in case of error
    });
    
  }


