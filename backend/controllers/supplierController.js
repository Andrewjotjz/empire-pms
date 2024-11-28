//import modules
const supplierModel = require('../models/SupplierModel');
const projectModel = require('../models/ProjectModel');
const productModel = require('../models/ProductModel');
const productPriceModel = require('../models/ProductPriceModel');
const mongoose = require('mongoose');

// const fetchSupplierwithProject = async (supplier_id) => {

//     // if project_id is null, find all projects, otherwise, find single project by id
//     const suppliers = await supplierModel.find(supplier_id).sort({ createdAt: -1 })

//     // Find all employees related to the projects
//     const suppliersIds = suppliers.map(supplier => supplier._id);
//     const projects = await projectModel.find({ suppliers: { $in: suppliersIds } });

//     // Map suppliers to their corresponding projects
//     const supplierProjectMap = {};
//     projects.forEach(project => {
//         project.suppliers.forEach(supplierID => {
//         if (!supplierProjectMap[supplierID]) 
//             { supplierProjectMap[supplierID] = []; }
//         supplierProjectMap[supplierID].push(project);
//       });
//     });

//     // Attach supplier to their corresponding projects
//     const supplierWithProjects = projects.map(project => {
//       return {
//         ...project.toObject(),
//         projects: supplierProjectMap[project._id] || []
//       };
//     });

//     return supplierWithProjects; 

// };

const fetchSupplierWithProjects = async (supplier_id) => {
    try {
        // Find the supplier by ID (assumed that supplier_id is not null)
        const supplier = await supplierModel.findById(supplier_id);
        if (!supplier) {
            throw new Error('Supplier not found');
        }

        // Find all projects related to the supplier
        const projects = await projectModel.find({ suppliers: supplier_id })
            .select('project_name project_address project_isarchived')
            .exec();

        // Attach the projects to the supplier
        const supplierWithProjects = {
            ...supplier.toObject(), // Convert the supplier document to a plain object
            projects: projects.map(project => project.toObject()) // Convert projects to plain objects
        };

        return supplierWithProjects;
    } catch (error) {
        console.error('Error fetching supplier with projects:', error);
        throw error; // Handle or rethrow the error as needed
    }
};


//Controller function - GET all Suppliers
const getAllSuppliers = async (req, res) => {
    try {
        // Fetch all supplier documents, sorted by updatedAt in descending order
        const Suppliers = await supplierModel.find({}).sort({ updatedAt: -1 });

        // Define the custom order for supplier types
        const supplierTypeOrder = {
            'Main': 1,
            'Special': 2,
            'Others': 3,
            'Inactive': 4
        };

        // Sort suppliers by supplier_type first, then by updatedAt
        Suppliers.sort((a, b) => {
            const orderA = supplierTypeOrder[a.supplier_type] || 5;
            const orderB = supplierTypeOrder[b.supplier_type] || 5;

            if (orderA < orderB) return -1;
            if (orderA > orderB) return 1;

            // If supplier_type is the same, sort by updatedAt
            return b.updatedAt - a.updatedAt;
        });

        // Return the sorted suppliers as a JSON response
        res.status(200).json(Suppliers);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving suppliers", error });
    }
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
    // const Supplier = await supplierModel.findById(id)
    const Supplier = await fetchSupplierWithProjects({ _id: id });

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

// Helper function to fetch products and their prices
const fetchProductsWithPrices = async (supplierObjectId, productObjectId = null) => {
    const matchCondition = {
        'product.supplier': supplierObjectId
    };
    if (productObjectId) {
        matchCondition['product._id'] = productObjectId;
    }

    const ProductsWithPrices = await productPriceModel.aggregate([
        {
            $lookup: {
                from: 'products', // Ensure this is the correct collection name
                localField: 'product_obj_ref',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' }, // Flatten the product array
        {
            $match: matchCondition // Match the supplier ID and optionally the product ID
        },
        {
            $lookup: {
                from: 'aliases', // Ensure this is the correct collection name
                localField: 'product.alias',
                foreignField: '_id',
                as: 'alias'
            }
        },
        { $unwind: { path: '$alias', preserveNullAndEmptyArrays: true }}, 
        {
            $lookup: {
                from: 'projects',
                localField: 'projects',
                foreignField: '_id',
                as: 'projectDetails'
            }   
        },
        {
            $project: {
                product: {
                    _id: '$product._id',
                    product_sku: '$product.product_sku',
                    product_name: '$product.product_name',
                    product_type: '$product.product_type',
                    product_actual_size: '$product.product_actual_size',
                    product_actual_rate: '$product.product_actual_rate',
                    product_next_available_stock_date: '$product.product_next_available_stock_date',
                    supplier: '$product.supplier',
                    alias: '$product.alias',
                    alias_name: '$alias.alias_name',
                    product_isarchived: '$product.product_isarchived',
                    createdAt: '$product.createdAt',
                    updatedAt: '$product.updatedAt'
                },
                productPrice: {
                    _id: '$_id',
                    product_obj_ref: '$product_obj_ref',
                    product_unit_a: '$product_unit_a',
                    product_number_a: '$product_number_a',
                    product_price_unit_a: '$product_price_unit_a',
                    product_unit_b: '$product_unit_b',
                    product_number_b: '$product_number_b',
                    product_price_unit_b: '$product_price_unit_b',
                    price_fixed: '$price_fixed',
                    product_effective_date: '$product_effective_date',
                    projects: '$projects',
                    project_names: '$projectDetails.project_name', // Get project names
                    createdAt: '$createdAt',
                    updatedAt: '$updatedAt',
                }
            }
        },
        {
            $sort: {
                'productPrice.product_effective_date': -1, // Sort by productPrice's product_effective_date in descending order
                'productPrice.createdAt': -1, // Sort by productPrice's createdAt in descending order
            }
        }
    ]);

    return ProductsWithPrices.map(item => ({
        product: {
            ...item.product,
        },
        productPrice: {
            ...item.productPrice,
        }
    }));
};

// Controller function - GET all products by supplier
const getSingleSupplierProducts = async (req, res) => {
    const { id } = req.params;
    const { all } = req.query;

    try {
        if (all === 'true' || !all) {
            const supplierObjectId = new mongoose.Types.ObjectId(id);
            const formattedResults = await fetchProductsWithPrices(supplierObjectId);
            res.status(200).json(formattedResults);
        } else {
            return res.status(404).json({ message: 'Please enter the correct query parameter' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Controller function - GET a single product by supplier and product ID
const getSingleProductBySupplier = async (req, res) => {
    const { id, productId } = req.params;

    try {
        const supplierObjectId = new mongoose.Types.ObjectId(id);
        const productObjectId = new mongoose.Types.ObjectId(productId);

        const formattedResults = await fetchProductsWithPrices(supplierObjectId, productObjectId);
        res.status(200).json(formattedResults);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


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
module.exports = { getAllSuppliers, getSingleSupplier, fetchProductsWithPrices, getSingleSupplierProducts, getSingleProductBySupplier, createNewSupplier, updateSingleSupplier, deleteSingleSupplier };
