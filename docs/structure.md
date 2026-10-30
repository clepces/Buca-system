# Arquitectura y Árbol de Directorios Maestro (B.U.C.A. AI)

> **Documento:** Estándar de Estructura y Organización del Código Fuente  
> **Versión:** 1.0.0  
> **Ámbito:** Frontend Modular Vanilla JS (ES6+), SASS y Arquitectura Clean Core

---

## 1. Principios de Gobernanza Estructural

1. **Vanilla JS Modular (Cero Frameworks):** Prohibido el uso de React, Vue, Svelte, Angular o wrappers de componentes externos. Toda la reactividad, renderizado de componentes y manipulación del DOM se realiza con ES6+ Vanilla, Template Literals y Web Components nativos.
2. **Límite de Líneas por Archivo:** Ningún archivo de código fuente (`.js`, `.scss`) debe exceder las **300 líneas de código**. Si un módulo sobrepasa este límite, debe subdividirse en controladores, adaptadores o servicios especializados.
3. **Nomenclatura Kebab-Case Obligatoria:** Todos los nombres de carpetas y archivos nuevos deben escribirse estrictamente en minúsculas y separados por guiones (ej. `module-placeholder-page.js`, `rate-modal.js`, `user-controller.js`).
4. **Protección del Workspace Compilado:** Queda estrictamente prohibido editar manualmente archivos dentro de `/dist`. Todo el trabajo se realiza en `/src` y se compila mediante Vite.
5. **Aislamiento en Tres Capas:**
   * **`Core` (`src/core/`):** El motor base del sistema (arranque, enrutador, bus de eventos, cliente de red, persistencia y motor gráfico). No contiene vistas de negocio directas.
   * **`Modules` (`src/modules/`):** Módulos de dominio empresarial desacoplados (Auth, Workspace, Inventory, POS, etc.).
   * **`Shared` (`src/shared/`):** Componentes visuales transversales, layouts de aplicación, modales globales, estado compartido y estilos SCSS.

---

## 2. Estructura Obligatoria de Cada Módulo

Cada dominio de negocio dentro de `src/modules/` debe mantener la siguiente anatomía de carpetas estandarizada:

```text
[modulo]/
  ├── index.js          # Punto de entrada y registro del módulo en el Kernel
  ├── routes.js         # Definición de rutas específicas del módulo
  ├── components/       # Componentes reusables de interfaz (UI)
  ├── logic/            # Reglas de negocio, cálculos y validaciones de datos
  ├── pages/            # Vistas principales del módulo
  ├── style/            # Archivos .scss locales del módulo
  ├── services/         # Llamadas a Firebase Firestore / Auth o APIs externas
  └── constants/        # Constantes, configuraciones y enumeradores locales
```

---

## 3. Árbol de Directorios Maestro

