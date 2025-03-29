const { check } = require('express-validator');

const registerValidator = [
    check('email')
        .isEmail().withMessage('Debe ser un email válido'),
    check('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const validateEmailCode = [
    check('code')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
        .isNumeric().withMessage('El código debe ser numérico'),
];

const loginValidator = [
    check('email')
        .isEmail().withMessage('Debe ser un email válido'),
    check('password')
        .notEmpty().withMessage('La contraseña es obligatoria'),
];

const personalDataValidator = [
    check('nombre')
        .notEmpty().withMessage('El nombre es obligatorio'),
    check('apellidos')
        .notEmpty().withMessage('Los apellidos son obligatorios'),
    check('nif')
        .matches(/^[0-9]{8}[A-Za-z]$/).withMessage('El NIF debe tener 8 números y una letra'),
];

module.exports = { registerValidator, validateEmailCode, loginValidator, personalDataValidator };