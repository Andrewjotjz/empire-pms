//import modules
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const librarySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    supplier: {
        type: String,
        required: true
    },
    type: {
        type: Schema.Types.ObjectId,
        ref: 'ProductType',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    file_original_name: { type: String, required: true },
    file_name: { type: String, required: true },
    file_url: { type: String, required: true },
    file_data: { type: Buffer, required: true }, // Store file data as binary
    file_mime_type: { type: String, required: true }, // Store MIME type
    tags: [{
        type: String,
    }],
    featured: {
        type: Boolean,
        default: false
    },
    archived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('Library', librarySchema);