//import modules
const statusModel = require('../models/statusModel');
const mongoose = require('mongoose');

//Controller function - GET all Statuses
const getAllStatuses = async (req, res) => {
    //'req' object not in used
    //create a new model called Statuses, await, and assign it with all Status documents in the Status collection, sort created date in descending order
    const Statuses = await statusModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Statuses);
}

//Controller function - GET single Status
const getSingleStatus = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Status ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Status, await, and assign it with the Status document, which can be found in the Status collection, find using ID
    const Status = await statusModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Status'.
    if (!Status) {
        //if Status doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Status"})
    }
    else {
        //if Status does exists, pass relevant data to 'res' object method
        res.status(200).json(Status)
    }
}

//Controller function - POST to create a new Status
const createNewStatus = async (req, res) => {
    //retrieve incoming request (along with new Status object) by using 'req' object property 'body', which stores new Status object.
    //destructure all relevant attributes in new Status object
    const { } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Status = await statusModel.create({ })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Status)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Status
const updateSingleStatus = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Status."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Status = await statusModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Status'.
    if (!Status) {
        //if Status doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Status"});
    }
    else {
        //if Status does exists, pass new Company object to 'res' object method
        res.status(200).json(Status);
    }
}


//Controller function - DELETE to delete a single Status
const deleteSingleStatus = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = body.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Status ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Status, await for database operation, which is find Company document and delete using id (as param)
    const Status = await statusModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Status'.
    if (!Status) {
        //if Status doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Status"});
    }
    else {
        //if Status does exists, pass relevant data to 'res' object method
        res.status(200).json(Status)
    }
}

//export controller module
module.exports = { getAllStatuses, getSingleStatus, createNewStatus, updateSingleStatus, deleteSingleStatus };