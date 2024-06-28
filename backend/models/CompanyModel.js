//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Company's schema/properties in its parameter.
const companySchema = new Schema({
    company_name: {
        type: String,
        required: true,
        trim: true
    },
    company_abn: {
        type: String,
        unique: true,
        trim: true
    },
    company_address: {
        type: String,
        trim: true
    },
    company_business_phone: {
        type: String,
        trim: true
    },
    company_business_email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true
    },
    company_created_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Employee'
    }]
}, { timestamps: true })


//export the model
module.exports = mongoose.model('Company', companySchema);
