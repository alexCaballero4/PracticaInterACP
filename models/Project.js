const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    projectCode: { type: String, required: true },
    email: { type: String },
    code: { type: String }, // Código interno del proyecto
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: {
        street: { type: String },
        number: { type: Number },
        postal: { type: Number },
        city: { type: String },
        province: { type: String },
    },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
