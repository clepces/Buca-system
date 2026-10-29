Contrato REST / Backend: Lista exhaustiva de endpoints, verbos HTTP (GET, POST), parámetros aceptados, formato del JSON de respuesta (Envelope estándar) y manejo de errores.
---

### 4. `docs/api.md` (Contrato API REST y Endpoints)

```markdown
# Especificación de API REST y Protocolos

## 1. Estándar de Respuestas JSON
Todas las respuestas HTTP deben implementar el sobre envelope canónico:

### Respuesta Exitosa (200 OK / 201 Created)
```json
{
  "success": true,
  "data": {},
  "meta": { "total": 100, "page": 1, "per_page": 20 },
  "uuid": "8b5f3a12-68bb-4e6f-9cc1-5a3d0f7b11a2",
  "timestamp": "2026-10-26T20:00:00Z"
}

```

### Respuesta de Error Cero Stack Traces (4xx / 5xx)

Queda estrictamente prohibido exponer rutas absolutas de servidor o trazas PHP.

```json
{
  "success": false,
  "error": "Mensaje genérico y seguro para el cliente.",
  "uuid": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "timestamp": "2026-10-26T20:00:00Z"
}

```

---

## 2. Catálogo de Endpoints

### `GET /api/v1/recurso`

* **Descripción:** Obtiene el listado del recurso con paginación.
* **Params Query:** `page` (int), `limit` (int), `query` (string).

### `POST /api/v1/recurso`

* **Descripción:** Crea un nuevo registro.
* **Body Payload:**
```json
{ "field_name": "value" }

```
