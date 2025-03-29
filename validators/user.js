const { check, body } = require('express-validator');

const personalDataValidator = [
  check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  check('apellidos').notEmpty().withMessage('Los apellidos son obligatorios'),
  check('nif')
    .matches(/^[0-9]{8}[A-Za-z]$/)
    .withMessage('El NIF debe tener 8 números y una letra'),
];

const companyDataValidator = [
  check('esAutonomo').isBoolean().withMessage('El campo esAutonomo debe ser booleano'),

  check('name')
    .if(body('esAutonomo').equals('false'))
    .notEmpty().withMessage('El nombre de empresa es obligatorio'),

  check('cif')
    .if(body('esAutonomo').equals('false'))
    .matches(/^[A-Z][0-9]{8}$/)
    .withMessage('El CIF debe tener 1 letra y 8 números'),

  check('street').notEmpty().withMessage('La calle es obligatoria'),
  check('number').isNumeric().withMessage('El número debe ser numérico'),
  check('postal').isNumeric().withMessage('El código postal debe ser numérico'),
  check('city').notEmpty().withMessage('La ciudad es obligatoria'),
  check('province').notEmpty().withMessage('La provincia es obligatoria'),
];

module.exports = { personalDataValidator, companyDataValidator };