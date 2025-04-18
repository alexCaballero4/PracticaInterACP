const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { createProject, updateProject, getProjects, getProjectById, deleteProject, getArchivedProjects, restoreProject } = require('../controllers/project');
const { createProjectValidator, updateProjectValidator } = require('../validators/project');

/**
 * @openapi
 * /project:
 *   post:
 *     summary: Crear un nuevo proyecto
 *     tags:
 *       - Project
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
 *               - projectCode
 *               - email
 *               - code
 *               - clientId
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nombre del proyecto
 *               projectCode:
 *                 type: string
 *                 example: Proyecto123
 *               email:
 *                 type: string
 *                 example: correo@cliente.com
 *               code:
 *                 type: string
 *                 example: INT-001
 *               clientId:
 *                 type: string
 *                 example: 6662a8c3c199795c88329e4e
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
 *         description: Proyecto creado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       422:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', authMiddleware, createProjectValidator, createProject);

/**
 * @openapi
 * /project/{id}:
 *   put:
 *     summary: Actualiza un proyecto existente
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del proyecto a actualizar
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - projectCode
 *               - email
 *               - code
 *               - clientId
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: Obra Y
 *               projectCode:
 *                 type: string
 *                 example: 100000
 *               email:
 *                 type: string
 *                 example: mimail@gmail.com
 *               code:
 *                 type: string
 *                 example: 00001-01
 *               clientId:
 *                 type: string
 *                 example: 6662a8c3c199795c88329e4e
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
 *               notes:
 *                 type: string
 *                 example: Proyecto de reforma de fachada
 *     responses:
 *       200:
 *         description: Proyecto actualizado correctamente
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Proyecto no encontrado
 *       422:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', authMiddleware, updateProjectValidator, updateProject);

/**
 * @openapi
 * /project:
 *   get:
 *     summary: Obtener todos los proyectos del usuario autenticado
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos devuelta correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   projectCode:
 *                     type: string
 *                   email:
 *                     type: string
 *                   code:
 *                     type: string
 *                   notes:
 *                     type: string
 *                   clientId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', authMiddleware, getProjects);

/**
 * @openapi
 * /project/one/{id}:
 *   get:
 *     summary: Obtener un proyecto específico por su ID
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto a recuperar
 *     responses:
 *       200:
 *         description: Proyecto devuelto correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 clientId:
 *                   type: string
 *                 name:
 *                   type: string
 *                 projectCode:
 *                   type: string
 *                 code:
 *                   type: string
 *                 address:
 *                   type: object
 *                   properties:
 *                     street:
 *                       type: string
 *                     number:
 *                       type: number
 *                     postal:
 *                       type: number
 *                     city:
 *                       type: string
 *                     province:
 *                       type: string
 *                 notes:
 *                   type: string
 *                 servicePrices:
 *                   type: array
 *                   items: {}
 *       401:
 *         description: Token no proporcionado o inválido
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/one/:id', authMiddleware, getProjectById);

/**
 * @openapi
 * /project/{id}:
 *   delete:
 *     summary: Eliminar un proyecto (soft o hard delete)
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto
 *       - in: query
 *         name: soft
 *         schema:
 *           type: boolean
 *         description: Si es false, elimina permanentemente (hard delete)
 *     responses:
 *       200:
 *         description: Proyecto archivado o eliminado correctamente
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', authMiddleware, deleteProject);

/**
 * @openapi
 * /project/archive:
 *   get:
 *     summary: Obtener los proyectos archivados del usuario autenticado
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proyectos archivados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       401:
 *         description: Token no proporcionado o inválido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/archive', authMiddleware, getArchivedProjects);

/**
 * @openapi
 * /project/restore/{id}:
 *   patch:
 *     summary: Restaurar un proyecto archivado
 *     tags:
 *       - Project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del proyecto archivado
 *     responses:
 *       200:
 *         description: Proyecto restaurado correctamente
 *       401:
 *         description: Token inválido
 *       404:
 *         description: Proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/restore/:id', authMiddleware, restoreProject);

module.exports = router;