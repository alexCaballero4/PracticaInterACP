const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require('path');

const routers = require('./routes/')

const dbConnect = require('./config/mongo.js')

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./docs/swagger');

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', routers)

const port = process.env.PORT || 3000

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}`);
    console.log(`Documentación Swagger: http://localhost:${port}/api-docs`);
})

dbConnect()
