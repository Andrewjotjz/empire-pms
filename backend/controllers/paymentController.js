//import modules
const paymentModel = require('../models/PaymentModel');
const mongoose = require('mongoose');

//Controller function - GET all Payments
const getAllPayments = async (req, res) => {
    //'req' object not in used
    //create a new model called Payments, await, and assign it with all Payment documents in the Payment collection, sort created date in descending order
    const Payments = await paymentModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Payments);
}

//Controller function - GET single Payment
const getSinglePayment = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Payment ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Payment, await, and assign it with the Payment document, which can be found in the Payment collection, find using ID
    const Payment = await paymentModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Payment'.
    if (!Payment) {
        //if Payment doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Payment"})
    }
    else {
        //if Payment does exists, pass relevant data to 'res' object method
        res.status(200).json(Payment)
    }
}

//Controller function - POST to create a new Payment
const createNewPayment = async (req, res) => {
    //retrieve incoming request (along with new Payment object) by using 'req' object property 'body', which stores new Payment object.
    //destructure all relevant attributes in new Payment object
    const { payment_type, payment_ref, supplier, payment_method, payment_term, payment_raw_total_amount_incl_gst, 
        period_start_date, period_end_date, invoices, payment_status, employees, payment_internal_comments } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Payment = await paymentModel.create({ payment_type, payment_ref, supplier, payment_method, payment_term, payment_raw_total_amount_incl_gst, 
            period_start_date, period_end_date, invoices, payment_status, employees, payment_internal_comments } )
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Payment)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Payment
const updateSinglePayment = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Payment."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Payment = await paymentModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Payment'.
    if (!Payment) {
        //if Payment doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Payment"});
    }
    else {
        //if Payment does exists, pass new Company object to 'res' object method
        res.status(200).json(Payment);
    }
}


//Controller function - DELETE to delete a single Payment
const deleteSinglePayment = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Payment ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Payment, await for database operation, which is find Company document and delete using id (as param)
    const Payment = await paymentModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Payment'.
    if (!Payment) {
        //if Payment doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Payment"});
    }
    else {
        //if Payment does exists, pass relevant data to 'res' object method
        res.status(200).json(Payment)
    }
}

//export controller module
module.exports = { getAllPayments, getSinglePayment, createNewPayment, updateSinglePayment, deleteSinglePayment };