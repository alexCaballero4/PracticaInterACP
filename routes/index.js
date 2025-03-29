const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { register, validateEmail, loginUser } = require('../controllers/auth');
const { registerValidator, validateEmailCode, loginValidator } = require('../validators/auth');
const { updateProfile, updateCompany} = require('../controllers/user');
const { personalDataValidator, companyDataValidator } = require('../validators/user')


router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post('/user/register', registerValidator, register);

router.post('/user/validation', authMiddleware, validateEmailCode, validateEmail);

router.post('/user/login', loginValidator, loginUser);

router.put('/user/register', authMiddleware, personalDataValidator, updateProfile);

router.patch('/user/company', authMiddleware, companyDataValidator, updateCompany);

module.exports = router;