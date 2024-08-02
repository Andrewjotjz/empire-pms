//import modules
const projectModel = require('../models/projectModel');
const employeeModel = require('../models/employeeModel');
const mongoose = require('mongoose');

//Controller function - GET all Projects
const getAllProjects = async (req, res) => {
    //'req' object not in used
    //create a new model called Projects, await, and assign it with all Project documents in the Project collection, sort created date in descending order
    const Projects = await projectModel.find({}).populate('suppliers').sort({createdAt: -1})
    //invoke 'res' object method: status() and json(), pass relevant data to them
    res.status(200).json(Projects);
}

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
    const Project = await projectModel.findById(id).populate('suppliers')

    //ADD-ON: Find employees associated with this project
    const Employees = await employeeModel.find({ projects: id }).exec();
    //ADD-ON: Combine project details with associated employees
    const ProjectWithEmployees = {
        ...Project._doc,
        employees: Employees
    };

    //check if there's 'null' or 'undefined' in 'Project'.
    if (!Project) {
        //if Project doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Project"})
    }
    else {
        //if Project does exists, pass relevant data to 'res' object method
        res.status(200).json(ProjectWithEmployees)
    }
}

//Controller function - POST to create a new Project
const createNewProject = async (req, res) => {
    //retrieve incoming request (along with new Project object) by using 'req' object property 'body', which stores new Project object.
    //destructure all relevant attributes in new Project object
    const { project_name, project_contacts, project_address, project_isarchived, employees, suppliers } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Project = await projectModel.create({ project_name, project_contacts, project_address, project_isarchived, employees, suppliers })
        //invoke 'res' object method: status() and json(), pass relevant data to them
        res.status(200).json(Project)
    }
    catch (error) {
        //if Company creation has error, pass error object and 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({error: error.message})
    }
}


//Controller function - PUT to update a single Project
const updateSingleProject = async (req,res) => {
    //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
    const { id } = req.params;
    //check if the ID object exists in mongoDB database
    if (!mongoose.Types.ObjectId.isValid(id)){
        //if ID doesn't exist, return error 404 details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(404).json({msg: "ID exists, however there is no such Project."});
    }        
    //if ID exists in mongoDB database
    //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
    //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
    const Project = await projectModel.findByIdAndUpdate({_id: id}, {...req.body});

    //check if there's 'null' or 'undefined' in 'Project'.
    if (!Project) {
        //if Project doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Project"});
    }
    else {
        //if Project does exists, pass new Company object to 'res' object method
        res.status(200).json(Project);
    }
}


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






// //import modules
// const projectModel = require('../models/projectModel');
// const employeeModel = require('../models/employeeModel');
// const mongoose = require('mongoose');



// const fetchProjectDetails = async (project_id) => {

//     // if project_id is null, find all projects, otherwise, find single project by id
//     const projects = await projectModel.find(project_id)
//     .sort({ createdAt: -1 })
//     .populate('suppliers', 'supplier_name supplier_isarchived')  // Populate suppliers with only the supplier_name field

//     // Find all employees related to the projects
//     const projectIds = projects.map(project => project._id);
//     const employees = await employeeModel.find({ projects: { $in: projectIds } }, 'employee_first_name employee_last_name employee_email employee_mobile_phone employee_roles projects');

//     // Map employees to their corresponding projects
//     const projectEmployeeMap = {};
//     employees.forEach(employee => {
//       employee.projects.forEach(projectId => {
//         if (!projectEmployeeMap[projectId]) {
//           projectEmployeeMap[projectId] = [];
//         }
//         projectEmployeeMap[projectId].push(employee);
//       });
//     });

//     // Attach employees to their corresponding projects
//     const projectsWithEmployees = projects.map(project => {
//       return {
//         ...project.toObject(),
//         employees: projectEmployeeMap[project._id] || []
//       };
//     });

//     return projectsWithEmployees; 

// };


// //Controller function - GET all Projects
// const getAllProjects = async (req, res) => {
//     //'req' object not in used
//     //create a new model called Projects, await, and assign it with all Project documents in the Project collection, sort created date in descending order
//     // const Projects = await projectModel.find({}).sort({createdAt: -1})

