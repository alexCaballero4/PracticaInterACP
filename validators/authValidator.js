const { check } = require('express-validator');

exports.registerValidator = [
    check('email')
        .isEmail().withMessage('Debe ser un email válido'),
    check('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

exports.validateEmailCode = [
    check('code')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
        .isNumeric().withMessage('El código debe ser numérico'),
];

