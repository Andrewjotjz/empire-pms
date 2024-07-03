//import modules
const express = require('express');
const { getAllDeliveries, getSingleDelivery, createNewDelivery, updateSingleDelivery, deleteSingleDelivery } = require('../controllers/deliveryController')

//create express' router
const router = express.Router();


//GET - get all Deliveries
router.get('/', getAllDeliveries)

//GET - get a single Delivery
router.get('/:id', getSingleDelivery)

//POST - create a new Delivery
router.post('/create', createNewDelivery)

//PUT - update a single Delivery
router.put('/:id', updateSingleDelivery)

//DELETE - delete a single Delivery
router.delete('/:id', deleteSingleDelivery)


//export router module that handles all Delivery routes
module.exports = router;