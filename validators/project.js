const { check } = require('express-validator');

const createProjectValidator = [
    check('name').notEmpty().withMessage('El nombre del proyecto es obligatorio'),
    check('projectCode').notEmpty().withMessage('El identificador del proyecto es obligatorio'),
    check('email').isEmail().withMessage('Debe proporcionar un email válido'),
    check('code').notEmpty().withMessage('El código interno del proyecto es obligatorio'),
    check('clientId').isMongoId().withMessage('clientId debe ser un ID válido de MongoDB'),
    check('address.street').notEmpty().withMessage('La calle es obligatoria'),
    check('address.number').isNumeric().withMessage('El número debe ser numérico'),
    check('address.postal').isNumeric().withMessage('El código postal debe ser numérico'),
    check('address.city').notEmpty().withMessage('La ciudad es obligatoria'),
    check('address.province').notEmpty().withMessage('La provincia es obligatoria'),
];

const updateProjectValidator = [
    check('name').notEmpty().withMessage('El nombre es obligatorio'),
    check('projectCode').notEmpty().withMessage('El código del proyecto es obligatorio'),
    check('email').isEmail().withMessage('Email inválido'),
    check('code').notEmpty().withMessage('El código interno es obligatorio'),
    check('clientId').isMongoId().withMessage('clientId inválido'),
    check('address.street').notEmpty().withMessage('La calle es obligatoria'),
    check('address.number').isNumeric().withMessage('Número inválido'),
    check('address.postal').isNumeric().withMessage('Código postal inválido'),
    check('address.city').notEmpty().withMessage('La ciudad es obligatoria'),
    check('address.province').notEmpty().withMessage('La provincia es obligatoria'),
    check('notes').optional().isString(),
];

module.exports = { createProjectValidator, updateProjectValidator };
