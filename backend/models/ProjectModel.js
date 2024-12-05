//import modules
const mongoose = require('mongoose');

//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Project's schema/properties in its parameter.
const projectSchema = new Schema({
    project_name: {
        type: String,
        required: true
    },
    project_address: {
        type: String,
        required: true
    },
    project_isarchived: {
        type: Boolean,
        default: false
    },
    suppliers: [{
        type: Schema.Types.ObjectId,
        ref: 'Supplier'
    }],
    area_obj_ref: [{
        areas: {
            area_id: {
                type: Schema.Types.ObjectId
            },
            area_name: { 
                type: String
            },
            levels: [{
                level_id: {
                    type: Schema.Types.ObjectId
                },
                level_name: { 
                    type: String
                },
                subareas: [{
                    subarea_id: {
                        type: Schema.Types.ObjectId
                    },
                    subarea_name: {
                        type: String
                    }
                }]
            }]
        }
    }]
}, { timestamps: true });

// Custom validation function for array limit
function arrayLimit(val) {
    return val.length <= 5;
}

//export the model
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
module.exports = Project;

