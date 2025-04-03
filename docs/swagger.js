const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API - Gestión de usuarios",
      version: "1.0.0",
      description: "API practica final Programacion Web",
      license: {
        name: "MIT",
        url: "https://spdx.org/licenses/MIT.html",
      },
      contact: {
        name: "Alejandro Caballero",
        email: "alejandro.caballero@live.u-tad.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000/api",
        description: "Servidor local",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJSDoc(options);
