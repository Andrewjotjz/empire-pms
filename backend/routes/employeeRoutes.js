//import modules
const express = require('express');
const { getAllEmployees, getSingleEmployee, createNewEmployee, updateSingleEmployee, deleteSingleEmployee } = require('../controllers/employeeController')

//create express' router
const router = express.Router();


//GET - get all employees
router.get('/', getAllEmployees)

//GET - get a single employee
router.get('/:id', getSingleEmployee)

//POST - create a new employee
router.post('/create', createNewEmployee)

//PUT - update a single employee
router.put('/:id', updateSingleEmployee)

//DELETE - delete a single employee
router.delete('/:id', deleteSingleEmployee)


//export router module that handles all employee routes
module.exports = router;