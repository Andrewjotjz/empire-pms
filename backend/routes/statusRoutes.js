//import modules
const express = require('express');
const { getAllStatuses, getSingleStatus, createNewStatus, updateSingleStatus, deleteSingleStatus } = require('../controllers/statusController')

//create express' router
const router = express.Router();


//GET - get all Statuses
router.get('/', getAllStatuses)

//GET - get a single Status
router.get('/:id', getSingleStatus)

//POST - create a new Status
router.post('/create', createNewStatus)

//PUT - update a single Status
router.put('/:id', updateSingleStatus)

//DELETE - delete a single Status
router.delete('/:id', deleteSingleStatus)


//export router module that handles all Status routes
module.exports = router;