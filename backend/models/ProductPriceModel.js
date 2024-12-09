//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;


const productPriceSchema = new Schema({
    product_obj_ref: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    product_unit_a: {
        type: String,
        required: true
    },
    product_number_a: {
        type: Number,
        required: true,
        min: 0
    },
    product_price_unit_a: {
        type: Number,
        required: true,
        min: 0
    },
    product_unit_b: {
        type: String,
        required: true
    },
    product_number_b: {
        type: Number,
        required: true,
        min: 0
    },
    product_price_unit_b: {
        type: Number,
        required: true,
        min: 0
    },
    price_fixed: {
        type: Boolean,
        default: false
    },
    product_actual_rate: {
        type: Number,
        required: true,
        min: 0
    },
    product_effective_date: {
        type: Date,
        required: true
    },
    projects: [{
        type: Schema.Types.ObjectId,
        ref: 'Project'
        }]
        
}, { timestamps: true });

//export the model
const ProductPrice = mongoose.models.ProductPrice || mongoose.model('ProductPrice', productPriceSchema);
module.exports = ProductPrice;