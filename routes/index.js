const express = require('express');
const router = express.Router();

// Ejemplo de ruta de prueba
router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

module.exports = router;
