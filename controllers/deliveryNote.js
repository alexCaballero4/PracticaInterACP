const { matchedData, validationResult } = require('express-validator');
const DeliveryNote = require('../models/DeliveryNote');
const { handleHttpError } = require('../utils/handleError');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');


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

        const concepts = note.format === 'hours'
            ? note.multi || []
            : note.materials || [];

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
            format: note.format,
            concepts,
            photo: note.sign || null
        };

        return res.status(200).json(response);

    } catch (err) {
        console.error('Error al obtener el albarán:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const generateDeliveryNotePDF = async (req, res) => {
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

        const concepts = note.format === 'hours'
            ? note.multi || [{ name: user.nombre, hours: note.hours }]
            : note.multi || [{ name: note.material, quantity: 1 }];

        const pdfName = `albaran_${noteId}.pdf`;
        const pdfPath = path.join(__dirname, '..', 'uploads', pdfName);

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(18).text('Albarán de Trabajo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${note.workdate}`);
        doc.text(`Proyecto: ${project.code || project.projectCode}`);
        doc.text(`Descripción: ${note.description}`);
        doc.text(`Usuario: ${user.nombre} (${user.email})`);
        doc.text(`Cliente: ${client.name} - ${client.address}`);
        doc.text(`CIF: ${client.cif}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles:', { underline: true });
        concepts.forEach((item, index) => {
            if (note.format === 'hours') {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Trabajador'} - ${item.hours} horas`);
            } else {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Material'} - ${item.quantity || 1} uds`);
            }
        });

        if (note.sign) {
            const imgPath = path.resolve('storage', 'signatures', note.sign);
            if (fs.existsSync(imgPath)) {
                doc.addPage().image(imgPath, { fit: [400, 200], align: 'center' });
                doc.text('Firma del cliente', { align: 'center' });
            }
        }

        doc.end();

        stream.on('finish', () => {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfName}`;
            return res.status(200).json({ message: 'PDF generado correctamente', url: fileUrl });
        });

    } catch (err) {
        console.error('Error al generar el PDF del albarán:', err);
        return res.status(500).json({ message: 'Error interno del servidor' });
    }
};



module.exports = { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, generateDeliveryNotePDF };
