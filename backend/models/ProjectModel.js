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
    }]
}, { timestamps: true });

// Custom validation function for array limit
function arrayLimit(val) {
    return val.length <= 5;
}

//export the model
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
module.exports = Project;

