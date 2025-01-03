//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

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
    product_type: {
        type: Schema.Types.ObjectId,
        ref: 'ProductType',
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
    product_note: {
        type: String
    },
    product_isarchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


// check if the model already exists before creating it
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = Product;