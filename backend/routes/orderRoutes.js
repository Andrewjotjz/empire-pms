//import modules
const express = require('express');
const { getAllOrders, getSingleOrder, createNewOrder, updateSingleOrder, deleteSingleOrder } = require('../controllers/orderController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Orders
router.get('/', requireAuth, getAllOrders)

//GET - get a single Order
router.get('/:id', requireAuth, getSingleOrder)

//POST - create a new Order
router.post('/create', requireAuth, createNewOrder)

//PUT - update a single Order
router.put('/:id', requireAuth, updateSingleOrder)

//DELETE - delete a single Order
router.delete('/:id', requireAuth, deleteSingleOrder)


//export router module that handles all Order routes
module.exports = router;