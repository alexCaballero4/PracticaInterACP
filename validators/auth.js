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

module.exports = { registerValidator, validateEmailCode, loginValidator };