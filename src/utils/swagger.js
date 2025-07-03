import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My API",
      version: "1.0.0",
      description: "API documentation for my project",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`, // your API base URL
      },
    ],
  },
  // Path to the API docs (globs or arrays of files)
  apis: ["../routes/*.js"], // adjust this to your project structure
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerSpec, swaggerUi };
