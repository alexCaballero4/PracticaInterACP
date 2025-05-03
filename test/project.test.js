const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');
const Client = require('../models/Client');
const Project = require('../models/Project');

let token = '';
let clientId = '';
let projectId = '';
let archivedProjectId = '';
const testEmail = `project_test_${Date.now()}@mail.com`;

beforeAll(async () => {
  const registerRes = await request(app)
    .post('/api/user/register')
    .send({ email: testEmail, password: 'testpassword123' });

  token = registerRes.body.token;
  const userId = registerRes.body.user._id;
  const code = (await User.findById(userId)).code;

  await request(app)
    .post('/api/user/validation')
    .set('Authorization', `Bearer ${token}`)
    .send({ code });

  await request(app)
    .put('/api/user/register')
    .set('Authorization', `Bearer ${token}`)
    .send({
      nombre: 'Test',
      apellidos: 'User',
      nif: '12345678A',
    });

  const clientRes = await request(app)
    .post('/api/client')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: 'Cliente Test',
      cif: `B${Math.floor(Math.random() * 90000000 + 10000000)}`,
      address: {
        street: 'Calle Prueba',
        number: 1,
        postal: 28000,
        city: 'Madrid',
        province: 'Madrid',
      },
    });

  clientId = clientRes.body._id;
});

afterAll(async () => {
  await Project.deleteMany({});
  await Client.deleteMany({});
  await User.deleteMany({ email: testEmail });
  await mongoose.connection.close();
});

describe('Project Endpoints', () => {
  it('debería crear un proyecto', async () => {
    const res = await request(app)
      .post('/api/project')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Test',
        projectCode: 'TEST-001',
        email: 'cliente@prueba.com',
        code: 'PRJ001',
        clientId,
        address: {
          street: 'Calle Test',
          number: 10,
          postal: 28001,
          city: 'Madrid',
          province: 'Madrid',
        },
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    projectId = res.body._id;
  });

  it('debería actualizar el proyecto', async () => {
    const res = await request(app)
      .put(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Proyecto Actualizado',
        projectCode: 'UPD-001',
        email: 'actualizado@cliente.com',
        code: 'UPD001',
        clientId,
        address: {
          street: 'Calle Actualizada',
          number: 20,
          postal: 28002,
          city: 'Madrid',
          province: 'Madrid',
        },
        notes: 'Notas de prueba',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Proyecto Actualizado');
  });

  it('debería obtener todos los proyectos del usuario', async () => {
    const res = await request(app)
      .get('/api/project')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('debería obtener un proyecto por su ID', async () => {
    const res = await request(app)
      .get(`/api/project/one/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(projectId);
  });

  it('debería archivar (soft delete) un proyecto', async () => {
    const res = await request(app)
      .delete(`/api/project/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/archivado/i);
    archivedProjectId = projectId;
  });

  it('debería listar los proyectos archivados', async () => {
    const res = await request(app)
      .get('/api/project/archive')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    const ids = res.body.map(p => p._id);
    expect(ids).toContain(archivedProjectId);
  });

  it('debería restaurar el proyecto archivado', async () => {
    const res = await request(app)
      .patch(`/api/project/restore/${archivedProjectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('acknowledged', true);
  });

  it('debería eliminar permanentemente (hard delete) un proyecto', async () => {
    const res = await request(app)
      .delete(`/api/project/${archivedProjectId}?soft=false`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/eliminado/i);
  });
});
