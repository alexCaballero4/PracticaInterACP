const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'pending'
  },
  role: {
    type: String,
    default: 'user'
  },
  code: {
    type: String,
    default: null
  },
  attempts: {
    type: Number,
    default: 0
  },
  nombre: {
    type: String
  },
  apellidos: {
    type: String
  },
  nif: {
    type: String
  },
  company: {
    nombre: String,
    cif: String,
    direccion: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);