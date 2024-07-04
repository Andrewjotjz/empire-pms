//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Project's contact schema/properties in its parameter.
const projectContactSchema = new Schema({
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

//create a new Schema object, and define Project's schema/properties in its parameter.
const projectSchema = new Schema({
    project_name: {
        type: String,
        required: true
    },
    project_contacts: {
        type: [projectContactSchema],
        validate: [arrayLimit, '{PATH} exceeds the limit of 5'] // Example validation
    },
    project_address: {
        type: String,
        required: true
    },
    project_isarchived: {
        type: Boolean,
        default: false
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    }],
    suppliers: [{
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    }]
}, { timestamps: true });

// Custom validation function for array limit
function arrayLimit(val) {
    return val.length <= 5;
}

//export the model
module.exports = mongoose.model('Project', projectSchema);
