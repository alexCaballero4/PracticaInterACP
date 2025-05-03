const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');
const DeliveryNote = require('../models/DeliveryNote');

let token = '';
let user;
let client;
let project;
let deliveryNoteId;

const testEmail = `test_note_${Date.now()}@mail.com`;

beforeAll(async () => {
    const register = await request(app)
        .post('/api/user/register')
        .send({ email: testEmail, password: 'testpass123' });

    token = register.body.token;
    user = await User.findById(register.body.user._id);

    await request(app)
        .put('/api/user/validation')
        .set('Authorization', `Bearer ${token}`)
        .send({ code: user.code });

    const clientRes = await request(app)
        .post('/api/client')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Cliente Test',
            cif: 'B64071485',
            address: {
                street: 'Calle Sol',
                number: 12,
                postal: 28080,
                city: 'Madrid',
                province: 'Madrid'
            }
        });

    client = clientRes.body.client || clientRes.body;
    expect(client).toBeDefined();
    expect(client._id).toBeDefined();

    const projectRes = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: 'Proyecto Test',
            projectCode: 'PJT-001',
            email: testEmail,
            code: 'CODE01',
            clientId: client._id,
            address: {
                street: 'Avenida Test',
                number: 1,
                postal: 28080,
                city: 'Madrid',
                province: 'Madrid'
            }
        });

    project = projectRes.body.project || projectRes.body;
    expect(project).toBeDefined();
    expect(project._id).toBeDefined();

    const deliveryRes = await request(app)
        .post('/api/deliverynote')
        .set('Authorization', `Bearer ${token}`)
        .send({
            clientId: client._id,
            projectId: project._id,
            format: 'material',
            material: 'Cemento',
            description: 'Albarán de prueba (material)',
            workdate: '2025-05-03'
        });

    expect(deliveryRes.statusCode).toBe(200);
    deliveryNoteId = deliveryRes.body._id;
});

afterAll(async () => {
    await DeliveryNote.deleteMany({ userId: user._id });
    await Project.deleteMany({ userId: user._id });
    await Client.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    await mongoose.connection.close();
});

describe('DeliveryNote Endpoints', () => {
    it('debería obtener todos los albaranes del usuario', async () => {
        const res = await request(app)
            .get('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });

    it('debería obtener el albarán por ID', async () => {
        const res = await request(app)
            .get(`/api/deliverynote/${deliveryNoteId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('project');
        expect(res.body).toHaveProperty('client');
    });

    it('debería generar el PDF del albarán', async () => {
        const res = await request(app)
            .get(`/api/deliverynote/pdf/${deliveryNoteId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('url');
    });

    it('debería firmar el albarán subiendo imagen', async () => {
        const filePath = path.join(__dirname, 'firma_test.jpg');
        const fileBuffer = fs.readFileSync(filePath);

        const res = await request(app)
            .patch(`/api/deliverynote/sign/${deliveryNoteId}`)
            .set('Authorization', `Bearer ${token}`)
            .attach('sign', fileBuffer, 'firma_test.jpg');

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('sign');
    });

    it('no debería permitir borrar un albarán firmado', async () => {
        const res = await request(app)
            .delete(`/api/deliverynote/${deliveryNoteId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('debería crear y luego borrar un albarán no firmado', async () => {
        const resCreate = await request(app)
            .post('/api/deliverynote')
            .set('Authorization', `Bearer ${token}`)
            .send({
                clientId: client._id,
                projectId: project._id,
                format: 'material',
                material: 'Cemento',
                description: 'Albarán de prueba (material)',
                workdate: '2025-05-03'
            });

        const noteId = resCreate.body._id;

        const resDelete = await request(app)
            .delete(`/api/deliverynote/${noteId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(resDelete.statusCode).toBe(200);
        expect(resDelete.body).toHaveProperty('message');
    });
});
