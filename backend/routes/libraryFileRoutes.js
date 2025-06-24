//import modules
const express = require('express');
const multer = require('multer');
const { uploadFile, getSingleFile, getAllFiles, getSingleFileMeta } = require('../controllers/libraryFileController')

//create express' router
const router = express.Router();


//! Configure Multer (store files in memory, not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });


//GET - retrieve all files related to a particular library
router.get('/', getAllFiles);

//POST - library file upload endpoint
router.post('/upload', upload.single("file"), uploadFile)

//GET - retrieve library file endpoint
router.get('/:id', getSingleFile);

//GET - view library file
router.get('/view/:id', getSingleFileMeta);


//export router module that handles all employee routes
module.exports = router;