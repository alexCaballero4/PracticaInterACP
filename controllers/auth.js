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

        res.status(201).json({
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
            },
            token,
        });

    } catch (err) {
        console.error('Error en el registro:', err);
        return handleHttpError(res);
    }
};

const validateEmail = async (req, res) => {
    console.log('Body recibido:', req.body);
    const { code } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return handleHttpError(res, 'Usuario no encontrado', 404);
        }
        console.log('Código enviado:', code);
        console.log('Código guardado:', user.code);

        if (user.code !== code) {
            user.attempts += 1;
            await user.save();
            return handleHttpError(res, 'Código incorrecto', 400);
        }

        user.status = 'validated';
        user.code = null;
        await user.save();

        return res.status(200).json({ message: '✅ Email validado correctamente' });

    } catch (err) {
        console.error('Error en la validación del email:', err);
        return handleHttpError(res);
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
            return handleHttpError(res, 'Credenciales incorrectas', 401);
        }

        const isMatch = await comparePassword(password, user.password);
        if (!isMatch) {
            return handleHttpError(res, 'Credenciales incorrectas', 401);
        }

        const token = generateToken(user);

        res.status(200).json({
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
            },
            token,
        });

    } catch (err) {
        console.error('Error en el login:', err);
        return handleHttpError(res);
    }
};

module.exports = { register, validateEmail, loginUser };