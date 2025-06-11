//import modules
const mongoose = require('mongoose');


//create mongoose's Schema
const Schema = mongoose.Schema;

//create a new Schema object, and define Alias's schema/properties in its parameter.
const aliasSchema = new Schema({
    alias_name: {
        type: String,
        unique: true,
        required: true
    }
}, { timestamps: true })


// Export the model
// const Alias = mongoose.model('Alias', aliasSchema);

// Check if the model already exists before creating it
const Alias = mongoose.models.Alias || mongoose.model('Alias', aliasSchema);
module.exports = Alias;

// module.exports = (connection) => connection.model('Alias', aliasSchema);

// module.exports = (connection) => {
//   // Register on custom connection (for writes or multi-tenant logic)
//   connection.model('Alias', aliasSchema);

//   // Also register on default connection (for .populate() to work properly)
//   if (mongoose.connection.models['Alias'] === undefined) {
//     mongoose.model('Alias', aliasSchema);
//   }

//   return connection.model('Alias');
// };