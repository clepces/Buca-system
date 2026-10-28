# 🌐 Informe de Diagnóstico: Problemas en el Árbol DOM y Renderizado

**Proyecto:** BUCA SYSTEM  
**Versión de Plataforma:** v5.2.0 (Alpha / Modular)  
**Fecha de Diagnóstico:** Octubre 2026  
**Clasificación:** Auditoría de Manipulación del DOM, Estilos y Accesibilidad  

---

## 1. Resumen Ejecutivo del DOM
Se evidenciaron fallos severos de montaje/desmontaje de contenedores principales (slots dinámicos), pérdida de elementos de interfaz tras transiciones de layout, limpiezas agresivas que destruían transiciones CSS de opacidad, y advertencias formales de accesibilidad HTML5.

---

## 2. Inventario de Problemas en el DOM Detectados

### 2.1. Pérdida y Bloqueo de Renderizado en Slots (`#topbar-slot` y `#dock-slot`)
* **Severidad:** Crítica (UI Rota)
* **Ubicaciones:**
  * `src/shared/ui/layouts/components/TopBar.js:20-37`
  * `src/shared/ui/layouts/components/DockableNavbar.js:39-48`
* **Mecanismo del Fallo:**
  * Al iniciar la aplicación en Auth, el contenedor raíz `#app` renderizaba `AuthLayout.render()`.
  * Los componentes `Header` y `Dock` guardaban internamente `this._initialized = true`.
  * Cuando el usuario se autenticaba y pasaba al Workspace, se ejecutaba `MainLayout.render()`, lo que creaba nuevos contenedores `#topbar-slot` y `#dock-slot` limpios y vacíos en el DOM.
  * El Kernel intentaba volver a inicializarlos llamando a `Header.init('topbar-slot')` y `Dock.init('dock-slot')`.
  * Debido a que `this._initialized` ya era verdadero, los métodos hacían un `return;` prematuro y **dejaban el TopBar y el Dock completamente en blanco**.
* **Solución Aplicada:**
  Se modificó la comprobación de inicialización: ahora se evalúa si el contenedor específico en el DOM actual ya contiene los elementos visuales (`container.querySelector('.app-header')`), permitiendo el remonte automático tras cambios de layout.

---

### 2.2. Destrucción de Transiciones CSS por `GhostSanitizer.js`
* **Severidad:** Alta
* **Ubicación:** `src/core/engine/safety/GhostSanitizer.js:28-36`
* **Mecanismo del Fallo:**
  El sanitizador buscaba cada 30 segundos todos los elementos con `[style*="opacity: 0"]`, ejecutaba `getComputedStyle(el)` forzando un recálculo de diseño (reflow thrashing) e inyectaba de forma forzosa `el.style.display = 'none'`.
  * *Efecto:* Modales con animación de desvanecimiento (fade-in), tooltips dinámicos o componentes en transición de entrada quedaban congelados o invisibles de forma irreversible.
* **Solución Aplicada:**
  Se limitó la purga exclusivamente a elementos con la clase explícita `.hidden` que no posean el atributo protector `[data-bne-ignore]`, respetando las animaciones fluidas del sistema.

---

### 2.3. Cascada de Reflows Inducida por `ReflowGuard.js`
* **Severidad:** Media
* **Ubicación:** `src/core/engine/safety/ReflowGuard.js:14-34`
* **Mecanismo del Fallo:**
  `ReflowGuard` observaba mutaciones de atributos en todo el subárbol de `document.body`. Cuando el conteo de mutaciones superaba el umbral, ordenaba al motor degradar el perfil (`this.engine.degrade()`). Al degradar el perfil, se modificaban atributos globales en `document.documentElement` (`data-buca-perf`, `data-buca-bloom`, etc.), disparando a su vez el mismo `MutationObserver` y generando ciclos redundantes.
* **Solución Aplicada:**
  Se implementó un intervalo de amortiguamiento (debounce / cooldown de 5 segundos) antes de permitir reevaluaciones automáticas de degradación.

---

### 2.4. Accesibilidad y Semántica de Formularios (HTML5 / WCAG)
* **Severidad:** Baja / Calidad de Código
* **Ubicaciones:**
  * `src/modules/auth/components/LoginForm.js`
  * `src/modules/auth/components/PINForm.js`
* **Detalles Observados por DevTools:**
  * Los campos de contraseña y correo no contaban con atributos de autocompletado (`autocomplete="email"`, `autocomplete="current-password"`).
  * Los 6 campos del PIN carecían de atributos `aria-label` o etiquetas explícitas asociadas.
* **Recomendación:**
  Completar los atributos `autocomplete` y `aria-*` en los formularios para cumplir con los estándares de accesibilidad WCAG AA estipulados en la constitución del proyecto.
