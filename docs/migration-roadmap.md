# Hoja de Ruta de Desarrollo, Migración y Producción (B.U.C.A. AI)

> **Documento:** Plan Estratégico de Hitos de Ingeniería, Estabilización y Despliegue  
> **Versión:** 1.0.0  
> **Estado:** Fase Alpha/RC Completada — Preparación para Google AI Studio y Firebase Live

---

## 1. Historial de Hitos Completados (Estabilización del Core)

```
 [HITO 0] Diagnóstico y Estabilización de Compilación Vite 8 (Completado)
   ├── Resolución de dependencias Sass-Embedded y PostCSS.
   ├── Corrección de retorno en CryptoWrapper y ciclo de sesión.
   └── Creación de los 5 informes diagnósticos maestros.

 [HITO 1] Enrutamiento SPA y Accesibilidad WCAG (Completado - v0.2.0-alpha)
   ├── Vistas procedurales para rutas huérfanas (/clients, /inventory, /pos, etc.).
   ├── Conmutación dinámica de StorageAdapter entre LocalStorage e IndexedDB.
   └── Atributos autocomplete y aria-label en formularios de autenticación.

 [HITO 2] UI & Estandarización de Tokens Gráficos (Completado - v0.3.0-alpha)
   ├── Normalización de escala z-index (Header: 100, Dock: 1000, Modales: 3000-3100).
   ├── Condicionamiento de desenfoques según perfil [data-buca-perf="L0"].
   └── Corrección de iconos rotos por vectores SVG nativos.

 [HITO 3] UX, IxD y Navegación por Teclado (Completado - v0.4.0-alpha)
   ├── Gestos táctiles pasivos (swipe) en el carrusel de negocios.
   ├── Atajo global de búsqueda rápida (Ctrl + K / Cmd + K).
   └── Cierre accesible de cualquier diálogo activo con la tecla Escape.

 [HITO 4] Fugas de Memoria y Ciclos de Desmontaje (Completado - v0.5.1-alpha)
   ├── Cancelación de rAF y timers huérfanos en FPSMonitor y GhostSanitizer.
   ├── Desconexión de nodos huérfanos del DOM en GraphicsEngine.
   └── Soporte de AbortController en clientes HTTP para transiciones de ruta.

 [HITO 5] Deuda Técnica, Purga y Code-Splitting (Completado - v1.0.0-rc1)
   ├── Eliminación de archivos obsoletos (NewsTicker y Error404 duplicado).
   ├── Migración de eventos inline a delegación nativa con data-action.
   ├── Creación del punto central de estado reactivo en src/shared/state/index.js.
   └── Optimización de chunks en Vite: bundle index.js reducido de 758 kB a 122 kB (-84%).
```

---

## 2. Próximos Hitos Estratégicos

### HITO 6: Integración Oficial con Google AI Studio y Firebase Live
* **Objetivo:** Importar el repositorio a Google AI Studio y conectar con un proyecto real de Firebase Firestore sin alterar la arquitectura Vanilla JS (sin frameworks).
* **Tareas Clave:**
  - [ ] **6.1.** Cargar credenciales reales de Firebase en `.env.local` y validar arranque en producción.
  - [ ] **6.2.** Desplegar reglas de seguridad canónicas en `firestore.rules` validadas por roles (`super_admin`, `admin`, `owner`, `worker`).
  - [ ] **6.3.** Conectar servicio de EmailJS para despacho real de desafíos 2FA en dispositivos no registrados.
  - [ ] **6.4.** Aplicar el ajuste de escala visual documentado en `interface.md` (reducir proporciones excesivas en tarjetas de negocio, telemetría y modales para ganar densidad ERP).
  - [ ] **6.5.** Promover `src/core/eventBus/index-v2.js` como el despachador oficial del sistema tras ejecutar batería de pruebas de integración.

---

### HITO 7: Implementación de Módulos Operativos de Negocio
* **Objetivo:** Pasar de las vistas placeholder actuales a interfaces operativas de alta densidad de datos.
* **Módulos a Desarrollar:**
  - [ ] **7.1. Módulo de Inventario (`/inventory`):**
    - Catálogo de productos con soporte para código de barras y SKU.
    - Valoración de inventario bajo el método PEPS / FIFO.
    - Alertas de stock crítico vinculadas al HUD de notificaciones.
  - [ ] **7.2. Módulo de Punto de Venta (`/pos`):**
    - Terminal de venta rápida bi-monetaria (conversión automática USD / Bolívares).
    - Apertura y arqueo ciego de caja (`cash_shifts`).
    - Desglose de pagos combinados (Efectivo, Pago Móvil, Punto de Venta, USDT).
  - [ ] **7.3. Módulo de Personal y Equipos (`/users` y `/teams`):**
    - Panel de invitación de colaboradores (modo Worker).
    - Asignación granular de permisos por puesto de trabajo.
    - Control de horarios y turnos de atención.

---

### HITO 8: Certificación PWA y Modo Offline Completo
* **Objetivo:** Permitir que los comercios continúen facturando en el mostrador aun ante caídas del suministro eléctrico o de conectividad a internet.
* **Tareas Clave:**
  - [ ] **8.1.** Configurar Service Worker nativo (`sw.js`) con estrategia Cache-First para el App Shell y Network-First con fallback a IndexedDB para el catálogo de productos.
  - [ ] **8.2.** Cola de transacciones offline (Offline Sync): las ventas efectuadas sin conexión se encolan en IndexedDB cifradas y se sincronizan atómicamente con Firestore en cuanto retorne la red.
  - [ ] **8.3.** Instalabilidad PWA (manifest.json, iconos corporativos y modo standalone para terminales Android y Windows).
