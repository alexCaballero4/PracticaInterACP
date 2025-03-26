const express = require('express');
const router = express.Router();
const { validateEmail } = require('../controllers/authController');
const { validateEmailCode } = require('../validators/authValidator');
const authMiddleware = require('../middleware/authMiddleware');
const { register } = require('../controllers/authController');
const { registerValidator } = require('../validators/authValidator');

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post('/user/register', registerValidator, register);

router.post('/user/validation', authMiddleware, validateEmailCode, validateEmail);

module.exports = router;
