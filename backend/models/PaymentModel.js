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
        type: String,
        unique: true
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
    payment_term: [{
        payment_datetime: {
            type: Date,
            required: true,
            default: Date.now
        },
        payment_amount_paid: {
            type: Number,
            min: 0
        }
    }],
    payment_raw_total_amount_incl_gst: {
        type: Number,
        min: 0,
        required: true
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
        _id: false,
        invoice_obj_ref: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: true
        },
        // ** Not necessary, already exist in the invoice db
        gross_total_amount: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    payment_status: {
        type: String,
        required: true,
        enum: ["In Review","Statement Checked","Fully Settled","Partially Settled"],
        default: "In Review"
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
const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
module.exports = Payment;