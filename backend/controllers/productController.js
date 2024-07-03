//import modules
const productModel = require('../models/productModel');
const mongoose = require('mongoose');

//Controller function - GET all Products
const getAllProducts = async (req, res) => {
    //'req' object not in used
    //create a new model called Products, await, and assign it with all Product documents in the Product collection, sort created date in descending order
    const Products = await productModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Products);
}

//Controller function - GET single Product
const getSingleProduct = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Product ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Product, await, and assign it with the Product document, which can be found in the Product collection, find using ID
    const Product = await productModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Product'.
    if (!Product) {
        //if Product doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product"})
    }
    else {
        //if Product does exists, pass relevant data to 'res' object method
        res.status(200).json(Product)
    }
}

//Controller function - POST to create a new Product
const createNewProduct = async (req, res) => {
    //retrieve incoming request (along with new Product object) by using 'req' object property 'body', which stores new Product object.
    //destructure all relevant attributes in new Product object
    const { product_sku, product_name, product_number_a, product_unit_a, product_price_unit_a, product_number_b, product_unit_b, 
        product_price_unit_b, product_effective_date, product_types, product_next_available_stock_date, product_isarchived,
        supplier, project, alias } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Product = await productModel.create({ product_sku, product_name, product_number_a, product_unit_a, product_price_unit_a, 
            product_number_b, product_unit_b, product_price_unit_b, product_effective_date, product_types, product_next_available_stock_date,
             product_isarchived, supplier, project, alias })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Product)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Product
const updateSingleProduct = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Product."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Product = await productModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Product'.
    if (!Product) {
        //if Product doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product"});
    }
    else {
        //if Product does exists, pass new Company object to 'res' object method
        res.status(200).json(Product);
    }
}


//Controller function - DELETE to delete a single Product
const deleteSingleProduct = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Product ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Product, await for database operation, which is find Company document and delete using id (as param)
    const Product = await productModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Product'.
    if (!Product) {
        //if Product doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product"});
    }
    else {
        //if Product does exists, pass relevant data to 'res' object method
        res.status(200).json(Product)
    }
}

//export controller module
module.exports = { getAllProducts, getSingleProduct, createNewProduct, updateSingleProduct, deleteSingleProduct };