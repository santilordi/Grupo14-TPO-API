# Grupo 14 - TPO: Autorización de Límite de Crédito 💳

1. ## Descripción del Módulo

*Módulo seleccionado: Autorización de Límite de Crédito 2️*

Este módulo centraliza la lógica de negocio para la *Autorización de Límites de Crédito* mediante una API REST en Spring Boot. Su objetivo es gestionar el ciclo de vida de las solicitudes de aumento: desde la recepción de la petición por parte de un cliente, hasta su listado, evaluación (aprobación/rechazo) y actualización del límite de crédito disponible.

La aplicación implementa persistencia de datos relacional (JPA / H2), transferencia segura mediante patrones DTO y la estructura requerida para la *Entrega 1* del Trabajo Práctico Obligatorio.

2. ## Modelo de Datos

*Cliente*
| Campo | Tipo | Descripción |
|-------|------|-------------|
| dni   | String (PK) | DNI del cliente |
| nombre| String      | Nombre completo |
| limiteCredito | BigDecimal | Límite actual autorizado |

*SolicitudAumento*
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id    | Long (PK, auto) | Identificador de la solicitud |
| cliente | FK -> Cliente | Cliente que solicita el aumento |
| montoSolicitado | BigDecimal | Monto de límite de crédito deseado |
| estado | Enum | PENDIENTE, APROBADA o RECHAZADA |

*SolicitudAumentoRequest (DTO)*
| Campo | Tipo | Descripción |
|-------|------|-------------|
| clienteId | String / Long | ID del cliente que hace la petición |
| montoSolicitado | BigDecimal | Nuevo límite deseado |

 *SolicitudAumentoResponse (DTO)*
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Long | Identificador de la solicitud |
| clienteId | String / Long | ID del cliente |
| estado | Enum | Estado actual de la solicitud |
| montoAutorizado | BigDecimal | Monto final autorizado (si aplica) |

3. ## Endpoints Implementados

- Solicitudes de Aumento (Core del Módulo)* `POST /api/solicitudes-aumento` - Crea una nueva solicitud de aumento para evaluar.
* `GET /api/solicitudes-aumento/pendientes` - Lista exclusiva de las solicitudes que esperan revisión del operador.
* `GET /api/solicitudes-aumento/{id}` - Consulta general de una solicitud puntual mediante el ID.
* `PUT /api/solicitudes-aumento/{id}/aprobar` - Logica de negocio: El operador evalúa positivamente y se actualiza el límite del cliente.
* `PUT /api/solicitudes-aumento/{id}/rechazar` - Lógica de negocio: El operador rechaza y cierra la solicitud.

4. ## Distribución de Tareas 

A continuación, se detalla la responsabilidad del trabajo en base al módulo elegido:

| Integrante | Tarea Principal | Descripción |
| Nahuel D'Angelo | Persistencia y Modelos | Entidad `SolicitudAumento`, Enumerados (`EstadoSolicitudCredito`) y Repositorios JPA. |
| Manuel Herrera| Lógica Core de Crédito | Implementación de las validaciones y reglas de negocio para la aprobación de límites según historial. |
| Santiago Morganti | Servicio de Solicitudes (I) | Lógica de `crearSolicitud()`, `obtenerPendientes()` y mappeo a Reponses. |
| Santiago Lordi | Servicio de Solicitudes (II) | Algoritmos de operadores: `aprobarSolicitud()`, `rechazarSolicitud()` y búsqueda por ID. |
| Gianfranco Lippi | Endpoints y REST API | Controller principal `SolicitudAumentoController` y exposición de las rutas (CRUD). |
| Juan Ignacio Arce | API y Documentación | Patrón de DTOs (`SolicitudAumentoRequest` / `Response`) y documentación de la Entrega 1 (README). |
