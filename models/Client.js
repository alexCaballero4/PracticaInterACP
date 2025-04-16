const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
    name: { type: String, required: true },
    cif: { type: String, required: true, unique: true },
    logo: { type: String },
    address: {
        street: { type: String },
        number: { type: Number },
        postal: { type: Number },
        city: { type: String },
        province: { type: String },
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['active', 'archived'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
