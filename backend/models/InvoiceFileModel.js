const mongoose = require("mongoose");

//create mongoose's Schema
const Schema = mongoose.Schema;

const invoiceFileSchema = new mongoose.Schema({
invoice_file_original_name: { 
    type: String, 
    required: true 
},
invoice_file_name: { 
    type: String, 
    required: true 
},
invoice_file_url: { 
    type: String, 
    required: true 
},
invoice_file_upload_date: { 
    type: Date, 
    default: Date.now 
},
invoice: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice'
    }
});

module.exports = mongoose.model("InvoiceFile", invoiceFileSchema);
