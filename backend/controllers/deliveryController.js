//import modules
const deliveryModel = require('../models/DeliveryModel');
const orderModel = require('../models/OrderModel');
const mongoose = require('mongoose');

//Controller function - GET all Deliveries
const getAllDeliveries = async (req, res) => {
    //'req' object not in used
    //create a new model called Deliveries, await, and assign it with all Delivery documents in the Delivery collection, sort created date in descending order
    const Deliveries = await deliveryModel.find({}).sort({createdAt: -1})
    .populate('order')
    .populate('supplier')
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
    .populate('order')
    .populate('supplier')

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
    const {
        delivery_evidence_type,
        delivery_evidence_reference,
        products,
        delivery_receiving_date,
        status,
        delivery_status,
        order, // order ID
        supplier,
        delivery_isarchive,
        delivery_notes
    } = req.body;

    try {
        // Step 1: Create a new Delivery document
        const Delivery = await deliveryModel.create({
            delivery_evidence_type,
            delivery_evidence_reference,
            products,
            delivery_receiving_date,
            status,
            delivery_status,
            order,
            supplier,
            delivery_isarchive,
            delivery_notes
        });

        // Step 2: Update the corresponding Order document to include the new Delivery ID
        const updatedOrder = await orderModel.findByIdAndUpdate(
            order, // the order ID from the request body
            { $push: { deliveries: Delivery._id } }, // push the new delivery ID into the 'deliveries' array
            { new: true, runValidators: true } // options: return the updated document and validate changes
        );

        if (!updatedOrder) {
            // If no order is found with the provided ID, send an error response
            return res.status(404).json({ error: "Order not found." });
        }

        // Step 3: Send success response
        res.status(200).json({ delivery: Delivery, updatedOrder });
    } catch (error) {
        console.log(error)
        // Handle errors during Delivery creation or Order update
        res.status(400).json({ error: error.message });
    }
};



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
    const { id } = req.params;
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