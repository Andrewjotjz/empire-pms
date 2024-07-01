//import modules
const { Router } = require('express');
const { getSingleCompany, createNewCompany, updateSingleCompany } = require('../controllers/companyController')

//create express' router
const router = Router();

//GET - get all companies
//? currently not required, perhaps in the future, an admin user can create multiple companies.

//GET - get a single company
router.get('/:id', getSingleCompany)

//POST - create a new company
router.post('/create', createNewCompany)

//PUT - update a single company
router.put('/:id', updateSingleCompany)

//DELETE - delete a single company
//? Currently the whole system only has one company 'EmpireCBS', perhaps in the future, an admin can create multiple companies and delete the company if needed.

//export the companyRoutes' router module
module.exports = router;

