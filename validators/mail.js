const { check, validationResult } = require('express-validator');

// Función para manejar los resultados de la validación
const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validatorMail = [
  check("subject").exists().notEmpty(),
  check("text").exists().notEmpty(),
  check("to").exists().notEmpty(),
  check("from").exists().notEmpty(),
  (req, res, next) => {
    return validateResults(req, res, next); // Llama a la función de validación
  }
];

module.exports = { validatorMail };