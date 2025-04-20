const mongoose = require('mongoose');

const deliveryNoteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },

    format: { type: String, enum: ['material', 'hours'], required: true },
    material: { type: String },
    hours: { type: Number },

    description: { type: String, required: true },
    workdate: { type: String, required: true },

    sign: { type: String, default: null },
    pdf: { type: String, default: null },
    pending: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('DeliveryNote', deliveryNoteSchema);
