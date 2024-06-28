//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object and define Order's schema/properties in its parameter.
const orderSchema = new Schema({
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    order_ref: {
        type: String,
        required: true
    },
    order_date: {
        type: Date,
        default: Date.now,
        required: true
    },
    order_est_date: {
        type: Date
    },
    order_est_time: {
        type: Date
    },
    products: [{
        product_id: {   //this will point at product_id, product_name, product_sku, product_number_a, product_unit_a, etc....
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        location: {     //these are not in PRODUCT model, but additional information relating to a particular product
            type: String,
            required: true
        },
        order_qty_a: {
            type: Number,
            required: true,
            min: 0
        },
        order_qty_b: {
            type: Number,
            required: true,
            min: 0
        },
        order_gross_amount_a: {
            type: Number,
            required: true,
            min: 0
        },
        order_gross_amount_b: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    order_total_amount: {
        type: Number,
        required: true,
        min: 0
    },
    order_internal_comments: {
        type: String
    },
    order_notes_to_supplier: {
        type: String
    },
    order_isarchived: {
        type: Boolean,
        default: false
    },
    invoices: [{
        type: Schema.Types.ObjectId,
        ref: 'Invoice'
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    deliveries: [{
        type: Schema.Types.ObjectId,
        ref: 'Delivery'
    }],
    statuses: [{
        type: Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    }]
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Order', orderSchema);