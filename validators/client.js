const { check } = require('express-validator');

const clientValidator = [
    check('name').notEmpty().withMessage('El nombre es obligatorio'),
    check('cif')
        .matches(/^[A-Z][0-9]{8}$/).withMessage('El CIF debe tener 1 letra y 8 números'),
    check('address.street').optional().isString(),
    check('address.number').optional().isNumeric(),
    check('address.postal').optional().isNumeric(),
    check('address.city').optional().isString(),
    check('address.province').optional().isString(),
];

module.exports = { clientValidator };
