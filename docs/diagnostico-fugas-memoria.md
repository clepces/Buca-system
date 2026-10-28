# 💾 Informe de Diagnóstico: Fugas de Memoria y Consumo de Recursos

**Proyecto:** BUCA SYSTEM  
**Versión de Plataforma:** v5.2.0 (Alpha / Modular)  
**Fecha de Diagnóstico:** Octubre 2026  
**Clasificación:** Auditoría de Performance y Ciclo de Vida de Objetos  

---

## 1. Resumen Ejecutivo de Fugas de Memoria
El análisis estático y dinámico del código reveló varios patrones propensos a retención indefinida de memoria (memory leaks), generación excesiva de recolección de basura (Garbage Collection thrashing) y timers/observadores que permanecen activos tras destruirse los componentes del DOM.

---

## 2. Inventario de Fugas y Puntos de Presión de Memoria

### 2.1. Alojamientos en Cada Frame en `FPSMonitor.js`
* **Severidad:** Media / Presión de Garbage Collection
* **Ubicación:** `src/core/engine/monitors/FPSMonitor.js:14, 23, 46`
* **Mecanismo del Fallo:**
  En cada llamada recursiva de animación, el monitor ejecutaba:
  ```javascript
  requestAnimationFrame(this.check.bind(this));
  ```
  El uso de `.bind(this)` dentro del bucle de 60 FPS creaba 60 funciones clausuradas nuevas por segundo. En sesiones prolongadas de uso en dispositivos con 4GB o menos de RAM, esto provocaba pausas periódicas de micro-congelamiento por el recolector de basura del motor V8.
* **Solución Aplicada:**
  Se vinculó la función una única vez en el constructor (`this._boundCheck = this.check.bind(this);`) y se reutilizó la misma referencia inmutable en todo el ciclo de animación.

---

### 2.2. Acumulación Descontrolada de Escuchas Globales (`document.addEventListener`)
* **Severidad:** Alta
* **Ubicaciones:**
  * `src/shared/ui/layouts/components/TopBar.js:45`
  * `src/shared/ui/layouts/components/DockableNavbar.js:55`
  * `src/core/kernel.js:272`
* **Mecanismo del Fallo:**
  Cada vez que el usuario navegaba entre rutas o se reconstruía el layout, los métodos `init()` de los componentes de navegación volvían a invocar `_bindEvents()`. Como estos escuchas se colgaban directamente del objeto global `document` sin verificar si ya existían o sin invocar `removeEventListener()`, los manejadores de eventos se multiplicaban exponencialmente.
  * *Efecto colateral:* Al hacer clic en un elemento del dock o topbar, el evento se despachaba múltiples veces simultáneamente (hasta 3-4 emisiones idénticas al EventBus).
* **Solución Aplicada:**
  Se introdujeron banderas de control de idempotencia (`_eventsBound`) en los módulos y se verificó la existencia previa de los componentes antes de volver a adjuntar escuchas en el árbol DOM.

---

### 2.3. Desconexión Incompleta en Observadores de DOM y Presión
* **Severidad:** Media
* **Ubicaciones:**
  * `src/core/engine/graphics.js:96` (`MutationObserver` en `document.body`)
  * `src/core/engine/graphics.js:82` (`IntersectionObserver` de assets)
  * `src/core/engine/monitors/ThermalGuard.js:24` (`ComputePressureObserver`)
* **Mecanismo del Fallo:**
  El motor gráfico instanciaba `MutationObserver` y `IntersectionObserver` de alcance global sobre todo el cuerpo del documento. Aunque existía un método `destroy()` en `GraphicsEngine`, el ciclo de vida del Kernel nunca invocaba dicha limpieza al cambiar de contexto o reiniciar la aplicación, manteniendo referencias vivas a nodos DOM huérfanos.
* **Recomendación / Estado:**
  Garantizar que los componentes que registran observadores implementen una interfaz unificada de desmontaje (`unmount` / `dispose`).

---

### 2.4. Telemetría Periódica de Alta Frecuencia (`setInterval` a 300ms)
* **Severidad:** Media
* **Ubicación:** `src/core/engine/graphics.js:175-190`
* **Mecanismo del Fallo:**
  Se ejecutaba un `setInterval` cada 300ms llamando a `getCurrentStats()` y `uiState.updateGraphics(...)`. Dentro de `getCurrentStats()`, se realizaban lecturas de `document.querySelectorAll('*').length`. Aunque se implementó un caché de 5 segundos para el conteo de nodos, el timer de 300ms continuaba despertando la CPU en segundo plano, afectando el consumo de batería y la autonomía térmica en hardware Eco.
