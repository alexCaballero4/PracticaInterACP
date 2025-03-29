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
  nombre: String,
  apellidos: String,
  nif: String,
  logo: String,
  company: {
    name: String,
    cif: {
      type: String,
      unique: true,
      sparse: true
    },
    street: String,
    number: Number,
    postal: Number,
    city: String,
    province: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);