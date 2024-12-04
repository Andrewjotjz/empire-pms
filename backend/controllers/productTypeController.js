//import modules
const productTypeModel = require('../models/ProductTypeModel');
const mongoose = require('mongoose');

//Controller function - GET all productTypes
const getAllProductTypes = async (req, res) => {
    //'req' object not in used
    //create a new model called productTypes, await, and assign it with all productType documents in the productType collection, sort created date in descending order
    const productTypes = await productTypeModel.find({})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(productTypes);
}

//Controller function - GET single productType
const getSingleProductType = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request productType ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called productType, await, and assign it with the productType document, which can be found in the productType collection, find using ID
    const productType = await productTypeModel.findById(id)

    //check if there's 'null' or 'undefined' in 'productType'.
    if (!productType) {
        //if productType doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such productType"})
    }
    else {
        //if productType does exists, pass relevant data to 'res' object method
        res.status(200).json(productType)
    }
}

//Controller function - POST to create a new productType
const createNewProductType = async (req, res) => {
    //retrieve incoming request (along with new productType object) by using 'req' object property 'body', which stores new productType object.
    //destructure all relevant attributes in new productType object
    const { type_name, type_unit, type_categories } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const productType = await productTypeModel.create({ type_name, type_unit, type_categories})
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(productType)
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//Controller function - PUT to update a single productType
const updateSingleProductType = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such productType."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const productType = await productTypeModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'productType'.
    if (!productType) {
        //if productType doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such productType"});
    }
    else {
        //if productType does exists, pass new productType object to 'res' object method
        res.status(200).json(productType);
    }
}

//Controller function - DELETE to delete a single productType
const deleteSingleProductType = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request productType ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called productType, await for database operation, which is find Company document and delete using id (as param)
    const productType = await productTypeModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'productType'.
    if (!productType) {
        //if productType doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such productType"});
    }
    else {
        //if productType does exists, pass relevant data to 'res' object method
        res.status(200).json(productType)
    }
}

//export controller module
module.exports = { getAllProductTypes, getSingleProductType, createNewProductType, updateSingleProductType, deleteSingleProductType };