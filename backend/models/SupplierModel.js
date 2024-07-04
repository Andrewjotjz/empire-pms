//import modules
const mongoose = require('mongoose');
const fs = require('fs');

//create mongoose's schema
const Schema = mongoose.Schema;


//create a new Schema object and define Supplier's contact schema/properties in its parameter.
const supplierContactSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        match: [/^[0-9\s+]\d{7,15}$/, 'Please fill a valid phone number'] // E.164 format
    },
    email: {
        type: String,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    is_primary: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Create a new Schema object and define Supplier's schema/properties in its parameter.
const supplierSchema = new Schema({
    supplier_name: {
        type: String,
        required: true
    },
    supplier_contacts: {
        type: [supplierContactSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'] // Example validation
    },
    supplier_address: {
        type: String
    },
    supplier_payment_term: {
        type: String
    },
    supplier_payment_term_description: {
        type: String
    },
    supplier_payment_method_details: {
        type: String
    },
    supplier_type: {
        type: String,
        required: true,
        enum: ['Main', 'Special', 'Others', 'Inactive'],
        default: 'Others'
    },
    supplier_isarchived: {
        type: Boolean,
        default: false
    },
    supplier_material_types: {
        type: String
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    orders: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }],
    invoices: [{
        type: Schema.Types.ObjectId,
        ref: 'Invoice'
    }]
}, { timestamps: true });

// Custom validation function for array limit
function arrayLimit(val) {
    return val.length <= 5;
}

//export the model
//module.exports = mongoose.model('Supplier', supplierSchema);

// Export the model
const Supplier = mongoose.model('Supplier', supplierSchema);
module.exports = Supplier;