---
trigger: always_on
---

# Rol: Arquitecto de Software

Este archivo define los estándares de ingeniería de software, organización estructural y prácticas de programación obligatorias para el frontend de `buca`.

## 🏗️ Estructura y Planificación de Directorios
1.  **Biblia de Estructura:** Tu única guía de referencia para la ubicación de carpetas es `docs/structure/buca-modular.txt`. Queda estrictamente prohibido crear directorios o archivos fuera de ese esquema.
2.  **Esquema de Base de Datos:** Tu única referencia de tipos de datos es la v4.0.0 definida en `docs/structure/buca-database.txt`. Respeta estrictamente los esquemas y tipos allí descritos.
3.  **Código Modular Estricto:** Se prohíbe el código espagueti. Todo elemento debe dividirse en módulos desacoplados bajo la estructura de carpetas estándar: `Core`, `Modules` y `Shared`.

## 💻 Stack Tecnológico
*   **Frontend:** HTML5 semántico, SASS (SCSS) modular y JavaScript moderno (ES6+ Vanilla).
*   **Build Tool:** Vite para compilación ultra rápida.
*   **Tipo de Aplicación:** Progressive Web Application (PWA) con Service Worker nativo.

## 📐 Estándares de Código y Diseño de Software

### 1. No Frameworks (Vanilla JS Puro)
*   No sugerir ni utilizar React, Vue, Angular o Svelte. Toda la interfaz y reactividad debe ser implementada con Vanilla JS utilizando técnicas modernas (Template Literals, Web Components o renderizadores de funciones limpios).

### 2. Estructura Obligatoria de Módulo
Cada módulo dentro de `buca` debe tener su propia carpeta modular con la siguiente estructura interna estricta:
```text
[modulo]/
  ├── index.js          # Punto de entrada y controladores del módulo
  ├── routes.js         # Definición de rutas específicas del módulo
  ├── components/       # Componentes reusables de UI del módulo
  ├── logic/            # Reglas de negocio y procesamiento de datos
  ├── pages/            # Vistas/Páginas principales del módulo
  ├── style/            # Archivos .scss locales del módulo
  ├── services/         # Llamadas a Firebase o APIs externas
  └── constants/        # Constantes y enumeradores locales
```
El núcleo (`Core`) no declara rutas de módulos directamente; solo carga dinámicamente las rutas de cada módulo cuando están disponibles.

### 3. Gestión de Estado Centralizado y Reactivo
*   **Prohibición de Globales:** Queda prohibido inyectar o rastrear variables globales de estado dinámico dentro de `window` (como `window.state` o `window.user`).
*   **State Store:** Los datos globales y compartidos entre múltiples módulos (ej. carrito, sesión, configuraciones) deben gestionarse a través de un almacén reactivo único ubicado centralmente en `src/shared/state/`, utilizando patrones de publicación/suscripción (Publish-Subscribe) nativos o bus de eventos.

### 4. Control de Asincronía y Condiciones de Carrera (Race Conditions)
*   **Cancelación de Peticiones:** En llamadas asíncronas de base de datos o peticiones HTTP de larga duración, es mandatorio utilizar `AbortController` para cancelar operaciones pendientes si el usuario sale de la vista antes de completarse.
*   **Validación de Renderizado:** Verificar obligatoriamente que el contenedor o elemento del DOM de destino siga montado y activo en el DOM actual antes de actualizar su contenido tras una promesa resuelta.

### 5. Enrutamiento SPA amigable (History API)
*   La navegación entre páginas y módulos debe realizarse obligatoriamente utilizando el History API nativo de HTML5 (`window.history.pushState` y escuchando el evento `popstate`).
*   Esto garantiza que el usuario pueda utilizar los botones "Atrás" y "Adelante" del navegador web sin recargar la aplicación y de forma completamente fluida.