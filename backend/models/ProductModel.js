//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

// //create a new Schema object and define Product's type schema/properties in its parameter.
// const productTypeSchema = new Schema({
//     type_name: {
//         type: String,
//         required: true
//     },
//     type_description: {
//         type: String,
//     }
// });

// //create a new Schema object and define a Product's schema/properties in its parameter.
// const productSchema = new Schema({
//     product_sku: {
//         required: true
//     },
//     product_name: {
//         required: true
//     },
//     product_number_a: {
//         type: Number,
//         required: true
//     },
//     product_unit_a: {
//         required: true
//     },
//     product_price_unit_a: {
//         required: true
//     },
//     product_number_b: {
//         type: Number,
//         required: true
//     },
//     product_unit_b: {
//         required: true
//     },
//     product_price_unit_b: {
//         required: true
//     },
//     product_effective_date: {
//         required: true
//     },
//     product_types: {
//         type: [productTypeSchema],
//         required: true
//     },
//     product_next_available_stock_date: {
//         required: false
//     },
//     product_isarchived: {
//         type: Boolean,
//         default: false
//     },
//     supplier: {
//         type: Schema.Types.ObjectId,
//         ref: 'Supplier',
//         required: true
//     },
//     project: {
//         type: Schema.Types.ObjectId,
//         ref: 'Project',
//         required: true
//     },
//     alias: {
//         type: Schema.Types.ObjectId,
//         ref: 'Alias'
//     }
// })

const productTypeSchema = new Schema({
    type_name: {
        type: String,
        required: true
    },
    type_description: {
        type: String
    }
});

const productSchema = new Schema({
    product_sku: {
        type: String,
        required: true
    },
    product_name: {
        type: String,
        required: true
    },
    product_number_a: {
        type: Number,
        required: true,
        min: 0
    },
    product_unit_a: {
        type: String,
        required: true
    },
    product_price_unit_a: {
        type: Number,
        required: true,
        min: 0
    },
    product_number_b: {
        type: Number,
        required: true,
        min: 0
    },
    product_unit_b: {
        type: String,
        required: true
    },
    product_price_unit_b: {
        type: Number,
        required: true,
        min: 0
    },
    product_effective_date: {
        type: Date,
        required: true
    },
    product_types: {
        type: [productTypeSchema],
        required: true
    },
    product_next_available_stock_date: {
        type: Date
    },
    product_isarchived: {
        type: Boolean,
        default: false
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    alias: {
        type: Schema.Types.ObjectId,
        ref: 'Alias'
    }
});

//export the model
module.exports = mongoose.model('Product', productSchema);