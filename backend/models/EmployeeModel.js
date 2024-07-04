//import modules
const mongoose = require('mongoose');
//import email validator module
const { isEmail } = require('validator');
//import bcrypt (password hash) module
const bcrypt = require('bcrypt');

//create mongoose's schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Employee's schema/properties in its parameter.
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
        type: String,
        unique: true,
        sparse: true
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


// fire a function before doc saved to db
employeeSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt();
    this.employee_password = await bcrypt.hash(this.employee_password, salt);
    next();
  });
  
  // static method to login user
  employeeSchema.statics.login = async function(email, password) {
    const Employee = await this.findOne({ employee_email: email });
    if (Employee) {
      const auth = await bcrypt.compare(password, Employee.employee_password);
      if (auth) {
        return Employee;
      }
      throw Error('incorrect email or password');
    }
    throw Error('incorrect email or password');
  };

//export the model
module.exports = mongoose.model('Employee', employeeSchema);