```text
buca-system/
├── index.html                     # App Shell y contenedor raíz SPA (#app)
├── vite.config.js                 # Configuración de compilación Vite y Rollup manualChunks
├── package.json                   # Dependencias de producción y scripts de build
├── docs/                          # Documentación técnica corporativa
│   ├── readme.md                  # Visión general, slogan y filosofía de roles
│   ├── structure.md               # Árbol maestro y reglas de código
│   ├── api.md                     # Contratos de red y servicios externos
│   ├── components.md              # Catálogo de componentes visuales modulares
│   ├── database.md                # Esquema Firestore v4.1.0 y colecciones
│   ├── domain-logic.md            # Reglas de negocio bi-monetarias y de inventario
│   ├── events.md                  # Especificación del Bus de Eventos Pub/Sub
│   ├── interface.md               # Diseño Glassmorphism, SASS y correcciones responsivas
│   └── migration-roadmap.md       # Hoja de ruta y etapas de desarrollo
├── src/
│   ├── main.js                    # Bootstrap inicial y arranque del Kernel
│   │
│   ├── core/                      # NÚCLEO DEL SISTEMA
│   │   ├── kernel.js              # Orquestador maestro del ciclo de vida
│   │   ├── ModuleLoader.js        # Cargador asíncrono dinámico de módulos
│   │   ├── api/                   # Clientes de red y comunicación
│   │   │   ├── BaseClient.js      # Cliente fetch con soporte AbortController
│   │   │   └── http.js            # Wrapper HTTP unificado con timeouts
│   │   ├── config/                # Configuraciones maestras
│   │   │   ├── config.js          # Constantes de configuración global
│   │   │   └── firebase.js        # Inicialización de Firebase SDK y emuladores
│   │   ├── engine/                # BUCA NEURAL ENGINE (Motor Gráfico)
│   │   │   ├── engine.js          # Fachada del motor gráfico
│   │   │   ├── graphics.js        # Gestor de perfiles y observadores de rendimiento
│   │   │   ├── monitors/          # Monitores de hardware (FPS, Térmico, RAM)
│   │   │   ├── profiles/          # Perfiles de renderizado (Eco, Balanced, Pro, Ultra)
│   │   │   ├── safety/            # Guardias de reflow y desinfección de GPU
│   │   │   ├── services/          # Throttling de red y feedback HUD
│   │   │   └── utils/             # Detección de GPU y capacidades de hardware
│   │   ├── eventBus/              # BUS DE EVENTOS
│   │   │   ├── index.js           # Implementación activa del EventBus
│   │   │   └── index-v2.js        # Versión optimizada con Map/Set y Middlewares
│   │   ├── router/                # ENRUTADOR SPA NATIVO
│   │   │   ├── router.js          # Manejador del History API y ciclo de desmontaje
│   │   │   ├── routes.js          # Mapa base de rutas
│   │   │   └── guards.js          # Guardias de autenticación y permisos
│   │   ├── security/              # SEGURIDAD Y CIFRADO
│   │   │   ├── CryptoWrapper.js   # Cifrado XOR/AES para persistencia local
│   │   │   └── permissions.js     # Validador de claims y roles
│   │   ├── state/                 # ESTADO REACTIVO DEL NÚCLEO
│   │   │   ├── BaseState.js       # Clase base observable con batching rAF
│   │   │   ├── global.js          # Estado global de tasas y configuración
│   │   │   ├── session.js         # Estado reactivo de sesión de usuario
│   │   │   ├── store.js           # Store unificado
│   │   │   └── ui.js              # Estado reactivo de interfaz y motor
│   │   └── storage/               # ADAPTADORES DE PERSISTENCIA
│   │       ├── StorageAdapter.js  # Conmutador dinámico entre Local e IndexedDB
│   │       ├── drivers/           # Controladores LocalStorage, Session e IndexedDB
│   │       └── migrations/        # Migraciones de esquema en cliente
│   │
│   ├── modules/                   # MÓDULOS DE NEGOCIO (CARGA DINÁMICA)
│   │   ├── auth/                  # MÓDULO DE AUTENTICACIÓN
│   │   │   ├── index.js           # Registro y bootstrap del módulo
│   │   │   ├── routes.js          # Rutas (/auth/login, /auth/register, /auth/pin)
│   │   │   ├── components/        # LoginForm, RegisterForm, PINForm
│   │   │   ├── pages/             # LoginPage, RegisterPage, PINPage
│   │   │   └── services/          # AuthService (integrado con Firebase y mock local)
│   │   └── workspace/             # MÓDULO DE ESPACIO DE TRABAJO
│   │       ├── index.js           # Registro y bootstrap del Workspace
│   │       ├── routes.js          # Rutas (/workspace, /clients, /inventory, etc.)
│   │       └── pages/             # DashboardPage, ModulePlaceholderPage
│   │
│   └── shared/                    # RECURSOS TRANSVERSALES COMPARTIDOS
│       ├── pages/                 # Páginas de error SPA (Error401, Error403, Error404)
│       ├── state/                 # Punto de exportación centralizado del Estado
│       │   └── index.js           # Barrel export del Reactive State Store
│       ├── styles/                # ARQUITECTURA SASS MODULAR
│       │   ├── base.css           # Estilos base y tokens CSS nativos
│       │   ├── _buca-bootstrap.scss # Integración de Bootstrap 5 con BNE
│       │   └── neural/            # Sistema de diseño "Corporate Hybrid Glass"
│       │       ├── abstracts/     # Variables, tokens de color, mixins y z-index
│       │       ├── components/    # Botones, tarjetas, dock, header, huds, modales
│       │       └── layout/        # Grids, wrappers y contenedores responsivos
│       ├── ui/                    # COMPONENTES VISUALES COMPARTIDOS
│       │   ├── components/        # BusinessHub (carrusel), DockableNavbar, TopBar
│       │   ├── layouts/           # MainLayout (ERP Shell) y AuthLayout (Inmersivo)
│       │   └── overlays/          # EmulatorModal, PerformanceModal, RateModal
│       └── utils/                 # UTILIDADES GLOBALES
│           ├── ui-bridge.js       # Puente para delegación de eventos y atajos
│           └── escape-html.js     # Sanitizador anti-XSS
```

---

## 4. Convenciones de Código y Estilo

* **Variables y Funciones:** `camelCase` (ej. `syncGraphicsUI`, `handleLayoutSync`).
* **Clases y Constructores:** `PascalCase` (ej. `GraphicsEngine`, `BaseClient`, `Router`).
* **Archivos y Directorios:** `kebab-case` (ej. `module-placeholder-page.js`, `storage-adapter.js`).
* **Constantes Globales:** `UPPER_SNAKE_CASE` (ej. `DEFAULT_CONFIG`, `STORAGE_KEYS`).
* **Atributos de Datos para Acciones:** `data-action="modulo:accion"` (ej. `data-action="workspace:scroll_carousel"`, `data-action="ui:open_modal"`).
* **Atributos de Datos para Rendimiento:** `data-buca-perf="L0|L1|L2|L3"` para controlar el nivel gráfico de la GPU.
