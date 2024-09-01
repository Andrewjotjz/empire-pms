//import modules
const aliasModel = require('../models/AliasModel');
const mongoose = require('mongoose');

//Controller function - GET all Aliases
const getAllAliases = async (req, res) => {
    //'req' object not in used
    //create a new model called Aliases, await, and assign it with all Alias documents in the Alias collection, sort created date in descending order
    const Aliases = await aliasModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Aliases);
}

//Controller function - GET single Alias
const getSingleAlias = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Alias ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Alias, await, and assign it with the Alias document, which can be found in the Alias collection, find using ID
    const Alias = await aliasModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Alias'.
    if (!Alias) {
        //if Alias doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Alias"})
    }
    else {
        //if Alias does exists, pass relevant data to 'res' object method
        res.status(200).json(Alias)
    }
}

//Controller function - POST to create a new Alias
const createNewAlias = async (req, res) => {
    //retrieve incoming request (along with new Alias object) by using 'req' object property 'body', which stores new Alias object.
    //destructure all relevant attributes in new Alias object
    const { alias_name } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Alias = await aliasModel.create({ alias_name })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Alias)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Alias
const updateSingleAlias = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Alias."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Alias = await aliasModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Alias'.
    if (!Alias) {
        //if Alias doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Alias"});
    }
    else {
        //if Alias does exists, pass new Company object to 'res' object method
        res.status(200).json(Alias);
    }
}


//Controller function - DELETE to delete a single Alias
const deleteSingleAlias = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Alias ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Alias, await for database operation, which is find Company document and delete using id (as param)
    const Alias = await aliasModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Alias'.
    if (!Alias) {
        //if Alias doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Alias"});
    }
    else {
        //if Alias does exists, pass relevant data to 'res' object method
        res.status(200).json(Alias)
    }
}

//export controller module
module.exports = { getAllAliases, getSingleAlias, createNewAlias, updateSingleAlias, deleteSingleAlias };