//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Invoice schema/properties in its parameter
const invoiceSchema = new Schema({
    invoice_ref: {
        type: String,
        required: true
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    invoice_issue_date: {
        type: Date,
        required: true
    },
    invoice_received_date: {
        type: Date,
        default: Date.now
    },
    invoice_due_date: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 30*24*60*60*1000); // 30 days in milliseconds
        }
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    products: [{    //THIS Array is exactly the same as 'Order model' because we want to pull the data from order.
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
    invoiced_delivery_fee: {
        type: Number,
        min: 0
    },
    invoiced_other_fee: {
        type: Number,
        min: 0
    },
    invoiced_credit: {
        type: Number,
        min: 0
    },
    invoiced_raw_total_amount_incl_gst: {
        type: Number,
        min: 0,
        required: true
    },
    invoiced_calculated_total_amount_incl_gst: {
        type: Number,
        min: 0,
        required: true
    },
    invoice_is_stand_alone: {
        type: Boolean,
        default: false,
        required: true
    },
    invoice_internal_comments: {
        type: String
    },
    invoice_isarchived: {
        type: Boolean,
        default: false
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: 'Payment'
    },
    status: {
        type: Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    },
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Invoice', invoiceSchema);