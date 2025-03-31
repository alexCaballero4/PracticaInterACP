const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, validateEmail, loginUser, recoverPassword, changePassword } = require('../controllers/auth');
const { registerValidator, validateEmailCode, loginValidator, recoverValidator, changePasswordValidator } = require('../validators/auth');
const { updateProfile, updateCompany, getUser, deleteUser} = require('../controllers/user');
const { personalDataValidator, companyDataValidator } = require('../validators/user')
const { uploadMiddlewareMemory } = require('../middleware/storageMiddleware');
const { updateLogo } = require('../controllers/storage');

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post('/user/register', registerValidator, register);

router.post('/user/validation', authMiddleware, validateEmailCode, validateEmail);

router.post('/user/login', loginValidator, loginUser);

router.put('/user/register', authMiddleware, personalDataValidator, updateProfile);

router.patch('/user/company', authMiddleware, companyDataValidator, updateCompany);

router.patch('/user/logo', authMiddleware, uploadMiddlewareMemory.single('logo'), updateLogo);

router.get('/user', authMiddleware, getUser);

router.delete('/user', authMiddleware, deleteUser);

router.post('/user/recover', recoverValidator, recoverPassword);

router.patch('/user/password', changePasswordValidator, changePassword);

module.exports = router;