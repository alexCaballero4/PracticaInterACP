const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMiddlewareMemory } = require('../middleware/storageMiddleware');
const { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, generateDeliveryNotePDF, signDeliveryNote } = require('../controllers/deliveryNote');
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
 *               projectId:
 *                 type: string
 *               format:
 *                 type: string
 *                 enum: [material, hours]
 *               material:
 *                 type: string
 *               hours:
 *                 type: number
 *               description:
 *                 type: string
 *               workdate:
 *                 type: string
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

/**
 * @openapi
 * /deliverynote/pdf/{id}:
 *   get:
 *     summary: Generar y descargar el PDF de un albarán
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
 *         description: ID del albarán
 *     responses:
 *       200:
 *         description: Devuelve la URL del archivo PDF generado con los datos del albarán
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PDF generado correctamente
 *                 url:
 *                   type: string
 *                   example: http://localhost:3000/uploads/albaran_123456.pdf
 *       401:
 *         description: No autorizado para acceder al albarán
 *       404:
 *         description: Albarán no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/pdf/:id', authMiddleware, generateDeliveryNotePDF);

/**
 * @openapi
 * /deliverynote/sign/{id}:
 *   patch:
 *     summary: Firmar un albarán subiendo imagen PNG o JPEG
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
 *         description: ID del albarán a firmar
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               sign:
 *                 type: string
 *                 format: binary
 *                 description: Firma del cliente en formato PNG o JPEG
 *     responses:
 *       200:
 *         description: Albarán firmado correctamente. Devuelve URL de la firma y del PDF en IPFS.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Albarán firmado correctamente
 *                 sign:
 *                   type: string
 *                   example: https://gateway.pinata.cloud/ipfs/QmX...
 *                 pdf:
 *                   type: string
 *                   example: https://gateway.pinata.cloud/ipfs/QmY...
 *       401:
 *         description: No autorizado
 *       422:
 *         description: Firma no proporcionada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/sign/:id', authMiddleware, uploadMiddlewareMemory.single('sign'), signDeliveryNote);

module.exports = router;
