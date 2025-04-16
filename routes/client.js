const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createClient, updateClient, getClients, getClientById, deleteClient } = require('../controllers/client');
const { clientValidator } = require('../validators/client');

/**
 * @openapi
 * /client:
 *   post:
 *     summary: Añadir cliente
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cif
 *             properties:
 *               name:
 *                 type: string
 *                 example: ACS
 *               cif:
 *                 type: string
 *                 example: D52921210
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: Carlos V
 *                   number:
 *                     type: number
 *                     example: 22
 *                   postal:
 *                     type: number
 *                     example: 28936
 *                   city:
 *                     type: string
 *                     example: Móstoles
 *                   province:
 *                     type: string
 *                     example: Madrid
 *     responses:
 *       200:
 *         description: Cliente creado correctamente
 *       401:
 *         description: Token inválido
 *       409:
 *         description: Cliente ya existente
 *       422:
 *         description: Datos inválidos
 */
router.post('/', authMiddleware, clientValidator, createClient);

/**
 * @openapi
 * /client/{id}:
 *   put:
 *     summary: Actualiza los datos de un cliente
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Client'
 *     responses:
 *       200:
 *         description: Cliente actualizado correctamente
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cliente no encontrado o no autorizado
 *       422:
 *         description: Error de validación
 */
router.put('/:id', authMiddleware, clientValidator, updateClient);

/**
 * @openapi
 * /client:
 *   get:
 *     summary: Obtiene los clientes del usuario
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes devuelta correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Client'
 *       401:
 *         description: Token inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, getClients);

/**
 * @openapi
 * /client/{id}:
 *   get:
 *     summary: Obtiene un cliente específico
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del cliente a obtener
 *     responses:
 *       200:
 *         description: Cliente encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Client'
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', authMiddleware, getClientById);

/**
 * @openapi
 * /client/{id}:
 *   delete:
 *     summary: Elimina (archiva o borra) un cliente
 *     tags:
 *       - Client
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del cliente a eliminar
 *         schema:
 *           type: string
 *       - in: query
 *         name: soft
 *         required: false
 *         description: Si es false, se elimina definitivamente
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Cliente archivado o eliminado correctamente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, deleteClient);

module.exports = router;
