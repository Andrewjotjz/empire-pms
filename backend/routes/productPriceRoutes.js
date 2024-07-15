//import modules
const express = require('express');
const { getAllProductPrices, getSingleProductPrice, createNewProductPrice, updateSingleProductPrice, deleteSingleProductPrice } = require('../controllers/productPriceController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Products
router.get('/', requireAuth, getAllProductPrices)

//GET - get a single Product
router.get('/:id', requireAuth, getSingleProductPrice)

//POST - create a new Product
router.post('/create', requireAuth, createNewProductPrice)

//PUT - update a single Product
router.put('/:id', requireAuth, updateSingleProductPrice)

//DELETE - delete a single Product
router.delete('/:id', requireAuth, deleteSingleProductPrice)


//export router module that handles all Product routes
module.exports = router;