//import modules
const InvoiceFileModel = require('../models/InvoiceFileModel');


//Handle upload invoice 
const uploadInvoiceFile = async (req, res) => {
    try {
        const files = req.files;
        const { id } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files uploaded." });
        }

        console.log("Multiple files in request:", req.files);

        // Save file metadata to MongoDB
        const savedFiles = await Promise.all(
            files.map((file) =>
                InvoiceFileModel.create({
                    invoice_file_original_name: file.originalname,
                    invoice_file_name: file.filename,
                    invoice_file_url: `http://localhost:3000/uploads/${file.filename}`,
                    invoice: id
                })
            )
        );

        const urls = savedFiles.map(file => file.invoice_file_url)

        console.log("SavedFiles showing:", savedFiles);

        return res.status(201).json({
            message: "Files uploaded successfully.",
            urls
        });
    } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadInvoiceFile };