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
        ref: 'Order'
    },
    products: [{    //THIS Array is exactly the same as 'Order model' because we want to pull the data from order.
        product_obj_ref: {   //this will point at product_obj_ref, product_name, product_sku, product_number_a, product_unit_a, etc....
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        invoice_product_location: {     //these are not in PRODUCT model, but additional information relating to a particular product
            type: String,
            required: true
        },
        // ** change name to invoice_qty 
        invoice_product_qty_a: {
            type: Number,
            required: true,
            min: 0
        },
        // ** add on product price, for easily display infor, no need to search in the productprice table
        invoice_product_price_unit: {
            type: Number,
            required: true,
            min: 0
        },
        // ** only need to store the invoiced_gross_amont 
        invoice_product_gross_amount_a: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    custom_products:[{
        custom_product_name:{
            type: String
        }, 
        custom_product_location: {
            type: String
        },
        custom_order_qty:{
            type: Number
        }, 
        custom_order_price:{
            type: Number
        }, 
        custom_order_gross_amount:{
            type: Number
        }
    }],
    invoiced_delivery_fee: {
        type: Number
    },
    invoiced_other_fee: {
        type: Number
    },
    invoiced_credit: {
        type: Number
    },
    invoiced_raw_total_amount_incl_gst: {
        type: Number,
        required: true
    },
    invoiced_calculated_total_amount_incl_gst: {
        type: Number,
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
    invoice_status: {
        type: String,
        enum: ["To review", "To reconcile", "Reviewed", "Cancelled", "Settled"],
        default: "To review"
    }
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Invoice', invoiceSchema);