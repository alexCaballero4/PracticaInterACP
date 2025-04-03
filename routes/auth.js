const express = require('express');
const router = express.Router();

const { register, validateEmail, loginUser, recoverPassword, changePassword } = require('../controllers/auth');
const { registerValidator, validateEmailCode, loginValidator, recoverValidator, changePasswordValidator } = require('../validators/auth');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @openapi
 * components:
 *   schemas:
 *     AuthCredentials:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: ejemplo@correo.com
 *         password:
 *           type: string
 *           example: contrasena123
 *     EmailCode:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *           example: "123456"
 *     RecoverRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           example: ejemplo@correo.com
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - code
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: ejemplo@correo.com
 *         code:
 *           type: string
 *           example: "123456"
 *         password:
 *           type: string
 *           example: nuevaContrasena123
 */

/**
 * @openapi
 * /user/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthCredentials'
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente y token generado
 *       409:
 *         description: Usuario ya registrado
 *       400:
 *         description: Validación fallida
 */
router.post('/register', registerValidator, register);

/**
 * @openapi
 * /user/login:
 *   post:
 *     summary: Login de usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthCredentials'
 *     responses:
 *       200:
 *         description: Usuario autenticado con éxito
 *       401:
 *         description: Credenciales incorrectas o cuenta no validada
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/login', loginValidator, loginUser);

/**
 * @openapi
 * /user/validation:
 *   post:
 *     summary: Validación del correo mediante código
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmailCode'
 *     responses:
 *       200:
 *         description: Validación completada
 *       401:
 *         description: Token inválido o usuario no encontrado
 *       422:
 *         description: Código incorrecto
 */
router.post('/validation', authMiddleware, validateEmailCode, validateEmail);

/**
 * @openapi
 * /user/recover:
 *   post:
 *     summary: Solicitar código de recuperación de contraseña
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecoverRequest'
 *     responses:
 *       200:
 *         description: Código enviado correctamente
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: Usuario no validado
 */
router.post('/recover', recoverValidator, recoverPassword);

/**
 * @openapi
 * /user/password:
 *   patch:
 *     summary: Cambiar contraseña usando código de recuperación
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       404:
 *         description: Usuario no encontrado
 *       422:
 *         description: Código incorrecto o validación fallida
 */
router.patch('/password', changePasswordValidator, changePassword);

module.exports = router;
