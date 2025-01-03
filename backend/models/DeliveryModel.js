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
        unique: true,
        required: true
    },
    products: [{
        product_obj_ref: {   //this will point at product_obj_ref, product_name, product_sku, product_number_a, product_unit_a, etc....
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        // ** Only need to store delivery/invoice qty 
        delivered_qty_a: {
            type: Number,
            required: true,
            min: 0
        }
    }],
    delivery_receiving_date: {
        type: Date,
        required: true
    },
    delivery_status: {
        type: String,
        required: true,
        enum: ["Partially delivered", "Delivered"]
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    },
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    delivery_isarchive: {
        type: Boolean,
        default: false
    },
    delivery_notes: {
        type: String
    }

}, { timestamps: true });

//export the model
module.exports = mongoose.model('Delivery', deliverySchema);