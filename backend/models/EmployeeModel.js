//import modules
const mongoose = require('mongoose');

//create mongoose's schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Employee's schema/properties in its parameter.
const employeeSchema = new Schema({
    employee_email: {
        type: String,
        unique: true,
        match: /.+\@.+\..+/
    },
    employee_first_name: {
        type: String,
        required: true
    },
    employee_last_name: {
        type: String,
        required: true
    },
    employee_external_id: {
        type: String,
        unique: true,
        sparse: true
    },
    employee_business_phone: {
        type: String,
        match: /^[0-9]{10,15}$/
    },
    employee_mobile_phone: {
        type: String,
        match: /^[0-9]{10,15}$/
    },
    employee_password: {
        type: String,
        required: true
    },
    employee_password_token: {
        type: String
    },
    employee_roles: {
        type: String,
        required: true,
        enum: ['Admin', 'Foreman', 'Manager', 'Purchaser', 'Employee'],
        default: ['Employee']
    },
    //not mandatory but default is 'false'
    employee_isarchived: {
        type: Boolean,
        default: false
    },
    companies: {
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Company',
        default: '6683398a7b83205fd037d6c5' //'_id' for Empire CBS
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    payments: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    }]
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Employee', employeeSchema);
