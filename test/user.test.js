const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

let token = '';
let testEmail = `test${Date.now()}@mail.com`;
let userId = '';

beforeAll(async () => {
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: testEmail, password: 'testpassword123' });

  token = registerRes.body.token;
  userId = registerRes.body.user._id;

  const user = await User.findById(userId);

  await request(app)
    .post('/api/user/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code: user.code });
});

afterAll(async () => {
  await User.deleteMany({ email: testEmail });
  await mongoose.connection.close();
});

describe('User Endpoints', () => {
  it('debería completar los datos personales del usuario', async () => {
    const res = await request(app)
      .put('/api/user/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Juan',
        apellidos: 'Pérez',
        nif: '12345678A',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('debería actualizar los datos de empresa como autónomo', async () => {
    const res = await request(app)
      .patch('/api/user/company')
      .set('Authorization', `Bearer ${token}`)
      .send({
        street: 'Calle Luna',
        number: 10,
        postal: 28001,
        city: 'Madrid',
        province: 'Madrid',
        esAutonomo: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('acknowledged', true);
  });

  it('debería devolver los datos del usuario', async () => {
    const res = await request(app)
      .get('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email', testEmail);
    expect(res.body).toHaveProperty('company');
  });

  it('debería subir el logo a Pinata', async () => {
    const res = await request(app)
      .patch('/api/user/logo')
      .set('Authorization', `Bearer ${token}`)
      .attach('logo', Buffer.from('FakeImageContent'), 'fake.png');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('logo');
  });

  it('debería hacer soft delete del usuario', async () => {
    const res = await request(app)
      .delete('/api/user')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('debería eliminar permanentemente al usuario (hard delete)', async () => {
    const resRegister = await request(app)
      .post('/api/user/register')
      .send({
        email: `harddelete${Date.now()}@mail.com`,
        password: 'harddelete123',
      });

    const hardDeleteToken = resRegister.body.token;
    const hardDeleteId = resRegister.body.user._id;

    const user = await User.findById(hardDeleteId);

    await request(app)
      .post('/api/user/validation')
      .set('Authorization', `Bearer ${hardDeleteToken}`)
      .send({ code: user.code });

    const resDelete = await request(app)
      .delete('/api/user?soft=false')
      .set('Authorization', `Bearer ${hardDeleteToken}`);

    expect(resDelete.statusCode).toBe(200);
    expect(resDelete.body).toHaveProperty('message');

    const deletedUser = await User.findById(hardDeleteId);
    expect(deletedUser).toBeNull();
  });
});
