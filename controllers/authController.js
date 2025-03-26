const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email, status: 'validated' });
        if (existingUser) return res.status(409).json({ message: 'Email ya registrado y validado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const code = generateCode();

        const user = await User.create({
            email,
            password: hashedPassword,
            code,
            attempts: 0,
        });

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'secretkey',
            { expiresIn: '1h' }
        );

        res.status(201).json({
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
            },
            token,
        });

    } catch (err) {
        console.error('💥 Error en el registro:', err); // <= esto lo añadimos
        res.status(500).json({ message: 'Error interno del servidor' });
    }

};

exports.validateEmail = async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        if (user.code !== code) {
            user.attempts += 1;
            await user.save();
            return res.status(400).json({ message: 'Código incorrecto' });
        }

        user.status = 'validated';
        user.code = null; // Opcional: eliminar el código después de validarlo
        await user.save();

        return res.status(200).json({ message: '✅ Email validado correctamente' });

    } catch (err) {
        console.error('💥 Error en la validación del email:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};
