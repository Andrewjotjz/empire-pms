//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

const subcategorySchema = new Schema({
    subcategory_name: {
        type: String
    }
}, { timestamps: true })


const categorySchema = new Schema({
    category_name: {
        type: String
    }, 
    subcategories: {
        type: [subcategorySchema]
    }
}, { timestamps: true })

const productTypeSchema = new Schema({
    type_name: {
        type: String,
        required: true,
        unique: true
    },
    type_categories: {
        type: [categorySchema]
    },
    type_isarchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


// check if the model already exists before creating it
const ProductType = mongoose.models.ProductType || mongoose.model('ProductType', productTypeSchema);
module.exports = ProductType;