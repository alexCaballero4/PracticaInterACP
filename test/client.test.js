const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');

let token = '';
let clientId = '';
let testEmail = `test_client_${Date.now()}@mail.com`;

beforeAll(async () => {
  const register = await request(app)
    .post('/api/user/register')
    .send({ email: testEmail, password: 'clientpass123' });

  token = register.body.token;

  const user = await User.findById(register.body.user._id);
  await request(app)
    .post('/api/user/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: user.code });
});

afterAll(async () => {
  await User.deleteOne({ email: testEmail });
  await mongoose.connection.close();
});

describe('Client Endpoints', () => {
  it('debería crear un nuevo cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Test',
        cif: 'B12345678',
        address: {
          street: 'Calle Sol',
          number: 12,
          postal: 28080,
          city: 'Madrid',
          province: 'Madrid'
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'Cliente Test');
    clientId = res.body._id;
  });

  it('debería obtener todos los clientes del usuario', async () => {
    const res = await request(app)
      .get('/api/client')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('debería obtener el cliente por ID', async () => {
    const res = await request(app)
      .get(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', clientId);
  });

  it('debería actualizar el cliente', async () => {
    const res = await request(app)
      .put(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Modificado',
        cif: 'B12345678',
        address: {
          street: 'Nueva Calle',
          number: 99,
          postal: 28085,
          city: 'Getafe',
          province: 'Madrid'
        }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Cliente Modificado');
  });

  it('debería archivar el cliente (soft delete)', async () => {
    const res = await request(app)
      .delete(`/api/client/${clientId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('debería eliminar el cliente (hard delete)', async () => {
    const newClient = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Hard Delete',
        cif: 'Z12345678'
      });

    const idToDelete = newClient.body._id;

    const res = await request(app)
      .delete(`/api/client/${idToDelete}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});
