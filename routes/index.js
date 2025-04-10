const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const storageRoutes = require('./storage');
const clientRoutes = require('./client');

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.use('/user', authRoutes);
router.use('/user', userRoutes);
router.use('/user', storageRoutes);
router.use('/client', clientRoutes);

module.exports = router;
