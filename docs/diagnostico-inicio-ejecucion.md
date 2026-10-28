# 🛠️ Informe de Diagnóstico: Inicio y Ejecución del Sistema

**Proyecto:** BUCA SYSTEM  
**Versión de Plataforma:** v5.2.0 (Alpha / Modular)  
**Fecha de Diagnóstico:** Octubre 2026  
**Clasificación:** Auditoría Técnica de Infraestructura y Build  

---

## 1. Resumen Ejecutivo de Errores de Inicio
Al intentar arrancar la aplicación (`npm run build` / `npm run dev`), el sistema fallaba de forma inmediata antes de poder servir cualquier archivo o renderizar en el navegador. Se identificaron dependencias críticas no instaladas en `package.json`, configuraciones rotas de preprocesadores de estilos (PostCSS y SASS) e inconsistencias en la resolución de módulos.

---

## 2. Inventario Detallado de Fallos Críticos de Inicio

### 2.1. Ausencia de Dependencias en `package.json`
* **Severidad:** Bloqueante (Fatal)
* **Descripción:** El archivo `package.json` únicamente declaraba `"vite": "^8.0.14"` en `devDependencies`. Sin embargo, el código fuente en `src/` importaba activamente múltiples librerías externas que no existían en el entorno:
  * `bootstrap` (importado en `src/shared/styles/_buca-bootstrap.scss:36`).
  * `bootstrap-icons` (importado en `src/main.js:8`).
  * `lucide` (importado en `src/core/kernel.js:19`).
  * `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/functions` (importados en `src/core/config/firebase.js` y `FirebaseProvider.js`).
  * `autoprefixer` (requerido por `postcss.config.js:3`).
* **Error de Consola:**
  ```text
  [plugin vite:css] Failed to load PostCSS config: Cannot find module 'autoprefixer'
  Error: [sass] Can't find stylesheet to import. @import "bootstrap/scss/bootstrap";
  ```

### 2.2. Incompatibilidad de Compilador SASS con Vite 8
* **Severidad:** Bloqueante (Fatal)
* **Descripción:** Vite v8 utiliza el compilador nativo ultrarrápido y requiere `sass-embedded` para procesar archivos `.scss` con alias de Rollup. Al intentar compilar `main.scss`, Vite emitía:
  ```text
  Error: Preprocessor dependency "sass-embedded" not found. Try `npm install -D sass-embedded`.
  ```

### 2.3. Fallo en Carga de Recurso Externo en AuthLayout
* **Severidad:** Menor / Fallo de Red (HTTP 404)
* **Ubicación:** `src/shared/ui/layouts/AuthLayout.js:26`
* **Descripción:** Se solicitaba el logo de Microsoft desde `https://cdn.simpleicons.org/microsoft/737373`, el cual devolvía un código de error HTTP 404, ensuciando la consola y violando la directiva de diseño (diseño L0 independiente de CDNs externas).

---

## 3. Acciones Correctivas Aplicadas Automáticamente

1. **Instalación y Persistencia de Paquetes Base:**
   * Se instalaron y vincularon en `package.json`: `bootstrap`, `bootstrap-icons`, `lucide`, `firebase`, `autoprefixer` y `sass-embedded`.
   * El bundle de producción (`npm run build`) compila ahora de manera exitosa en **6.03 segundos** sin advertencias bloqueantes.

2. **Reemplazo de Activo 404 por Icono Vectorial Local:**
   * En `src/shared/ui/layouts/AuthLayout.js`, se sustituyó la imagen externa por la clase vectorial inline `<i class="bi bi-microsoft"></i>`, eliminando la dependencia externa y acelerando el tiempo de pintura inicial (FCP).

3. **Verificación de Servidor Local:**
   * El servidor de desarrollo de Vite se encuentra operativo en el puerto asignado `http://localhost:3002/`, sirviendo los módulos dinámicos correctamente en tiempo real.
