//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Alias's schema/properties in its parameter.
const aliasSchema = new Schema({
    alias_name: {
        type: String,
        unique: true,
        required: true
    },
    alias_type: {
        type: String,
        required: true,
        enum: ['Plasterboard', 'Metal', 'Compound']
    }
}, { timestamps: true })


//export the model
module.exports = mongoose.model('Alias', aliasSchema);
