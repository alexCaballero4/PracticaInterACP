const User = require('../models/User');
const { handleHttpError } = require('../utils/handleError');
const { validationResult, matchedData } = require('express-validator');

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 400);

  const { nombre, apellidos, nif } = matchedData(req);
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
  if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 422);

  const {
    name, cif, street, number, postal, city, province, esAutonomo
  } = matchedData(req);
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

    const companyData = esAutonomo
      ? {
          name: `${user.nombre} ${user.apellidos}`,
          cif: user.nif,
          street, number, postal, city, province
        }
      : { name, cif, street, number, postal, city, province };

    user.company = companyData;
    await user.save();

    return res.status(200).json({ acknowledged: true });

  } catch (err) {
    console.error('Error al actualizar compañía:', err);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId).lean();
    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    const response = {
      _id: user._id,
      email: user.email,
      emailCode: user.code,
      status: user.status === 'validated' ? 1 : 0,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      name: user.nombre,
      surnames: user.apellidos,
      nif: user.nif,
      logo: user.logo || null,
      address: user.company
        ? {
            street: user.company.street,
            number: user.company.number,
            postal: user.company.postal,
            city: user.company.city,
            province: user.company.province
          }
        : null,
      company: user.company || null
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error al obtener el usuario:', err);
    return handleHttpError(res);
  }
};

const deleteUser = async (req, res) => {
  const userId = req.user.id;
  const isSoftDelete = req.query.soft !== 'false';

  try {
    const user = await User.findById(userId);
    if (!user) return handleHttpError(res, 'Usuario no encontrado', 404);

    if (isSoftDelete) {
      user.status = 'deleted';
      await user.save();
      return res.status(200).json({ message: 'Usuario marcado como eliminado (soft delete)' });
    } else {
      await User.deleteOne({ _id: userId });
      return res.status(200).json({ message: 'Usuario eliminado permanentemente (hard delete)' });
    }
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    return handleHttpError(res);
  }
};

module.exports = { updateProfile, updateCompany, getUser, deleteUser };