//import modules
const express = require('express');
const { getAllOrders, getSingleOrder, createNewOrder, updateSingleOrder, deleteSingleOrder } = require('../controllers/orderController')

//create express' router
const router = express.Router();


//GET - get all Orders
router.get('/', getAllOrders)

//GET - get a single Order
router.get('/:id', getSingleOrder)

//POST - create a new Order
router.post('/create', createNewOrder)

//PUT - update a single Order
router.put('/:id', updateSingleOrder)

//DELETE - delete a single Order
router.delete('/:id', deleteSingleOrder)


//export router module that handles all Order routes
module.exports = router;