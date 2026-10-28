/**
 * @fileoverview Kernel Central del Ecosistema Operativo BUCA (BNE v5.2)
 * @module core/kernel
 * @description Orquestador maestro encargado de coordinar la secuencia de arranque, 
 * la calibración del motor gráfico, la persistencia y la navegación dinámica.
 * Sigue los estándares de ingeniería de software de grado empresarial.
 */

import { eventBus } from './eventBus/index.js';
import { uiState } from '@/core/state/ui.js';
import { Header } from '@/shared/ui/layouts/components/TopBar.js';
import { Dock } from '@/shared/ui/layouts/components/DockableNavbar.js';
import { Workspace } from '@/shared/ui/layouts/components/WidgetGrid.js';
import { MainLayout } from '@/shared/ui/layouts/MainLayout.js';
import {
    createIcons,
    LayoutGrid, Layers, Package, Calculator, BarChart3, Users, Settings,
    Sparkles, Plus, Clock, Calendar, Cpu, Gauge, FileText
} from 'lucide';
import GraphicsEngine from '@/core/engine/engine.js';
import { initFirebase } from '@/core/config/firebase.js';
import EmulatorModal from '@/shared/ui/overlays/EmulatorModal.js';

// Infraestructura de Carga Dinámica
import ModuleLoader from '@/core/ModuleLoader.js';
import { router } from '@/core/router/router.js';
import { routes } from '@/core/router/routes.js';
import { storage } from '@/core/storage/StorageAdapter.js';

/**
 * @class BucaKernel
 * @description Clase principal que gestiona el ciclo de vida de la aplicación.
 * Implementa el patrón Singleton para asegurar una única instancia del núcleo.
 */
