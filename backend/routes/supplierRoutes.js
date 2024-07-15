//import modules
const express = require('express');
const { getAllSuppliers, getSingleSupplier, getsingleSupplierProducts,getsingleproductbySupplier, createNewSupplier, updateSingleSupplier, deleteSingleSupplier } = require('../controllers/supplierController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Suppliers
router.get('/', requireAuth, getAllSuppliers)

//GET - get a single Supplier
router.get('/:id', requireAuth, getSingleSupplier)

//GET - get all products related to a single Supplier
router.get('/:id/products', requireAuth, getsingleSupplierProducts)

//GET - get one product data related to a single Supplier
router.get('/:supplierId/products/:productId', requireAuth, getsingleproductbySupplier)

//POST - create a new Supplier
router.post('/create', requireAuth, createNewSupplier)

//PUT - update a single Supplier
router.put('/:id', requireAuth, updateSingleSupplier)

//DELETE - delete a single Supplier
router.delete('/:id', requireAuth, deleteSingleSupplier)


//export router module that handles all Supplier routes
module.exports = router;