//import modules
const express = require('express');
const { getAllInvoices, getSingleInvoice, createNewInvoice, updateSingleInvoice, deleteSingleInvoice } = require('../controllers/invoiceController')

//create express' router
const router = express.Router();


//GET - get all Invoices
router.get('/', getAllInvoices)

//GET - get a single Invoice
router.get('/:id', getSingleInvoice)

//POST - create a new Invoice
router.post('/create', createNewInvoice)

//PUT - update a single Invoice
router.put('/:id', updateSingleInvoice)

//DELETE - delete a single Invoice
router.delete('/:id', deleteSingleInvoice)


//export router module that handles all Invoice routes
module.exports = router;