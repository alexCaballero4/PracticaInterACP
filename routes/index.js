const express = require('express');
const router = express.Router();
const { validatorMail } = require("../validators/mail")
const { send } = require("../controllers/mail")

// Ejemplo de ruta de prueba
router.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

router.post("/mail", validatorMail, send);

module.exports = router;
