# Bus Central de Eventos y Ciclo Reactivo Pub/Sub (B.U.C.A. AI)

> **Documento:** Especificación del Bus de Eventos, Análisis Comparativo V1 vs V2 y Catálogo de Canales  
> **Versión:** 1.0.0  
> **Ámbito:** Comunicación Desacoplada entre Módulos, Layouts y Motor Gráfico

---

## 1. Principio de Gobernanza Reactiva

En la arquitectura de B.U.C.A. AI, **ningún componente o módulo invoca directamente métodos internos de otro componente**. Toda comunicación transversal (cambios de ruta, apertura de modales, sincronización de tasas, desplazamiento de carruseles y alertas del motor gráfico) se realiza estrictamente a través del patrón Publicador/Suscriptor (Pub/Sub) centralizado.

Esto previene el código espagueti, elimina dependencias circulares y permite reemplazar o actualizar módulos enteros de forma completamente transparente.

---

## 2. Análisis Comparativo: `index.js` (V1) vs `index-v2.js` (V2)

El proyecto cuenta con una investigación y evolución técnica implementada en `src/core/eventBus/index-v2.js` frente a la versión base original `src/core/eventBus/index.js`. A continuación se detalla la matriz de mejoras arquitectónicas:

| Dimensión Técnica | EventBus V1 (`index.js`) | EventBus V2 (`index-v2.js`) | Impacto en Rendimiento y Estabilidad |
| :--- | :--- | :--- | :--- |
| **Estructura de Datos** | Objeto plano literal `{}` con arrays `[]`. | `Map` nativo de JavaScript conteniendo `Set`s de callbacks. | **Eliminación de colisiones:** Evita sobrescribir propiedades heredadas de `Object.prototype` (ej. `toString`, `watch`). |
| **Complejidad de Desuscripción (`off`)** | $O(N)$ mediante `Array.prototype.filter()`. | $O(1)$ directo mediante `Set.delete()`. | **Ultra-rápido en SPA:** La remoción masiva de listeners durante transiciones de ruta no genera bloqueos en el hilo principal. |
| **Paso de Argumentos** | Parámetro único `data`. | Operador Rest `...args`. | **Flexibilidad total:** Permite emitir múltiples argumentos sin obligar a empaquetar siempre en objetos intermedios. |
| **Aislamiento de Errores (Fault Tolerance)** | Ninguno. Si un suscriptor lanza una excepción, se detiene la ejecución y los demás oyentes no reciben el evento. | Bucle protegido con `try/catch` individual por suscriptor con logging de error. | **Resiliencia empresarial:** Un fallo en un widget o gráfico no tumba la interfaz principal ni rompe el flujo del usuario. |
| **Tuberías Globales (Middlewares)** | No soportado. | Método `use((event, ...args) => void)` con capacidad de interceptar o cancelar eventos. | **Auditoría y Telemetría:** Permite registrar bitácoras (`activity_log`), telemetría en tiempo real o control de seguridad centralizado. |
| **Patrón `once` y Desuscripción Segura** | Genera una clausura interna que no puede desuscribirse con la referencia original. | Enlaza la propiedad `onceWrapper.originalListener = callback`. | **Prevención de fugas de memoria:** Permite invocar `off(event, callbackOriginal)` incluso antes de que se dispare el wrapper `once`. |
| **Prevención de Duplicados** | Permite registrar accidentalmente el mismo callback múltiples veces si no se valida en cliente. | Garantizado por diseño mediante las propiedades de unicidad de `Set`. | **Idempotencia:** Evita emisiones repetidas causadas por re-renders rápidos de la UI. |

> **Recomendación de Ingeniería:** Promover `index-v2.js` como la implementación estándar oficial en la fase de refinamiento del Kernel, asegurando compatibilidad hacia atrás en los nombres de métodos (`on`, `off`, `once`, `emit`).

---

## 3. Catálogo Canónico de Canales de Eventos

### 3.1. Canales del Ciclo de Vida del Kernel (`kernel:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `kernel:boot:progress` | `BucaKernel` | `percent: number` | Preloader Splash | Actualiza la barra de carga inicial (0% a 100%). |
| `kernel:ready` | `BucaKernel` | `{ timestamp: number }` | Overlays / Modales | Señal de arranque completado; revela el App Shell. |
| `kernel:layout-ready` | `BucaKernel` | `{ path: string, mode: string }` | Router SPA | Confirma que los slots del layout (`workspace` o `auth`) están montados en el DOM. |

---

### 3.2. Canales de Navegación y Rutas (`router:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `router:navigate` | Dock, Botones, Links | `{ path: string }` | `Router` | Solicita navegación SPA fluida sin recarga física. |
| `router:before-change` | `Router` | `{ path: string, route: object }` | `BucaKernel` | Anticipa cambios entre el layout inmersivo Auth y el ERP Shell. |
| `router:changed` | `Router` | `{ path: string, route: object }` | `WidgetGrid`, Badges | Notifica el montaje exitoso de la nueva vista en pantalla. |

---

### 3.3. Canales de Interfaz y Diálogos (`ui:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `ui:open_modal` | Botones, Tablas | `{ title, subtitle, description }` | `ModalBase` | Despliega el diálogo modal estándar del sistema. |
| `ui:close_modal` | Tecla Esc, Botones | `{}` | `ModalBase` | Oculta el modal activo y restaura el scroll del documento. |
| `ui:toggle_theme` | Botón TopBar | `{}` | `BucaKernel` | Alterna entre tema claro y tema oscuro (Light/Dark). |
| `ui:open_performance` | Atajo / Header | `{}` | `PerformanceModal` | Abre el gestor de perfiles de hardware y telemetría de GPU. |
| `ui:open_rate` | TopBar Pill | `{}` | `RateModal` | Abre la consola de ajuste y sincronización de tasa BCV. |
| `ui:enter_business` | `BusinessHub` | `{ id: string }` | `Router` | Entra a la gestión operativa de una unidad de negocio. |
| `ui:filter_business` | Context Pills | `{ type: 'all' \| 'directory' }` | `Workspace` | Filtra entre negocios propios y el directorio de comercios. |

---

### 3.4. Canales del Espacio de Trabajo (`workspace:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `workspace:scroll_carousel`| Flechas Nav | `{ direction: 'prev' \| 'next' }` | `BusinessHub` | Desplaza suavemente el carrusel de tarjetas de negocios. |
| `workspace:toggle_search` | Botón Lupa / Esc | `{ active: boolean }` | `WidgetGrid` | Expande o colapsa el buscador neural global. |
| `workspace:quick_action` | Action Pills | `{ label: string }` | Controladores | Dispara flujos rápidos (exportar, reportes, atajos). |

---

### 3.5. Canales de Rendimiento y Motor Gráfico (`graphics:*` y `buca:*`)

| Canal | Emisor | Payload | Receptor | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `graphics:tier-changed` | `GraphicsEngine` | `{ tier, id, isLowPerf }` | `ResourceThrottle`, UI | Notifica cambio de perfil gráfico (`eco`, `balanced`, `pro`, `ultra`). |
| `buca:perf_critical` | `FPSMonitor` | `{}` | `GraphicsEngine` | Dispara la degradación preventiva ante caídas sostenidas (< 30 FPS). |
| `buca:rate_change` | `RateModal` | `{ rate: number, timestamp }` | TopBar, POS | Notifica a todos los widgets la actualización de la tasa bi-monetaria. |
| `buca:drp_pause_polling` | `ResourceThrottle` | `{ critical: boolean }` | `BaseClient` | Suspende peticiones de red no prioritarias durante estrés gráfico. |
