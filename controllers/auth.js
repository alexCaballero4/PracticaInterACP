const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/handlePassword');
const { handleHttpError } = require('../utils/handleError');
const { generateToken } = require('../utils/handleJwt');
const { generateCode } = require('../utils/handleCode');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleHttpError(res, 'Datos inválidos en la petición', 400);
    }

    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email, status: 'validated' });
        if (existingUser) {
            return handleHttpError(res, 'Email ya registrado y validado', 409);
        }

        const hashedPassword = await hashPassword(password);
        const code = generateCode();

        const user = await User.create({
            email,
            password: hashedPassword,
            code,
            attempts: 0,
        });

        const token = generateToken(user);

        console.log('Token registro generado:', token);
        console.log('Código de verificación:', code);

        res.status(200).json({
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
                _id: user._id
            },
            token
        });

    } catch (err) {
        console.error('Error en el registro:', err);
        return handleHttpError(res);
    }
};

const validateEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { code } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Token inválido o usuario no encontrado' });
        }

        if (user.code !== code) {
            user.attempts += 1;
            await user.save();
            return res.status(422).json({ message: 'Código incorrecto' });
        }

        user.status = 'validated';
        user.code = null;
        await user.save();

        return res.status(200).json({ acknowledged: true });

    } catch (err) {
        console.error('Error en la validación del email:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};


const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return handleHttpError(res, 'Datos inválidos en la petición', 400);
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return handleHttpError(res, 'Usuario no encontrado', 404);
        }

        if (user.status !== 'validated') {
            return handleHttpError(res, 'La cuenta no ha sido validada aún', 401);
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return handleHttpError(res, 'Credenciales incorrectas', 401);
        }

        const token = generateToken(user);

        console.log('Token login generado:', token);

        res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                role: user.role,
                nombre: user.nombre
            },
            token,
        });

    } catch (err) {
        console.error('Error en el login:', err);
        return handleHttpError(res);
    }
};

module.exports = { register, validateEmail, loginUser };