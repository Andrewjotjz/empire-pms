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

        // Save file metadata to MongoDB
        const savedFiles = await Promise.all(
            files.map((file) => {
                InvoiceFileModel.create({
                    invoice_file_original_name: file.originalname,
                    invoice_file_name: file.originalname,
                    invoice_file_url: `http://localhost:3000/uploads/${file.originalname}`,
                    invoice_file_data: file.buffer, // Save file data in binary format
                    invoice_file_mime_type: file.mimetype, // Save file MIME type
                    invoice: id
                })}
            )
        );

        return res.status(201).json({
            message: "Files uploaded successfully.",
            files: savedFiles
        });
    } catch (error) {
        console.error("Error uploading files:", error);
        res.status(500).json({ message: error.message });
    }
};


const getSingleInvoiceFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await InvoiceFileModel.findById(id);

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        // Set the Content-Type
        res.set('Content-Type', file.invoice_file_mime_type);

        // Set the Content-Disposition header to suggest a filename for the download
        res.set('Content-Disposition', `attachment; filename="${file.invoice_file_name || 'downloaded_file'}"`);

        // Send binary data
        res.send(file.invoice_file_data); 
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ message: error.message });
    }
};

const getAllInvoiceFiles = async (req, res) => {
    try {
        const { id } = req.params; // Invoice ID

        // Find all files associated with the invoice ID
        const files = await InvoiceFileModel.find({ invoice: id });

        if (!files || files.length === 0) {
            return res.status(404).json({ message: "No files found for this invoice." });
        }

        // Prepare files for response
        const fileData = files.map((file) => ({
            id: file._id,
            originalName: file.invoice_file_original_name,
            mimeType: file.invoice_file_mime_type,
        }));

        res.status(200).json({
            message: "Files retrieved successfully.",
            files: fileData,
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        res.status(500).json({ message: error.message });
    }
};


module.exports = { uploadInvoiceFile, getSingleInvoiceFile, getAllInvoiceFiles};