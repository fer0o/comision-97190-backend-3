# AdoptMe API

API backend para gestion de adopciones de mascotas desarrollada con Node.js, Express y MongoDB Atlas.

El proyecto implementa autenticacion con JWT, gestion de mascotas, adopciones, documentacion Swagger/OpenAPI, tests funcionales y dockerizacion con imagen publicada en DockerHub.

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JWT
- Bcrypt
- Cookie Parser
- Mocha
- Chai
- Supertest
- MongoDB Memory Server
- Swagger / OpenAPI
- Docker

## Arquitectura

El proyecto sigue una arquitectura por capas:

```txt
app -> router -> controller -> service -> repository -> DAO -> model -> MongoDB
```

Los DAO mantienen operaciones CRUD simples:

```txt
create
getAll
getOne
update
delete
```

## Estructura del proyecto

```txt
src/
  app.js
  server.js
  config/
    config.js
    db.js
    swagger.js
  controllers/
    adoptions.controller.js
    health.controller.js
    pets.controller.js
    sessions.controller.js
  dao/
    mongo/
      adoption.mongo.dao.js
      pet.mongo.dao.js
      user.mongo.dao.js
  docs/
    adoptions.yaml
    health.yaml
    pets.yaml
    sessions.yaml
  models/
    adoption.model.js
    pet.model.js
    user.model.js
  repositories/
    adoption.repository.js
    index.js
    pet.repository.js
    user.repository.js
  routes/
    adoptions.router.js
    health.router.js
    pets.router.js
    sessions.router.js
  services/
    adoption.service.js
    pet.service.js
    session.service.js
    user.service.js
  utils/
    hash.js
    jwt.js
test/
  setup.js
  functional/
    adoptions.test.js
    health.test.js
    sessions.test.js
Dockerfile
.dockerignore
```

## Variables de entorno

Crear un archivo `.env` en la raiz del proyecto usando `.env.example` como referencia.

```env
PORT=8080
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/adoptme_backend3
JWT_SECRET=change_this_secret
NODE_ENV=development
```

Notas:

- `MONGO_URI` debe apuntar a MongoDB Atlas.
- `.env` no se incluye en la imagen Docker.
- Para ejecutar con Docker se debe pasar el `.env` en runtime con `--env-file`.
- Los tests funcionales no usan `MONGO_URI`; levantan una base MongoDB temporal en memoria.

### Nota sobre MongoDB Atlas

Para ejecutar la API con `npm run dev`, `npm start` o Docker, la IP desde donde se corre el proyecto debe estar permitida en MongoDB Atlas Network Access.

Para una evaluacion academica puede habilitarse temporalmente:

```txt
0.0.0.0/0
```

Esto permite conexiones desde cualquier IP. Se recomienda usarlo solo con una base de datos academica o de prueba, sin datos sensibles.

## Instalacion local

Requisito:

```txt
Node.js >= 20.19.0
```

El Dockerfile usa `node:22-alpine`, por lo que la imagen Docker ya cumple este requisito.

```bash
npm install
```

Ejecutar en modo desarrollo:

```bash
npm run dev
```

Ejecutar en modo produccion:

```bash
npm start
```

Servidor local:

```txt
http://localhost:8080
```

## Scripts

```bash
npm run dev
npm start
npm test
```

## Endpoints principales

### Health

```txt
GET /api/health
```

### Sessions

```txt
POST /api/sessions/register
POST /api/sessions/login
GET  /api/sessions/current
```

`GET /api/sessions/current` acepta token JWT por:

```txt
Authorization: Bearer <token>
```

o cookie:

```txt
token=<jwt>
```

### Pets

```txt
GET    /api/pets
POST   /api/pets
GET    /api/pets/:pid
PUT    /api/pets/:pid
DELETE /api/pets/:pid
```

### Adoptions

```txt
GET  /api/adoptions
GET  /api/adoptions/:aid
POST /api/adoptions/:uid/:pid
```

Reglas principales de adopcion:

- El usuario debe existir.
- La mascota debe existir.
- Una mascota adoptada no puede volver a adoptarse.
- La creacion de adopcion y actualizacion de mascota se realiza con transaccion MongoDB.
- Existe indice unico parcial para evitar doble adopcion activa de la misma mascota.

## Swagger / OpenAPI

La documentacion interactiva esta disponible en:

```txt
http://localhost:8080/api/docs
```

Cuando se ejecuta con Docker en el puerto externo `8081`:

```txt
http://localhost:8081/api/docs
```

Swagger documenta:

```txt
Health
Sessions
Pets
Adoptions
```

## Tests funcionales

El proyecto usa Mocha, Chai, Supertest y MongoDB Memory Server.

Los tests levantan un `MongoMemoryReplSet`, es decir, un replica set temporal en memoria. Esto permite probar transacciones de MongoDB sin depender de MongoDB Atlas, IP whitelist, red externa o datos persistidos.

Ejecutar tests:

```bash
npm test
```

Resultado validado:

```txt
13 passing
```

Los tests cubren:

- `GET /api/health`
- Tests funcionales de `adoptions.router.js`
- Casos positivos y negativos de adopciones
- Validacion de ids invalidos
- Usuario, mascota y adopcion inexistentes
- Mascota ya adoptada
- Concurrencia para evitar doble adopcion
- Registro concurrente con email duplicado

Importante:

- `npm test` no requiere `.env`.
- `npm test` no usa MongoDB Atlas.
- La base de datos de prueba se crea en memoria y se elimina al terminar los tests.

Nota de auditoria:

- `npm audit --omit=dev` no reporta vulnerabilidades en dependencias de produccion.
- `npm audit` completo puede reportar vulnerabilidades en dependencias de desarrollo relacionadas con Mocha.
- No se aplico `npm audit fix --force` para evitar cambios regresivos en dependencias de desarrollo.

## Docker

Construir la imagen local:

```bash
docker build -t adoptme-api:local .
```

Ejecutar la imagen local:

```bash
docker run --rm --env-file .env -p 8081:8080 adoptme-api:local
```

Probar health desde Docker:

```txt
http://localhost:8081/api/health
```

## DockerHub

Imagen publica:

```txt
https://hub.docker.com/r/fer0o/adoptme-api
```

Tags disponibles:

```txt
fer0o/adoptme-api:1.0.1
fer0o/adoptme-api:latest
```

Ejecutar imagen desde DockerHub:

```bash
docker run --rm --env-file .env -p 8081:8080 fer0o/adoptme-api:1.0.1
```

Endpoint de verificacion:

```txt
http://localhost:8081/api/health
```

## Estado del proyecto

Implementado:

- API sin frontend.
- Conexion MongoDB Atlas con Mongoose.
- Arquitectura por capas.
- Roles `user` y `admin` en modelo de usuario.
- Auth con JWT.
- Mascotas.
- Adopciones.
- Tests funcionales.
- Dockerfile.
- Imagen DockerHub.
- Swagger/OpenAPI.

Extensiones futuras posibles:

- Pagos simulados.
- CI/CD.
- Reglas de negocio adicionales para adopciones.
