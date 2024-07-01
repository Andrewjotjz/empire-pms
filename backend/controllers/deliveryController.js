//import modules
const deliveryModel = require('../models/deliveryModel');
const mongoose = require('mongoose');

//Controller function - GET all Deliveries
const getAllDeliveries = async (req, res) => {
    //'req' object not in used
    //create a new model called Deliveries, await, and assign it with all Delivery documents in the Delivery collection, sort created date in descending order
    const Deliveries = await deliveryModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Deliveries);
}

//Controller function - GET single Delivery
const getSingleDelivery = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Delivery ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Delivery, await, and assign it with the Delivery document, which can be found in the Delivery collection, find using ID
    const Delivery = await deliveryModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Delivery'.
    if (!Delivery) {
        //if Delivery doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Delivery"})
    }
    else {
        //if Delivery does exists, pass relevant data to 'res' object method
        res.status(200).json(Delivery)
    }
}

//Controller function - POST to create a new Delivery
const createNewDelivery = async (req, res) => {
    //retrieve incoming request (along with new Delivery object) by using 'req' object property 'body', which stores new Delivery object.
    //destructure all relevant attributes in new Delivery object
    const { } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Delivery = await deliveryModel.create({ })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Delivery)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Delivery
const updateSingleDelivery = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Delivery."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Delivery = await deliveryModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Delivery'.
    if (!Delivery) {
        //if Delivery doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Delivery"});
    }
    else {
        //if Delivery does exists, pass new Company object to 'res' object method
        res.status(200).json(Delivery);
    }
}


//Controller function - DELETE to delete a single Delivery
const deleteSingleDelivery = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = body.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Delivery ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Delivery, await for database operation, which is find Company document and delete using id (as param)
    const Delivery = await deliveryModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Delivery'.
    if (!Delivery) {
        //if Delivery doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Delivery"});
    }
    else {
        //if Delivery does exists, pass relevant data to 'res' object method
        res.status(200).json(Delivery)
    }
}

//export controller module
module.exports = { getAllDeliveries, getSingleDelivery, createNewDelivery, updateSingleDelivery, deleteSingleDelivery };