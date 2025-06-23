const mongoose = require("mongoose");

//create mongoose's Schema
const Schema = mongoose.Schema;

const invoiceFileSchema = new mongoose.Schema({
    invoice_file_original_name: { type: String, required: true },
    invoice_file_name: { type: String, required: true },
    invoice_file_url: { type: String, required: true },
    invoice_file_data: { type: Buffer, required: true }, // Store file data as binary
    invoice_file_mime_type: { type: String, required: true }, // Store MIME type
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    invoice_file_upload_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InvoiceFile", invoiceFileSchema);
