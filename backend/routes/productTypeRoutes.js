//import modules
const express = require('express');
const { getAllProductTypes, getSingleProductType, createNewProductType, updateSingleProductType, deleteSingleProductType } = require('../controllers/productTypeController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Product Types
router.get('/', requireAuth, getAllProductTypes)

//GET - get a single Product Type by id
router.get('/:id', requireAuth, getSingleProductType)

//POST - create a new ProductType
router.post('/create', requireAuth, createNewProductType)

//PUT - update a single ProductType
router.put('/:id', requireAuth, updateSingleProductType)

//DELETE - delete a single ProductType
router.delete('/:id', requireAuth, deleteSingleProductType)


//export router module that handles all ProductType routes
module.exports = router;