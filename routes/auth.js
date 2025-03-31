const express = require('express');
const router = express.Router();

const { register, validateEmail,  loginUser, recoverPassword, changePassword } = require('../controllers/auth');
const { registerValidator, validateEmailCode, loginValidator, recoverValidator,  changePasswordValidator } = require('../validators/auth');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, loginUser);
router.post('/validation', authMiddleware, validateEmailCode, validateEmail);
router.post('/recover', recoverValidator, recoverPassword);
router.patch('/password', changePasswordValidator, changePassword);

module.exports = router;
