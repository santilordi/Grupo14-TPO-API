# TP Ejemplo — Aplicaciones Interactivas UADE

Sistema de créditos y cobranzas desarrollado como ejemplo didáctico para la materia
**Aplicaciones Interactivas (3.4.082)** de la UADE.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend | Java 21 + Spring Boot 3.4.3 |
| Persistencia | Spring Data JPA + Hibernate |
| Base de datos | H2 (en memoria) |
| Seguridad | Spring Security + JWT (jjwt 0.12.6) |
| Build | Maven |
| Frontend | React 18 + Vite 7 |
| Routing | React Router v7 |
| Estado global | Redux Toolkit + React-Redux |

---

## Estructura del proyecto

```
tpejemplo/
├── backend/               → Proyecto Spring Boot (Maven)
│   └── src/main/java/com/uade/tpejemplo/
│       ├── config/        → SecurityConfig (JWT + stateless)
│       ├── controller/    → AuthController, ClienteController, CreditoController,
│       │                     CobranzaController, SolicitudAumentoController
│       ├── dto/
│       │   ├── request/   → ClienteRequest, CreditoRequest, CobranzaRequest,
│       │   │                 LoginRequest, RegisterRequest, SolicitudAumentoRequest
│       │   └── response/  → ClienteResponse, CreditoResponse, CuotaResponse,
│       │                     CobranzaResponse, AuthResponse, SolicitudAumentoResponse
│       ├── exception/     → ResourceNotFoundException, BusinessException,
│       │                     GlobalExceptionHandler, ErrorResponse
│       ├── model/         → Cliente, Credito, Cuota, CuotaId, Cobranza, Usuario, Rol,
│       │                     SolicitudAumento, EstadoSolicitudCredito
│       ├── repository/    → ClienteRepository, CreditoRepository, CuotaRepository,
│       │                     CobranzaRepository, UsuarioRepository, SolicitudAumentoRepository
│       ├── security/      → JwtUtil, JwtAuthFilter, UserDetailsServiceImpl
│       └── service/
│           ├── ClienteService / ClienteServiceImpl
│           ├── CreditoService / CreditoServiceImpl
│           ├── CobranzaService / CobranzaServiceImpl
│           └── SolicitudAumentoService / SolicitudAumentoServiceImpl
└── frontend/              → Proyecto React + Vite
    └── src/
        ├── api/           → apiClient.js, auth.js, clientes.js, creditos.js, cobranzas.js
        ├── components/    → Navbar.jsx, PrivateRoute.jsx
        ├── store/
        │   ├── index.js                  → configureStore (combina reducers)
        │   └── slices/
        │       ├── authSlice.js          → login/register thunks + logout
        │       ├── clientesSlice.js      → fetchClientes + addCliente
        │       ├── creditosSlice.js      → fetchCreditosPorCliente + addCredito
        │       └── cobranzasSlice.js     → fetchCobranzasPorCredito + addCobranza
        └── pages/         → Login.jsx, Register.jsx, Clientes.jsx, Creditos.jsx, Cobranzas.jsx
```

---

## Modelo de datos

### Cliente
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dni | String (PK) | DNI del cliente |
| nombre | String | Nombre completo |
| limiteCredito | BigDecimal | Límite actual autorizado |

### Credito
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| cliente | FK → Cliente | Dueño del crédito |
| deudaOriginal | BigDecimal | Monto total del crédito |
| fecha | LocalDate | Fecha de otorgamiento |
| importeCuota | BigDecimal | Valor de cada cuota |
| cantidadCuotas | Integer | Número de cuotas |

### Cuota
| Campo | Tipo | Descripción |
|-------|------|-------------|
| idCredito + idCuota | PK compuesta (@EmbeddedId) | Clave compuesta |
| credito | FK → Credito | Crédito al que pertenece |
| fechaVencimiento | LocalDate | Vencimiento mensual auto-generado |

> Al crear un crédito se generan automáticamente N cuotas con vencimiento mensual.

### Cobranza
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| cuota | FK → Cuota | Cuota que se está pagando |
| importe | BigDecimal | Importe cobrado |

### SolicitudAumento
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador de la solicitud |
| cliente | FK → Cliente | Cliente que solicita el aumento |
| montoSolicitado | BigDecimal | Monto de límite de crédito deseado |
| fechaSolicitud | LocalDate | Fecha de creación de la solicitud |
| estado | Enum (String) | PENDIENTE, APROBADO o RECHAZADO |

### Usuario
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long (PK, auto) | Identificador |
| username | String (unique) | Nombre de usuario |
| password | String (BCrypt) | Contraseña encriptada |
| rol | Enum (ADMIN/USER) | Rol del usuario |

---

## API REST

### Autenticación (pública)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario, devuelve token JWT |
| POST | `/api/auth/login` | Iniciar sesión, devuelve token JWT |

### Clientes (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/clientes` | Crear cliente |
| GET | `/api/clientes` | Listar todos |
| GET | `/api/clientes/{dni}` | Buscar por DNI |

