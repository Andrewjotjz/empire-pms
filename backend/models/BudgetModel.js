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
    entries: [{
        area_info: {
            area_id: { type: Schema.Types.ObjectId },
            area_name: { type: String }, // Eg: COMMON AREA, APARTMENT
            level_id: { type: Schema.Types.ObjectId },
            level_name: { type: String }, // Eg: null, Ground - South, Ground - North, Level 1 - South,  Level 1, Level 2, Level 3....
            subarea_id: { type: Schema.Types.ObjectId },
            subarea_name: { type: String } // Eg: null, Balcony, Alimak, Lift Lobby
        },
        product_type_obj_ref: {
            type_id: {
                type: Schema.Types.ObjectId, // Eg: Plasterboard, Framing Wall
                ref: 'ProductType',
                required: true
            },
            type_total_m2: { type: Number, default: 0 }, // TO SHOW TOTAL ONLY
            type_rate: { type: Number, default: 0 },
            type_total_amount: { type: Number, default: 0 },
            category_obj_ref: [{
                category_id: {
                    type: Schema.Types.ObjectId // Eg: 13 FR, 64mm Stud 0.5bmt (3m height)
                },
                category_total_m2: { type: Number, default: 0 }, // TO BE INPUT
                category_rate: { type: Number, default: 0 },
                category_total_amount: { type: Number, default: 0 },
                subcategory_obj_ref: [{
                    subcategory_id: {
                        type: Schema.Types.ObjectId  // Eg: 64mm Stud, 64mm Track, 64mm Noggin
                    },
                    subcategory_total_m2: { type: Number, default: 0 }, // TO BE INPUT
                    subcategory_rate: { type: Number, default: 0 },
                    subcategory_total_amount: { type: Number, default: 0 }
                }]
            }]
        }
    }],
    budget_isarchived: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
// const budgetSchema = new Schema({
//     budget_name: {
//         type: String,
//         required: true
//     },
//     project: {
//         type: Schema.Types.ObjectId,
//         ref: 'Project',
//         required: true
//     },
//     budget_area: {
//         type: Schema.Types.ObjectId
//     },
//     budget_area_level: {
//         type: Schema.Types.ObjectId
//     },
//     budget_area_subarea: {
//         type: Schema.Types.ObjectId
//     },
//     entries: [{
//         product_type_obj_ref: {
//             type_id: {
//                 type: Schema.Types.ObjectId,
//                 ref: 'ProductType',
//                 required: true
//             },
//             type_total_m2: { type: Number, default: 0 },
//             type_rate: { type: Number, default: 0 },
//             type_total_amount: { type: Number, default: 0 },
//             category_obj_ref: [{
//                 category_id: {
//                     type: Schema.Types.ObjectId
//                 },
//                 category_total_m2: { type: Number, default: 0 },
//                 category_rate: { type: Number, default: 0 },
//                 category_total_amount: { type: Number, default: 0 },
//                 subcategory_obj_ref: [{
//                     subcategory_id: {
//                         type: Schema.Types.ObjectId
//                     },
//                     subcategory_total_m2: { type: Number, default: 0 },
//                     subcategory_rate: { type: Number, default: 0 },
//                     subcategory_total_amount: { type: Number, default: 0 }
//                 }]
//             }]
//         }        
//     }],
//     budget_isarchived: {
//         type: Boolean,
//         default: false
//     }
// }, { timestamps: true });


// check if the model already exists before creating it
const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
module.exports = Budget;