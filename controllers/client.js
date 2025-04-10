const { validationResult, matchedData } = require('express-validator');
const Client = require('../models/Client');
const { handleHttpError } = require('../utils/handleError');

const createClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 422);

    const body = matchedData(req);
    const userId = req.user.id;

    try {
        const existing = await Client.findOne({ cif: body.cif });
        if (existing) return handleHttpError(res, 'Cliente ya existe', 409);

        const client = await Client.create({
            ...body,
            userId
        });

        res.status(200).json(client);
    } catch (err) {
        console.error('Error al crear cliente:', err);
        return handleHttpError(res);
    }
};

const updateClient = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return handleHttpError(res, 'Datos inválidos', 422);

    const body = matchedData(req);
    const userId = req.user.id;
    const clientId = req.params.id;

    try {
        const client = await Client.findOne({ _id: clientId, userId });

        if (!client) return handleHttpError(res, 'Cliente no encontrado o no autorizado', 404);

        Object.assign(client, body); // actualiza campos que lleguen
        const updated = await client.save();

        res.status(200).json(updated);
    } catch (err) {
        console.error('Error al actualizar cliente:', err);
        return handleHttpError(res);
    }
};

const getClients = async (req, res) => {
    const userId = req.user.id;

    try {
        const clients = await Client.find({ userId });

        const result = clients.map(client => ({
            ...client.toObject(),
            activeProjects: 0,
            pendingDeliveryNotes: 0
        }));

        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener clientes:', err);
        return handleHttpError(res);
    }
};

const getClientById = async (req, res) => {
    const userId = req.user.id;
    const clientId = req.params.id;

    try {
        const client = await Client.findOne({ _id: clientId, userId });

        if (!client) return handleHttpError(res, 'Cliente no encontrado o no autorizado', 404);

        const result = {
            ...client.toObject(),
            // De momento devolvemos estos en 0
            activeProjects: 0,
            pendingDeliveryNotes: 0
        };

        res.status(200).json(result);
    } catch (err) {
        console.error('Error al obtener cliente:', err);
        return handleHttpError(res);
    }
};

module.exports = { createClient, updateClient, getClients, getClientById };
