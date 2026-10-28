import { uiState } from '@/core/state/ui.js';
import { eventBus } from '@/core/eventBus/index.js';
import { NotificationsPanel } from '@/shared/ui/components/header/NotificationsPanel.js';
import { ProfilePanel } from '@/shared/ui/components/header/ProfilePanel.js';

/**
 * Componente modular Header — BUCA Website
 * =========================================================================
 * Implementa el sistema de paneles estandarizado "Glass Panel" v2.6.
 * Refactorizado para usar Estado Reactivo (uiState) v4.8.0.
 * =========================================================================
 */

export const Header = {

    /**
     * Inicializa el componente Header inyectando el HTML y vinculando eventos.
     * @param {string} containerId - ID del contenedor donde se inyectará el header.
     */
    init(containerId = 'topbar-slot') {
        if (this._initialized) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = this.render();
        this.element = container.querySelector('.app-header'); // Asignar el elemento
        
        this._createOverlay();
        this._extractPanelsToBody();
        // Inicializar gestos táctiles
        this._initTouchGestures();
        // Inicializar despachador central de eventos (Seguridad Pro)
        this._bindEvents();

        this._initialized = true;
    },

    /**
     * _bindEvents — Centraliza todos los eventos del Header mediante delegación.
     * Escucha en el documento para atrapar clics en el Header y en los Paneles (en el body).
     */
    _bindEvents() {
        // 1. Manejo de clics delegados (Botones con data-action)
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('[data-action]');
            
            // Si hay un trigger con acción, lo procesamos y detenemos el flujo
            if (trigger) {
                // Detener propagación para que no interfiera con otros elementos
                // e.stopPropagation(); // Opcional, pero recomendable en delegación
                
                const action = trigger.getAttribute('data-action');
                const target = trigger.getAttribute('data-target');

                console.log(`[Header] -> Action: ${action}`);

                switch (action) {
                case 'header:toggle_panel':
                    this.togglePanel(target, trigger);
                    break;
                case 'header:scroll_qc_left':
                    this.scrollQC(-80);
                    break;
                case 'header:scroll_qc_right':
                    this.scrollQC(80);
                    break;
                case 'header:toggle_fullscreen':
                    this.toggleFullscreen();
                    break;
                default:
                    // Si no es interna del Header, va al EventBus global
                    eventBus.emit(action, trigger.dataset);
                    break;
                }
                return; // ⛔ IMPORTANTE: Detenemos aquí para que no se ejecute el cierre de paneles
            }

            // 2. Clic fuera de paneles y dropdowns -> Cerrar todo
            // Solo llegamos aquí si el clic NO fue en un [data-action]
            const isInsidePanel = e.target.closest('.glass-panel');
            const isInsideWrapper = e.target.closest('.dropdown-wrapper');
            
            if (!isInsidePanel && !isInsideWrapper) {
                this.closeAllPanels();
            }
        });

        // 2. Manejo de Teclado (Escape y Atajos)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllPanels();
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggleSearch?.(true);
            }
        });

        // 3. Suscripción al Estado Reactivo (FPS / Motor)
        uiState.subscribe((state) => {
            const gfx = state.graphics;
            if (gfx) this.updateEngineUI(gfx);
        });

        // 4. Reposicionamiento en Resize
        window.addEventListener('resize', () => {
            this.checkQCArrows();
            const activePanel = document.querySelector('.glass-panel.active');
            if (activePanel) {
                const wrapperId = activePanel.getAttribute('data-anchor-wrapper');
                if (wrapperId) {
                    const wrapper = document.getElementById(wrapperId);
                    this._positionPanel(activePanel, wrapper);
                }
            }
        });
    },

    /**
     * _extractPanelsToBody — Extrae cada .glass-panel del header y lo mueve al body.
     * @description Resuelve el bug de Stacking Context: los paneles dentro del header
     * con z-index:100 no pueden superar ese nivel. Al moverlos al body, su z-index:2100
     * funciona correctamente sobre todos los elementos.
     */
    _extractPanelsToBody() {
        const panels = document.querySelectorAll('.app-header .glass-panel');
        panels.forEach(panel => {
            // Guardar referencia al wrapper padre original
            const wrapper = panel.closest('.dropdown-wrapper');
            if (wrapper) {
                panel.setAttribute('data-anchor-wrapper', wrapper.id || '');
                // Crear un ID único para vincular wrapper ↔ panel
                if (!wrapper.id) {
                    const uid = 'dw-' + panel.id;
                    wrapper.id = uid;
                    panel.setAttribute('data-anchor-wrapper', uid);
                }
            }
            // Mover al body
            document.body.appendChild(panel);
        });
    },

    /**
     * _positionPanel — Calcula la posición del panel relativa a su trigger.
     * @param {HTMLElement} panel - El panel a posicionar.
     * @param {HTMLElement} wrapper - El dropdown-wrapper trigger.
     */
    _positionPanel(panel, wrapper) {
        if (!panel || !wrapper) return;

        // ── MOBILE (≤767px): TODOS los paneles usan bottom sheet ──
        // CSS maneja la posición fija en la parte inferior.
        // Solo limpiamos estilos inline para que CSS tome control.
        if (window.innerWidth <= 767) {
            panel.style.position = '';
            panel.style.top = '';
            panel.style.left = '';
            panel.style.right = '';
            panel.style.bottom = '';
            return;
        }

        // ── DESKTOP: posicionamiento dinámico por coordenadas ──
        const rect = wrapper.getBoundingClientRect();
        const panelWidth = panel.offsetWidth || 340;

        // Posicionar debajo del trigger, alineado a la derecha
        let left = rect.right - panelWidth;

        // Evitar que se salga por la izquierda de la pantalla
        if (left < 8) left = 8;

        // Evitar que se salga por la derecha
        if (left + panelWidth > window.innerWidth - 8) {
            left = window.innerWidth - panelWidth - 8;
        }

        panel.style.position = 'fixed';
        panel.style.top = `${rect.bottom + 10}px`;
        panel.style.left = `${left}px`;
        panel.style.right = 'auto';
    },

    /**
     * Crea el overlay global para los paneles si no existe.
     */
    _createOverlay() {
        if (document.getElementById('panel-overlay')) return;
        const overlay = document.createElement('div');
        overlay.id = 'panel-overlay';
        overlay.className = 'panel-overlay';
        overlay.addEventListener('click', () => this.closeAllPanels());
        document.body.appendChild(overlay);
    },



    /**
     * _initTouchGestures — Sistema de gestos táctiles Edge-like para bottom sheets.
     * @description Compatible con iOS Safari, Android Chrome/Edge, cualquier táctil.
     */
    _initTouchGestures() {
        const THRESHOLD_RICH = 80;  // px para panel rico
        const THRESHOLD_SM = 60;  // px para paneles compactos
        const VELOCITY_THRESHOLD = 0.4; // px/ms — "flick" rápido

        let startY = 0;
        let currentY = 0;
        let startTime = 0;
        let isDragging = false;
        let activePanel = null;

        /**
         * touchstart — Registra inicio del gesto.
         * @param {TouchEvent} e - Evento de inicio táctil.
         */
        const onTouchStart = (e) => {
            if (window.innerWidth > 767) return;

            const panel = e.target.closest('.glass-panel.active');
            if (!panel) return;

            // No activar swipe si el scroll interno está activo
            const scrollArea = panel.querySelector('.panel-scroll-area');
            if (scrollArea && scrollArea.scrollTop > 8) return;

            startY = e.touches[0].clientY;
            currentY = startY;
            startTime = Date.now();
            isDragging = true;
            activePanel = panel;

            // Quitar transición CSS → movimiento 1:1 con el dedo
            activePanel.style.transition = 'none';
        };

        /**
         * touchmove — El panel sigue el dedo visualmente.
         * @param {TouchEvent} e - Evento de movimiento táctil.
         */
        const onTouchMove = (e) => {
            if (!isDragging || !activePanel) return;

            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            if (deltaY > 0) {
                // Resistencia progresiva: sensación natural
                const drag = deltaY * 0.65;
                activePanel.style.transform = `translateY(${drag}px)`;
                e.preventDefault(); // evitar scroll del body
            } else if (deltaY < -10) {
                // Swipe hacia arriba: cancelar
                activePanel.style.transition = '';
                activePanel.style.transform = 'translateY(0)';
                isDragging = false;
                activePanel = null;
            }
        };

        /**
         * touchend — Decide cerrar o snap-back por umbral O velocidad.
         */
        const onTouchEnd = () => {
            if (!isDragging || !activePanel) return;

            const deltaY = currentY - startY;
            const elapsed = Date.now() - startTime;
            const velocity = elapsed > 0 ? deltaY / elapsed : 0;

            const isRich = activePanel.classList.contains('glass-panel--rich');
            const threshold = isRich ? THRESHOLD_RICH : THRESHOLD_SM;
            const shouldClose = deltaY >= threshold || velocity >= VELOCITY_THRESHOLD;

            activePanel.style.transition = ''; // restaurar CSS transition
            const panelRef = activePanel;

            if (shouldClose) {
                panelRef.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    panelRef.style.transform = '';
                    this.closeAllPanels();
                }, 320);
            } else {
                panelRef.style.transform = 'translateY(0)';
            }

            isDragging = false;
            activePanel = null;
        };

        /**
         * touchcancel: sistema cancela el toque (llamada, notif) → snap back
         */
        const onTouchCancel = () => {
            if (isDragging && activePanel) {
                activePanel.style.transition = '';
                activePanel.style.transform = 'translateY(0)';
            }
            isDragging = false;
            activePanel = null;
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
        document.addEventListener('touchcancel', onTouchCancel, { passive: true });
    },

    /**
     * openPanel — Abre un panel y lo posiciona relativo a su trigger.
     * @param {string} panelId - ID del panel a abrir.
     * @param {HTMLElement} triggerWrapper - El .dropdown-wrapper que lo activó.
     */
    openPanel(panelId, triggerWrapper) {
        this.closeAllPanels();
        const panel = document.getElementById(panelId);
        if (!panel) return;

        // Posicionar antes de mostrar
        if (triggerWrapper) {
            this._positionPanel(panel, triggerWrapper);
            triggerWrapper.classList.add('panel-open');
        }

        panel.classList.add('active');
        this.checkQCArrows();

        const overlay = document.getElementById('panel-overlay');
        if (overlay && window.innerWidth <= 767) {
            overlay.classList.add('active');
        }
    },

    /**
     * Cierra todos los paneles activos y oculta el overlay.
     */
    closeAllPanels() {
        document.querySelectorAll('.glass-panel.active').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.dropdown-wrapper.panel-open').forEach(w => w.classList.remove('panel-open'));
        const overlay = document.getElementById('panel-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    /**
     * Alterna la visibilidad de un panel.
     * @param {string} panelId - ID del panel.
     * @param {HTMLElement} trigger - El elemento que disparó la acción.
     */
    togglePanel(panelId, trigger) {
        const panel = document.getElementById(panelId);
        const wrapper = trigger.closest('.dropdown-wrapper');

        if (panel && panel.classList.contains('active')) {
            this.closeAllPanels();
        } else {
            this.openPanel(panelId, wrapper);
        }
    },

    /**
     * Genera el HTML del Header.
     * @returns {string} El HTML del componente.
     */
    render() {
        const state = uiState.get();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const logoSrc = `/assets/icons/logo-${currentTheme === 'dark' ? 'light' : 'dark'}.svg`;
        const tierCode = state.graphics?.tier?.toUpperCase() || 'L1';
        const fps = state.graphics?.fps || '--';

        return `
            <header class="app-header navbar navbar-expand-lg navbar-light header--glass p-0">
                <div class="container-fluid px-3">
                    <div class="d-flex align-items-center gap-3">
                        <a href="/" class="navbar-brand d-flex align-items-center gap-2 m-0 p-0">
                            <img id="app-logo" src="${logoSrc}" alt="Logo BUCA" class="logo-img" style="width: 32px;">
                            <div class="brand-text-group d-none d-sm-flex flex-column">
                                <span class="brand-title h6 fw-bold text-primary mb-0" style="font-family: 'Outfit', sans-serif;">B.U.C.A</span>
                                <span class="brand-subtitle text-muted" style="font-size: 0.6rem; letter-spacing: 1px;">ERP SYSTEM</span>
                            </div>
                        </a>
                        
                        <!-- Saludo Dinámico (Solo en Desktop) -->
                        <div class="d-none d-xl-block">
                            <div class="layout-greeting py-1 px-3 border rounded-pill">
                                <span class="greeting-text small text-muted">BUEN DÍA, <strong class="text-primary text-uppercase">DAISY</strong></span>
                            </div>
                        </div>
                    </div>

                    <div class="header-right d-flex align-items-center gap-2 gap-md-3">
                        <!-- Cápsula de Acciones Compacta -->
                        <div class="header-actions-capsule d-flex align-items-center gap-1 p-1 rounded-pill border">
                            <button class="btn btn-sm btn-icon rounded-circle d-lg-none" data-action="ui:toggle_theme" title="Tema">
                                <i class="bi bi-moon-stars-fill"></i>
                            </button>
                            
                            <button class="btn btn-sm btn-icon rounded-circle d-lg-none" data-action="ui:open_performance" title="Performance">
                                <i class="bi bi-speedometer2"></i>
                            </button>

                            <div class="dropdown-wrapper position-relative" id="dw-panel-notifications">
                                <button class="btn btn-sm btn-icon rounded-circle position-relative" data-action="header:toggle_panel" data-target="panel-notifications">
                                    <i class="bi bi-bell-fill"></i>
                                    <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle" style="width: 8px; height: 8px;"></span>
                                </button>
                                ${NotificationsPanel.render()}
                            </div>
                        </div>

                        <!-- Motor & Tasa (Solo Desktop/Tablet) -->
                        <div class="d-none d-md-flex align-items-center gap-2">
                            <div class="glass-pill d-flex align-items-center gap-2 px-3 py-1 rounded-pill border clickable" data-action="ui:open_performance">
                                <i class="bi bi-cpu text-primary"></i>
                                <div class="d-flex flex-column">
                                    <span class="small fw-bold" id="header-engine-status">${tierCode}</span>
                                    <span class="text-muted" style="font-size: 0.65rem;">${fps} FPS</span>
                                </div>
                            </div>
                            
                            <div class="glass-pill d-none d-lg-flex align-items-center gap-2 px-3 py-1 rounded-pill border clickable" data-action="ui:open_rate">
                                <i class="bi bi-currency-exchange text-success"></i>
                                <div class="d-flex flex-column">
                                    <span class="small fw-bold">Bs. 475.96</span>
                                    <span class="text-muted" style="font-size: 0.65rem;">TASA BCV</span>
                                </div>
                            </div>
                        </div>

                        <!-- Perfil -->
                        <div class="dropdown-wrapper" id="dw-panel-profile">
                            <div class="d-flex align-items-center gap-2 ps-2 clickable" data-action="header:toggle_panel" data-target="panel-profile">
                                <div class="user-avatar-circle bg-primary text-white d-flex align-items-center justify-content-center rounded-circle position-relative" style="width: 38px; height: 38px; font-weight: 800;">
                                    DT
                                    <span class="position-absolute bottom-0 end-0 p-1 bg-success border border-light rounded-circle" style="width: 10px; height: 10px;"></span>
                                </div>
                                <div class="d-none d-lg-flex flex-column">
                                    <span class="small fw-bold lh-1 text-primary">Admin</span>
                                    <span class="text-muted" style="font-size: 0.65rem;">DEPARTAMENTO <i class="bi bi-chevron-down ms-1"></i></span>
                                </div>
                            </div>
                            ${ProfilePanel.render(tierCode)}
                        </div>
                    </div>
                </div>
            </header>
        `;
    },

    /**
     * handleFooterAction — Maneja acciones del footer con lógica de doble toque en móvil.
     * @param {HTMLElement} btn - El botón presionado.
     * @param {Function} action - La función a ejecutar.
     */
    handleFooterAction(btn, action) {
        // En desktop: ejecución directa
        if (window.innerWidth > 767) {
            action();
            return;
        }

        // En mobile: lógica de expansión (1er toque) y ejecución (2do toque)
        if (btn.classList.contains('touch-active')) {
            action();
            btn.classList.remove('touch-active');
        } else {
            // Limpiar otros botones activos en el footer
            document.querySelectorAll('.footer-action.touch-active').forEach(b => b.classList.remove('touch-active'));
            // Activar este botón
            btn.classList.add('touch-active');
        }
    },

    /**
     * Alterna el modo de pantalla completa.
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => { });
        } else {
            document.exitFullscreen().catch(() => { });
        }
        this.closeAllPanels();
    },

    /**
     * Desplaza horizontalmente los controles rápidos (QC).
     * @param {number} amount - Cantidad de píxeles a desplazar.
     */
    scrollQC(amount) {
        const container = document.getElementById('qc-scroll-container');
        if (container) {
            container.scrollBy({ left: amount, behavior: 'smooth' });
            setTimeout(() => this.checkQCArrows(), 350);
        }
    },

    /**
     * Verifica y actualiza la visibilidad de las flechas de desplazamiento de QC.
     */
    checkQCArrows() {
        const container = document.getElementById('qc-scroll-container');
        const arrowL = document.querySelector('.qc-arrow--left');
        const arrowR = document.querySelector('.qc-arrow--right');

        if (!container || !arrowL || !arrowR) return;

        const hasOverflow = container.scrollWidth > container.clientWidth;

        if (!hasOverflow) {
            arrowL.style.display = 'none';
            arrowR.style.display = 'none';
        } else {
            arrowL.style.display = 'flex';
            arrowR.style.display = 'flex';
            arrowL.style.opacity = container.scrollLeft > 10 ? '1' : '0.3';
            arrowR.style.opacity = (container.scrollLeft + container.clientWidth) < (container.scrollWidth - 10) ? '1' : '0.3';
        }
    },

    /** 
     * updateEngineUI — Actualiza los badges de rendimiento en el header y perfil.
     * @param {Object} data - Datos provenientes de buca:performance_change
     */
    updateEngineUI(data) {
        const headerStatus = document.getElementById('header-engine-status');
        const profileBadge = document.getElementById('profile-engine-badge');
        const tierCode = data.id || 'L1';
        const tierId = data.tier || 'balanced';

        if (headerStatus) headerStatus.textContent = tierCode;
        if (profileBadge) {
            profileBadge.textContent = tierCode;
            profileBadge.className = 'badge ' + this._getBadgeClassForTier(tierId);
        }
        
        // Sincronización adicional para el widget del header principal
        const headerPill = document.getElementById('header-engine-status');
        if (headerPill) headerPill.textContent = tierCode;
    },

    /**
     * Obtiene la clase CSS del badge según el tier de rendimiento.
     * @param {string} tierId - ID del tier (eco, balanced, etc).
     * @returns {string} Clase CSS.
     */
    _getBadgeClassForTier(tierId) {
        const map = {
            'eco': 'badge--eco',
            'balanced': 'badge--balanced',
            'pro': 'badge--pro',
            'ultra': 'badge--ultra'
        };
        return map[tierId] || 'badge--balanced';
    },

    /**
     * toggleSearch — Delega la apertura del buscador al componente de Workspace.
     * @param {boolean} active - Si se debe activar o desactivar.
     */
    toggleSearch(active) {
        if (window.toggleWorkspaceSearch) {
            window.toggleWorkspaceSearch(active);
        }
    },

    /**
     * Vincula eventos de búsqueda (reservado para futuras expansiones).
     */
    _bindSearchEvents() {
        // La lógica de búsqueda ahora reside en Workspace.js o globalmente vinculado al nuevo input
    }
};
