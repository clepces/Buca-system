# 📋 Índice Maestro de Optimización y Refactorización (BUCA System v5.2.0)

**Documento:** Plan Estratégico de Calidad, Rendimiento e Interfaces  
**Clasificación:** Hoja de Ruta de Ingeniería (Architecture, UI/UX/IxD & Code Quality)  
**Versión:** 1.0.0  
**Fecha:** Octubre 2026  

---

## FASE 1: BUGS CRÍTICOS, ERRORES DE EJECUCIÓN Y ADVERTENCIAS (Prioridad Inmediata)

### 1.1. Manejo de Rutas y Vistas Huérfanas del Dock
- [ ] **1.1.1.** Crear vistas placeholder o páginas funcionales para los enlaces del Dock: `/clients`, `/providers`, `/inventory`, `/pos`, `/users`, `/roles`, `/teams` (actualmente retornan 404).
- [ ] **1.1.2.** Unificar el enrutador comodín (`*`) para que renderice de forma segura sin romper el contenedor principal.

### 1.2. Intercepción y Multi-Despacho de Eventos Clic
- [ ] **1.2.1.** Eliminar la triple captura de clics entre `Kernel`, `TopBar` y `DockableNavbar`.
- [ ] **1.2.2.** Implementar un único despachador delegado (`CentralActionDispatcher`) con `event.stopPropagation()` para acciones `[data-action]`.

### 1.3. Driver de Persistencia en `StorageAdapter.js`
- [ ] **1.3.1.** Corregir `StorageAdapter.init(tier)` para permitir el cambio dinámico entre `LocalDriver` (L0/L1) e `IndexedDBDriver` (L2/L3) si el hardware calibra en un nivel superior.

### 1.4. Supresión de Advertencias en Consola y Accesibilidad (WCAG AA)
- [ ] **1.4.1.** Añadir atributos `autocomplete` (`email`, `current-password`, `one-time-code`) en `LoginForm.js` y `PINForm.js`.
- [ ] **1.4.2.** Agregar etiquetas accesibles `aria-label` a los 6 campos individuales de entrada del PIN.
- [ ] **1.4.3.** Corregir atributos faltantes `id`/`name` señalados en las auditorías de DevTools.

---

## FASE 2: UI (User Interface) Y CORRECCIÓN DE INTERFAZ MAL VISUALIZADA

### 2.1. Estandarización de Tokens y Eliminación de Colores Hardcoded
- [ ] **2.1.1.** Auditar y eliminar valores hexadecimales fijos (`#2563eb`, `#0f172a`, `#64748b`, etc.) en componentes SCSS, sustituyéndolos por variables centralizadas (`--buca-blue`, `--surface-solid`, etc.) según la norma `BNE-RULE-001`.
- [ ] **2.1.2.** Verificar variantes visuales bajo el atributo `[data-buca-perf="L0"]` para garantizar fondos sólidos opacos sin desenfoques en GPU Eco.

### 2.2. Consistencia Visual y Sistema de Iconografía
- [ ] **2.2.1.** Migrar iconos dispersos de `bootstrap-icons` a vectores SVG inline o biblioteca unificada Lucide para reducir el bundle CSS de 426 kB.
- [ ] **2.2.2.** Normalizar tamaños de iconos, paddings y espaciados en botones de acción rápida.

### 2.3. Corrección de Solapamientos y Z-Index de Modales
- [ ] **2.3.1.** Estandarizar la escala de capas `z-index` (Dropdowns: 1000, Header: 1050, Dock: 1100, Overlays: 1200, Modales: 1300, Preloader: 99999).
- [ ] **2.3.2.** Corregir colisión visual entre `EmulatorModal` y `ModalBase`.

### 2.4. Ajustes Responsivos (Mobile First)
- [ ] **2.4.1.** Ajustar el carrusel de negocios (`BusinessHub`) en pantallas menores a 480px para evitar desbordamientos sin degradar el scroll táctil.
- [ ] **2.4.2.** Optimizar el corte curvo del `Dock` en pantallas móviles estrechas.