### Créditos (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/creditos` | Crear crédito (genera cuotas automáticamente) |
| GET | `/api/creditos/{id}` | Buscar por ID (incluye cuotas con estado pagada/pendiente) |
| GET | `/api/creditos/cliente/{dni}` | Créditos de un cliente |

### Cobranzas (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/cobranzas` | Registrar pago de una cuota |
| GET | `/api/cobranzas/credito/{idCredito}` | Cobranzas de un crédito |

### Solicitudes de Aumento (requiere JWT)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/solicitudes` | Crear una nueva solicitud de aumento |
| GET | `/api/solicitudes` | Listar todas las solicitudes |
| GET | `/api/solicitudes/pendientes` | Listar solicitudes pendientes |
| GET | `/api/solicitudes/{id}` | Buscar solicitud por ID |
| PATCH | `/api/solicitudes/{id}/aprobar` | Aprobar solicitud y actualizar límite del cliente |
| PATCH | `/api/solicitudes/{id}/rechazar` | Rechazar solicitud |

---

## Seguridad JWT

El flujo de autenticación es:

```
1. POST /api/auth/register  →  { token, username, rol }
2. POST /api/auth/login     →  { token, username, rol }
3. Resto de endpoints       →  Header: Authorization: Bearer <token>
```

- Token firmado con HMAC-SHA384
- Expiración: 24 horas
- Sesión stateless (sin HttpSession)
- Contraseñas encriptadas con BCrypt

---

## Manejo de errores

Todos los errores devuelven un `ErrorResponse` uniforme:

```json
{
  "status": 400,
  "error": "Error de negocio",
  "mensajes": ["La cuota 1 del crédito 1 ya fue pagada"],
  "timestamp": "2026-03-03T14:00:00"
}
```

Excepciones manejadas por `@RestControllerAdvice`:
- `ResourceNotFoundException` → 404
- `EntityNotFoundException` (JPA) → 404
- `BusinessException` → 400 (reglas de negocio)
- `MethodArgumentNotValidException` → 400 (validaciones `@Valid`)
- `DataIntegrityViolationException` → 409 (violaciones de integridad)
- `Exception` genérica → 500

---

## Frontend React + Redux

### Redux store

El estado global está dividido en 4 slices:

| Slice | Estado | Acciones |
|-------|--------|----------|
| `auth` | `user`, `loading`, `error` | `loginThunk`, `registerThunk`, `logout` |
| `clientes` | `lista`, `loading`, `error` | `fetchClientes`, `addCliente` |
| `creditos` | `lista`, `loading`, `error` | `fetchCreditosPorCliente`, `addCredito`, `clearCreditos` |
| `cobranzas` | `lista`, `loading`, `error` | `fetchCobranzasPorCredito`, `addCobranza`, `clearCobranzas` |

Cada operación asíncrona usa `createAsyncThunk`, que maneja automáticamente los estados `pending / fulfilled / rejected`.

### Otros conceptos del frontend

- **PrivateRoute** redirige a `/login` si `state.auth.user` es null
- **Navbar** despacha `logout()` y limpia `localStorage`
- **apiClient.js** centraliza todas las llamadas fetch con el header `Authorization: Bearer <token>`
- El proxy de Vite redirige `/api/*` → `localhost:8080` (evita CORS en desarrollo)

### Páginas
| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/login` | Login.jsx | Público |
| `/register` | Register.jsx | Público |
| `/clientes` | Clientes.jsx | Privado |
| `/creditos` | Creditos.jsx | Privado |
| `/cobranzas` | Cobranzas.jsx | Privado |

---

## Cómo correr el proyecto

### Backend
```bash
cd backend
mvn spring-boot:run
# Corre en http://localhost:8080
# Consola H2: http://localhost:8080/h2-console
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

## Módulo 2 — Autorización de Límite de Crédito

Este módulo centraliza la lógica de negocio para la autorización de límites de crédito mediante una API REST en Spring Boot. Su objetivo es gestionar el ciclo de vida de las solicitudes de aumento: desde la recepción de la petición por parte de un cliente, hasta su listado, evaluación (aprobación/rechazo) y actualización del límite de crédito disponible.

### DTOs del Módulo

**SolicitudAumentoRequest**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dniCliente | String | DNI del cliente que solicita el aumento |
| montoSolicitado | BigDecimal | Nuevo límite deseado |

**SolicitudAumentoResponse**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long | Identificador de la solicitud |
| dniCliente | String | DNI del cliente |
| montoSolicitado | BigDecimal | Monto solicitado |
| estado | String | Estado actual (PENDIENTE, APROBADO, RECHAZADO) |
| fechaSolicitud | LocalDate | Fecha de creación |

### Distribución de Tareas

| Integrante | Tarea Principal | Descripción |
|------------|----------------|-------------|
| Nahuel D'Angelo | Persistencia y Modelos | Entidad `SolicitudAumento`, Enumerados (`EstadoSolicitudCredito`) y Repositorios JPA |
| Manuel Herrera | Lógica Core de Crédito | Validaciones y reglas de negocio para aprobación de límites según historial |
| Santiago Morganti | Servicio de Solicitudes (I) | Lógica de `crearSolicitud()`, `obtenerPendientes()` y mapeo a Responses |
| Santiago Lordi | Servicio de Solicitudes (II) | Algoritmos de operadores: `aprobarSolicitud()`, `rechazarSolicitud()` y búsqueda por ID |
| Gianfranco Lippi | Endpoints y REST API | Controller `SolicitudAumentoController` y exposición de rutas |
| Juan Ignacio Arce | API y Documentación | Patrón de DTOs (`SolicitudAumentoRequest` / `Response`) y documentación |

