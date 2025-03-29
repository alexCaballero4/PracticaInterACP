const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, validateEmail, loginUser, updateProfile } = require('../controllers/auth');
const { registerValidator, validateEmailCode, loginValidator, personalDataValidator } = require('../validators/auth');


router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post('/user/register', registerValidator, register);

router.post('/user/validation', authMiddleware, validateEmailCode, validateEmail);

router.post('/user/login', loginValidator, loginUser);

router.put('/user/register', authMiddleware, personalDataValidator, updateProfile);

module.exports = router;