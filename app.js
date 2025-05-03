const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const routers = require('./routes/');
const dbConnect = require('./config/mongo.js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routers);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

dbConnect();

module.exports = app;
