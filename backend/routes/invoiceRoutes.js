//import modules
const express = require('express');
const { getAllInvoices, getSingleInvoice, createNewInvoice, updateSingleInvoice, deleteSingleInvoice } = require('../controllers/invoiceController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Invoices
router.get('/', requireAuth, getAllInvoices)

//GET - get a single Invoice
router.get('/:id', requireAuth, getSingleInvoice)

//POST - create a new Invoice
router.post('/create', requireAuth, createNewInvoice)

//PUT - update a single Invoice
router.put('/:id', requireAuth, updateSingleInvoice)

//DELETE - delete a single Invoice
router.delete('/:id', requireAuth, deleteSingleInvoice)


//export router module that handles all Invoice routes
module.exports = router;