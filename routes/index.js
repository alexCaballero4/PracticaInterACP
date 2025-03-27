const express = require('express');
const router = express.Router();
const { validateEmail } = require('../controllers/auth');
const { validateEmailCode } = require('../validators/auth');
const authMiddleware = require('../middleware/authMiddleware');
const { register } = require('../controllers/auth');
const { registerValidator } = require('../validators/auth');
const { loginUser } = require('../controllers/auth');
const { loginValidator } = require('../validators/auth');

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post('/user/register', registerValidator, register);

router.post('/user/validation', authMiddleware, validateEmailCode, validateEmail);

router.post('/user/login', loginValidator, loginUser);

module.exports = router;