// Import modules
const mongoose = require('mongoose');
// Import email validator module
const { isEmail } = require('validator');
// Import bcrypt (password hash) module
const bcrypt = require('bcrypt');

// Create mongoose's schema
const Schema = mongoose.Schema;

// Create a new Schema object and define Employee's schema/properties in its parameter.
const employeeSchema = new Schema({
    employee_email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
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
        type: String
    },
    employee_business_phone: {
        type: String,
        match: [/^[0-9\s+]\d{7,15}$/, 'Please fill a valid phone number'] // E.164 format
    },
    employee_mobile_phone: {
        type: String,
        match: [/^[0-9\s+]\d{7,15}$/, 'Please fill a valid phone number'] // E.164 format
    },
    employee_password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],
    },
    employee_roles: {
        type: String,
        required: true,
        enum: ['Admin', 'Foreman', 'Manager', 'Purchaser', 'Employee'],
        default: 'Employee'
    },
    // Not mandatory but default is 'false'
    employee_isarchived: {
        type: Boolean,
        default: false
    },
    companies: [{
        required: true,
        type: Schema.Types.ObjectId,
        ref: 'Company'
    }],
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
    }],
    payments: [{
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    }],
    employee_password_token: {
        type: String,
        required: false
    },
    employee_reset_token_expires: {
        type: Date,
        required: false
    }
}, { timestamps: true });

// Fire a function before doc saved to db
employeeSchema.pre('save', async function(next) {
    if (this.isModified('employee_password')) {
        const salt = await bcrypt.genSalt();
        this.employee_password = await bcrypt.hash(this.employee_password, salt);
    }
    next();
});

// Static method to login user
employeeSchema.statics.login = async function(email, password) {
    const Employee = await this.findOne({ employee_email: email });
    if (Employee) {
        const auth = await bcrypt.compare(password, Employee.employee_password);
        if (auth) {
            return Employee;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect email');
};

// Export the model
const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);
module.exports = Employee;
