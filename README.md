# Backoffice B2B — Arquitectura de Microservicios

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Solución basada en microservicios para la gestión de clientes, productos y pedidos en un entorno B2B. Resuelve un problema típico de backoffice: mantener catálogo de clientes y productos desacoplados, crear órdenes con validación de stock e idempotencia, y orquestar el flujo completo (validar cliente → crear orden → confirmar) desde un servicio independiente estilo AWS Lambda.

> **Nota:** La consigna original menciona MySQL y archivos `db/schema.sql` / `db/seed.sql`. Esta implementación fue adaptada a **PostgreSQL**, y la creación de tablas se realiza de forma programática desde Node.js al iniciar los servicios, manteniendo la estructura general del proyecto.

---

## Stack tecnológico

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-plain.svg" title="Node.js" alt="Node.js" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" title="Express" alt="Express" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-plain.svg" title="JavaScript (ES Modules)" alt="JavaScript" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-plain.svg" title="PostgreSQL" alt="PostgreSQL" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sequelize/sequelize-plain.svg" title="Sequelize" alt="Sequelize" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-plain.svg" title="Docker" alt="Docker" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swagger/swagger-plain.svg" title="Swagger / OpenAPI" alt="Swagger" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain.svg" title="AWS Lambda (Serverless Framework)" alt="AWS" width="40" height="40"/>&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/JWT-black?style=flat-square&logo=jsonwebtokens&logoColor=white" title="JSON Web Token" alt="JWT" height="28"/>&nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Serverless_Framework-fd5750?style=flat-square&logo=serverless&logoColor=white" title="Serverless Framework" alt="Serverless Framework" height="28"/>
</p>

| Tecnología | Uso en el proyecto |
|---|---|
| **Node.js + Express** | Runtime y framework REST de los tres servicios |
| **PostgreSQL + Sequelize** | Base de datos relacional y ORM con sincronización automática de tablas |
| **Docker & Docker Compose** | Empaquetado y orquestación local de los tres servicios + la base de datos |
| **JSON Web Token (JWT)** | Autenticación de usuarios en `customers-api` y `orders-api` |
| **Service Token** | Autenticación interna servicio-a-servicio (`orders-api` → `customers-api`) |
| **Swagger / OpenAPI** | Documentación interactiva (`/docs`) en cada servicio |
| **Serverless Framework** | Empaqueta el orquestador como función AWS Lambda (ejecutable local con `serverless-offline`) |
| **Axios** | Cliente HTTP para la comunicación entre microservicios |

---

## Estructura del proyecto

```
Microservice-B2b/
├── customers-api/         # Gestión de clientes + autenticación JWT
├── orders-api/             # Catálogo de productos y ciclo de vida de órdenes
├── lambda-orchestrator/    # Orquestador serverless: valida cliente, crea y confirma orden
├── docker-compose.yml      # Levanta los 3 servicios + PostgreSQL
└── README.md
```

Cada servicio sigue una organización por capas (`routes` → `controllers` → `services` → `models`/`clients`), con `config`, `middlewares` y `utils` propios. El detalle de `orders-api` está documentado en su propio [README](orders-api/README.md).

---

## Servicios y puertos

| Servicio              | URL                        |
|-----------------------|----------------------------|
| Customers API         | http://localhost:3001      |
| Orders API            | http://localhost:3002      |
| PostgreSQL            | localhost:5432             |
| Lambda Orchestrator   | http://localhost:3003 *(vía `serverless-offline`)* |

---

## Requisitos previos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Node.js 20+ y npm (solo si se ejecuta algún servicio fuera de Docker)

---

## Variables de entorno

Cada microservicio requiere un archivo `.env` basado en su `.env.example`. A continuación se documentan las variables que cada servicio realmente lee en su código (algunas no están presentes en el `.env.example` del repo; ver la auditoría funcional más abajo):

### `customers-api/.env`

```env
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=backoffice_b2b
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=super-secret-jwt
JWT_EXPIRES_IN=1h
SERVICE_TOKEN=internal-service-token
AUTH_USERNAME=admin
AUTH_PASSWORD=change_this_password
```

### `orders-api/.env`

```env
PORT=3002
DB_HOST=postgres
DB_PORT=5432
DB_NAME=backoffice_b2b
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=super-secret-jwt
SERVICE_TOKEN=internal-service-token
AUTH_USERNAME=admin
AUTH_PASSWORD=admin123
CUSTOMERS_API_BASE_URL=http://customers-api:3001
```

### `lambda-orchestrator/.env`

```env
CUSTOMERS_API_BASE_URL=http://localhost:3001
ORDERS_API_BASE_URL=http://localhost:3002
```

---

## Cómo levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/Lualvarad0/Microservice-B2b.git
cd Microservice-B2b
```

### 2. Crear los archivos `.env`

Copiar los `.env.example` en cada servicio y completar las variables indicadas en la sección anterior:

```bash
cp customers-api/.env.example customers-api/.env
cp orders-api/.env.example orders-api/.env
cp lambda-orchestrator/.env.example lambda-orchestrator/.env
```

### 3. Construir y levantar los servicios

```bash
docker compose build
docker compose up -d
```

### 4. Verificar estado

```bash
docker ps
```

Health check de las APIs:

- Customers API → http://localhost:3001/health
- Orders API → http://localhost:3002/health

### Detener los servicios

```bash
docker compose down

