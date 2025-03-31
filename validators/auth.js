const { check, body } = require('express-validator');

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

const companyDataValidator = [
    check('esAutonomo')
        .isBoolean().withMessage('El campo esAutonomo debe ser booleano'),

    check('name')
        .if(body('esAutonomo').equals('false'))
        .notEmpty().withMessage('El nombre de empresa es obligatorio'),
    check('cif')
        .if(body('esAutonomo').equals('false'))
        .matches(/^[A-Z][0-9]{8}$/).withMessage('El CIF debe tener 1 letra y 8 números'),

    check('street')
        .notEmpty().withMessage('La calle es obligatoria'),
    check('number')
        .isNumeric().withMessage('El número debe ser numérico'),
    check('postal')
        .isNumeric().withMessage('El código postal debe ser numérico'),
    check('city')
        .notEmpty().withMessage('La ciudad es obligatoria'),
    check('province')
        .notEmpty().withMessage('La provincia es obligatoria')
];

const recoverValidator = [
    check('email')
        .isEmail()
        .withMessage('Debe ser un email válido'),
];

const changePasswordValidator = [
    check('email')
        .isEmail().withMessage('Debe ser un email válido'),
    check('code')
        .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
        .isNumeric().withMessage('El código debe ser numérico'),
    check('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

module.exports = { registerValidator, validateEmailCode, loginValidator, personalDataValidator, companyDataValidator, recoverValidator, changePasswordValidator };