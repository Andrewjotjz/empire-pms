//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Payment schema/properties in its parameter
const paymentSchema = new Schema({
    payment_type: {
        type: String,
        required: true,
        enum: ['Invoice', 'Bulk invoices (statement)']
    },
    payment_ref: {
        type: String
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier',
        required: true
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['Bank transfer', 'Credit card', 'Cash', 'Letter of credit', 'Others']
    },
    payment_datetime: {
        type: Date,
        required: true,
        default: Date.now
    },
    payment_raw_total_amount_incl_gst: {
        type: Number,
        min: 0,
        required: true
    },
    payment_outstanding_amount: {
        type: Number,
        min: 0
    },
    period_start_date: {
        type: Date,
        required: true
    },
    period_end_date: {
        type: Date,
        required: true
    },
    invoices: [{
        invoice_id: {
        type: Schema.Types.ObjectId,
        ref: 'Invoice',
        required: true
        },
        gross_total_amount: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    status: {
        type: Schema.Types.ObjectId,
        ref: 'Status',
        required: true
    },
    employees: [{
        type: Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    }],
    payment_internal_comments: {
        type: String
    }
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Payment', paymentSchema);