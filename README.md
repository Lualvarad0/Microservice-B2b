# Backoffice B2B — Technical Test

Solución mínima basada en microservicios para la gestión de clientes, productos y pedidos en un entorno B2B.

> **Nota:** La consigna original menciona MySQL y archivos `db/schema.sql` / `db/seed.sql`. Esta implementación fue adaptada a **PostgreSQL**, y la creación de tablas se realiza de forma programática desde Node.js al iniciar los servicios, manteniendo la estructura general del proyecto.

---

## Estructura del proyecto

```
/customer-api
/orders-api
/lambda-orchestrator
/db
docker-compose.yml
README.md
```

---

## Tecnologías utilizadas

- Node.js + Express
- PostgreSQL
- Docker & Docker Compose
- JSON Web Token (JWT)
- Serverless Framework (orquestador)
- SQL parametrizado con validación de datos

---

## Servicios y puertos

| Servicio              | URL                        |
|-----------------------|----------------------------|
| Customers API         | http://localhost:3001      |
| Orders API            | http://localhost:3002      |
| PostgreSQL            | localhost:5432             |
| Lambda Orchestrator   | http://localhost:3003 *(según configuración serverless-offline)* |

---

## Requisitos previos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Node.js 22 o compatible
- npm

---

## Variables de entorno

Cada microservicio requiere un archivo `.env` basado en su `.env.example`.

### `customers-api/.env`

```env
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_NAME=backoffice_b2b
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=super-secret-jwt
SERVICE_TOKEN=internal-service-token
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
CUSTOMERS_API_BASE=http://customers-api:3001
```

### `lambda-orchestrator/.env`

```env
CUSTOMERS_API_BASE=http://localhost:3001
ORDERS_API_BASE=http://localhost:3002
SERVICE_TOKEN=internal-service-token
```

---

## Cómo levantar el proyecto

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_PROYECTO>
```

### 2. Crear los archivos `.env`

Copiar los `.env.example` en cada servicio:

```bash
cp customers-api/.env.example customers-api/.env
cp orders-api/.env.example orders-api/.env
cp lambda-orchestrator/.env.example lambda-orchestrator/.env
```

### 3. Construir los contenedores

```bash
docker compose build
```

### 4. Levantar los servicios

```bash
docker compose up -d
```

### 5. Verificar estado

```bash
docker ps
```

Verificar health de las APIs:

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

PostgreSQL corre en Docker a través del servicio `postgres` definido en `docker-compose.yml`. Al arrancar, cada API se conecta y crea sus tablas automáticamente mediante código Node.js si no existen — sin necesidad de migraciones manuales.

---

## Endpoints principales

### Customers API (`localhost:3001`)

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|------------------------------------|
| POST   | `/auth/login`               | Obtener token JWT                  |
| GET    | `/health`                   | Health check                       |
| POST   | `/customers`                | Crear cliente                      |
| GET    | `/customers`                | Listar clientes (con búsqueda)     |
| GET    | `/customers/:id`            | Obtener cliente por ID             |
| PUT    | `/customers/:id`            | Actualizar cliente                 |
| DELETE | `/customers/:id`            | Eliminar cliente                   |
| GET    | `/internal/customers/:id`   | Uso interno entre servicios        |

### Orders API (`localhost:3002`)

| Método | Ruta                        | Descripción                        |
|--------|-----------------------------|------------------------------------|
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

---

## Autenticación

### JWT (endpoints públicos)

1. Llamar a `POST /auth/login`
2. Obtener el token
3. Incluirlo en el header:

```
Authorization: Bearer <token>
```

### Service Token (comunicación interna entre servicios)

```
Authorization: Bearer internal-service-token
```

---

## Ejemplos con curl

### Login en Customers API

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin"}'
```

### Crear cliente

```bash
curl -X POST http://localhost:3001/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{"name":"ACME Corp","email":"ops@acme.com","phone":"0999999999"}'
```

### Obtener cliente por ID

```bash
curl -X GET http://localhost:3001/customers/1 \
  -H "Authorization: Bearer TU_TOKEN"
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
  -d '{"sku":"SKU-001","name":"Laptop Dell","price_cents":129900,"stock":10}'
```

### Crear orden

```bash
curl -X POST http://localhost:3002/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_ORDERS" \
  -d '{"customer_id":1,"items":[{"product_id":1,"qty":2}]}'
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

Orquestador invocable por HTTP que valida el cliente, crea la orden y la confirma, devolviendo una respuesta consolidada.

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
    { "product_id": 2, "qty": 3 }
  ],
  "idempotency_key": "abc-123",
  "correlation_id": "req-789"
}
```

---

## Notas sobre Docker

- Cada microservicio tiene su propio `Dockerfile`.
- Usar `DB_HOST=postgres` dentro de contenedores (no `localhost`).
- No incluir `node_modules` en el repositorio.
- Usar `.dockerignore` en cada servicio.
- Usar `package-lock.json` para instalaciones reproducibles.

---

## Solución de problemas comunes

| Problema | Solución |
|----------|----------|
| Error de conexión a DB | Verificar que PostgreSQL esté arriba y que `DB_HOST=postgres` |
| API falla al iniciar | Revisar logs: `docker compose logs customers-api` |
| Puerto ocupado | Cambiar puerto en `docker-compose.yml` o liberar el puerto |
| Token inválido | Verificar `JWT_SECRET` y el header `Authorization` |
| Error entre servicios | Verificar que `SERVICE_TOKEN` sea el mismo en ambos servicios |

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

- [ ] Lambda Orchestrator completo
- [ ] Documentación OpenAPI
- [ ] Colección Postman / Insomnia
- [ ] Archivos `db/schema.sql` y `db/seed.sql` como referencia documental
- [ ] Despliegue en AWS