//import modules
const express = require('express');
const { getAllProducts, getSingleProduct, createNewProduct, updateSingleProduct, deleteSingleProduct } = require('../controllers/productController')

//create express' router
const router = express.Router();


//GET - get all Products
router.get('/', getAllProducts)

//GET - get a single Product
router.get('/:id', getSingleProduct)

//POST - create a new Product
router.post('/create', createNewProduct)

//PUT - update a single Product
router.put('/:id', updateSingleProduct)

//DELETE - delete a single Product
router.delete('/:id', deleteSingleProduct)


//export router module that handles all Product routes
module.exports = router;