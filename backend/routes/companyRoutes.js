//import modules
const { Router } = require('express');
const { getAllCompanies, getSingleCompany, createNewCompany, updateSingleCompany, deleteSingleCompany } = require('../controllers/companyController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = Router();

//GET - get all companies
//? currently not required, perhaps in the future, an admin user can create multiple companies.
router.get('/', requireAuth, getAllCompanies)

//GET - get a single company
router.get('/:id', requireAuth, getSingleCompany)

//POST - create a new company
router.post('/create', requireAuth, createNewCompany)

//PUT - update a single company
router.put('/:id', requireAuth, updateSingleCompany)

//DELETE - delete a single company
//? Currently the whole system only has one company 'EmpireCBS', perhaps in the future, an admin can create multiple companies and delete the company if needed.
router.delete('/:id', requireAuth, deleteSingleCompany)

//export the companyRoutes' router module
module.exports = router;

