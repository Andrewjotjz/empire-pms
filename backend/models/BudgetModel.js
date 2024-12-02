//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;


const budgetSchema = new Schema({
    budget_name: {
        type: String,
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    budget_location: [{
        type: String,
        required: true
    }],
    entries: [{
        type_obj_ref: {
            type: Schema.Types.ObjectId,
            ref: 'ProductType',
            required: true
        },
        category: {
            category_id: Schema.Types.ObjectId,
            category_name: String,
            subcategory: {
                subcategory_id: Schema.Types.ObjectId,
                subcategory_name: String
            }
        },
        total_m2: { type: Number, required: true, default: 0 },
        rate: { type: Number, required: true, default: 0 },
        total_amount: { type: Number, required: true, default: 0 }
    }],
    budget_isarchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });


// check if the model already exists before creating it
const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
module.exports = Budget;