class BucaKernel {
    /**
     * @constructor
     * @description Inicializa las propiedades base y expone la instancia globalmente 
     * para compatibilidad con sistemas externos y legacy.
     */
    constructor() {
        /** @property {boolean} isInitialized Indica si el núcleo ha completado el boot */
        this.isInitialized = false;

        /** @private {string|null} _lastSyncId Cache del último ID de rendimiento sincronizado */
        this._lastSyncId = null;

        /** @property {string|null} currentLayoutMode Almacena el modo de layout activo */
        this.currentLayoutMode = null;

        window.BucaKernel = this;
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CICLO DE VIDA (LIFECYCLE)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * @method boot
     * @async
     * @description Ejecuta la secuencia oficial de arranque del ecosistema.
     * Coordina la carga de UI, calibración de hardware y activación de módulos.
     * @returns {Promise<void>}
     * @throws {Error} Si ocurre un fallo crítico en la inicialización de Firebase o Motores.
     */
    async boot() {
        if (this.isInitialized) return;

        console.log('%c 🟢 BUCA KERNEL: INITIALIZING MODULAR WEBSITE ', 'background: #0f172a; color: #10b981; font-weight: bold;');

        this.updateSplashProgress(10);

        // 1. Renderizar Estructura Base del DOM (Await layout for slot integrity)
        await this._renderMainLayout();
        this.updateSplashProgress(30);

        // 2. Calibración de Motores (Gráfico y Persistencia)
        const engineResponse = await GraphicsEngine.init();
        storage.init(engineResponse.tier);

        GraphicsEngine.scan();

        // 3. Servicios en la Nube (Firebase)
        initFirebase();
        this.updateSplashProgress(50);

        // 4. Restauración de Preferencias de Usuario
        await this.initTheme();

        // 5. Inyección de Componentes Compartidos (Shared UI)
        const path = window.location.pathname;
        const isAuthRoute = path.startsWith('/auth');

        if (!isAuthRoute) {
            Header.init('topbar-slot');
            Dock.init('dock-slot');
            Workspace.init();
        }

        // Inicializar el Layout si tiene método init
        if (this.currentLayout && this.currentLayout.init) this.currentLayout.init();

        // Inyectar Modo de Layout en el Body para CSS dinámico
        let layoutMode = isAuthRoute ? 'auth' : 'workspace';

        document.body.setAttribute('data-layout-mode', layoutMode);

        this.updateSplashProgress(75);

        // 6. Procesamiento de Activos Visuales
        this.initIcons();

        // 7. Carga de Módulos Críticos (Carga Selectiva v2.0)
        const modulesToLoad = ['auth'];
        if (!isAuthRoute) {
            modulesToLoad.push('workspace');
        }

        await Promise.all(modulesToLoad.map(m => ModuleLoader.load(m)));

        // 8. Activación de Sistemas de Control
        this.setupEventListeners();
        router.init(routes);
        this.startTelemetry();
        await this.handleEmulatorWarning();

        // FINALIZACIÓN
        this.isInitialized = true;
        this.updateSplashProgress(100);

        this._finalizeBoot();
    }

    /**
     * @private
     * @method _renderMainLayout
     * @async
     * @description Inyecta la estructura HTML principal en el contenedor raíz.
     * Detecta dinámicamente si debe usar el layout de Workspace o el de Auth.
     */
    async _renderMainLayout() {
        const appContainer = document.getElementById('app');
        if (!appContainer) return;

        const isAuthRoute = window.location.pathname.startsWith('/auth');
        const nextLayoutMode = isAuthRoute ? 'auth' : 'workspace';

        // Evitar re-renderizado si ya estamos en el layout correcto
        if (this.currentLayoutMode === nextLayoutMode) return;
        this.currentLayoutMode = nextLayoutMode;

        console.log(`[Kernel] -> Aplicando Layout: ${nextLayoutMode.toUpperCase()}`);
        document.body.setAttribute('data-layout-mode', nextLayoutMode);

        if (isAuthRoute) {
            // Renderizar Layout inmersivo para Auth (Carga Diferida)
            try {
                const { AuthLayout } = await import('@/shared/ui/layouts/AuthLayout.js');
                appContainer.innerHTML = AuthLayout.render();
                if (AuthLayout.init) AuthLayout.init();
            } catch (err) {
                console.error('[Kernel] Fallo al cargar AuthLayout:', err);
                appContainer.innerHTML = '<div class="error-critical">Error de Sistema: Layout no disponible.</div>';
            }
        } else {
            // Renderizar Layout estándar para el ERP (Carga Estática)
            appContainer.innerHTML = MainLayout.render();
            if (MainLayout.init) MainLayout.init();
        }
    }

    /**
     * @private
     * @method _finalizeBoot
     * @description Realiza las tareas de limpieza final y revela la interfaz al usuario.
     */
    _finalizeBoot() {
        requestAnimationFrame(() => {
            document.body.classList.add('app-ready');
            this.hideSplash();
            eventBus.emit('kernel:ready', { timestamp: Date.now() });
        });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // UI Y SINCRONIZACIÓN (ENGINE SYNC)
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * @method syncGraphicsUI
     * @description Sincroniza los indicadores de rendimiento de la UI con el estado del motor.
     * Implementa un "Reflow Guard" para evitar actualizaciones innecesarias del DOM.
     * @param {Object} stats - Estadísticas de rendimiento del motor.
     * @param {string} stats.tier - Nivel de rendimiento (L0, L1, L2, L3).
     * @param {string} stats.id - Identificador descriptivo del perfil.
     * @param {number} stats.fps - Cuadros por segundo actuales.
     */
    syncGraphicsUI({ tier, id, fps }) {
        if (this._lastSyncId === id && this._lastSyncFps === fps && this._lastSyncTier === tier) return;

        this._lastSyncId = id;
        this._lastSyncFps = fps;
        this._lastSyncTier = tier;

        // Sincronización masiva de Badges y HUDs
        document.querySelectorAll('[data-perf="profile-badge"]').forEach(badge => {
            badge.textContent = id;
            badge.className = `badge badge--${tier}`;
        });

        const fpsEl = document.getElementById('header-engine-fps');
        if (fpsEl) {
            fpsEl.textContent = `${fps} FPS`;
            fpsEl.style.color = fps < 30 ? 'var(--color-error)' : 'inherit';
        }
    }

    /**
     * @method updateSplashProgress
     * @description Actualiza la barra de progreso visual y el estado del sistema.
     * @param {number} percent - Porcentaje de progreso (0-100).
     */
    updateSplashProgress(percent) {
        const bar = document.getElementById('splash-progress');
        const text = document.getElementById('splash-percentage');
        const status = document.getElementById('splash-status');

        if (bar) bar.style.setProperty('--buca-progress', `${percent}%`);
        if (text) text.textContent = `${percent}%`;

        // Mensajes dinámicos según el progreso
        if (status) {
            const messages = {
                10: 'Iniciando Kernel BUCA...',
                30: 'Renderizando Shell de Usuario...',
                50: 'Sincronizando con Firebase Cloud...',
                75: 'Calibrando Motores Gráficos...',
                90: 'Preparando entorno de trabajo...',
                100: '¡Sistema Listo!'
            };

            // Buscar el mensaje más cercano al porcentaje actual
            const currentMsg = Object.keys(messages)
                .reverse()
                .find(p => percent >= p);

            if (currentMsg) {
                status.textContent = messages[currentMsg];
                // Efecto sutil de parpadeo al cambiar mensaje
                if (this._lastMsg !== messages[currentMsg]) {
                    status.style.opacity = '0.4';
                    setTimeout(() => status.style.opacity = '0.7', 100);
                    this._lastMsg = messages[currentMsg];
                }
            }
        }

        eventBus.emit('kernel:boot:progress', percent);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // CONFIGURACIÓN Y EVENTOS
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * @method setupEventListeners
     * @description Configura los escuchas de eventos globales y la delegación de acciones.
     * Implementa el sistema de "Acciones Dinámicas" via data-attributes.
     */
    setupEventListeners() {
        // Delegación Global de Clics
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (actionEl) {
                const action = actionEl.getAttribute('data-action');
                let payload = {};
                try {
                    const rawPayload = actionEl.getAttribute('data-payload');
                    if (rawPayload) payload = JSON.parse(rawPayload);
                } catch (err) { console.error('[Kernel] Payload error:', err); }

                eventBus.emit(action, payload);
            }
        });

        // Suscripción a comandos de UI Desacoplados
        eventBus.on('ui:toggle_theme', () => this.toggleTheme());
        eventBus.on('engine:recalibrate', () => GraphicsEngine.calibrate());

        // Conexión con los Modales del UI Bridge
        eventBus.on('ui:open_performance', () => { if (window.openPerformanceSettings) window.openPerformanceSettings(); });
        eventBus.on('ui:open_rate', () => { if (window.openRateModal) window.openRateModal(); });
        eventBus.on('ui:open_settings', () => { if (window.openSettings) window.openSettings(); });
        eventBus.on('ui:open_terminal', () => { if (window.openTerminal) window.openTerminal(); });
        eventBus.on('ui:open_profile', () => { if (window.openModal) window.openModal('Perfil de Usuario', 'Datos Personales', 'Edición de información y preferencias.'); });
        eventBus.on('ui:open_security', () => { if (window.openModal) window.openModal('Seguridad PIN', 'Configurar Llave Maestra', 'Opciones de autenticación de dos factores.'); });
        eventBus.on('ui:open_billing', () => { if (window.openModal) window.openModal('Suscripción Plan', 'Facturación y Contratos', 'Gestiona tu plan activo y métodos de pago.'); });
        eventBus.on('ui:manage_widgets', () => { if (window.openModal) window.openModal('Gestor de Widgets', 'Personalizar Tablero', 'Activa o desactiva las tarjetas del Workspace.'); });
        eventBus.on('ui:view_server_status', () => { if (window.openModal) window.openModal('Estado de Servidores', 'Métricas de Nube', 'Estado actual de Firebase y los Emuladores locales.'); });
        eventBus.on('ui:logout', () => { console.log('[Auth] Cerrando sesión...'); if (window.openModal) window.openModal('Cierre de Sesión', 'Desconectando', 'Cerrando de forma segura...'); });

        // Acciones de Negocio y AI
        eventBus.on('ui:enter_business', (data) => { if (window.enterBusiness) window.enterBusiness(data.id); });
        eventBus.on('ui:filter_business', (data) => {
            document.querySelectorAll('.context-pill').forEach(pill => pill.classList.remove('active'));
            const activePill = document.querySelector(`.context-pill[data-payload*='"type": "${data.type}"']`);
            if (activePill) activePill.classList.add('active');

            if (data.type === 'directory') {
                router.navigate('/workspaces');
            } else {
                router.navigate('/workspace');
            }
        });
        eventBus.on('ai:toggle_assistant', () => { if (window.toggleAIAssistant) window.toggleAIAssistant(); });
        eventBus.on('ui:open_create_business', () => { if (window.openCreateBusiness) window.openCreateBusiness(); });

        // Navegación Global Reactiva
        eventBus.on('router:navigate', (payload) => {
            if (payload && payload.path) router.navigate(payload.path);
        });

        // Sincronización Reactiva
        uiState.subscribe((state) => {
            if (state.graphics) this.syncGraphicsUI(state.graphics);
        });

        // Sincronización de Layout ante Navegación SPA (Antes del render para preparar slots)
        eventBus.on('router:before-change', async ({ path }) => {
            await this.handleLayoutSync(path);
        });
    }

    /**
     * @method handleLayoutSync
     * @async
     * @description Coordina el cambio de shell visual cuando se detecta un salto entre módulos.
     */
    async handleLayoutSync(path) {
        const isAuthRoute = path.startsWith('/auth');
        const nextLayoutMode = isAuthRoute ? 'auth' : 'workspace';

        if (this.currentLayoutMode === nextLayoutMode) return;

        console.log('[Kernel] -> Transición de Módulo detectada. Sincronizando UI...');

        // 1. Cambiar el Shell
        await this._renderMainLayout();

        // 2. Si volvemos al Workspace, debemos reinicializar los componentes globales del shell
        if (nextLayoutMode === 'workspace') {
            Header.init('topbar-slot');
            Dock.init('dock-slot');
            Workspace.init();
            this.initIcons();
        }

        eventBus.emit('kernel:layout-ready', { path, mode: nextLayoutMode });
    }

    /**
     * @method toggleTheme
     * @async
     * @description Alterna entre los modos visuales Light y Dark.
     */
    async toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', next);
        await storage.set('theme', next);
        uiState.update({ theme: next });
        this.updateThemeUI(next);
    }

