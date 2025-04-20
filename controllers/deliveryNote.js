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

module.exports = { createDeliveryNote };
