//import modules
const express = require('express');
const { getAllAliases, getSingleAlias, createNewAlias, updateSingleAlias, deleteSingleAlias } = require('../controllers/aliasController')

//create express' router
const router = express.Router();


//GET - get all Aliases
router.get('/', getAllAliases)

//GET - get a single Alias
router.get('/:id', getSingleAlias)

//POST - create a new Alias
router.post('/create', createNewAlias)

//PUT - update a single Alias
router.put('/:id', updateSingleAlias)

//DELETE - delete a single Alias
router.delete('/:id', deleteSingleAlias)


//export router module that handles all Alias routes
module.exports = router;