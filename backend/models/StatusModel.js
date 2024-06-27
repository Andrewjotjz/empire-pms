//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Status schema/properties in its parameter
const statusSchema = new Schema({
});

//export the model
module.exports = mongoose.model('Status', statusSchema);