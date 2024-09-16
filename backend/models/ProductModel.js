//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

const validProductTypes = ["Compound",
    "Access Panel",
    "Framing Ceiling",
    "Framing Wall",
    "Batt Insulation",
    "Rigid Insulation",
    "Plasterboard",
    "External Cladding",
    "SpeedPanel",
    "Timber",
    "Others",
    "Tools",
    "Plastering(Fixings/Screws)",
    "Framing Ceiling(Accessories)",
    "Framing Wall(Accessories)",
    "Rigid Insulation(Accessories)",
    "Plasterboard(Accessories)",
    "External Cladding(Accessories)",
    "SpeedPanel(Accessories)"];

const productSchema = new Schema({
    product_sku: {
        type: String,
        trim: true,
        required: true
    },
    product_name: {
        type: String,
        trim: true,
        required: true
    },
    product_types: {
        type: String,
        enum: validProductTypes,
        required: true
    },
    product_actual_size: {
        type: Number,
        required: true,
        min: 0
    },
    product_next_available_stock_date: {
        type: Date, 
        default: null
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    alias: {
        type: Schema.Types.ObjectId,
        ref: 'Alias'
    },
    product_isarchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


// Add custom validation using the path method
productSchema.path('product_types').validate(function(value) {
    return validProductTypes.includes(value); // Reuse the centralized array here
}, 'Invalid product type');


// check if the model already exists before creating it
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = Product;