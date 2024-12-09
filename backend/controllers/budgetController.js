//import modules
const budgetModel = require('../models/BudgetModel');
const mongoose = require('mongoose');

//Controller function - GET all Budgets
const getAllBudgets = async (req, res) => {
    //'req' object not in used
    //create a new model called Budgets, await, and assign it with all Budget documents in the Budget collection, sort created date in descending order
    const Budgets = await budgetModel.find({})
    .populate('project')
    .populate('budget_area')
    .sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Budgets);
}

//Controller function - GET single Budget
const getSingleBudget = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Budget ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Budget, await, and assign it with the Budget document, which can be found in the Budget collection, find using ID
    const Budget = await budgetModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Budget'.
    if (!Budget) {
        //if Budget doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Budget"})
    }
    else {
        //if Budget does exists, pass relevant data to 'res' object method
        res.status(200).json(Budget)
    }
}

//Controller function - POST to create a new Budget
const createNewBudget = async (req, res) => {
    //retrieve incoming request (along with new Budget object) by using 'req' object property 'body', which stores new Budget object.
    //destructure all relevant attributes in new Budget object
    const { budget_name, project, budget_area, budget_area_level, budget_area_subarea, entries } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Budget = await budgetModel.create({ budget_name, project, budget_area, budget_area_level, budget_area_subarea, entries })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Budget)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Budget
const updateSingleBudget = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Budget."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Budget = await budgetModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Budget'.
    if (!Budget) {
        //if Budget doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Budget"});
    }
    else {
        //if Budget does exists, pass new Company object to 'res' object method
        res.status(200).json(Budget);
    }
}


//Controller function - DELETE to delete a single Budget
const deleteSingleBudget = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Budget ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Budget, await for database operation, which is find Company document and delete using id (as param)
    const Budget = await budgetModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Budget'.
    if (!Budget) {
        //if Budget doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Budget"});
    }
    else {
        //if Budget does exists, pass relevant data to 'res' object method
        res.status(200).json(Budget)
    }
}

//export controller module
module.exports = { getAllBudgets, getSingleBudget, createNewBudget, updateSingleBudget, deleteSingleBudget };