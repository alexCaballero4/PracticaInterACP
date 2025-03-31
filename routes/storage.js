const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { uploadMiddlewareMemory } = require('../middleware/storageMiddleware');
const { updateLogo } = require('../controllers/storage');

router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single('logo'), updateLogo);

module.exports = router;
