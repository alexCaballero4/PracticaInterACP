const { matchedData, validationResult } = require('express-validator');
const DeliveryNote = require('../models/DeliveryNote');
const { handleHttpError } = require('../utils/handleError');

const createDeliveryNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const data = matchedData(req);

    try {
        const note = await DeliveryNote.create({
            ...data,
            userId: req.user.id
        });

        res.status(200).json(note);
    } catch (err) {
        console.error('Error al crear albarán:', err);
        return handleHttpError(res);
    }
};

const getDeliveryNotes = async (req, res) => {
    const userId = req.user.id;
    const { company = false, signed } = req.query;

    try {
        const query = { deleted: { $ne: true } };

        if (signed !== undefined) {
            query.pending = signed === 'false';
        }

        query.userId = userId;

        const deliveryNotes = await DeliveryNote.find(query)
            .populate('clientId')
            .populate('projectId')
            .populate('userId');

        res.status(200).json(deliveryNotes);
    } catch (err) {
        console.error('Error al obtener los albaranes:', err);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const getDeliveryNoteById = async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    try {
        const note = await DeliveryNote.findById(noteId)
            .populate('clientId')
            .populate('projectId')
            .populate('userId');

        if (!note) return res.status(404).json({ message: 'Albarán no encontrado' });

        if (note.userId._id.toString() !== userId) {
            return res.status(401).json({ message: 'No autorizado para ver este albarán' });
        }

        const user = note.userId;
        const client = note.clientId;
        const project = note.projectId;

        const response = {
            company: user.company || null,
            name: user.nombre,
            date: note.createdAt,
            client: {
                name: client.name,
                address: client.address,
                cif: client.cif
            },
            project: project.code || project.projectCode || '',
            description: note.description,
            format: note.format,
            hours: note.hours,
            workers: note.multi || [],
            photo: note.sign || null
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error('Error al obtener el albarán:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

module.exports = { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById };
