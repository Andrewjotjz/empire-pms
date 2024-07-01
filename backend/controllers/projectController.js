//import modules
const projectModel = require('../models/projectModel');
const mongoose = require('mongoose');

//Controller function - GET all Projects
const getAllProjects = async (req, res) => {
    //'req' object not in used
    //create a new model called Projects, await, and assign it with all Project documents in the Project collection, sort created date in descending order
    const Projects = await projectModel.find({}).sort({createdAt: -1})
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
    const Project = await projectModel.findById(id)

    //check if there's 'null' or 'undefined' in 'Project'.
    if (!Project) {
        //if Project doesn't exist, return error 400 page details
        //invoke 'res' object method: status() and json(), pass relevant data to them
        //! DESIGN 400 PAGE
        res.status(400).json({msg: "ID exists, however there is no such Project"})
    }
    else {
        //if Project does exists, pass relevant data to 'res' object method
        res.status(200).json(Project)
    }
}

//Controller function - POST to create a new Project
const createNewProject = async (req, res) => {
    //retrieve incoming request (along with new Project object) by using 'req' object property 'body', which stores new Project object.
    //destructure all relevant attributes in new Project object
    const { } = req.body;

    try {
        //since this function is asynchronous, means the function will 'await' for the database operation, which is create a new Company model with retrieved attributes.
        const Project = await projectModel.create({ })
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
    const { id } = body.params;
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