//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Status schema/properties in its parameter
const statusSchema = new Schema({
    status_name: {
        type: String,
        required: true
    },
    status_type: {
        type: String,
        required: true,
        enum: ['Order', 'Supplier', 'Delivery', 'Invoice']
    },
    employee: {
        type: Schema.Types.ObjectId,
        ref: 'Employee'
    },
    status_change_datetime: {
        type: Date,
        required: true,
        default: Date.now
    },
    status_change_details: {
        type: String,
        required: true
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status_internal_comment: {
        type: String
    }
}, { timestamps: true });

//export the model
module.exports = mongoose.model('Status', statusSchema);