//import modules
const express = require('express');
const { getAllEmployees, getSingleEmployee, createNewEmployee, updateSingleEmployee, changeEmployeePassword, deleteSingleEmployee, loginEmployee, logoutEmployee, sendPasswordResetEmail, resetEmployeePassword } = require('../controllers/employeeController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();

//GET - logout employee
router.get('/logout', logoutEmployee)

//GET - get all employees
router.get('/', requireAuth, getAllEmployees)

//GET - get a single employee
router.get('/:id', requireAuth, getSingleEmployee)

//POST - create a new employee and also sign up employee's email and password
router.post('/create', requireAuth, createNewEmployee)

//PUT - update a single employee
router.put('/:id', requireAuth, updateSingleEmployee)

//PUT - update a single employee's password
router.put('/:id/change-password', requireAuth, changeEmployeePassword)

//DELETE - delete a single employee
router.delete('/:id', requireAuth, deleteSingleEmployee)

//POST - login existing employee
router.post('/login', loginEmployee)

//POST - send password reset email
router.post('/:id/send-reset-password-email', requireAuth, sendPasswordResetEmail)

//POST - reset employee's password using token
router.post('/reset-password', resetEmployeePassword)

//export router module that handles all employee routes
module.exports = router;
