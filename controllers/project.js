const Project = require('../models/Project');
const { matchedData, validationResult } = require('express-validator');
const { handleHttpError } = require('../utils/handleError');

const createProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 422);

    const data = matchedData(req);
    const userId = req.user.id;

    try {
        const newProject = await Project.create({
            ...data,
            userId,
        });

        res.status(200).json(newProject);
    } catch (err) {
        console.error('Error al crear proyecto:', err);
        return handleHttpError(res);
    }
};

const updateProject = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 422);

    const projectId = req.params.id;
    const userId = req.user.id;
    const data = matchedData(req);

    try {
        const project = await Project.findOne({ _id: projectId, userId });

        if (!project) return handleHttpError(res, 'Proyecto no encontrado o no autorizado', 404);

        Object.assign(project, data);
        await project.save();

        res.status(200).json(project);
    } catch (err) {
        console.error('Error al actualizar proyecto:', err);
        return handleHttpError(res);
    }
};

const getProjects = async (req, res) => {
    const userId = req.user.id;

    try {
        const projects = await Project.find({ userId });
        res.status(200).json(projects);
    } catch (err) {
        console.error('Error al obtener los proyectos:', err);
        return handleHttpError(res);
    }
};

const getProjectById = async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;

    try {
        const project = await Project.findOne({ _id: projectId, userId });

        if (!project) return handleHttpError(res, 'Proyecto no encontrado', 404);

        res.status(200).json(project);
    } catch (err) {
        console.error('Error al obtener el proyecto:', err);
        return handleHttpError(res);
    }
};

const deleteProject = async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;
    const isSoftDelete = req.query.soft !== 'false';

    try {
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) return handleHttpError(res, 'Proyecto no encontrado', 404);

        if (isSoftDelete) {
            project.status = 'archived';
            await project.save();
            return res.status(200).json({ message: 'Proyecto archivado correctamente (soft delete)' });
        } else {
            await Project.deleteOne({ _id: projectId });
            return res.status(200).json({ message: 'Proyecto eliminado permanentemente (hard delete)' });
        }
    } catch (err) {
        console.error('Error al eliminar proyecto:', err);
        return handleHttpError(res);
    }
};

const getArchivedProjects = async (req, res) => {
    const userId = req.user.id;

    try {
        const archivedProjects = await Project.find({ userId, status: 'archived' });
        res.status(200).json(archivedProjects);
    } catch (err) {
        console.error('Error al obtener proyectos archivados:', err);
        return handleHttpError(res);
    }
};

const restoreProject = async (req, res) => {
    const userId = req.user.id;
    const projectId = req.params.id;

    try {
        const project = await Project.findOne({ _id: projectId, userId });
        if (!project) return handleHttpError(res, 'Proyecto no encontrado', 404);

        project.status = 'active';
        await project.save();

        return res.status(200).json({ acknowledged: true });
    } catch (err) {
        console.error('Error al restaurar el proyecto:', err);
        return handleHttpError(res);
    }
};


module.exports = { createProject, updateProject, getProjects, getProjectById, deleteProject, getArchivedProjects, restoreProject };
