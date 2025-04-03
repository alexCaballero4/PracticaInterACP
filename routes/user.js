const express = require('express');
const router = express.Router();

const { updateProfile, updateCompany, getUser, deleteUser } = require('../controllers/user');
const { personalDataValidator, companyDataValidator } = require('../validators/user');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @openapi
 * components:
 *   schemas:
 *     UserProfile:
 *       type: object
 *       required:
 *         - nombre
 *         - apellidos
 *         - nif
 *       properties:
 *         nombre:
 *           type: string
 *           example: Ricardo
 *         apellidos:
 *           type: string
 *           example: Palacios Romero
 *         nif:
 *           type: string
 *           example: 12345678A
 *     CompanyStandard:
 *       type: object
 *       required:
 *         - name
 *         - cif
 *         - street
 *         - number
 *         - postal
 *         - city
 *         - province
 *         - esAutonomo
 *       properties:
 *         name:
 *           type: string
 *           example: U-tad, SL
 *         cif:
 *           type: string
 *           example: F12345678
 *         street:
 *           type: string
 *           example: Fernando Alonso
 *         number:
 *           type: number
 *           example: 22
 *         postal:
 *           type: number
 *           example: 28936
 *         city:
 *           type: string
 *           example: Móstoles
 *         province:
 *           type: string
 *           example: Madrid
 *         esAutonomo:
 *           type: boolean
 *           example: false
 *     CompanyAutonomo:
 *       type: object
 *       required:
 *         - street
 *         - number
 *         - postal
 *         - city
 *         - province
 *         - esAutonomo
 *       properties:
 *         street:
 *           type: string
 *           example: Calle Venus
 *         number:
 *           type: number
 *           example: 77
 *         postal:
 *           type: number
 *           example: 28922
 *         city:
 *           type: string
 *           example: Alcorcón
 *         province:
 *           type: string
 *           example: Madrid
 *         esAutonomo:
 *           type: boolean
 *           example: true
 */

/**
 * @openapi
 * /user/register:
 *   put:
 *     summary: Completa los datos personales del usuario registrado
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserProfile'
 *     responses:
 *       200:
 *         description: Datos personales actualizados correctamente
 *       400:
 *         description: Validación incorrecta
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/register', authMiddleware, personalDataValidator, updateProfile);

/**
 * @openapi
 * /user/company:
 *   patch:
 *     summary: Actualiza los datos de empresa o como autónomo
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/CompanyStandard'
 *               - $ref: '#/components/schemas/CompanyAutonomo'
 *     responses:
 *       200:
 *         description: Empresa/Autónomo actualizado correctamente
 *       401:
 *         description: Token inválido
 *       409:
 *         description: El CIF ya existe
 *       422:
 *         description: Error de validación
 */
router.patch('/company', authMiddleware, companyDataValidator, updateCompany);

/**
 * @openapi
 * /user:
 *   get:
 *     summary: Obtiene la información completa del usuario autenticado
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario devuelta correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/', authMiddleware, getUser);

/**
 * @openapi
 * /user:
 *   delete:
 *     summary: Elimina el usuario (soft delete por defecto)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: Si es false, se elimina definitivamente (hard delete)
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/', authMiddleware, deleteUser);

module.exports = router;
