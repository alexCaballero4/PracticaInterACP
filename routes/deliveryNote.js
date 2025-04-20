const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById } = require('../controllers/deliveryNote');
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

/**
 * @openapi
 * /deliverynote:
 *   get:
 *     summary: Obtener albaranes del usuario autenticado
 *     tags:
 *       - DeliveryNote
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: company
 *         schema:
 *           type: boolean
 *         description: Si se activa, también obtiene albaranes de la empresa del usuario
 *       - in: query
 *         name: signed
 *         schema:
 *           type: boolean
 *         description: Si se pasa, filtra por albaranes firmados o pendientes
 *     responses:
 *       200:
 *         description: Lista de albaranes del usuario
 *       401:
 *         description: Token inválido o no enviado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, getDeliveryNotes);

/**
 * @openapi
 * /deliverynote/{id}:
 *   get:
 *     summary: Obtener un albarán específico
 *     tags:
 *       - DeliveryNote
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del albarán a recuperar
 *       - in: query
 *         name: company
 *         schema:
 *           type: boolean
 *         description: Indica si debe buscar también en la compañía del usuario
 *     responses:
 *       200:
 *         description: Devuelve el albarán
 *       401:
 *         description: Token inválido o acceso no autorizado
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, getDeliveryNoteById);

module.exports = router;
