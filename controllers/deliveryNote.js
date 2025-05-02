const { matchedData, validationResult } = require('express-validator');
const axios = require('axios');
const DeliveryNote = require('../models/DeliveryNote');
const { handleHttpError } = require('../utils/handleError');
const { uploadToPinata } = require('../utils/handleUploadIPFS');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const createDeliveryNote = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return handleHttpError(res, 'Error de validación', 422);

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
    const { signed } = req.query;

    try {
        const query = { deleted: { $ne: true }, userId };

        if (signed !== undefined) {
            query.pending = signed === 'false';
        }

        const deliveryNotes = await DeliveryNote.find(query)
            .populate('clientId')
            .populate('projectId')
            .populate('userId');

        res.status(200).json(deliveryNotes);
    } catch (err) {
        console.error('Error al obtener los albaranes:', err);
        return handleHttpError(res);
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

        if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
        if (note.userId._id.toString() !== userId) return handleHttpError(res, 'No autorizado', 401);

        const response = {
            company: note.userId.company || null,
            name: note.userId.nombre,
            date: note.createdAt,
            client: {
                name: note.clientId.name,
                address: note.clientId.address,
                cif: note.clientId.cif
            },
            project: note.projectId.code || note.projectId.projectCode || '',
            format: note.format,
            concepts: note.format === 'hours' ? note.multi || [] : note.materials || [],
            photo: note.sign || null
        };

        return res.status(200).json(response);
    } catch (err) {
        console.error('Error al obtener el albarán:', err);
        return handleHttpError(res);
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

        if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
        if (note.userId._id.toString() !== userId) return handleHttpError(res, 'No autorizado', 401);

        const pdfName = `albaran_${noteId}.pdf`;
        const pdfPath = path.join(__dirname, '..', 'uploads', pdfName);

        if (note.sign) {
            try {
                const pdfUrl = `https://${note.pdf}`;
                const pdfResponse = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
                fs.writeFileSync(pdfPath, pdfResponse.data);
                return res.status(200).json({ message: 'PDF firmado descargado correctamente', url: `${req.protocol}://${req.get('host')}/uploads/${pdfName}` });
            } catch (error) {
                console.error('Error descargando PDF desde IPFS:', error.message);
                return handleHttpError(res, 'Error al descargar PDF firmado', 500);
            }
        }

        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(18).text('Albarán de Trabajo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${note.workdate}`);
        doc.text(`Proyecto: ${note.projectId.code || note.projectId.projectCode}`);
        doc.text(`Descripción: ${note.description}`);
        doc.text(`Usuario: ${note.userId.nombre || ''} (${note.userId.email})`);

        const addr = note.clientId.address;
        doc.text(`Cliente: ${note.clientId.name}`);
        doc.text(`Dirección: ${addr.street}, ${addr.number}, ${addr.postal} ${addr.city} (${addr.province})`);
        doc.text(`CIF: ${note.clientId.cif}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles:', { underline: true });
        const concepts = note.format === 'hours'
            ? note.multi || [{ name: note.userId.nombre, hours: note.hours }]
            : note.multi || [{ name: note.material, quantity: 1 }];

        concepts.forEach((item, index) => {
            if (note.format === 'hours') {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Trabajador'} - ${item.hours} horas`);
            } else {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Material'} - ${item.quantity || 1} uds`);
            }
        });

        doc.end();

        stream.on('finish', () => {
            const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${pdfName}`;
            return res.status(200).json({ message: 'PDF generado correctamente', url: fileUrl });
        });

    } catch (err) {
        console.error('Error al generar el PDF del albarán:', err);
        return handleHttpError(res);
    }
};

const signDeliveryNote = async (req, res) => {
    try {
        const noteId = req.params.id;
        const userId = req.user.id;

        if (!req.file) return handleHttpError(res, 'No se ha proporcionado ningún archivo', 422);

        const note = await DeliveryNote.findById(noteId)
            .populate('clientId')
            .populate('projectId')
            .populate('userId');

        if (!note) return handleHttpError(res, 'Albarán no encontrado', 404);
        if (note.userId._id.toString() !== userId) return handleHttpError(res, 'No autorizado', 401);

        const { buffer, originalname } = req.file;
        const signFileName = `firma_${noteId}${path.extname(originalname)}`;
        const signPath = path.join(__dirname, '..', 'uploads', signFileName);
        fs.writeFileSync(signPath, buffer);

        const pinataRes = await uploadToPinata(buffer, originalname);
        const ipfsURL = `${process.env.PINATA_GATEWAY_URL}/ipfs/${pinataRes.IpfsHash}`;

        note.sign = ipfsURL;
        note.pending = false;

        const pdfName = `albaran_${noteId}.pdf`;
        const pdfPath = path.join(__dirname, '..', 'uploads', pdfName);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        doc.fontSize(18).text('Albarán de Trabajo', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Fecha: ${note.workdate}`);
        doc.text(`Proyecto: ${note.projectId.code || note.projectId.projectCode}`);
        doc.text(`Descripción: ${note.description}`);
        doc.text(`Usuario: ${note.userId.nombre || ''} (${note.userId.email})`);

        const addr = note.clientId.address;
        doc.text(`Cliente: ${note.clientId.name}`);
        doc.text(`Dirección: ${addr.street}, ${addr.number}, ${addr.postal} ${addr.city} (${addr.province})`);
        doc.text(`CIF: ${note.clientId.cif}`);
        doc.moveDown();

        doc.fontSize(14).text('Detalles:', { underline: true });
        const concepts = note.format === 'hours'
            ? note.multi || [{ name: note.userId.nombre, hours: note.hours }]
            : note.multi || [{ name: note.material, quantity: 1 }];

        concepts.forEach((item, index) => {
            if (note.format === 'hours') {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Trabajador'} - ${item.hours} horas`);
            } else {
                doc.fontSize(12).text(`${index + 1}. ${item.name || 'Material'} - ${item.quantity || 1} uds`);
            }
        });

        try {
            doc.addPage().image(buffer, { fit: [400, 200], align: 'center' });
            doc.text('Firma del cliente', { align: 'center' });
        } catch (e) {
            console.warn('Error al insertar imagen de firma:', e.message);
            doc.addPage().fontSize(12).text('Firma no disponible', { align: 'center' });
        }

        doc.end();

        stream.on('finish', async () => {
            const pdfBuffer = fs.readFileSync(pdfPath);
            const pdfUpload = await uploadToPinata(pdfBuffer, pdfName);
            note.pdf = `${process.env.PINATA_GATEWAY_URL}/ipfs/${pdfUpload.IpfsHash}`;

            await note.save();

            return res.status(200).json({
                message: 'Albarán firmado correctamente',
                sign: ipfsURL
            });
        });
    } catch (err) {
        console.error('Error al firmar albarán:', err);
        return handleHttpError(res, 'Error interno al firmar albarán');
    }
};


const deleteDeliveryNote = async (req, res) => {
    const userId = req.user.id;
    const noteId = req.params.id;

    try {
        const note = await DeliveryNote.findById(noteId);

        if (!note) {
            return handleHttpError(res, 'Albarán no encontrado', 404);
        }

        if (note.userId.toString() !== userId) {
            return handleHttpError(res, 'No autorizado', 401);
        }

        if (note.sign) {
            return handleHttpError(res, 'No se puede borrar un albarán ya firmado', 400);
        }

        await DeliveryNote.deleteOne({ _id: noteId });

        return res.status(200).json({ message: 'Albarán eliminado correctamente' });

    } catch (err) {
        console.error('Error al eliminar el albarán:', err);
        return handleHttpError(res);
    }
};

module.exports = { createDeliveryNote, getDeliveryNotes, getDeliveryNoteById, generateDeliveryNotePDF, signDeliveryNote, deleteDeliveryNote };