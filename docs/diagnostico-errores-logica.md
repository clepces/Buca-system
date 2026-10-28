# 🧠 Informe de Diagnóstico: Errores de Lógica y Flujo de Negocio

**Proyecto:** BUCA SYSTEM  
**Versión de Plataforma:** v5.2.0 (Alpha / Modular)  
**Fecha de Diagnóstico:** Octubre 2026  
**Clasificación:** Auditoría de Lógica de Software y Arquitectura  

---

## 1. Resumen Ejecutivo de Lógica
Se descubrieron anomalías estructurales severas en la lógica de persistencia del cliente, en el ciclo de vida del router SPA, en las transiciones de autenticación y en la gestión de sesiones. El error más grave provocaba la pérdida silenciosa de cualquier valor guardado en el almacenamiento local.

---

## 2. Inventario de Errores de Lógica Detectados

### 2.1. Cifrado sin Retorno en `CryptoWrapper.decrypt` (Pérdida Total de Persistencia)
* **Severidad:** Crítica (Grave)
* **Ubicación:** `src/core/security/CryptoWrapper.js:41-56`
* **Mecanismo del Fallo:**
  El método `decrypt` implementaba un descifrado XOR sobre Base64, acumulaba los caracteres descifrados en la variable local `let text = ''`, pero **omitía la sentencia `return text;`**.
* **Impacto en el Sistema:**
  * Toda llamada a `CryptoWrapper.decrypt(encoded)` retornaba invariablemente `undefined`.
  * Como consecuencia, `LocalDriver.get(key)` recibía `undefined`, fallaba en `JSON.parse(undefined)`, entraba en el bloque `catch` y retornaba `null`.
  * Las preferencias del usuario (`theme`), las configuraciones de rendimiento del motor (`buca_performance_config`) y las banderas de seguridad (`emulator_warning_accepted`) no podían ser recuperadas tras ser guardadas.
* **Solución Aplicada:**
  Se agregó `return text;` al final del bloque `try` en `CryptoWrapper.js`.

---

### 2.2. Error de Redirección hacia Ruta Inexistente (`/workspaces` vs `/workspace`)
* **Severidad:** Alta
* **Ubicaciones:**
  * `src/modules/auth/pages/LoginPage.js:163`
  * `src/core/kernel.js:310`
* **Mecanismo del Fallo:**
  Al completar el ciclo de login y el desafío de seguridad PIN, el temporizador ejecutaba `router.navigate('/workspaces')`. Sin embargo, en `src/modules/workspace/routes.js`, las rutas declaradas eran estrictamente `/` y `/workspace` (en singular).
* **Impacto en el Sistema:**
  El router disparaba un error 404 (Not Found) inmediatamente después de que el usuario introducía un PIN correcto, rompiendo el flujo de entrada al sistema.
* **Solución Aplicada:**
  * Se añadió formalmente la ruta alias `/workspaces` al mapa de rutas de `workspaceRoutes`.
  * Se configuró `LoginPage.js` para navegar de forma directa y canónica a `/workspace`.

---

### 2.3. Omisión de Actualización de Estado de Sesión tras Desafío PIN
* **Severidad:** Crítica
* **Ubicación:** `src/modules/auth/pages/LoginPage.js:159-168`
* **Mecanismo del Fallo:**
  Cuando la barra de progreso de "Sincronizando Identidad" llegaba al 100%, el código ejecutaba la navegación sin invocar `sessionState.set({ isAuthenticated: true, user: ... })`.
* **Impacto en el Sistema:**
  El guardia de rutas (`RouterGuards.requiresAuth()`) inspeccionaba `sessionState.get().isAuthenticated`, encontraba `false` y redirigía nuevamente al usuario a `/auth/login`, creando un bucle infinito que impedía entrar al Workspace.
* **Solución Aplicada:**
  Se integró la persistencia en `sessionState` con los datos del usuario verificado antes de ordenar la navegación a `/workspace`.

---

### 2.4. Condición de Carrera en Inicialización del Kernel (`router.init` vs `setupEventListeners`)
* **Severidad:** Alta
* **Ubicación:** `src/core/kernel.js:121-124`
* **Mecanismo del Fallo:**
  En `kernel.boot()`, se ejecutaba `router.init(routes)` antes de `this.setupEventListeners()`. Dado que la ruta raíz `/` requiere autenticación, `router.init` detectaba al usuario no autenticado y emitía el evento `router:before-change` para cambiar de layout a Auth. Como `setupEventListeners()` aún no se había ejecutado, el Kernel no escuchaba el evento y la sincronización visual fallaba.
* **Solución Aplicada:**
  Se invirtió el orden de ejecución: los eventos y el bus de escucha se registran con prioridad antes de activar el motor de enrutamiento SPA.

---

### 2.5. Ausencia de Fallback para Desarrollo Local sin Emuladores Firebase
* **Severidad:** Media / Experiencia de Desarrollo (DX)
* **Ubicación:** `src/modules/auth/services/AuthService.js:27-31`
* **Mecanismo del Fallo:**
  El SDK de Firebase intentaba conectarse al puerto `localhost:9099` de Auth. Si el desarrollador no tenía los emuladores de Java activos en segundo plano, la promesa de red fallaba con `auth/network-request-failed`, bloqueando el acceso incluso con las credenciales maestras de desarrollo (`123456`).
* **Solución Aplicada:**
  Se incorporó un fallback controlado en entorno `localhost` que permite avanzar al desafío PIN para perfiles de prueba y desarrollo local.
