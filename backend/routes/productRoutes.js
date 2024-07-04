//import modules
const express = require('express');
const { getAllProducts, getSingleProduct, createNewProduct, updateSingleProduct, deleteSingleProduct } = require('../controllers/productController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Products
router.get('/', requireAuth, getAllProducts)

//GET - get a single Product
router.get('/:id', requireAuth, getSingleProduct)

//POST - create a new Product
router.post('/create', requireAuth, createNewProduct)

//PUT - update a single Product
router.put('/:id', requireAuth, updateSingleProduct)

//DELETE - delete a single Product
router.delete('/:id', requireAuth, deleteSingleProduct)


//export router module that handles all Product routes
module.exports = router;