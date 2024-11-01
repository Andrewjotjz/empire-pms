//import modules
const employeeModel = require('../models/EmployeeModel');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmailServices')

//Handle employee login/signup errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email: '', password: '' };
  
    // incorrect email
    if (err.message === 'incorrect email') {
      errors.email = 'That email is not registered';
    }
  
    // incorrect password
    if (err.message === 'incorrect password') {
      errors.password = 'That password is incorrect';
    }
  
    // duplicate email error
    if (err.code === 11000) {
      errors.email = 'that email is already registered';
      return errors;
    }
  
    // validation errors
    if (err.message.includes('user validation failed')) {
      // console.log(err);
      Object.values(err.errors).forEach(({ properties }) => {
        // console.log(val);
        // console.log(properties);
        errors[properties.path] = properties.message;
      });
    }
  
    return errors;
  }
//Create json web token
const maxAge = 30 * 60; //60 minutes in seconds
// Middleware to refresh token
const refreshToken = (req, res, next) => {
    const token = req.cookies.jwt;
    
    // Check if token exists
    if (token) {
      jwt.verify(token, 'empirepms2024 secret', (err, decoded) => {
        if (err) {
          return next(); // Token is invalid or expired, proceed to next middleware
        }
        
        // Reset token expiration if the user is active
        const newToken = createToken(decoded.id); // Generate a new token
        res.cookie('jwt', newToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: maxAge * 1000 }); // Update cookie
        next(); // Continue to the next middleware or route handler
      });
    } else {
      next(); // No token found, proceed to next middleware
    }
  };
// Middleware to create token
const createToken = (id) => {
    //header&payload + secret = signature
    //user's { id } represents payload, 'empirepms2024 secret' represents secret. Use jwt's sign() to get signature. Which results in 'encoded token'.
    return jwt.sign({ id }, 'empirepms2024 secret', {
    //Then, define 'age' to Token by using 'expiresIn' attribute
    expiresIn: maxAge
  });
};

//Controller function - POST to login employee
const loginEmployee = async (req,res) => {
    //! insert comment
    const { employee_email, employee_password } = req.body;

    try {
        //! insert comment
        const Employee = await employeeModel.login(employee_email, employee_password);
        const token = createToken(Employee._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }); //in millisecond
        res.status(200).json({token, employee: Employee});
    } 
    catch (err) {
        //! insert comment
        const errors = handleErrors(err);
        res.status(400).json({errors});
    }
}

//Controller function - GET all employees
const getAllEmployees = async (req, res) => {
    //'req' object not in used
    //create a new model called Employees, await, and assign it with all employee documents in the employee collection, sort created date in descending order
    const Employees = await employeeModel.find({}).populate('projects').sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Employees);
}

//Controller function - GET single employee
const getSingleEmployee = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request EMPLOYEE ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Employee, await, and assign it with the employee document, which can be found in the employee collection, find using ID
    const Employee = await employeeModel.findById(id).populate('projects').populate('companies')

    //check if there's 'null' or 'undefined' in 'Employee'.
    if (!Employee) {
        //if Employee doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such employee"})
    }
    else {
        //if Employee does exists, pass relevant data to 'res' object method
        res.status(200).json(Employee)
    }
}

//Controller function - POST to create a new employee
const createNewEmployee = async (req, res) => {
    //retrieve incoming request (along with new Employee object) by using 'req' object property 'body', which stores new employee object.
    //destructure all relevant attributes in new Employee object
    const { employee_email, employee_first_name, employee_last_name, employee_external_id, employee_business_phone, employee_mobile_phone,
        employee_password, employee_roles, employee_isarchived, companies, projects, payments, employee_password_token, employee_reset_token_expires } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Employee = await employeeModel.create({ employee_email, employee_first_name, employee_last_name, employee_external_id, employee_business_phone, employee_mobile_phone,
            employee_password, employee_password_token, employee_roles, employee_isarchived, companies, projects, payments, employee_password_token, employee_reset_token_expires })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Employee)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}

//Controller function - PUT to update a single employee
const updateSingleEmployee = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such employee."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Employee = await employeeModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Employee'.
    if (!Employee) {
        //if Employee doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such employee"});
    }
    else {
        //if Employee does exists, pass new Employee object to 'res' object method
        res.status(200).json(Employee);
    }
}

