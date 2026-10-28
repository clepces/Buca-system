/**
 * Componente Workspace — BUCA Business Hub
 * =========================================================================
 * Gestiona el área principal de trabajo, implementando la visualización
 * de negocios, estadísticas y accesos rápidos premium.
 * =========================================================================
 */
import { BusinessHub } from '@/shared/ui/components/hub/BusinessHub.js';
import { eventBus } from '@/core/eventBus/index.js';

export const Workspace = {
    /** @type {string} Nombre de usuario mock */
    userName: 'Daisy', 

    /**
     * Inicializa el Workspace inyectando el Nav Ribbon y renderizando componentes.
     * @returns {void}
     */
    init() {
        const workspaceInternal = document.querySelector('.workspace-internal');
        const navSlot = document.getElementById('workspace-nav-slot');
        if (!workspaceInternal || !navSlot) return;

        // Evitar doble inicialización
        if (document.getElementById('workspace-premium')) return;

        // Inyectar el Navigation Ribbon en el slot dedicado
        this.renderNav(navSlot);

        // Inyectar el nuevo contenedor premium antes del legado
        const premiumContainer = document.createElement('div');
        premiumContainer.id = 'workspace-premium';
        premiumContainer.className = 'workspace-premium';

        workspaceInternal.prepend(premiumContainer);

        const currentPath = window.location.pathname;
        const isHome = currentPath === '/' || currentPath === '/workspace' || currentPath === '/workspaces';
        premiumContainer.style.display = isHome ? 'block' : 'none';

        if (!this._routeSubscribed) {
            eventBus.on('router:changed', ({ path }) => {
                const premium = document.getElementById('workspace-premium');
                if (premium) {
                    const home = path === '/' || path === '/workspace' || path === '/workspaces';
                    premium.style.display = home ? 'block' : 'none';
                }
            });
            this._routeSubscribed = true;
        }

        this.renderStats();
        this.renderBusiness();
        this._bindEvents();
    },

    /**
     * Renderiza el listón de navegación superior del workspace.
     * @param {HTMLElement} container - Contenedor donde se inyectará el nav.
     * @returns {void}
     */
    renderNav(container) {
        container.innerHTML = `
            <style>
                @media screen and (max-width: 400px) {
                    .workspace-context-actions {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 12px;
                    }
                    .nav-actions-group {
                        justify-content: space-between;
                        width: 100%;
                        overflow-x: auto;
                        padding-bottom: 4px;
                    }
                    .nav-actions-group::-webkit-scrollbar {
                        height: 2px;
                    }
                    .nav-actions-group::-webkit-scrollbar-thumb {
                        background: var(--border-glass);
                        border-radius: 4px;
                    }
                    .breadcrumb-trail {
                        display: none; /* Ocultar migas de pan en móviles para ganar espacio */
                    }
                }
            </style>
            <div class="workspace-navigation-ribbon">
                <div class="container-max ribbon-content">
                    <div class="breadcrumb-trail">
                        <div class="crumb" data-action="kernel:navigate" data-payload='{"view": "dashboard"}'>
                            <i class="bi bi-house-door"></i>
                            <span>Workspace</span>
                        </div>
                        <div class="crumb-separator"><i class="bi bi-chevron-right"></i></div>
                        <div class="crumb active">
                            <span>Panel de Control</span>
                        </div>
                    </div>

                    <div class="workspace-context-actions">
                        <div class="nav-actions-group">
                            <div class="context-pill active" data-action="ui:filter_business" data-payload='{"type": "all"}'>Mis Negocios</div>
                            <div class="context-pill" data-action="ui:filter_business" data-payload='{"type": "directory"}'>Directorio</div>
                        </div>

                        <div class="nav-actions-group">
                            <!-- Buscador Neural (Icono expansivo) -->
                            <div class="ws-search-capsule" id="ws-search-wrapper">
                                <button class="ws-search-trigger" data-action="workspace:toggle_search" data-payload='{"active": true}' title="Buscar (Ctrl+K)">
                                    <i class="bi bi-search"></i>
                                </button>
                                <div class="ws-search-input-group">
                                    <input type="text" id="ws-global-search" placeholder="¿Qué estás buscando?">
                                    <button class="ws-search-close" data-action="workspace:toggle_search" data-payload='{"active": false}'>
                                        <i class="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <button class="action-mini-pill" title="Notificaciones Centrales" data-action="ui:open_notifications">
                                <i class="bi bi-bell"></i>
                            </button>

                            <button class="action-mini-pill" title="Exportar Reporte Mensual" data-action="ui:export_report">
                                <i class="bi bi-cloud-download"></i>
                            </button>

                            <button class="action-mini-pill" title="Configuración del Workspace" data-action="ui:open_settings">
                                <i class="bi bi-sliders2"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza estadísticas rápidas (reservado para expansión).
     * @returns {void}
     */
    renderStats() {
        const container = document.getElementById('workspace-premium');
        if (!container) return;

        // La franja de estadísticas ahora es opcional o se usa para métricas más detalladas
        // Por ahora, solo renderizamos el HUB de negocios directamente
    },

    /**
     * Renderiza la sección de HUB de Negocios con el carrusel.
     * @returns {void}
     */
    renderBusiness() {
        const container = document.getElementById('workspace-premium');
        if (!container) return;

        container.innerHTML = `
            <!-- ADVANCED TELEMETRY STRIP -->
            ${this._renderTelemetryStrip()}

            <!-- BUSINESS HUB -->
            ${BusinessHub.render()}
        `;
    },

    /**
     * Genera el HTML para la franja de telemetría premium.
     * @private
     * @returns {string} HTML de la franja.
     */
    _renderTelemetryStrip() {
        return `
            <div class="telemetry-premium-strip">
                <div class="telemetry-items">
                    <div class="telemetry-card" title="Ventas Totales Proyectadas">
                        <div class="t-icon bg-blue-glow"><i class="bi bi-graph-up-arrow"></i></div>
                        <div class="t-data">
                            <span class="t-label">Ventas Hoy</span>
                            <span class="t-value">Bs. 42.500,00</span>
                            <span class="t-trend up">+15.2% <i class="bi bi-caret-up-fill"></i></span>
                        </div>
                    </div>

                    <div class="telemetry-card" title="Unidades de Negocio Activas">
                        <div class="t-icon bg-purple-glow"><i class="bi bi-building"></i></div>
                        <div class="t-data">
                            <span class="t-label">Unidades</span>
                            <span class="t-value">12 Activas</span>
                            <span class="t-trend neutral">Estable <i class="bi bi-dash"></i></span>
                        </div>
                    </div>

                    <div class="telemetry-card" title="Personal en Turno">
                        <div class="t-icon bg-green-glow"><i class="bi bi-people"></i></div>
                        <div class="t-data">
                            <span class="t-label">Staff Online</span>
                            <span class="t-value">24 Operativos</span>
                            <span class="t-trend pulse-success">En línea <i class="bi bi-circle-fill"></i></span>
                        </div>
                    </div>

                    <div class="telemetry-card" title="Pedidos pendientes de despacho">
                        <div class="t-icon bg-orange-glow"><i class="bi bi-cart-check"></i></div>
                        <div class="t-data">
                            <span class="t-label">Despachos</span>
                            <span class="t-value">8 Pendientes</span>
                            <span class="t-trend warning">Atención req. <i class="bi bi-exclamation-triangle"></i></span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },



    /**
     * Genera el HTML para una acción rápida.
     * @private
     * @param {string} label - Etiqueta de la acción.
     * @param {string} icon - Icono de Bootstrap.
     * @param {string} color - Clase de color.
     * @returns {string} HTML de la acción.
     */
    _renderQuickAction(label, icon, color) {
        return `
            <div class="quick-action-item qa--${color}" data-action="workspace:quick_action" data-payload='{"label": "${label}"}'>
                <div class="qa-icon-box">
                    <i class="bi ${icon}"></i>
                </div>
                <span class="qa-label">${label}</span>
            </div>
        `;
    },

    /**
     * Vincula los eventos interactivos del Workspace.
     * @private
     * @returns {void}
     */
    _bindEvents() {
        /**
         * Alterna la visibilidad del buscador expansivo.
         * @param {boolean} active - Si se debe activar.
         */
        window.toggleWorkspaceSearch = (active) => {
            const wrapper = document.getElementById('ws-search-wrapper');
            const input = document.getElementById('ws-global-search');
            if (!wrapper) return;

            if (active) {
                wrapper.classList.add('active');
                setTimeout(() => input?.focus(), 150);
            } else {
                wrapper.classList.remove('active');
                if (input) input.value = '';
            }
        };

        const wsSearchInput = document.getElementById('ws-global-search');
        if (wsSearchInput) {
            wsSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') window.toggleWorkspaceSearch(false);
                if (e.key === 'Enter') {
                    alert(`Buscando en Workspace: ${wsSearchInput.value}`);
                    window.toggleWorkspaceSearch(false);
                }
            });
        }

        // Drag & Touch scroll para el carrusel
        const carousel = document.querySelector('.business-carousel');
        if (carousel) {
            let isDown = false;
            let startX;
            let scrollLeft;

            carousel.addEventListener('mousedown', (e) => {
                isDown = true;
                carousel.classList.add('active');
                startX = e.pageX - carousel.offsetLeft;
                scrollLeft = carousel.scrollLeft;
            });
            carousel.addEventListener('mouseleave', () => {
                isDown = false;
                carousel.classList.remove('active');
            });
            carousel.addEventListener('mouseup', () => {
                isDown = false;
                carousel.classList.remove('active');
            });
            carousel.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - carousel.offsetLeft;
                const walk = (x - startX) * 2;
                
                if (Math.abs(walk) > 10) {
                    carousel.dataset.isDragging = 'true';
                }
                
                carousel.scrollLeft = scrollLeft - walk;
            });

            // Touch gestures para dispositivos móviles
            let touchStartX = 0;
            let touchScrollLeft = 0;
            carousel.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    touchStartX = e.touches[0].pageX - carousel.offsetLeft;
                    touchScrollLeft = carousel.scrollLeft;
                }
            }, { passive: true });

            carousel.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1) {
                    const x = e.touches[0].pageX - carousel.offsetLeft;
                    const walk = (x - touchStartX);
                    if (Math.abs(walk) > 8) {
                        carousel.dataset.isDragging = 'true';
                    }
                }
            }, { passive: true });

            carousel.addEventListener('touchend', () => {
                if (carousel.dataset.isDragging === 'true') {
                    setTimeout(() => {
                        carousel.dataset.isDragging = 'false';
                    }, 100);
                }
            }, { passive: true });

            // Evitar que el clic se dispare si se estaba arrastrando
            carousel.addEventListener('click', (e) => {
                if (carousel.dataset.isDragging === 'true') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    carousel.dataset.isDragging = 'false';
                }
            }, true); // Capture phase para interceptar antes que los botones internos
        }

        // Atajo de teclado global Ctrl+K / Cmd+K para el buscador del Workspace
        if (!this._keyShortcutBound) {
            window.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
                    e.preventDefault();
                    const wrapper = document.getElementById('ws-search-wrapper');
                    const isActive = wrapper?.classList.contains('active');
                    window.toggleWorkspaceSearch(!isActive);
                }
            });
            this._keyShortcutBound = true;
        }

        // Suscripción desacoplada a acciones del Workspace via EventBus
        if (!this._workspaceActionsBound) {
            eventBus.on('workspace:scroll_carousel', ({ direction }) => {
                const carousel = document.getElementById('business-carousel-main');
                if (!carousel) return;
                const scrollAmount = 352;
                carousel.scrollBy({ left: direction === 'prev' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
            });

            eventBus.on('workspace:toggle_search', ({ active }) => {
                window.toggleWorkspaceSearch(active);
            });

            eventBus.on('workspace:quick_action', ({ label }) => {
                alert(`Abriendo ${label}...`);
            });

            this._workspaceActionsBound = true;
        }

        /**
         * Desplaza el carrusel de negocios.
         * @param {string} direction - 'prev' o 'next'.
         */
        window.scrollCarousel = (direction) => {
            const carousel = document.getElementById('business-carousel-main');
            if (!carousel) return;
            
            const scrollAmount = 352; // Ancho tarjeta (320) + gap (32)
            if (direction === 'prev') {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        };
    }
};

window.Workspace = Workspace;