    /**
     * @method initTheme
     * @async
     * @description Restaura el tema visual preferido del usuario desde la persistencia.
     */
    async initTheme() {
        const saved = await storage.get('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeUI(saved);
    }

    /**
     * @method updateThemeUI
     * @description Actualiza los activos visuales (logos, iconos) según el tema activo.
     * @param {string} theme - 'light' | 'dark'
     */
    updateThemeUI(theme) {
        const isDark = theme === 'dark';
        const logoImg = document.getElementById('app-logo');
        if (logoImg) logoImg.src = `/assets/icons/logo-${isDark ? 'light' : 'dark'}.svg`;

        document.querySelectorAll('.theme-icon').forEach(icon => {
            icon.classList.toggle('bi-sun-fill', isDark);
            icon.classList.toggle('bi-moon-stars-fill', !isDark);
        });
    }

    /**
     * @method hideSplash
     * @description Oculta el preloader global con una transición suave de salida.
     */
    hideSplash() {
        setTimeout(() => {
            const preloader = document.getElementById('global-preloader');
            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.visibility = 'hidden';
                setTimeout(() => preloader.remove(), 600);
            }
        }, 800); // 🚀 Optimización: Reducido de 5000ms a 800ms para respuesta inmediata
    }

    /**
     * @method initIcons
     * @description Procesa y renderiza los iconos vectoriales de la librería Lucide.
     */
    initIcons() {
        createIcons({
            icons: {
                LayoutGrid, Layers, Package, Calculator, BarChart3, Users, Settings,
                Sparkles, Plus, Clock, Calendar, Cpu, Gauge, FileText
            }
        });
    }

