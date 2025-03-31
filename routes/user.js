const express = require('express');
const router = express.Router();

const { updateProfile, updateCompany, getUser, deleteUser } = require('../controllers/user');
const { personalDataValidator, companyDataValidator } = require('../validators/user');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/register', authMiddleware, personalDataValidator, updateProfile);
router.patch('/company', authMiddleware, companyDataValidator, updateCompany);

router.get('/', authMiddleware, getUser);
router.delete('/', authMiddleware, deleteUser);

module.exports = router;