# Para eliminar también los volúmenes:
docker compose down -v
```

---

## Base de datos

PostgreSQL corre en Docker a través del servicio `postgres` definido en `docker-compose.yml`. Al arrancar, cada API se conecta y crea sus tablas automáticamente mediante código Node.js si no existen, sin necesidad de migraciones manuales.

---

## Endpoints principales

### Customers API (`localhost:3001`)

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|-------------------------------------|
| POST   | `/auth/login`               | Obtener token JWT                  |
| GET    | `/health`                   | Health check                       |
| POST   | `/customers`                | Crear cliente                      |
| GET    | `/customers`                | Listar clientes (con búsqueda)     |
| GET    | `/customers/:id`            | Obtener cliente por ID             |
| PUT    | `/customers/:id`            | Actualizar cliente                 |
| DELETE | `/customers/:id`            | Eliminar cliente (soft delete)     |
| GET    | `/internal/customers/:id`   | Uso interno entre servicios        |

### Orders API (`localhost:3002`)

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|-------------------------------------|
| POST   | `/auth/login`               | Obtener token JWT                  |
| GET    | `/health`                   | Health check                       |
| POST   | `/products`                 | Crear producto                     |
| GET    | `/products`                 | Listar productos                   |
| GET    | `/products/:id`             | Obtener producto por ID            |
| PATCH  | `/products/:id`             | Actualizar producto                |
| POST   | `/orders`                   | Crear orden                        |
| GET    | `/orders`                   | Listar órdenes                     |
| GET    | `/orders/:id`               | Obtener orden por ID               |
| POST   | `/orders/:id/confirm`       | Confirmar orden (idempotente)      |
| POST   | `/orders/:id/cancel`        | Cancelar orden                     |

El detalle completo de arquitectura interna, lógica de negocio y decisiones técnicas de `orders-api` está en su propio [README](orders-api/README.md).

---

## Autenticación

### JWT (endpoints públicos)

1. Llamar a `POST /auth/login` con usuario y contraseña
2. Obtener el token
3. Incluirlo en el header:

```
Authorization: Bearer <token>
```

### Service Token (comunicación interna entre servicios)

```
Authorization: Bearer <SERVICE_TOKEN>
```

---

## Ejemplos con curl

### Login en Customers API

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"change_this_password"}'
```

### Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name":"ACME Corp","email":"ops@acme.com","phone":"0999999999"}'
```

### Buscar clientes

```bash
curl -X GET "http://localhost:3001/customers?search=acme&limit=10" \
  -H "Authorization: Bearer TU_TOKEN"
```

### Crear producto

```bash
curl -X POST http://localhost:3002/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ORDERS" \
  -d '{"sku":"SKU-001","name":"Laptop Dell","price":1299.00,"stock":10}'
```

### Crear orden

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ORDERS" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":2}]}'
```

### Confirmar orden (con idempotencia)

```bash
curl -X POST http://localhost:3002/orders/1/confirm \
  -H "Authorization: Bearer TU_TOKEN_ORDERS" \
  -H "X-Idempotency-Key: abc-123"
```

### Cancelar orden

```bash
curl -X POST http://localhost:3002/orders/1/cancel \
  -H "Authorization: Bearer TU_TOKEN_ORDERS"
```

---

## Lambda Orchestrator

Orquestador invocable por HTTP (empaquetado como función AWS Lambda vía Serverless Framework) que valida el cliente contra `customers-api`, crea la orden en `orders-api` y la confirma, devolviendo una respuesta consolidada.

### Ejecutar localmente

```bash
cd lambda-orchestrator
npm install
npm run dev
```

### Invocar endpoint

```
POST /orchestrator/create-and-confirm-order
```

**Body:**

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 2, "quantity": 3 }
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

Documentación interactiva disponible en `http://localhost:3003/docs`.

---

## Notas sobre Docker

- Cada microservicio tiene su propio `Dockerfile`.
- Usar `DB_HOST=postgres` dentro de contenedores (no `localhost`).
- No incluir `node_modules` en el repositorio.
- Usar `package-lock.json` para instalaciones reproducibles.

---

## Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| El servicio no arranca / "Missing required environment variable" | Revisar que el `.env` tenga **todas** las variables listadas en la sección de variables de entorno, no solo las del `.env.example` del repo |
| Error de conexión a DB | Verificar que PostgreSQL esté arriba y que `DB_HOST=postgres` |
| API falla al iniciar | Revisar logs: `docker compose logs customers-api` |
| Puerto ocupado | Cambiar puerto en `docker-compose.yml` o liberar el puerto |
| Token inválido | Verificar `JWT_SECRET` y el header `Authorization` |
| Error entre servicios | Verificar que `SERVICE_TOKEN` sea el mismo en `customers-api` y `orders-api`, y que `CUSTOMERS_API_BASE_URL` apunte a la URL correcta |

---

## Criterios cubiertos

- [x] Customers API funcional
- [x] Orders API funcional
- [x] Levantamiento local con Docker Compose
- [x] Validación de cliente desde Orders contra Customers
- [x] Creación de órdenes con validación de stock
- [x] Confirmación idempotente con `X-Idempotency-Key`
- [x] Cancelación con restauración de stock
- [x] Base de datos en contenedor Docker
- [x] Estructura de monorepo

## Pendiente / En desarrollo

- [ ] Alinear `.env.example` de `orders-api` y `lambda-orchestrator` con las variables que el código realmente requiere
- [ ] Tests automatizados (unitarios / integración)
- [ ] CI/CD (lint, tests y build en cada PR)
- [ ] Documentación OpenAPI consolidada (actualmente una instancia de Swagger por servicio)
- [ ] Colección Postman / Insomnia
- [ ] Archivos `db/schema.sql` y `db/seed.sql` como referencia documental
- [ ] Despliegue en AWS

## Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.
