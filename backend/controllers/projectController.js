//import modules
const projectModel = require('../models/ProjectModel');
const productModel = require('../models/ProductModel');
const productPriceModel = require('../models/ProductPriceModel');
const employeeModel = require('../models/EmployeeModel');

const mongoose = require('mongoose');



const fetchProjectDetails = async (project_id) => {

    // if project_id is null, find all projects, otherwise, find single project by id
    // Populate suppliers with only the supplier_name field
    const projects = await projectModel.find(project_id).sort({ createdAt: -1 }).populate('suppliers')

    // Find all employees related to the projects
    const projectIds = projects.map(project => project._id);
    const employees = await employeeModel.find({ projects: { $in: projectIds } });

    // Map employees to their corresponding projects
    const projectEmployeeMap = {};
    employees.forEach(employee => {
      employee.projects.forEach(projectId => {
        if (!projectEmployeeMap[projectId]) 
            { projectEmployeeMap[projectId] = []; }
        projectEmployeeMap[projectId].push(employee);
      });
    });

    // Attach employees to their corresponding projects
    const projectsWithEmployees = projects.map(project => {
      return {
        ...project.toObject(),
        employees: projectEmployeeMap[project._id] || []
      };
    });

    return projectsWithEmployees; 

};


//Controller function - GET all Projects
const getAllProjects = async (req, res) => {
    //'req' object not in used
    //create a new model called Projects, await, and assign it with all Project documents in the Project collection, sort created date in descending order
    // const Projects = await projectModel.find({}).sort({createdAt: -1})

    try {
        // Fetch all projects and populate the supplier names and employee names
        const projectsWithDetails = await fetchProjectDetails({})
    
        // Respond with the populated project data
        res.status(200).json(projectsWithDetails);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

//Controller function - GET single Project
const getSingleProject = async (req, res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the id is a valid id in database
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Project ID does not exist in database."})
    }

    //if ID exists in mongoDB database
    //create a new model called Project, await, and assign it with the Project document, which can be found in the Project collection, find using ID
    const projectsWithDetails = await fetchProjectDetails({ _id: id });

    //check if there's 'null' or 'undefined' in 'Project'.
    if (!projectsWithDetails) {
        //if Project doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Project"})
    }
    else {
        //if Project does exists, pass relevant data to 'res' object method
        res.status(200).json(projectsWithDetails)
    }
}

//Controller function - POST to create a new Project
// const createNewProject = async (req, res) => {
//     // Retrieve incoming request data
//     const { project_name, project_address, suppliers, area_obj_ref } = req.body;

//     try {
//         // Create new project
//         const newProject = await projectModel.create({ project_name, project_address, suppliers, area_obj_ref });

//         // Step 2: Find all products belonging to the selected suppliers
//         const products = await productModel.find({ supplier: { $in: suppliers } }).select('_id');

//         // Step 3: Find all product prices for those products
//         const productPrices = await productPriceModel.find({ product_obj_ref: { $in: products.map(p => p._id) } });

//         // Step 4: Update product prices to include the new project
//         await Promise.all(productPrices.map(async (price) => {
//             price.projects.push(newProject._id); 
//             await price.save();
//         }));

//         // Send response with the newly created project
//         res.status(200).json(newProject);
//     } catch (error) {
//         console.error('Error creating project:', error);
//         res.status(500).json({ error: "Internal server error. Please try again later." });
//     }
// };
const createNewProject = async (req, res) => {
    const { project_name, project_address, suppliers, area_obj_ref } = req.body;

    try {
        // Step 1: Create new project
        const newProject = await projectModel.create({ project_name, project_address, suppliers, area_obj_ref });

        // Step 2: Find all products belonging to the selected suppliers
        const products = await productModel.find({ supplier: { $in: suppliers } }).select('_id');

        // Step 3: Find the most recent product price for each product
        const latestProductPrices = await productPriceModel.aggregate([
            { $match: { product_obj_ref: { $in: products.map(p => p._id) } } },
            { $sort: { product_effective_date: -1 } }, // Sort by latest date first
            { 
                $group: { 
                    _id: "$product_obj_ref", // Group by product
                    latestPriceId: { $first: "$_id" } // Get the latest product price ID
                }
            }
        ]);

        // Step 4: Update only the latest product prices
        await Promise.all(latestProductPrices.map(async (price) => {
            await productPriceModel.findByIdAndUpdate(price.latestPriceId, {
                $addToSet: { projects: newProject._id } // Avoid duplicate project entries
            });
        }));

        // Step 5: Send response with the newly created project
        res.status(200).json(newProject);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};


//Controller function - PUT to update a single Project
// const updateSingleProject = async (req, res) => {
//     const { id } = req.params;
//     const { suppliers } = req.body; // Get the new supplier list

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         return res.status(404).json({ msg: "ID exists, however there is no such Project." });
//     }

//     try {
//         // Step 1: Find the existing project
//         const existingProject = await projectModel.findById(id);
//         if (!existingProject) {
//             return res.status(400).json({ msg: "ID exists, however there is no such Project." });
//         }

//         // Step 2: Update the project with new supplier selection
//         existingProject.suppliers = suppliers;
//         const updatedProject = await existingProject.save();

//         // Step 3: Find all products that belong to the new suppliers
//         const products = await productModel.find({ supplier: { $in: suppliers } }).select('_id');

//         // Step 4: Remove this project ID from ProductPrice entries that no longer match
//         await productPriceModel.updateMany(
//             { projects: id },
//             { $pull: { projects: id } }
//         );

//         // Step 5: Add the project ID to ProductPrice entries that match the new suppliers
//         await productPriceModel.updateMany(
//             { product_obj_ref: { $in: products.map(p => p._id) } },
//             { $addToSet: { projects: id } }
//         );

//         return res.status(200).json(updatedProject);
//     } catch (error) {
//         console.error('Error updating project:', error);
//         return res.status(500).json({ error: "Internal server error. Please try again later." });
//     }
// };
const updateSingleProject = async (req, res) => {
    const { id } = req.params;
    const { suppliers } = req.body; // Get the new supplier list

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ msg: "ID exists, however there is no such Project." });
    }

    try {
        // Step 1: Find the existing project
        const existingProject = await projectModel.findById(id);
        if (!existingProject) {
            return res.status(400).json({ msg: "ID exists, however there is no such Project." });
        }
        
        // Step 2: Filter out suppliers that are already in the project (avoid duplicate updates)
        const existingSupplierIds = existingProject.suppliers.map(supplier => supplier.toString());
        const newSuppliers = suppliers.filter(supplier => !existingSupplierIds.includes(supplier.toString()));

        // Step 3: Update the project with new supplier selection
        existingProject.suppliers = suppliers;
        const updatedProject = await existingProject.save();

        // Step 4: Find all products that belong to the new suppliers
        const products = await productModel.find({ supplier: { $in: newSuppliers } }).select('_id');

        // Step 5: Remove this project ID from all ProductPrice entries (reset)
        await productPriceModel.updateMany(
            { projects: id },
            { $pull: { projects: id } }
        );

        // Step 6: Find the most recent product price for each product
        const latestProductPrices = await productPriceModel.aggregate([
            { $match: { product_obj_ref: { $in: products.map(p => p._id) } } },
            { $sort: { product_effective_date: -1 } }, // Sort by latest date first
            { 
                $group: { 
                    _id: "$product_obj_ref", // Group by product
                    latestPriceId: { $first: "$_id" } // Get the latest product price ID
                }
            }
        ]);

        // Step 6: Add the project ID only to the most recent ProductPrice entries
        await Promise.all(latestProductPrices.map(async (price) => {
            await productPriceModel.findByIdAndUpdate(price.latestPriceId, {
                $addToSet: { projects: id }
            });
        }));

        return res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};


//Controller function - DELETE to delete a single Project
const deleteSingleProject = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 404 PAGE
        res.status(404).json({msg: "Request Project ID does not exist in database."});
    }
    //if ID exists in mongoDB database
    //create a new model called Project, await for database operation, which is find Company document and delete using id (as param)
    const Project = await projectModel.findByIdAndDelete({_id: id})

    //check if there's 'null' or 'undefined' in 'Project'.
    if (!Project) {
        //if Project doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Project"});
    }
    else {
        //if Project does exists, pass relevant data to 'res' object method
        res.status(200).json(Project)
    }
}

//export controller module
module.exports = { getAllProjects, getSingleProject, createNewProject, updateSingleProject, deleteSingleProject };