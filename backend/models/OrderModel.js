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
        unique: true,
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
        order_gross_amount: {
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
    //One order can be created without delivery. But if there's delivery, there must be a delivery_ID and delivery_status
    deliveries: [{
        _id: false,
        delivery_id: {
            type: Schema.Types.ObjectId,
            ref: 'Delivery',
            required: true
        },
        delivery_status: {
            type: String,
            required: true
        }
    }],
    //One order can be created without invoice. But if there's invoice, there must be an invoice_ID and invoice_status
    invoices: [{
        _id: false,
        invoice_id: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true
        },
        invoice_status: {
            type: String,
            required: true
        }
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    order_status: {
        type: String,
        required: true,
        enum: ["Draft","Pending","Approved","Rejected","Cancelled"]
    }
}, { timestamps: true });

// Mongoose Pre-save hook to check if there's at least one product
orderSchema.pre('save', function(next) {
    if (this.products.length === 0) {
        const err = new Error("An order must have at least one product. Please use SKU:'OTHER001' if required.");
        return next(err);
    }
    next();
});

//export the model
module.exports = mongoose.model('Order', orderSchema);