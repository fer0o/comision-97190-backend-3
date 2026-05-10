import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "AdoptMe API",
            version: "1.0.0",
            description: "API backend para gestion de adopciones de mascotas.",
        },
        servers: [
            {
                url: "http://localhost:8080",
                description: "Local server",
            },
            {
                url: "http://localhost:8081",
                description: "Docker local server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            }
        }
    },
    apis: ["./src/docs/*.yaml"],
};

export const swaggerSpecs = swaggerJSDoc(options);
