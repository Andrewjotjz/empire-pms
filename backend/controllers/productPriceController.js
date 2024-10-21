//import modules
const productPriceModel = require('../models/ProductPriceModel');
const productModel = require('../models/ProductModel');

const mongoose = require('mongoose');


//Controller function - GET all Product Prices
const getAllProductPrices = async (req, res) => {
    //'req' object not in used
    //create a new model called ProductPrices, await, and assign it with all ProductPrices documents in the ProductPrices collection, sort created date in descending order
    const ProductPrices = await productPriceModel.find({}).sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(ProductPrices);
}

//Controller function - GET single Product Price
const getSingleProductPrice = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Product Price ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called ProductPrice, await, and assign it with the ProductPrice document, which can be found in the ProductPrice collection, find using ID
    const ProductPrice = await productPriceModel.findById(id)

    //check if there's 'null' or 'undefined' in 'ProductPrice'.
    if (!ProductPrice) {
        //if ProductPrice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product Price"})
    }
    else {
        //if ProductPrice does exists, pass relevant data to 'res' object method
        res.status(200).json(ProductPrice)
    }
}

 

//Controller function - POST to create a new ProductPrice
const createNewProductPrice = async (req, res) => {
    //retrieve incoming request (along with new ProjectPrice object) by using 'req' object property 'body', which stores new ProjectPrice object.
    //destructure all relevant attributes in new ProjectPrice object
    const { product_obj_ref, product_unit_a, product_number_a, product_price_unit_a, product_unit_b,
        product_number_b, product_price_unit_b, price_fixed, product_effective_date, projects } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new ProductPrice model with retrieved attributes.
        const ProjectPrice = await productPriceModel.create({ product_obj_ref, product_unit_a, product_number_a, product_price_unit_a, product_unit_b,
            product_number_b, product_price_unit_b, price_fixed, product_effective_date, projects })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(ProjectPrice)
    }
    catch (error) {
        //if creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Product Price
const updateSingleProductPrice = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Product Price."});
    }        
    //if ID exists in mongoDB database
    //create a new model, await for database operation, which is find product price document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const ProductPrice = await productPriceModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'ProductPrice'.
    if (!ProductPrice) {
        //if ProjectPrice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product Price"});
    }
    else {
        //if ProjectPrice does exists, pass new ProductPrice object to 'res' object method
        res.status(200).json(ProductPrice);
    }
}


//Controller function - DELETE to delete a single Product Price
const deleteSingleProductPrice = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Product Price ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called ProductPrice, await for database operation, which is find ProductPrice document and delete using id (as param)
    const ProductPrice = await productPriceModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'ProductPrice'.
    if (!ProductPrice) {
        //if ProductPrice doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product Price"});
    }
    else {
        //if ProductPrice does exists, pass relevant data to 'res' object method
        res.status(200).json(ProductPrice)
    }
}

//export controller module
module.exports = { getAllProductPrices, getSingleProductPrice, createNewProductPrice, updateSingleProductPrice, deleteSingleProductPrice};