//import modules
const express = require('express');
const { getAllStatuses, getSingleStatus, createNewStatus, updateSingleStatus, deleteSingleStatus } = require('../controllers/statusController')
//import function from middlewares folder
const { requireAuth } = require('../middlewares/authMiddleware');

//create express' router
const router = express.Router();


//GET - get all Statuses
router.get('/', requireAuth, getAllStatuses)

//GET - get a single Status
router.get('/:id', requireAuth, getSingleStatus)

//POST - create a new Status
router.post('/create', requireAuth, createNewStatus)

//PUT - update a single Status
router.put('/:id', requireAuth, updateSingleStatus)

//DELETE - delete a single Status
router.delete('/:id', requireAuth, deleteSingleStatus)


//export router module that handles all Status routes
module.exports = router;