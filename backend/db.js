const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load the .env file
dotenv.config();

const dbA = mongoose.createConnection(process.env.MONG_URI);
const dbB = mongoose.createConnection(process.env.MONG_URI_B);

module.exports = { dbA, dbB };
