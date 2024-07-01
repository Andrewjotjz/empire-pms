//import modules
const employeeModel = require('../models/employeeModel');
const mongoose = require('mongoose');

//Controller function - GET all employees
const getAllEmployees = async (req, res) => {
    //'req' object not in used
    //create a new model called Employees, await, and assign it with all employee documents in the employee collection, sort created date in descending order
    const Employees = await employeeModel.find({}).sort({createdAt: -1})
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
    const Employee = await employeeModel.findById(id)

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
    const { } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Employee = await employeeModel.create({ })
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
        //if Employee does exists, pass new Company object to 'res' object method
        res.status(200).json(Employee);
    }
}


//Controller function - DELETE to delete a single employee
const deleteSingleEmployee = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = body.params;
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

//export controller module
module.exports = { getAllEmployees, getSingleEmployee, createNewEmployee, updateSingleEmployee, deleteSingleEmployee };