    async handleEmulatorWarning() {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (!isLocal) return;

        // Limpieza física del banner de Firebase (Garbage Collector)
        // El SDK lo inyecta tarde, así que lo buscamos activamente.
        const cleanupBanner = () => {
            const banner = document.querySelector('.firebase-emulator-warning') ||
                document.querySelector('[class*="firebase-emulator"]');
            if (banner) {
                banner.remove();
                console.log('[Kernel] -> Banner de emulador nativo eliminado.');
            }
        };

        // Ejecutar limpieza inmediata y programar una secundaria por si el SDK tarda en inyectarlo
        cleanupBanner();
        setTimeout(cleanupBanner, 2000);
        setTimeout(cleanupBanner, 5000);

        const accepted = await storage.get('emulator_warning_accepted');
        if (accepted) return;

        eventBus.on('kernel:ready', () => {
            setTimeout(() => this.showSecurityNotice(), 1500);
        });
    }

    showSecurityNotice() {
        EmulatorModal.show();
        console.log('[Kernel] -> Aviso de seguridad mostrado.');
    }

    /**
     * @method startTelemetry
     * @description Inicia los servicios de monitoreo reactivo.
     */
    startTelemetry() {
        console.log('[Kernel] -> Telemetría reactiva iniciada.');
    }

}

/**
 * @type {BucaKernel}
 * @constant
 * @description Instancia exportada del núcleo para uso en toda la aplicación.
 */
export const kernel = new BucaKernel();
export default kernel;