---

## Entrega 3 — Gestor de Permisos, Anulación y Redux

### Roles de usuario

| Rol | Acceso |
|-----|--------|
| `USER` | Puede crear solicitudes de aumento, ver créditos, cobranzas y clientes por DNI |
| `ADMIN` | Puede crear clientes, gestionar permisos de usuarios, anular créditos y cobranzas, aprobar/rechazar solicitudes |

> Los clientes solo pueden ser creados por un usuario con rol `ADMIN` mediante `POST /api/clientes`.
> Una vez creado, cualquier usuario autenticado puede referenciarlo al crear una solicitud de aumento.

### Ingreso como ADMIN

Al iniciar la aplicación por primera vez, se crea automáticamente un usuario administrador por defecto:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

Con este usuario podés acceder a la gestión de permisos (`/admin/permisos`), crear clientes, anular créditos/cobranzas y aprobar/rechazar solicitudes de aumento.

### Gestor de Permisos

El administrador puede habilitar o denegar la capacidad de anular créditos y cobranzas para cada usuario.

**Modelo — Usuario**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `puedeAnularCredito` | Boolean (default: false) | Permiso para anular créditos |
| `puedeAnularCobranza` | Boolean (default: false) | Permiso para anular cobranzas |

**Endpoints**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/usuarios` | Listar todos los usuarios (ADMIN) |
| PUT | `/api/admin/usuarios/{id}/permisos` | Actualizar permisos de un usuario (ADMIN) |

**Frontend**
- Ruta `/admin/permisos` — solo accesible para usuarios con rol `ADMIN`
- Muestra todos los usuarios con rol `USER` y permite togglear sus permisos
- Slice Redux: `permisosSlice.js` con thunks `fetchUsuarios` y `updatePermisos`

### Anulación de Créditos y Cobranzas

**Reglas de negocio**
- Un crédito/cobranza ya anulado no puede volver a anularse (arroja `BusinessException`)
- Solo usuarios con permiso `puedeAnularCredito` o rol `ADMIN` ven el botón **Anular** en créditos
- Solo usuarios con permiso `puedeAnularCobranza` o rol `ADMIN` ven el botón **Anular** en cobranzas

**Endpoints**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| DELETE | `/api/creditos/{id}` | Anular un crédito (marca `anulado = true`) |
| DELETE | `/api/cobranzas/{id}` | Anular una cobranza (marca `anulada = true`) |

**Frontend — botones condicionales**
- `Creditos.jsx`: el botón **Anular** solo se renderiza si `user.puedeAnularCredito === true \|\| user.rol === 'ADMIN'` y el crédito no está anulado
- `Cobranzas.jsx`: el botón **Anular** solo se renderiza si `user.puedeAnularCobranza === true \|\| user.rol === 'ADMIN'` y la cobranza no está anulada
- Ambos muestran un `ConfirmDialog` antes de confirmar la operación

### Redux — slices y thunks

| Slice | Thunks | Estado |
|-------|--------|--------|
| `creditosSlice` | `fetchCreditosPorCliente`, `addCredito`, `anularCreditoThunk` | `lista`, `loading`, `error` |
| `cobranzasSlice` | `fetchCobranzasPorCredito`, `addCobranza`, `anularCobranzaThunk` | `lista`, `loading`, `error` |
| `permisosSlice` | `fetchUsuarios`, `updatePermisos` | `usuarios`, `loading`, `error` |

### Seguridad — @EnableMethodSecurity

La clase `SecurityConfig` utiliza `@EnableMethodSecurity`, lo que permite proteger endpoints con anotaciones como `@PreAuthorize("hasRole('ADMIN')")` a nivel de método.

### Frontend — nuevas rutas

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/admin/permisos` | `GestorPermisos.jsx` | Solo ADMIN |
| `/solicitudes` | `SolicitudesAumento.jsx` | Privado |

---

## Temas de la materia cubiertos

| Unidad | Tema | Implementado en |
|--------|------|----------------|
| I | Spring Boot, arquitectura, estructura de proyectos | Toda la capa backend |
| II | Hibernate/JPA, entidades, repositorios | `model/`, `repository/` |
| II | Seguridad con JWT | `security/`, `config/SecurityConfig` |
| III | React + Vite, componentes, props | `pages/`, `components/` |
| III | React Hooks (`useState`, `useEffect`) | Todas las páginas |
| III | React Router | `App.jsx`, `PrivateRoute` |
| IV | Fetch, consumo de API | `api/` |
| IV | Renderizado condicional | Estados de carga y error en cada página |
| V | Redux I y II: acciones, reducers, store, thunks | `store/slices/`, `store/index.js` |
