//import modules - company model, mongoose
const companyModel = require('../models/CompanyModel');
const mongoose = require('mongoose');

//Controller function - GET all companies
//? Currently not required, perhaps in the future, an admin user can create multiple companies.
const getAllCompanies = async (req,res) => {
    //'req' object not in used
    //create a new model called Company, await, and assign it with all company documents in the company collection, sort created date in descending order
    const Company = await companyModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Company)
    }

//Controller function - GET a single company
const getSingleCompany = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    //destructure the 'id' object
    const { id } = req.params;

    //check if the ID object exists in mongoDB database
    if (!mongoose.isValidObjectId(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request COMPANY ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Company, await, and assign it with the company document, which can be found in the company collection, find using ID
    const Company = await companyModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Company'.
    if (!Company) {
        //if Company doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such company"})
    }
    else {
        //if Company does exists, pass relevant data to 'res' object method
        res.status(200).json(Company)
    }
}

//Controller function - POST a new company
const createNewCompany = async (req,res) => {
    //retrieve incoming request (along with new company object) by using 'req' object property 'body', which stores new company object.
    //destructure all relevant attributes in new company object
    const { company_name, company_abn, company_address, company_business_phone, company_business_email, company_created_date,
        employees } = req.body

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes
        const Company = await companyModel.create({ company_name, company_abn, company_address, company_business_phone, 
            company_business_email, company_created_date, employees })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Company)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}

//Controller - PUT a company for update
const updateSingleCompany = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    //destructure the 'id' object
    const { id } = req.params;

    //check if the ID object exists in mongoDB database
    if (!mongoose.isValidObjectId(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request COMPANY ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), and update with relevant data retrieved using 'req' object 'body' property.
    const Company = await companyModel.findOneAndUpdate({_id: id},{...req.body})

    //check if there's 'null' or 'undefined' in 'Company'.
    if (!Company) {
        //if Company doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such company"})
    }
    else {
        //if Company does exists, pass new Company object to 'res' object method
        res.status(200).json(Company)
    }
}

//Controller - DELETE a company 
//? Currently the whole system only has one company 'EmpireCBS', perhaps in the future, an admin can create multiple companies and delete the company if needed.
const deleteSingleCompany = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    //destructure the 'id' object
    const { id } = req.params;

    //check if the ID object exists in mongoDB database
    if (!mongoose.isValidObjectId(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request COMPANY ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document and delete using id (as param)
    const Company = await companyModel.findOneAndDelete({_id: id})

    //check if there's data in Company model
    if (!Company) {
        //if Company doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such company"})
    }
    else {
        //if Company does exists, pass relevant data to 'res' object method
        res.status(200).json(Company)
    }
}

//export controller module
module.exports = { getAllCompanies, getSingleCompany, createNewCompany, updateSingleCompany, deleteSingleCompany };