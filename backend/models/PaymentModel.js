//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Payment schema/properties in its parameter
const paymentSchema = new Schema({
});

//export the model
module.exports = mongoose.model('Payment', paymentSchema);