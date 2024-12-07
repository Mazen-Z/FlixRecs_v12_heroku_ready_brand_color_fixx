// models/VisitCount.js
const mongoose = require('mongoose');

const visitCountSchema = new mongoose.Schema({
    count: { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model('VisitCount', visitCountSchema);
