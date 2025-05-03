const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

let token = '';
let testEmail = `test${Date.now()}@mail.com`;
let testCode = '';
let recoveryCode = '';

describe('Auth Endpoints', () => {
    afterAll(async () => {
        await User.deleteOne({ email: testEmail });
        await mongoose.connection.close();
    });

    it('debería registrar un usuario nuevo', async () => {
        const res = await request(app)
            .post('/api/user/register')
            .send({
                email: testEmail,
                password: 'testpassword123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty('email', testEmail);
        expect(res.body).toHaveProperty('token');

        token = res.body.token;

        const user = await User.findOne({ email: testEmail });
        testCode = user.code;
    });

    it('debería validar correctamente el email del usuario', async () => {
        const res = await request(app)
            .post('/api/user/validation')
            .set('Authorization', `Bearer ${token}`)
            .send({ code: testCode });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged', true);
    });

    it('debería iniciar sesión con credenciales válidas', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: testEmail,
                password: 'testpassword123',
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', testEmail);
    });

    it('debería enviar código de recuperación de contraseña', async () => {
        const res = await request(app)
            .post('/api/user/recover')
            .send({ email: testEmail });

        expect(res.statusCode).toBe(200);
        expect(res.body.user).toHaveProperty('email', testEmail);

        const updatedUser = await User.findOne({ email: testEmail });
        recoveryCode = updatedUser.code;
        expect(recoveryCode).toHaveLength(6);
    });

    it('debería cambiar la contraseña usando el código de recuperación', async () => {
        const res = await request(app)
            .patch('/api/user/password')
            .send({
                email: testEmail,
                code: recoveryCode,
                password: 'nuevaPassword123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('acknowledged', true);
    });

    it('debería iniciar sesión con la nueva contraseña', async () => {
        const res = await request(app)
            .post('/api/user/login')
            .send({
                email: testEmail,
                password: 'nuevaPassword123'
            });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', testEmail);
    });
});
