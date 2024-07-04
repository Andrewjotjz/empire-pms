//import modules
const express = require('express');
const { getAllPayments, getSinglePayment, createNewPayment, updateSinglePayment, deleteSinglePayment } = require('../controllers/paymentController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Payments
router.get('/', requireAuth, getAllPayments)

//GET - get a single Payment
router.get('/:id', requireAuth, getSinglePayment)

//POST - create a new Payment
router.post('/create', requireAuth, createNewPayment)

//PUT - update a single Payment
router.put('/:id', requireAuth, updateSinglePayment)

//DELETE - delete a single Payment
router.delete('/:id', requireAuth, deleteSinglePayment)


//export router module that handles all Payment routes
module.exports = router;