const User = require('../models/User');
const { handleHttpError } = require('../utils/handleError');
const { validationResult } = require('express-validator');

const updateProfile = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleHttpError(res, 'Datos inválidos', 400);
    }

    const { nombre, apellidos, nif } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

        user.nombre = nombre;
        user.apellidos = apellidos;
        user.nif = nif;

        await user.save();

        return res.status(200).json({ message: 'Datos personales actualizados correctamente' });

    } catch (err) {
        console.error('Error al actualizar datos personales:', err);
        return handleHttpError(res);
    }
};

const updateCompany = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { name, cif, street, number, postal, city, province, esAutonomo } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(401).json({ message: 'Token inválido o usuario no encontrado' });

        if (!esAutonomo) {
            const existingCompany = await User.findOne({ 'company.cif': cif, _id: { $ne: userId } });
            if (existingCompany) {
                return res.status(409).json({ message: 'El CIF ya está registrado por otro usuario' });
            }
        }

        const companyData = esAutonomo ? { name: `${user.nombre} ${user.apellidos}`, cif: user.nif, street, number, postal, city, province } : {
            name, cif, street, number, postal, city, province
        };

        user.company = companyData;
        await user.save();

        return res.status(200).json({ acknowledged: true });

    } catch (err) {
        console.error('Error al actualizar compañía:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { updateProfile, updateCompany };