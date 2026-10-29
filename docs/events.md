Bus de Eventos y Ciclo Reactivo: Lista de canales de eventos (Pub/Sub), qué componente publica cada evento y cuál se suscribe a él para evitar código espagueti.



```

---

### 6. `docs/events.md` (Bus Central de Eventos Pub/Sub)

```markdown
# Bus Central de Eventos y Ciclo Reactivo

## 1. Principio de Gobernanza
Ningún componente invoca directamente métodos de otro componente. Toda comunicación entre controles visuales y módulos de datos se realiza a través de `NexusEventBus`.

---

## 2. Catálogo de Canales de Eventos

| Canal | Emisor | Payload | Descripción |
| :--- | :--- | :--- | :--- |
| `search:input` | Buscador UI | `{ query: string }` | Disparado al filtrar en tiempo real. |
| `search:cleared` | Buscador UI | `{}` | Disparado al vaciar el input para restaurar datos. |
| `data:updated` | Formulario | `{ id: string, data: object }` | Notifica que un registro cambió. |

```