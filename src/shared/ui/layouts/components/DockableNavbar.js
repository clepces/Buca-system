import { eventBus } from '@/core/eventBus/index.js';

/**
 * Dock Premium - Reference: animation-dock.gif
 * =========================================================================
 * Implementa el efecto de "Curva Negativa" y "Corte de Círculo" flotante.
 * =========================================================================
 */
export const Dock = {
    state: {
        currentContext: 'main',
        activePath: window.location.pathname,
        activeIndex: 0
    },

    navMaps: {
        main: [
            { id: 'modules', icon: 'bi-grid-fill', action: 'dock:switch-context', payload: { context: 'modules' }, hasContext: true },
            { id: 'business', icon: 'bi-layers-fill', action: 'ui:enter_business', payload: { id: 'Dashboard' } },
            { id: 'home', icon: 'bi-house-door-fill', action: 'router:navigate', payload: { path: '/' } },
            { id: 'people', icon: 'bi-people-fill', action: 'dock:switch-context', payload: { context: 'people' }, hasContext: true },
            { id: 'settings', icon: 'bi-gear-fill', action: 'ui:open_settings' }
        ],
        modules: [
            { id: 'back', icon: 'bi-arrow-left-short', action: 'dock:switch-context', payload: { context: 'main' } },
            { id: 'clients', icon: 'bi-person-badge', action: 'router:navigate', payload: { path: '/clients' } },
            { id: 'providers', icon: 'bi-truck', action: 'router:navigate', payload: { path: '/providers' } },
            { id: 'inventory', icon: 'bi-box-seam', action: 'router:navigate', payload: { path: '/inventory' } },
            { id: 'pos', icon: 'bi-pc-display-horizontal', action: 'router:navigate', payload: { path: '/pos' } }
        ],
        people: [
            { id: 'back', icon: 'bi-arrow-left-short', action: 'dock:switch-context', payload: { context: 'main' } },
            { id: 'users', icon: 'bi-people', action: 'router:navigate', payload: { path: '/users' } },
            { id: 'roles', icon: 'bi-shield-lock', action: 'router:navigate', payload: { path: '/roles' } },
            { id: 'teams', icon: 'bi-diagram-3', action: 'router:navigate', payload: { path: '/teams' } }
        ]
    },

    init(containerId = 'dock-slot') {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (container.querySelector('.dock-container')) return;

        this.renderTo(container);
        if (!this._eventsBound) {
            this._bindEvents();
            this._eventsBound = true;
        }
        
        // Posición inicial de la curva
        setTimeout(() => this._updateCurve(this.state.activeIndex), 100);
    },

    renderTo(container) {
        container.innerHTML = this.render();
    },

    _bindEvents() {
        document.addEventListener('click', (e) => {
            const trigger = e.target.closest('.dock-item');
            if (!trigger) return;

            const index = parseInt(trigger.getAttribute('data-index'));
            const action = trigger.getAttribute('data-action');
            const payload = trigger.getAttribute('data-payload');
            const data = payload ? JSON.parse(payload) : {};

            // Solo actualizar UI si no es un cambio de contexto (que re-renderea)
            if (action !== 'dock:switch-context') {
                document.querySelectorAll('.dock-item').forEach(el => el.classList.remove('active'));
                trigger.classList.add('active');
                this._updateCurve(index);
                this.state.activeIndex = index;
            }

            if (action === 'dock:switch-context') {
                this.switchContext(data.context);
                return;
            }

            // Nota: Kernel despacha centralizadamente [data-action] hacia el EventBus
        });
    },

    _updateCurve(index) {
        const curve = document.querySelector('.curve-container');
        const dock = document.querySelector('.dock');
        if (!curve || !dock) return;

        const items = dock.querySelectorAll('.dock-item');
        const totalItems = items.length;
        
        // Cálculo de posición porcentual para centrado exacto
        const itemWidthPercent = 100 / totalItems;
        const pos = (index * itemWidthPercent) + (itemWidthPercent / 2);
        
        curve.style.left = `calc(${pos}% - 55px)`;
    },

    switchContext(newContext) {
        if (!this.navMaps[newContext]) return;
        
        this.state.currentContext = newContext;
        const dockContainer = document.querySelector('.dock-container');
        
        if (dockContainer) {
            dockContainer.classList.add('dock-context-transition');
            this.renderTo(document.getElementById('dock-slot'));
            
            // Re-centrar curva tras el re-render
            setTimeout(() => {
                this._updateCurve(0); 
                dockContainer.classList.remove('dock-context-transition');
            }, 300);
        }
    },

    _renderItems() {
        const items = this.navMaps[this.state.currentContext];
        return items.map((item, index) => `
            <button class="dock-item ${this.state.activeIndex === index ? 'active' : ''}" 
                    data-action="${item.action}" 
                    data-index="${index}"
                    data-payload='${JSON.stringify(item.payload || {})}'>
                <i class="${item.icon}"></i>
                <span class="small d-none d-lg-block">${item.id.charAt(0).toUpperCase() + item.id.slice(1)}</span>
            </button>
        `).join('');
    },

    render() {
        return `
            <div class="dock-slot d-flex align-items-end justify-content-center">
                <nav class="dock-container" aria-label="Navegación principal">
                    <div class="dock-nav-wrapper">
                        <div class="curve-container">
                            <div class="curve-left"></div>
                            <div class="curve-right"></div>
                        </div>
                        <div class="dock" id="dock-scrollable">
                            ${this._renderItems()}
                        </div>
                    </div>
                </nav>
            </div>
        `;
    }
};

export default Dock;
