//import modules
const express = require('express');
const { getAllProjects, getSingleProject, createNewProject, updateSingleProject, deleteSingleProject } = require('../controllers/projectController');
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();

//GET - get all Projects
router.get('/', requireAuth, getAllProjects)

//GET - get a single Project
router.get('/:id', requireAuth, getSingleProject)

//POST - create a new Project
router.post('/create', requireAuth, createNewProject)

//PUT - update a single Project
router.put('/:id', requireAuth, updateSingleProject)

//DELETE - delete a single Project
router.delete('/:id', requireAuth, deleteSingleProject)

//export router that handles all project routes
module.exports = router;