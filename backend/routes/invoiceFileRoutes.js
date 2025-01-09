//import modules
const express = require('express');
const multer = require('multer');
const { uploadInvoiceFile, getSingleInvoiceFile, getAllInvoiceFiles } = require('../controllers/invoiceFileController')

//create express' router
const router = express.Router();


//! Configure Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./uploads"); // Local folder for uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname); // Rename file to avoid conflicts
//   },
// });
// const upload = multer({ storage });


//! Configure Multer (store files in memory, not on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

//POST - invoice file upload endpoint
router.post('/upload', upload.array("invoices", 10), uploadInvoiceFile)

//GET - retrieve invoice file endpoint
router.get('/retrieve-single/:id', getSingleInvoiceFile);

//GET - retrieve all files related to a particular invoice
router.get('/retrieve-all/:id', getAllInvoiceFiles);


//export router module that handles all employee routes
module.exports = router;