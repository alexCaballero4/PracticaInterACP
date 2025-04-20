const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createDeliveryNote } = require('../controllers/deliveryNote');
const { createDeliveryNoteValidator } = require('../validators/deliveryNote');

/**
 * @openapi
 * /deliverynote:
 *   post:
 *     summary: Crear un albarán (material u horas)
 *     tags:
 *       - DeliveryNote
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *               - projectId
 *               - format
 *               - description
 *               - workdate
 *             properties:
 *               clientId:
 *                 type: string
 *                 example: 6662a8c3c199795c88329e4e
 *               projectId:
 *                 type: string
 *                 example: 6662afde03013916089bc058
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *                 example: material
 *               material:
 *                 type: string
 *                 example: Cemento blanco
 *               hours:
 *                 type: number
 *                 example: 8
 *               description:
 *                 type: string
 *                 example: Suministro y aplicación de material
 *               workdate:
 *                 type: string
 *                 example: 2/1/2024
 *     responses:
 *       200:
 *         description: Albarán creado correctamente
 *       401:
 *         description: Token inválido
 *       422:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, createDeliveryNoteValidator, createDeliveryNote);

module.exports = router;