---

## FASE 3: UX (User Experience) E IxD (Interaction Design)

### 3.1. Feedback Visual y Manejo de Estados de Carga
- [ ] **3.1.1.** Bloquear y deshabilitar botones durante peticiones asíncronas para evitar dobles envíos.
- [ ] **3.1.2.** Sustituir mensajes de error técnicos (`auth/network-request-failed`) por toasts o alertas semánticas corporativas.

### 3.2. Micro-interacciones y Animaciones Fluidas (60+ FPS)
- [ ] **3.2.1.** Añadir transiciones con aceleración por GPU (`transform`, `opacity`) en el carrusel y las píldoras de navegación.
- [ ] **3.2.2.** Suavizar la animación de salida del preloader global (`#global-preloader`).
- [ ] **3.2.3.** Implementar soporte táctil por gestos (swipe) en el carrusel de negocios para tablets y móviles.

### 3.3. Control de Navegación por Teclado
- [ ] **3.3.1.** Habilitar cierre de modales con tecla `Escape`.
- [ ] **3.3.2.** Trampa de foco accesible (Focus Trap) al abrir diálogos modales.
- [ ] **3.3.3.** Atajo global `Ctrl + K` funcional para desplegar el buscador neural del workspace.

---

## FASE 4: FUGAS DE MEMORIA Y OPTIMIZACIÓN DE RECURSOS

### 4.1. Limpieza de Temporizadores e Intervalos Huérfanos
- [ ] **4.1.1.** Ajustar la frecuencia del timer de telemetría en `GraphicsEngine` (reducir de 300ms a 1000ms o suspender cuando la pestaña esté inactiva/oculta).
- [ ] **4.1.2.** Destruir intervalos al desmontar el modal de rendimiento (`PerformanceModal`).

### 4.2. Desacoplamiento de Observadores (DOM Observers Lifecycle)
- [ ] **4.2.1.** Implementar método `unmount()` o desconexión formal de `MutationObserver` e `IntersectionObserver` al navegar fuera del Workspace.
- [ ] **4.2.2.** Evitar recálculos de layout forzados (`offsetWidth`, `getComputedStyle`) en bucles continuos.

### 4.3. Control de Asincronía con `AbortController`
- [ ] **4.3.1.** Implementar `AbortController` en peticiones a Firebase y servicios externos para cancelar tareas pendientes si el usuario cambia de ruta antes de completarse.

---

## FASE 5: DEUDA TÉCNICA, CÓDIGO MUERTO Y PURGA DE GLOBALES

### 5.1. Eliminación de Variables Globales en `window`
- [ ] **5.1.1.** Eliminar dependencias globales prohibidas por la regla de arquitectura: `window.Workspace`, `window.scrollCarousel`, `window.enterBusiness`, `window.toggleWorkspaceSearch`.
- [ ] **5.1.2.** Migrar todos los eventos inline `onclick="..."` a delegación nativa mediante atributos de datos `data-action`.

### 5.2. Purga de Archivos Zombis y Deprecados
- [ ] **5.2.1.** Eliminar archivos muertos: `src/shared/ui/components/navigation/NewsTicker/` (marcado como obsoleto).
- [ ] **5.2.2.** Unificar duplicados: `src/shared/pages/Error404.js` vs `src/shared/ui/pages/Error404.js`.
- [ ] **5.2.3.** Limpiar estilos no referenciados en `_buca-bootstrap.scss` (ej. clase `.buca-card` redundante).

### 5.3. Alineación Estructural con la Biblia de Arquitectura
- [ ] **5.3.1.** Reubicar almacén de estado reactivo a `src/shared/state/` según especificación de `buca-modular-v1.txt`.
- [ ] **5.3.2.** Optimizar el empaquetado de Vite dividiendo el bundle principal (`index.js` > 750 kB) en chunks dinámicos mediante `manualChunks`.
