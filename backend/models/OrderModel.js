//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object and define Order's schema/properties in its parameter.
const orderSchema = new Schema({
    supplier: {
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    },
    order_ref: {
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
    },
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }], location,
    
});

//export the model
module.exports = mongoose.model('Order', orderSchema);