// Controller function - PUT to change employee password
const changeEmployeePassword = async (req, res) => {
    // Retrieve incoming request id and new password
    const { id } = req.params;
    const { employee_password } = req.body;

    // Check if the ID object exists in MongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "Invalid employee ID." });
    }

    try {
        const employee = await employeeModel.findById(id);

        if (!employee) {
            return res.status(404).json({ msg: "Employee not found." });
        }

        employee.employee_password = employee_password; // Set the new password directly
        await employee.save(); // This will trigger the pre-save middleware

        res.status(200).json({ msg: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Controller function - DELETE to delete a single employee
const deleteSingleEmployee = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request EMPLOYEE ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Employee, await for database operation, which is find Company document and delete using id (as param)
    const Employee = await employeeModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Employee'.
    if (!Employee) {
        //if Employee doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such employee"});
    }
    else {
        //if Employee does exists, pass relevant data to 'res' object method
        res.status(200).json(Employee)
    }
}

// POST send password reset email
const sendPasswordResetEmail = async (req, res) => {
    const { id } = req.params;

    try {
        const employee = await employeeModel.findById(id);

        if (!employee) { return res.status(404).json({ error: 'Employee not found' }); }

        if (employee.employee_email === "andrewjot1998@gmail.com" || employee.employee_email === "shannon.c@empirecbs.com" ) {
            const resetToken = crypto.randomBytes(32).toString('hex');

            employee.employee_password_token = resetToken;

            employee.employee_reset_token_expires = Date.now() + 3600000; // 1 hour

            await employee.save();

            const resetUrl = `https://empirecbs.onrender.com/EmpirePMS/employee/reset-password?token=${resetToken}&id=${id}`;

            const message = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .email-container {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        border: 1px solid #e0e0e0;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .email-header {
                        background-color: #090a1f;
                        padding: 20px;
                        text-align: center;
                        color: #f7f2f2;
                    }
                    .email-header img {
                        max-width: 120px;
                        margin-bottom: 20px;
                    }
                    .email-body {
                        padding: 20px;
                        background-color: #ffffff;
                    }
                    .email-body p {
                        margin: 10px 0;
                    }
                    .email-footer {
                        background-color: #f4f4f4;
                        padding: 10px;
                        text-align: center;
                        font-size: 12px;
                        color: #999;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        margin: 20px 0;
                        font-size: 16px;
                        color: #ffffff;
                        background-color: #090a1f;
                        text-decoration: none;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                    }
                    .button:hover {
                        background-color: #161c33;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <img src="https://via.placeholder.com/120" alt="Company Logo">
                        <h1>EmpirePMS</h1>
                    </div>
                    <div class="email-body">
                        <p>Dear ${employee.employee_first_name} ${employee.employee_last_name},</p>
                        <p>We have received a request to reset the password for your account associated with this email address. Please click the button below to reset your password:</p>
                        <p style="text-align: center;"><a href="${resetUrl}" class="button">Reset Password</a></p>
                        <p>This link will expire in one hour. If you did not request a password reset, please ignore this email or contact IT support immediately.</p>
                        <p>Thank you,</p>
                        <p>IT Administrator<br>EMPIRE COMMERCIAL BUILDINGS SOLUTIONS PTY LTD<br>20 Trade Place, Vermont 3133<br>P: 03 7076 2666</p>
                    </div>
                    <div class="email-footer">
                        <p>&copy; ${new Date().getFullYear()} EmpirePMS. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `;

            await sendEmail(employee.employee_email, 'Password Reset Request', message);

            res.status(200).json({ msg: 'Password reset email sent' });
        }
        else {
            throw new Error('Target email address is not secured. Please contact Andrew Jot')
        }
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// POST reset employee's password
const resetEmployeePassword = async (req, res) => {
    const { token, id, newPassword } = req.body;

    try {
        const employee = await employeeModel.findOne({
            _id: id,
            employee_password_token: token,
            employee_reset_token_expires: { $gt: Date.now() }
        });

        if (!employee) {
            return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
        }

        employee.employee_password = newPassword; // Set the new password directly
        employee.employee_password_token = undefined;
        employee.employee_reset_token_expires = undefined;

        await employee.save(); // This will trigger the pre-save middleware

        res.status(200).json({ message: 'Password has been reset' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

//Controller function - GET to logout employee
const logoutEmployee = (req,res) => {
    //replace json web token (1st param), with another empty cookie (2nd param), and set the maxAge to 1 millisecond.
    res.cookie('jwt', '', { maxAge: 1 });
    //after log out, redirect user to login page
    // res.redirect('/');
    res.json({msg: "This employee has successfully logged out"})
    console.log("Employee successfully logged out.")
}



//export controller module
module.exports = { getAllEmployees, getSingleEmployee, createNewEmployee, updateSingleEmployee, changeEmployeePassword, deleteSingleEmployee, loginEmployee, logoutEmployee, sendPasswordResetEmail, resetEmployeePassword, refreshToken };