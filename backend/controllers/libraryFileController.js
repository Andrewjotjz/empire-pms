//import modules
const LibraryModel = require('../models/LibraryModel');


//Handle upload file 
const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        const { title, supplier, type, description, tags, featured } = req.body;

        if (!file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        // const savedFile = await Promise.all(
        //     file.map((file) => {
        //         return LibraryModel.create({
        //             title,
        //             supplier,
        //             type,
        //             description,
        //             tags: Array.isArray(tags) ? tags : tags ? [tags] : [], // support for multiple or single tag
        //             featured: featured === 'true', // because formData sends all fields as string
        //             file_original_name: file.originalname,
        //             file_name: file.originalname,
        //             file_url: `http://localhost:3000/uploads/${file.originalname}`,
        //             file_data: file.buffer,
        //             file_mime_type: file.mimetype,
        //         });
        //     })
        // );

        const savedFile = await LibraryModel.create({
            title,
            supplier,
            type,
            description,
            tags: Array.isArray(tags) ? tags : tags ? [tags] : [], // support for multiple or single tag
            featured: featured === 'true', // because formData sends all fields as string
            file_original_name: file.originalname,
            file_name: file.originalname,
            file_url: `http://localhost:3000/uploads/${file.originalname}`,
            file_data: file.buffer,
            file_mime_type: file.mimetype,
        });

        return res.status(201).json({
            message: "Files uploaded successfully.",
            file: savedFile
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ message: error.message });
    }
};

const getSingleFile = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await LibraryModel.findById(id).populate('type'); // Populate type name

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        // Set download headers
        res.set('Content-Type', file.file_mime_type);
        res.set('Content-Disposition', `attachment; filename="${file.file_name || 'downloaded_file'}"`);

        // Send binary file
        res.send(file.file_data);
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).json({ message: error.message });
    }
};

const getSingleFileMeta = async (req, res) => {
    try {
        const { id } = req.params;
        const file = await LibraryModel.findById(id).populate('type');

        if (!file) {
            return res.status(404).json({ message: "File not found." });
        }

        const meta = {
            id: file._id,
            title: file.title,
            supplier: file.supplier,
            type: {
                id: file.type._id,
                name: file.type.type_name
            },
            description: file.description,
            tags: file.tags,
            featured: file.featured,
            mimeType: file.file_mime_type,
            originalName: file.file_original_name,
            fileName: file.file_name,
            createdAt: file.createdAt,
        };

        res.status(200).json({ file: meta });
    } catch (error) {
        console.error("Error fetching file metadata:", error);
        res.status(500).json({ message: error.message });
    }
};


const getAllFiles = async (req, res) => {
    try {
        const files = await LibraryModel.find({})
            .populate('type') // So you can access type name
            .sort({ createdAt: -1 });

        // if (!files.length) {
        //     return res.status(404).json({ message: "No files found." });
        // }

        const fileData = files.map((file) => ({
            id: file._id,
            title: file.title,
            supplier: file.supplier,
            type: {
                id: file.type?._id,
                name: file.type?.type_name,
            },
            description: file.description,
            tags: file.tags,
            featured: file.featured,
            mimeType: file.file_mime_type,
            originalName: file.file_original_name,
            fileName: file.file_name,
            createdAt: file.createdAt,
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



module.exports = { uploadFile, getSingleFile, getAllFiles};