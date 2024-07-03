//import modules
const express = require('express');
const { getAllProjects, getSingleProject, createNewProject, updateSingleProject, deleteSingleProject } = require('../controllers/projectController');

//create express' router
const router = express.Router();

//GET - get all Projects
router.get('/', getAllProjects)

//GET - get a single Project
router.get('/:id', getSingleProject)

//POST - create a new Project
router.post('/create', createNewProject)

//PUT - update a single Project
router.put('/:id', updateSingleProject)

//DELETE - delete a single Project
router.delete('/:id', deleteSingleProject)

//export router that handles all project routes
module.exports = router;