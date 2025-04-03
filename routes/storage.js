const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const { uploadMiddlewareMemory } = require('../middleware/storageMiddleware');
const { updateLogo } = require('../controllers/storage');

/**
 * @openapi
 * components:
 *   schemas:
 *     LogoUploadResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Logo actualizado correctamente
 *         logo:
 *           type: string
 *           example: https://mi-gateway.mypinata.cloud/ipfs/QmXYZ...
 */

/**
 * @openapi
 * /user/logo:
 *   patch:
 *     summary: Sube o actualiza el logo del usuario
 *     tags:
 *       - Storage
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - logo
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoUploadResponse'
 *       401:
 *         description: Token no proporcionado o inválido
 *       400:
 *         description: No se ha proporcionado ningún archivo
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/logo', authMiddleware, uploadMiddlewareMemory.single('logo'), updateLogo);

module.exports = router;
