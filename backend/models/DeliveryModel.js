//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create new Schema object and define Delivery schema/properties in its parameter
const deliverySchema = new Schema({
    delivery_evidence_type: {
        type: String,
        required: true,
        enum: ['Delivery Docket', 'Invoice']
    },
    delivery_evidence_reference: {
        type: String,
        required: true
    },
    products: [{
        product_id: {   //this will point at product_id, product_name, product_sku, product_number_a, product_unit_a, etc....
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        delivered_qty_a: {
            type: Number,
            required: true,
            min: 0
        },
        delivered_qty_b: {
            type: Number,
            required: true,
            min: 0
        },
    }],
    delivery_receiving_date: {
        type: Date,
        required: true
    },
    status: {   //NEEDS TO BE REVIEWED
        type: Schema.Types.ObjectId,
        ref: 'Status'
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    },

});

//export the model
module.exports = mongoose.model('Delivery', deliverySchema);