//     try {
//         // Fetch all projects and populate the supplier names and employee names
//         const projectsWithDetails = await fetchProjectDetails({})
    
//         // Respond with the populated project data
//         res.status(200).json(projectsWithDetails);
//       } catch (error) {
//         res.status(500).json({ message: error.message });
//       }
//     };

// //Controller function - GET single Project
// const getSingleProject = async (req, res) => {
//     //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
//     const { id } = req.params;
//     //check if the id is a valid id in database
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         //if ID doesn't exist, return error 404 details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 404 PAGE
//         res.status(404).json({msg: "Request Project ID does not exist in database."})
//     }

//     //if ID exists in mongoDB database
//     //create a new model called Project, await, and assign it with the Project document, which can be found in the Project collection, find using ID
//     const projectsWithDetails = await fetchProjectDetails({ _id: id });

//     //check if there's 'null' or 'undefined' in 'Project'.
//     if (!projectsWithDetails) {
//         //if Project doesn't exist, return error 400 page details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 400 PAGE
//         res.status(400).json({msg: "ID exists, however there is no such Project"})
//     }
//     else {
//         //if Project does exists, pass relevant data to 'res' object method
//         res.status(200).json(projectsWithDetails)
//     }
// }

// //Controller function - POST to create a new Project
// const createNewProject = async (req, res) => {
//     //retrieve incoming request (along with new Project object) by using 'req' object property 'body', which stores new Project object.
//     //destructure all relevant attributes in new Project object
//     const { project_name, project_contacts, project_address, project_isarchived, employees, suppliers } = req.body;

//     try {
//         //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
//         const Project = await projectModel.create({ project_name, project_contacts, project_address, project_isarchived, employees, suppliers })
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         res.status(200).json(Project)
//     }
//     catch (error) {
//         //if Company creation has error, pass error object and 400 page details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 400 PAGE
//         res.status(400).json({error: error.message})
//     }
// }


// //Controller function - PUT to update a single Project
// const updateSingleProject = async (req,res) => {
//     //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
//     const { id } = req.params;
//     //check if the ID object exists in mongoDB database
//     if (!mongoose.Types.ObjectId.isValid(id)){
//         //if ID doesn't exist, return error 404 details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 400 PAGE
//         res.status(404).json({msg: "ID exists, however there is no such Project."});
//     }        
//     //if ID exists in mongoDB database
//     //create a new model called Company, await for database operation, which is find Company document using id (1st param), 
//     //and update with relevant data retrieved using 'req' object 'body' property (2nd param).
//     const Project = await projectModel.findByIdAndUpdate({_id: id}, {...req.body});

//     //check if there's 'null' or 'undefined' in 'Project'.
//     if (!Project) {
//         //if Project doesn't exist, return error 400 page details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 400 PAGE
//         res.status(400).json({msg: "ID exists, however there is no such Project"});
//     }
//     else {
//         //if Project does exists, pass new Company object to 'res' object method
//         res.status(200).json(Project);
//     }
// }


// //Controller function - DELETE to delete a single Project
// const deleteSingleProject = async (req,res) => {
//     //retrieve incoming request id by using 'req' object property 'params', which stores 'id' object
//     const { id } = req.params;
//     //check if the ID object exists in mongoDB database.
//     if (!mongoose.Types.ObjectId.isValid(id)) {
//         //if ID doesn't exist, return error 404 details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 404 PAGE
//         res.status(404).json({msg: "Request Project ID does not exist in database."});
//     }
//     //if ID exists in mongoDB database
//     //create a new model called Project, await for database operation, which is find Company document and delete using id (as param)
//     const Project = await projectModel.findByIdAndDelete({_id: id})

//     //check if there's 'null' or 'undefined' in 'Project'.
//     if (!Project) {
//         //if Project doesn't exist, return error 400 page details
//         //invoke 'res' object method: status() and json(), pass relevant data to them
//         //! DESIGN 400 PAGE
//         res.status(400).json({msg: "ID exists, however there is no such Project"});
//     }
//     else {
//         //if Project does exists, pass relevant data to 'res' object method
//         res.status(200).json(Project)
//     }
// }

// //export controller module
// module.exports = { getAllProjects, getSingleProject, createNewProject, updateSingleProject, deleteSingleProject };