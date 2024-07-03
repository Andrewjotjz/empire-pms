//import modules
const supplierModel = require('../models/supplierModel');
const mongoose = require('mongoose');

//Controller function - GET all Suppliers
const getAllSuppliers = async (req, res) => {
    //'req' object not in used
    //create a new model called Suppliers, await, and assign it with all Supplier documents in the Supplier collection, sort created date in descending order
    const Suppliers = await supplierModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Suppliers);
}

//Controller function - GET single Supplier
const getSingleSupplier = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Supplier ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Supplier, await, and assign it with the Supplier document, which can be found in the Supplier collection, find using ID
    const Supplier = await supplierModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Supplier'.
    if (!Supplier) {
        //if Supplier doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Supplier"})
    }
    else {
        //if Supplier does exists, pass relevant data to 'res' object method
        res.status(200).json(Supplier)
    }
}

//Controller function - POST to create a new Supplier
const createNewSupplier = async (req, res) => {
    //retrieve incoming request (along with new Supplier object) by using 'req' object property 'body', which stores new Supplier object.
    //destructure all relevant attributes in new Supplier object
    const { supplier_name, supplier_contacts, supplier_address, supplier_payment_term, supplier_payment_term_description,
         supplier_payment_method_details, supplier_type, supplier_isarchived, supplier_material_types, projects, 
         orders, invoices } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Supplier = await supplierModel.create({ supplier_name, supplier_contacts, supplier_address, supplier_payment_term, supplier_payment_term_description,
            supplier_payment_method_details, supplier_type, supplier_isarchived, supplier_material_types, projects, 
            orders, invoices })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Supplier)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Supplier
const updateSingleSupplier = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Supplier."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Supplier = await supplierModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Supplier'.
    if (!Supplier) {
        //if Supplier doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Supplier"});
    }
    else {
        //if Supplier does exists, pass new Company object to 'res' object method
        res.status(200).json(Supplier);
    }
}


//Controller function - DELETE to delete a single Supplier
const deleteSingleSupplier = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Supplier ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Supplier, await for database operation, which is find Company document and delete using id (as param)
    const Supplier = await supplierModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Supplier'.
    if (!Supplier) {
        //if Supplier doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Supplier"});
    }
    else {
        //if Supplier does exists, pass relevant data to 'res' object method
        res.status(200).json(Supplier)
    }
}

//export controller module
module.exports = { getAllSuppliers, getSingleSupplier, createNewSupplier, updateSingleSupplier, deleteSingleSupplier };