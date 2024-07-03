//import modules
const express = require('express');
const { getAllPayments, getSinglePayment, createNewPayment, updateSinglePayment, deleteSinglePayment } = require('../controllers/paymentController')

//create express' router
const router = express.Router();


//GET - get all Payments
router.get('/', getAllPayments)

//GET - get a single Payment
router.get('/:id', getSinglePayment)

//POST - create a new Payment
router.post('/create', createNewPayment)

//PUT - update a single Payment
router.put('/:id', updateSinglePayment)

//DELETE - delete a single Payment
router.delete('/:id', deleteSinglePayment)


//export router module that handles all Payment routes
module.exports = router;