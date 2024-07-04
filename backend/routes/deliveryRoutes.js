//import modules
const express = require('express');
const { getAllDeliveries, getSingleDelivery, createNewDelivery, updateSingleDelivery, deleteSingleDelivery } = require('../controllers/deliveryController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Deliveries
router.get('/', requireAuth, getAllDeliveries)

//GET - get a single Delivery
router.get('/:id', requireAuth, getSingleDelivery)

//POST - create a new Delivery
router.post('/create', requireAuth, createNewDelivery)

//PUT - update a single Delivery
router.put('/:id', requireAuth, updateSingleDelivery)

//DELETE - delete a single Delivery
router.delete('/:id', requireAuth, deleteSingleDelivery)


//export router module that handles all Delivery routes
module.exports = router;