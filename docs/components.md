# Catálogo de Componentes UI Modulares (Vanilla JS ES6+)

> **Documento:** Inventario de Componentes Visuales, Props, Eventos e Interfaz  
> **Versión:** 1.0.0  
> **Patrón:** Web Components / Pure Vanilla JS Templates con Delegación de Eventos

---

## 1. Componentes de Navegación y Shell

### 1.1. `TopBar` (Header Superior Corporativo)
* **Ubicación:** `src/shared/ui/layouts/components/TopBar.js`
* **Propósito:** Barra superior fija translúcida con información del sistema, tasas de cambio en tiempo real, selector de tema claro/oscuro, buscador neural y controles rápidos.
* **Características Clave:**
  * Renderizado condicional de píldoras financieras (`Tasa BCV`).
  * Extracción dinámica de paneles al `body` para resolver conflictos de Stacking Context y `z-index`.
  * Soporte de gestos táctiles de deslizamiento (swipe-down) para cerrar paneles en móviles.

### 1.2. `DockableNavbar` (Dock de Navegación Flotante)
* **Ubicación:** `src/shared/ui/layouts/components/DockableNavbar.js`
* **Propósito:** Menú inferior flotante con estética de corte circular y curva negativa animada.
* **Mapeo de Contextos:**
  * `main`: Navegación principal (Módulos, Negocios, Dashboard, Personal, Ajustes).
  * `modules`: Sub-módulo ERP (Clientes, Proveedores, Inventario, Punto de Venta).
  * `people`: Gestión de equipo (Usuarios, Roles, Equipos).
* **Adaptación Responsiva:** En pantallas menores a 576px oculta textos secundarios y compacta el ancho para maximizar el área de trabajo útil.

---

## 2. Componentes del Espacio de Trabajo (Workspace)

### 2.1. `BusinessHub` (Carrusel de Negocios)
* **Ubicación:** `src/shared/ui/components/hub/BusinessHub.js`
* **Propósito:** Vitrina principal para visualizar las unidades de negocio del usuario (Modo Owner) o empresas afiliadas (Modo Worker).
* **Interacciones:**
  * Arrastre con ratón en escritorio (Drag-to-scroll).
  * Soporte táctil móvil nativo (`touchstart`, `touchmove`, `touchend`) con detección de umbral de 8px para evitar clics accidentales al deslizar.
  * Tarjeta especial `create-new` para invocar el asistente de creación de empresas.

### 2.2. `WidgetGrid` (Franja de Telemetría y Accesos Rápidos)
* **Ubicación:** `src/shared/ui/layouts/components/WidgetGrid.js`
* **Propósito:** Cuadrícula de estadísticas y atajos de alta frecuencia:
  * Ventas del día en Bolívares y Dólares.
  * Unidades de negocio activas.
  * Personal operativo en turno.
  * Pedidos pendientes de despacho.
* **Atajos de Teclado:** Integra `Ctrl + K` / `Cmd + K` para desplegar el buscador neural en cualquier momento.

---

## 3. Modales y Overlays del Sistema

### 3.1. `RateModal` (Gestor de Tasa de Cambio Bi-Monetaria)
* **Ubicación:** `src/shared/ui/overlays/RateModal.js`
* **Propósito:** Panel estilo Fintech para la supervisión y ajuste de la tasa oficial BCV y cálculo de reposición.
* **Características:**
  * Tipografía numérica fraccionada estilo banca moderna.
  * Previsualización instantánea al tipear valores manuales.
  * Limpieza estricta de eventos en `hide()` para evitar fugas de memoria.

### 3.2. `PerformanceModal` (Gestor de Buca Neural Engine)
* **Ubicación:** `src/shared/ui/overlays/PerformanceModal.js`
* **Propósito:** Panel de control de hardware gráfico. Permite alternar entre los niveles **L0 (Eco)**, **L1 (Balanced)**, **L2 (Pro)** y **L3 (Ultra)**.
* **Monitoreo en Tiempo Real:**
  * Medición de cuadros por segundo (FPS) y latencia en milisegundos.
  * Uso de memoria JS Heap (VRAM estimada).
  * Conteo de nodos del DOM bajo caché de 5 segundos.
  * Interruptor entre modo automático (auto-degradación térmica) y modo manual.

### 3.3. `EmulatorModal` (Aviso de Entorno Local)
* **Ubicación:** `src/shared/ui/overlays/EmulatorModal.js`
* **Propósito:** Notificación visual al detectar ejecución en `localhost`. Asegura que los desarrolladores validen la conexión con los emuladores de Firebase en los puertos `9099` (Auth) y `8080` (Firestore) antes de realizar pruebas de escritura.

---

## 4. Formularios y Páginas Modulares

### 4.1. `LoginForm` y `PINForm`
* **Ubicación:** `src/modules/auth/components/`
* **Propósito:** Formularios de acceso con validación reactiva en el cliente:
  * Cumplimiento WCAG AA: Etiquetas `aria-label`, atributos `autocomplete` estándar.
  * Manejo semántico de errores de Firebase (`auth/user-not-found`, `auth/wrong-password`, `auth/network-request-failed`).
  * Autosalvado seguro de sesión en el almacén reactivo.

### 4.2. `ModulePlaceholderPage`
* **Ubicación:** `src/modules/workspace/pages/module-placeholder-page.js`
* **Propósito:** Generador procedural de vistas para sub-módulos en desarrollo (`/clients`, `/providers`, `/inventory`, `/pos`, `/users`, `/roles`, `/teams`). Evita pantallas en blanco o errores 404, proporcionando una interfaz funcional con métricas mock y acciones conectadas al `eventBus`.
