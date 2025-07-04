//import modules
const orderModel = require('../models/OrderModel');
const mongoose = require('mongoose');

//Controller function - GET all Orders
const getAllOrders = async (req, res) => {
    //'req' object not in used
    //create a new model called Orders, await, and assign it with all Order documents in the Order collection, sort created date in descending order
    try {
        // Find all Order documents, populate Project, Supplier, and Products, and sort by created date in descending order
        const Orders = await orderModel
            .find({})
            .populate('project') // Populate the 'project' field
            .populate('supplier') // Populate the 'supplier' field
            .populate({
                path: 'products.product_obj_ref', // Populate the 'product_obj_ref' inside 'products' array
                select: 'product_name product_sku product_number_a product_unit_a', // Specify the fields to include
            })
            .sort({ createdAt: -1 });

        // Respond with the retrieved Orders
        // invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Orders);
    } catch (error) {
        // Handle any errors that occur during the query
        res.status(500).json({ message: "Error retrieving orders", error });
    }
}

// Controller function - GET single Order
const getSingleOrder = async (req, res) => {
    // Retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    // Check if the id is a valid id in the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        // If ID doesn't exist, return error 404 details
        // Invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        return res.status(404).json({ msg: "Request Order ID does not exist in database." });
        // ^^^ Add return here to prevent further execution
    }

    try {
        // If ID exists in the MongoDB database
        // Create a new model called Order, await, and assign it with the Order document, which can be found in the Order collection, find using ID
        const Order = await orderModel
            .findById(id)
            .populate('supplier')
            .populate({
                path: 'products.product_obj_ref' // Populate the 'product_obj_ref' inside 'products' array
            })
            .populate({
                path: 'products.productprice_obj_ref' // Populate the 'productprice_obj_ref' inside 'products' array
            })
            .populate('project')
            .populate('deliveries')
            .populate('invoices')
            .populate('project');

        
        const filteredInvoice = Order.invoices.filter(invoice => invoice.invoice_status !== "Cancelled")

        Order.invoices = filteredInvoice;

        // Respond with the retrieved Order
        // Invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Order);
    } catch (error) {
        // Handle any errors that occur during the query
        res.status(500).json({ message: "Error retrieving order", error });
    }
};


//Controller function - POST to create a new Order
const createNewOrder = async (req, res) => {
    //retrieve incoming request (along with new Order object) by using 'req' object property 'body', which stores new Order object.
    //destructure all relevant attributes in new Order object
    const { supplier, order_ref, order_date, order_est_datetime, products, custom_products, order_total_amount, order_internal_comments,
        order_notes_to_supplier, order_isarchived, deliveries, invoices, project, order_status } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Order = await orderModel.create({ supplier, order_ref, order_date, order_est_datetime, products, custom_products, order_total_amount, order_internal_comments,
            order_notes_to_supplier, order_isarchived, deliveries, invoices, project, order_status })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Order)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
        console.log(error.message)
    }
}


//Controller function - PUT to update a single Order
const updateSingleOrder = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Order."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Order = await orderModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Order'.
    if (!Order) {
        //if Order doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Order"});
    }
    else {
        //if Order does exists, pass new Company object to 'res' object method
        res.status(200).json(Order);
    }
}


//Controller function - DELETE to delete a single Order
const deleteSingleOrder = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Order ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Order, await for database operation, which is find Company document and delete using id (as param)
    const Order = await orderModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Order'.
    if (!Order) {
        //if Order doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Order"});
    }
    else {
        //if Order does exists, pass relevant data to 'res' object method
        res.status(200).json(Order)
    }
}

//export controller module
module.exports = { getAllOrders, getSingleOrder, createNewOrder, updateSingleOrder, deleteSingleOrder };