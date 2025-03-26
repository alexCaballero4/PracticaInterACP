const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'validated'],
        default: 'pending',
    },
    code: {
        type: String,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    role: {
        type: String,
        default: 'user',
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
