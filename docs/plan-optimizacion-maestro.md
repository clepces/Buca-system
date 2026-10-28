# 📋 Índice Maestro de Optimización y Refactorización (BUCA System v5.2.0)

**Documento:** Plan Estratégico de Calidad, Rendimiento e Interfaces  
**Clasificación:** Hoja de Ruta de Ingeniería (Architecture, UI/UX/IxD & Code Quality)  
**Versión:** 1.0.0 (Completado)  
**Fecha:** Octubre 2026  

---

## FASE 1: BUGS CRÍTICOS, ERRORES DE EJECUCIÓN Y ADVERTENCIAS (Completada - v0.2.0-alpha)

### 1.1. Manejo de Rutas y Vistas Huérfanas del Dock
- [x] **1.1.1.** Crear vistas placeholder o páginas funcionales para los enlaces del Dock: `/clients`, `/providers`, `/inventory`, `/pos`, `/users`, `/roles`, `/teams`.
- [x] **1.1.2.** Unificar el enrutador comodín (`*`) para que renderice de forma segura sin romper el contenedor principal.

### 1.2. Intercepción y Multi-Despacho de Eventos Clic
- [x] **1.2.1.** Eliminar la triple captura de clics entre `Kernel`, `TopBar` y `DockableNavbar`.
- [x] **1.2.2.** Implementar un único despachador delegado con control de captura para acciones `[data-action]`.

### 1.3. Driver de Persistencia en `StorageAdapter.js`
- [x] **1.3.1.** Corregir `StorageAdapter.init(tier)` para conmutar dinámicamente entre `LocalDriver` (L0/L1) e `IndexedDBDriver` (L2/L3) según la calibración de hardware.

### 1.4. Supresión de Advertencias en Consola y Accesibilidad (WCAG AA)
- [x] **1.4.1.** Añadir atributos `autocomplete` (`email`, `current-password`, `one-time-code`) en `LoginForm.js` y `PINForm.js`.
- [x] **1.4.2.** Agregar etiquetas accesibles `aria-label` a los campos de entrada del PIN.
- [x] **1.4.3.** Corregir atributos faltantes `id`/`name` señalados en las auditorías de DevTools.

---

## FASE 2: UI (User Interface) Y CORRECCIÓN DE INTERFAZ MAL VISUALIZADA (Completada - v0.3.0-alpha)

### 2.1. Estandarización de Tokens y Eliminación de Colores Hardcoded
- [x] **2.1.1.** Auditar y sustituir valores fijos por tokens de diseño centralizados (`--buca-blue`, `--surface-solid`, `var(--blur-intensity)`) bajo la norma `BNE-RULE-001`.
- [x] **2.1.2.** Condicionar desenfoques pesados al perfil de hardware activo `[data-buca-perf]`, deshabilitándolos en L0 (Eco).

### 2.2. Consistencia Visual y Sistema de Iconografía
- [x] **2.2.1.** Corregir peticiones rotas (404 a simpleicons) sustituyéndolas por vectores e iconos nativos.
- [x] **2.2.2.** Normalizar tamaños de iconos, paddings y espaciados en botones de acción rápida.

### 2.3. Corrección de Solapamientos y Z-Index de Modales
- [x] **2.3.1.** Estandarizar la escala de capas `z-index` (Dropdowns: 1000, Header: 100, Dock: 1000, Overlays: 1800, Modales: 3000-3100).
- [x] **2.3.2.** Corregir colisión visual entre `EmulatorModal` y modales estándar.

### 2.4. Ajustes Responsivos (Mobile First)
- [x] **2.4.1.** Ajustar el carrusel de negocios (`BusinessHub`) en móviles <= 576px eliminando márgenes negativos y compactando tarjetas.
- [x] **2.4.2.** Ocultar HUDs flotantes y compactar el wrapper del Dock en dispositivos estrechos.

---

## FASE 3: UX (User Experience) E IxD (Interaction Design) (Completada - v0.4.0-alpha)

### 3.1. Feedback Visual y Manejo de Estados de Carga
- [x] **3.1.1.** Sustituir navegación forzada con recarga (`window.location.href`) por transiciones SPA fluidas con el Router.
- [x] **3.1.2.** Sustituir mensajes de error técnicos por alertas semánticas corporativas en formularios de autenticación.

### 3.2. Micro-interacciones y Animaciones Fluidas (60+ FPS)
- [x] **3.2.1.** Implementar soporte táctil por gestos (`touchstart`, `touchmove`, `touchend`) con detección de arrastre en el carrusel de negocios.
- [x] **3.2.2.** Suavizar la animación y aceleración por GPU en el visor de métricas.

### 3.3. Control de Navegación por Teclado
- [x] **3.3.1.** Habilitar cierre global de modales y overlays con la tecla `Escape`.
- [x] **3.3.2.** Atajo global `Ctrl + K` / `Cmd + K` para abrir el buscador neural del Workspace.

---

## FASE 4: FUGAS DE MEMORIA Y OPTIMIZACIÓN DE RECURSOS (Completada - v0.5.1-alpha)

### 4.1. Limpieza de Temporizadores e Intervalos Huérfanos
- [x] **4.1.1.** Reducir la frecuencia del timer de telemetría de `GraphicsEngine` de 300ms a 1000ms y pausar cuando `document.hidden`.
- [x] **4.1.2.** Destruir intervalos, timeouts y cancelar `requestAnimationFrame` en `FPSMonitor`, `GhostSanitizer` y `PerformanceModal`.

### 4.2. Desacoplamiento de Observadores (DOM Observers Lifecycle)
- [x] **4.2.1.** Implementar `unobserveRemovedNodes()` en `GraphicsEngine` para podar nodos huérfanos del `Set` y del `IntersectionObserver`.
- [x] **4.2.2.** Añadir ciclo de vida `unmount()` / `destroy()` en el router para vistas anteriores antes de montar nuevas rutas.

### 4.3. Control de Asincronía con `AbortController`
- [x] **4.3.1.** Implementar `AbortController` y timeouts de seguridad en `BaseClient` y `http.js` para cancelar peticiones pendientes ante cambios de ruta.

---

## FASE 5: DEUDA TÉCNICA, CÓDIGO MUERTO Y PURGA DE GLOBALES (Completada - v1.0.0-rc1)

### 5.1. Eliminación de Variables Globales en `window`
- [x] **5.1.1.** Migrar eventos inline `onclick="..."` en plantillas a delegación nativa con atributos de datos `data-action` y `eventBus`.
- [x] **5.1.2.** Preservar compatibilidad hacia atrás en UI Bridge mediante eventos desacoplados.

### 5.2. Purga de Archivos Zombis y Deprecados
- [x] **5.2.1.** Eliminar archivos muertos: `src/shared/ui/components/navigation/NewsTicker/`.
- [x] **5.2.2.** Eliminar el duplicado `src/shared/ui/pages/Error404.js` y consolidar en `src/shared/pages/Error404.js`.
- [x] **5.2.3.** Limpiar estilos SCSS redundantes en `_buca-bootstrap.scss`.

### 5.3. Alineación Estructural con la Biblia de Arquitectura
- [x] **5.3.1.** Establecer punto de acceso centralizado `src/shared/state/index.js` según estándar de arquitectura.
- [x] **5.3.2.** Optimizar el empaquetado de Vite dividiendo el bundle principal en chunks dinámicos (`manualChunks`), reduciendo `index.js` de 758 kB a 122 kB (84% menos peso).
