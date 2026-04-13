# Grupo 14 - TPO: Autorización de Límite de Crédito 💳

## 1. Descripción del Módulo

**Módulo seleccionado: Autorización de Límite de Crédito 2️**

Este módulo expone diversos servicios REST a través de una arquitectura basada en **Spring Boot**. Su objetivo principal es permitir que los operadores gestionen e interactúen con información financiera de clientes, y específicamente, permitir la evaluación y autorización de aumentos de límites de crédito basados en el historial crediticio de cada usuario. 

La aplicación integra persistencia funcional (JPA / H2), manejo de excepciones, validaciones de los modelos de entrada (*Bean Validation*) y la estructura inicial requerida para la **Entrega 1** del TPO.

## 2. Modelo de Datos

A continuación, se detalla de forma simplificada el modelo de datos diseñado para cumplir con los requerimientos del módulo:

* **Cliente**: Entidad central que almacena los datos personales del cliente y su límite de crédito actual.
* **Prestamo**: Representa una solicitud de crédito otorgada. Se asocia a un Cliente y mantiene el registro del monto inicial, plazos (cuotas) y saldo.
* **Cuota**: Dependiente de un préstamo. Representa los pagos trazados que el cliente debe realizar, con su fecha de vencimiento y estado (PAGADA, PENDIENTE).
* **Cobranza**: Transacciones de abonos que impactan en las cuotas pendientes de un préstamo, formando la base para analizar el "historial del cliente".
* **SolicitudAumento**: Entidad clave del módulo. Registra cuando un cliente pide más límite. Posee campos como `montoSolicitado`, y un `estado` controlado por los enumerados (`PENDIENTE`, `APROBADA`, `RECHAZADA`).

> **Nota sobre Implementación de DTOs:**  
> Para la gestión de las solicitudes de aumento, implementamos el patrón **DTO** separando los datos persistidos de los que interactúan con la API REST.  
> - `SolicitudAumentoRequest`: Recibe los datos de entrada necesarios del cliente logrando un endpoint seguro.  
> - `SolicitudAumentoResponse`: Formatea la respuesta del servidor filtrando la información pertinente (estado, montos), ocultando la lógica interna.

## 3. Endpoints Implementados

Se han implementado operaciones CRUD y reglas de negocio conectando Repositorios y Servicios:

### 👤 Clientes
* `GET /api/clientes` - Lista todos los clientes registrados.
* `GET /api/clientes/{id}` - Obtiene toda la información de un cliente en específico.
* `POST /api/clientes` - Da de alta a un nuevo cliente.

### 💰 Solicitudes de Aumento (Core del Módulo)
* `POST /api/solicitudes-aumento` - Crea una nueva solicitud de aumento para evaluar.
* `GET /api/solicitudes-aumento/pendientes` - Lista exclusiva de las solicitudes que esperan revisión del operador.
* `GET /api/solicitudes-aumento/{id}` - Consulta general de una solicitud puntual mediante el ID.
* `PUT /api/solicitudes-aumento/{id}/aprobar` - Logica de negocio: El operador evalúa positivamente y se actualiza el límite del cliente.
* `PUT /api/solicitudes-aumento/{id}/rechazar` - Lógica de negocio: El operador rechaza y cierra la solicitud.

### 💸 Préstamos, Cuotas y Cobranzas
* `POST /api/prestamos` - Genera un préstamo nuevo y su plan de cuotas correspondiente.
* `GET /api/prestamos/cliente/{clienteId}` - Consultar historial de préstamos del cliente.
* `GET /api/prestamos/{id}/cuotas` - Devuelve el cronograma de cuotas asociado.
* `POST /api/cobranzas/pagar` - Permite registrar el impacto del pago de una cuota en el sistema.

---

## 4. Distribución de Tareas - Grupo 14

A continuación, se detalla la responsabilidad del trabajo en base al módulo elegido:

| Integrante | Tarea Principal | Descripción |
| :--- | :--- | :--- |
| **Nahuel D'Angelo** | Persistencia y Modelos | Entidad `SolicitudAumento`, Enumerados (`EstadoSolicitudCredito`) y Repositorios JPA. |
| **Manuel Herrera**| Lógica Core de Crédito | Implementación de las validaciones y reglas de negocio para la aprobación de límites según historial. |
| **Santiago Morganti** | Servicio de Solicitudes (I) | Lógica de `crearSolicitud()`, `obtenerPendientes()` y mappeo a Reponses. |
| **Santiago Lordi** | Servicio de Solicitudes (II) | Algoritmos de operadores: `aprobarSolicitud()`, `rechazarSolicitud()` y búsqueda por ID. |
| **Gian** | Endpoints y REST API | Controller principal `SolicitudAumentoController` y exposición de las rutas (CRUD). |
| **Juan Arce** | API y Documentación | Patrón de DTOs (`SolicitudAumentoRequest` / `Response`) y documentación de la Entrega 1 (README). |
