const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const clientRoutes = require('./client');
const projectRoutes = require('./project');
const deliveryNoteRoutes = require('./deliveryNote');

router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.use('/user', authRoutes);
router.use('/user', userRoutes);
router.use('/client', clientRoutes);
router.use('/project', projectRoutes);
router.use('/deliverynote', deliveryNoteRoutes);

module.exports = router;
