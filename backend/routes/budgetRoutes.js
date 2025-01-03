//import modules
const express = require('express');
const { getAllBudgets, getSingleBudget, createNewBudget, updateSingleBudget, deleteSingleBudget } = require('../controllers/budgetController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Budgets
router.get('/', requireAuth, getAllBudgets)

//GET - get a single Budget
router.get('/:id', requireAuth, getSingleBudget)

//POST - create a new Budget
router.post('/create', requireAuth, createNewBudget)

//PUT - update a single Budget
router.put('/:id', requireAuth, updateSingleBudget)

//DELETE - delete a single Budget
router.delete('/:id', requireAuth, deleteSingleBudget)


//export router module that handles all Budget routes
module.exports = router;