//import modules
const invoiceModel = require('../models/InvoiceModel');
const orderModel = require('../models/OrderModel');
const mongoose = require('mongoose');

//Controller function - GET all Invoices
const getAllInvoices = async (req, res) => {
    //'req' object not in used
    //create a new model called Invoices, await, and assign it with all Invoice documents in the Invoice collection, sort created date in descending order
    const Invoices = await invoiceModel
    .find({})
    .populate('supplier')
    .populate('order')
    .populate({
        path: 'products.product_obj_ref', // Populate the 'product_obj_ref' inside 'products' array
    })
    .populate('payment')
    .sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Invoices);
}

//Controller function - GET single Invoice
const getSingleInvoice = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Invoice ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Invoice, await, and assign it with the Invoice document, which can be found in the Invoice collection, find using ID
    const Invoice = await invoiceModel
    .findById(id)
    .populate('supplier')
    .populate('order')
    .populate({
        path: 'products.product_obj_ref', // Populate the 'product_obj_ref' inside 'products' array
    })
    .populate('payment')

    //check if there's 'null' or 'undefined' in 'Invoice'.
    if (!Invoice) {
        //if Invoice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Invoice"})
    }
    else {
        //if Invoice does exists, pass relevant data to 'res' object method
        res.status(200).json(Invoice)
    }
}

//Controller function - POST to create a new Invoice
const createNewInvoice = async (req, res) => {
    const {
        invoice_ref, supplier, invoice_issue_date, invoice_received_date, invoice_due_date,
        order, products, custom_products, invoiced_delivery_fee, invoiced_other_fee, invoiced_credit,
        invoiced_raw_total_amount_incl_gst, invoiced_calculated_total_amount_incl_gst, invoice_is_stand_alone,
        invoice_internal_comments, invoice_isarchived, payment, invoice_status
    } = req.body;

    try {
        // Step 1: Create the new invoice
        const newInvoice = await invoiceModel.create({
            invoice_ref, supplier, invoice_issue_date, invoice_received_date, invoice_due_date,
            order, products, custom_products, invoiced_delivery_fee, invoiced_other_fee, invoiced_credit,
            invoiced_raw_total_amount_incl_gst, invoiced_calculated_total_amount_incl_gst, invoice_is_stand_alone,
            invoice_internal_comments, invoice_isarchived, payment, invoice_status
        });

        // Step 2: Check if there is an associated order and update it with the new invoice ID
        if (order) {

            const updatedOrder = await orderModel.findByIdAndUpdate(
                order, 
                { $push: { invoices: newInvoice._id } }, // Push the new invoice's _id into the 'invoice_obj_ref'
                { new: true }
            );            

            if (!updatedOrder) {
                return res.status(404).json({ error: "Order not found" });
            }
        }

        // Step 3: Return the newly created invoice as a response
        res.status(200).json(newInvoice);
    }
    catch (error) {
        // Handle any errors during the invoice creation or order update process
        res.status(400).json({ error: error.message });
    }
};



//Controller function - PUT to update a single Invoice
const updateSingleInvoice = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Invoice."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Invoice = await invoiceModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Invoice'.
    if (!Invoice) {
        //if Invoice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Invoice"});
    }
    else {
        //if Invoice does exists, pass new Company object to 'res' object method
        res.status(200).json(Invoice);
    }
}


//Controller function - DELETE to delete a single Invoice
const deleteSingleInvoice = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Invoice ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Invoice, await for database operation, which is find Company document and delete using id (as param)
    const Invoice = await invoiceModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Invoice'.
    if (!Invoice) {
        //if Invoice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Invoice"});
    }
    else {
        //if Invoice does exists, pass relevant data to 'res' object method
        res.status(200).json(Invoice)
    }
}

//export controller module
module.exports = { getAllInvoices, getSingleInvoice, createNewInvoice, updateSingleInvoice, deleteSingleInvoice };