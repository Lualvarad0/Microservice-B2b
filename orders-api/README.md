# orders-api

Microservicio de gestión de productos y órdenes desarrollado con **Node.js**, **Express**, **Sequelize** y **PostgreSQL**, como parte de una arquitectura B2B basada en microservicios.

---

## Tabla de contenido

- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Arquitectura interna](#arquitectura-interna)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución del proyecto](#ejecución-del-proyecto)
- [Base de datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Lógica de negocio](#lógica-de-negocio)
- [Confirmación y cancelación de órdenes](#confirmación-y-cancelación-de-órdenes)
- [Paginación y manejo de errores](#paginación-y-manejo-de-errores)
- [Swagger](#swagger)
- [Decisiones técnicas](#decisiones-técnicas)

---

## Descripción general

`orders-api` administra el ciclo de vida completo de productos y órdenes dentro del sistema B2B:

- Registro y consulta de productos
- Creación y consulta de órdenes
- Validación remota de clientes contra `customers-api`
- Control de inventario (descuento y restauración de stock)
- Confirmación idempotente de órdenes
- Cancelación de órdenes bajo reglas definidas
- Documentación interactiva con Swagger

---

## Tecnologías utilizadas

| Tecnología       | Uso                                          |
|------------------|----------------------------------------------|
| Node.js          | Entorno de ejecución                         |
| Express          | Framework REST                               |
| Sequelize        | ORM                                          |
| PostgreSQL        | Base de datos                                |
| JWT              | Autenticación                                |
| Axios            | Integración con otros microservicios         |
| Swagger UI       | Documentación y pruebas interactivas         |
| Docker           | Empaquetado y ejecución en contenedores      |

---

## Arquitectura interna

La API está organizada en capas:

| Capa          | Descripción                                                        |
|---------------|--------------------------------------------------------------------|
| `config`      | Variables de entorno, conexión a DB y configuración de Swagger     |
| `routes`      | Definición de endpoints HTTP                                       |
| `controllers` | Recepción de requests y construcción de responses                  |
| `services`    | Lógica de negocio                                                  |
| `models`      | Entidades Sequelize y sus asociaciones                             |
| `middlewares` | Autenticación, manejo de errores y rutas inexistentes              |
| `clients`     | Integración con microservicios externos                            |
| `database`    | Inicialización y sincronización de la DB                           |
| `utils`       | Validación, cursores, respuestas y JWT                             |

---

## Estructura del proyecto

```
orders-api/
├── src/
│   ├── clients/
│   │   └── customersApiClient.js
│   ├── config/
│   │   ├── db.js
│   │   ├── env.js
│   │   └── swagger.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── healthController.js
│   │   ├── ordersController.js
│   │   └── productsController.js
│   ├── database/
│   │   └── initDb.js
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── notFoundHandler.js
│   ├── models/
│   │   ├── IdempotencyKey.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Product.js
│   │   └── index.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── healthRoutes.js
│   │   ├── index.js
│   │   ├── orderRoutes.js
│   │   └── productRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── orderService.js
│   │   └── productService.js
│   ├── utils/
│   │   ├── appError.js
│   │   ├── asyncHandler.js
│   │   ├── cursor.js
│   │   ├── jwt.js
│   │   ├── pagination.js
│   │   ├── responses.js
│   │   └── validators.js
│   ├── app.js
│   └── server.js
├── .env
├── .env.example
├── Dockerfile
└── package.json
```

---

## Variables de entorno

Crea un archivo `.env` basado en `.env.example`:

```env
NODE_ENV=development
PORT=3002

DB_HOST=postgres
DB_PORT=5432
DB_NAME=backoffice_b2b
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=super-secret-jwt
JWT_EXPIRES_IN=1h

SERVICE_TOKEN=internal-service-token

AUTH_USERNAME=admin
AUTH_PASSWORD=admin123

DB_MAX_RETRIES=10
DB_RETRY_DELAY_MS=3000
DEFAULT_PAGE_LIMIT=10
MAX_PAGE_LIMIT=50

CUSTOMERS_API_BASE_URL=http://customers-api:3001

CONFIRMED_CANCEL_WINDOW_MINUTES=5
DB_LOGGING=false
SWAGGER_SERVER_URL=http://localhost:3002
```

### Variables clave

| Variable                          | Descripción                                               |
|-----------------------------------|-----------------------------------------------------------|
| `PORT`                            | Puerto donde corre el servicio                            |
| `DB_*`                            | Conexión a PostgreSQL                                     |
| `JWT_SECRET` / `JWT_EXPIRES_IN`  | Configuración de autenticación JWT                        |
| `AUTH_USERNAME` / `AUTH_PASSWORD`| Credenciales de login                                     |
| `SERVICE_TOKEN`                   | Token interno para comunicación con `customers-api`       |
| `CUSTOMERS_API_BASE_URL`          | URL base de `customers-api`                               |
| `CONFIRMED_CANCEL_WINDOW_MINUTES`| Ventana de tiempo para cancelar órdenes confirmadas       |
| `SWAGGER_SERVER_URL`              | URL base utilizada en la documentación Swagger            |

---

## Ejecución del proyecto

### Local

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev
```

### Con Docker

```bash
docker compose up --build
```

---

## Base de datos

Al arrancar el servicio, Sequelize se conecta a PostgreSQL y sincroniza los modelos automáticamente, creando las tablas si no existen:

| Tabla               | Descripción                            |
|---------------------|----------------------------------------|
| `products`          | Catálogo de productos                  |
| `orders`            | Órdenes registradas                    |
| `order_items`       | Ítems por orden                        |
| `idempotency_keys`  | Registro de claves de idempotencia     |

---

## Autenticación

La API usa JWT. Para obtener un token:

```bash
POST /auth/login
```

**Body:**

```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "TOKEN_JWT",
    "tokenType": "Bearer",
    "expiresIn": "1h"
  }
}
```

Incluir el token en todos los endpoints protegidos:

```
Authorization: Bearer TOKEN_JWT
```

---

## Endpoints

### Health

| Método | Ruta      |
|--------|-----------|
| GET    | `/health` |

### Auth

| Método | Ruta           |
|--------|----------------|
| POST   | `/auth/login`  |

### Products

| Método | Ruta                                          | Descripción             |
|--------|-----------------------------------------------|-------------------------|
| POST   | `/products`                                   | Crear producto          |
| PATCH  | `/products/:id`                               | Actualizar producto     |
| GET    | `/products/:id`                               | Obtener por ID          |
| GET    | `/products?search=&cursor=&limit=`            | Listar con paginación   |

### Orders

| Método | Ruta                                          | Descripción             |
|--------|-----------------------------------------------|-------------------------|
| POST   | `/orders`                                     | Crear orden             |
| GET    | `/orders/:id`                                 | Obtener por ID          |
| GET    | `/orders?status=&from=&to=&cursor=&limit=`    | Listar con filtros      |
| POST   | `/orders/:id/confirm`                         | Confirmar orden         |
| POST   | `/orders/:id/cancel`                          | Cancelar orden          |

---

## Lógica de negocio

### Productos

Cada producto contiene: SKU, nombre, descripción, precio, stock y estado activo.

### Creación de órdenes

Al crear una orden, el servicio realiza en una sola transacción:

1. Valida el cliente en `customers-api` (`GET /internal/customers/:id`)
2. Valida existencia y stock de cada producto
3. Calcula el total
4. Crea la orden en estado `CREATED`
5. Crea los `order_items`
6. Descuenta el stock

La comunicación con `customers-api` usa el `SERVICE_TOKEN`:

```
Authorization: Bearer SERVICE_TOKEN
```

---

## Confirmación y cancelación de órdenes

### Confirmar orden

```
POST /orders/:id/confirm
X-Idempotency-Key: <clave-unica>
```

El header `X-Idempotency-Key` es obligatorio. Si la misma clave se reutiliza, la API devuelve la misma respuesta sin reprocesar la operación.

### Cancelar orden

```
POST /orders/:id/cancel
```

| Estado de la orden | Comportamiento                                                        |
|--------------------|-----------------------------------------------------------------------|
| `CREATED`          | Se cancela y se restaura el stock                                     |
| `CONFIRMED`        | Solo se puede cancelar dentro de la ventana definida en `CONFIRMED_CANCEL_WINDOW_MINUTES` |
| `CANCELLED`        | Devuelve error                                                        |

---

## Paginación y manejo de errores

### Paginación por cursor

Los listados usan `cursor` y `limit`. Ejemplo de respuesta:

```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "items": [],
    "pageInfo": {
      "limit": 10,
      "hasMore": false,
      "nextCursor": null
    }
  }
}
```

### Errores

Los errores se devuelven en formato JSON:

```json
{
  "success": false,
  "message": "Unauthorized",
  "details": null
}
```

Errores controlados: credenciales inválidas, token ausente o expirado, producto o cliente inexistente, stock insuficiente, orden inexistente, `X-Idempotency-Key` ausente o reutilización inválida.

---

## Swagger

Accede a la documentación interactiva en:

```
http://localhost:3002/docs
```

Configuración en: `src/config/swagger.js`  
Librerías: `swagger-jsdoc` + `swagger-ui-express`

### Autenticarse en Swagger

1. Ejecutar `POST /auth/login`
2. Copiar el `accessToken`
3. Clic en **Authorize**
4. Pegar: `Bearer TU_TOKEN`

Para confirmar una orden, incluir también:

```
X-Idempotency-Key: confirm-order-1-key-001
```

Swagger permite probar el flujo completo: login → productos → órdenes → confirmación → cancelación.

---

## Decisiones técnicas

- PostgreSQL en lugar de MySQL
- Sequelize como ORM con sincronización automática de tablas
- JWT para autenticación con expiración configurable
- Validación de clientes vía llamada interna a `customers-api`
- Idempotencia en confirmación de órdenes mediante tabla `idempotency_keys`
- Swagger integrado como documentación técnica interactiva

---

> Proyecto desarrollado como solución para prueba técnica.