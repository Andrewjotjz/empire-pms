//import modules
const express = require('express');
const { getAllAliases, getSingleAlias, createNewAlias, updateSingleAlias, deleteSingleAlias } = require('../controllers/aliasController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Aliases
router.get('/', requireAuth, getAllAliases)

//GET - get a single Alias
router.get('/:id', requireAuth, getSingleAlias)

//POST - create a new Alias
router.post('/create', requireAuth, createNewAlias)

//PUT - update a single Alias
router.put('/:id', requireAuth, updateSingleAlias)

//DELETE - delete a single Alias
router.delete('/:id', requireAuth, deleteSingleAlias)


//export router module that handles all Alias routes
module.exports = router;