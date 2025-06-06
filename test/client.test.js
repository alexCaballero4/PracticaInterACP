const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');

let token = '';
let clientId = '';
const testEmail = `test_client_${Date.now()}@mail.com`;
const dynamicCIF = `B${Math.floor(10000000 + Math.random() * 90000000)}`;

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
  await Client.deleteMany({});
  await User.deleteMany({ email: testEmail });
  await mongoose.connection.close();
});

describe('Client Endpoints', () => {
  it('debería crear un nuevo cliente', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Test',
        cif: dynamicCIF,
        address: {
          street: 'Calle Sol',
          number: 12,
          postal: 28080,
          city: 'Madrid',
          province: 'Madrid',
        },
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
        cif: dynamicCIF,
        address: {
          street: 'Nueva Calle',
          number: 99,
          postal: 28085,
          city: 'Getafe',
          province: 'Madrid',
        },
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
    const newCif = `Z${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newClient = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Hard Delete',
        cif: newCif,
      });

    const idToDelete = newClient.body._id;

    const res = await request(app)
      .delete(`/api/client/${idToDelete}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('debería fallar al crear un cliente sin nombre', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cif: `B${Math.floor(10000000 + Math.random() * 90000000)}`,
        address: {
          street: 'Calle Faltante',
          number: 1,
          postal: 28000,
          city: 'Madrid',
          province: 'Madrid',
        },
      });

    expect(res.statusCode).toBe(422);
  });

  it('debería fallar al crear cliente sin token', async () => {
    const res = await request(app)
      .post('/api/client')
      .send({
        name: 'Cliente Sin Token',
        cif: `B${Math.floor(10000000 + Math.random() * 90000000)}`,
      });

    expect(res.statusCode).toBe(401);
  });

  it('debería fallar al crear cliente con CIF repetido', async () => {
    const res = await request(app)
      .post('/api/client')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cliente Duplicado',
        cif: dynamicCIF,
        address: {
          street: 'Calle Repetida',
          number: 2,
          postal: 28000,
          city: 'Madrid',
          province: 'Madrid',
        },
      });

    expect(res.statusCode).toBe(409);
  });
});
