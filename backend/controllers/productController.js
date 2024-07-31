//import modules
const productModel = require('../models/ProductModel');
const productPriceModel = require('../models/ProductPriceModel');
const mongoose = require('mongoose');

// Helper function to fetch products by type
const fetchProductsByType = async (productType) => {
    const matchCondition = {
        'product_types': productType
    };

    const Products = await productModel.aggregate([
        {
            $match: matchCondition // Match the product type
        },
        {
            $lookup: {
                from: 'aliases', // Ensure this is the correct collection name
                localField: 'alias',
                foreignField: '_id',
                as: 'aliasDetails'
            }
        },
        { $unwind: { path: '$aliasDetails', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                product_sku: 1,
                product_name: 1,
                product_types: 1,
                product_actual_size: 1,
                product_next_available_stock_date: 1,
                supplier: 1,
                alias: 1,
                alias_name: '$aliasDetails.alias_name',
                product_isarchived: 1,
                createdAt: 1,
                updatedAt: 1,
            }
        }
    ]);

    return Products;
};

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

    // Get all the product prices based on the product id
    const ProductPrices = await productPriceModel.find({product_id: id});

    //check if there's 'null' or 'undefined' in 'Product'.
    if (!Product) {
        //if Product doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product"})
    }
    else {
        //if Product does exists, pass relevant data to 'res' object method
        res.status(200).json({ Product, ProductPrices});

    }
}

//Controller function - GET products by type
const getProductsByType = async (req, res) => {
    const { type } = req.params;
    try {
        const formattedResults = await fetchProductsByType(type);
        res.status(200).json(formattedResults);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller method to get filtered products
const getFilteredProducts = async (req, res) => {
    const { type } = req.params;

    if (!type) {
        return res.status(400).json({ error: 'Product type is required' });
    }

    try {
        const products = await productModel.find({ product_types: type })
            .populate('alias')
            .exec();

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//Controller function - POST to create a new Product
const createNewProduct = async (req, res) => {
    // retrieve incoming request (along with new Product object) by using 'req' object property 'body', which stores new Product object.
    // destructure all relevant attributes in new Product object
    const { product_sku, product_name, product_types, product_actual_size, product_next_available_stock_date, product_isarchived, supplier, alias, product_number_a, product_unit_a, product_price_unit_a, product_number_b, product_unit_b, product_price_unit_b, price_fixed, product_effective_date, projects} = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.

        const Product = await productModel.create({ product_sku, product_name, product_types, product_actual_size, product_next_available_stock_date,
            supplier, alias, price_fixed, product_isarchived });

        // Get product object id then insert Price Info into productPrice table
        // Need to add verification when it exist product price
        if (product_price_unit_a != null){

            const product_id = Product._id;
            const ProductPrice = await productPriceModel.create({ product_id, product_number_a, product_unit_a, product_price_unit_a, product_number_b, product_unit_b, 
                product_price_unit_b, price_fixed, product_effective_date, projects });

            res.status(200).json({ Product, ProductPrice });
        }else{
            //invoke 'res' object method: status() and json(), pass relevant data to them
            res.status(200).json(Product);
        }
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message});
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


    // At the same time need to delete related product Prices
    const ProductPrices =await productPriceModel.deleteMany({ product_id: id });


    //check if there's 'null' or 'undefined' in 'Product'.
    if (!Product) {
        //if Product doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Product"});
    }
    else {
        //if Product does exists, pass relevant data to 'res' object method
        res.status(200).json({Product, ProductPrices})
    }
}

//export controller module
module.exports = { getAllProducts, getSingleProduct, getProductsByType, getFilteredProducts, createNewProduct, updateSingleProduct, deleteSingleProduct };