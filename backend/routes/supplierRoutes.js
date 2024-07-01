//import modules
const express = require('express');
const { getAllSuppliers, getSingleSupplier, createNewSupplier, updateSingleSupplier, deleteSingleSupplier } = require('../controllers/supplierController')

//create express' router
const router = express.Router();


//GET - get all Suppliers
router.get('/', getAllSuppliers)

//GET - get a single Supplier
router.get('/:id', getSingleSupplier)

//POST - create a new Supplier
router.post('/create', createNewSupplier)

//PUT - update a single Supplier
router.put('/:id', updateSingleSupplier)

//DELETE - delete a single Supplier
router.delete('/:id', deleteSingleSupplier)


//export router module that handles all Supplier routes
module.exports = router;