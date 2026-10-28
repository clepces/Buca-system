/**
 * Router - Orquestador de Navegación BNE
 * =========================================================================
 * Gestiona el cambio de vistas sin recarga, integrándose con el 
 * ModuleLoader para carga dinámica de componentes.
 * =========================================================================
 */
import ModuleLoader from '@/core/ModuleLoader.js';
import { eventBus } from '@/core/eventBus/index.js';

class Router {
    constructor() {
        this.routes = [];
        this.currentPath = window.location.pathname;
        this.prevPath = null;
        this.currentRoute = null;
        
        // Escuchar el evento de navegación del navegador (atrás/adelante)
        window.onpopstate = () => this.handleRouteChange();

        // Interceptar clics en enlaces globales para navegación SPA
        this.#setupLinkInterceptor();
    }

    /**
     * Inicializa el router con un mapa base de rutas.
     * @param {Array<Object>} globalRoutes - Lista inicial de rutas base.
     * @returns {void}
     */
    init(globalRoutes) {
        // Combinar rutas globales con las ya registradas por módulos
        this.routes = [...(this.routes || []), ...globalRoutes];
        this.handleRouteChange();
        console.log('[Router] -> Sistema de navegación activo');
    }

    /**
     * Registra nuevas rutas dinámicamente (usado por módulos).
     * @param {Array<Object>} newRoutes - Nuevas rutas a incorporar.
     * @returns {void}
     */
    addRoutes(newRoutes) {
        this.routes = [...this.routes, ...newRoutes];
        // Eliminamos handleRouteChange de aquí para evitar dobles llamadas 
        // durante la carga inicial de módulos. El Kernel llamará a init() al final.
    }

    /**
     * Navega a una nueva ruta de forma programática.
     * @param {string} path - URL de destino.
     * @returns {Promise<void>}
     */
    async navigate(path) {
        if (path === this.currentPath) return;
        
        // Antes de navegar, podemos verificar guardias si es necesario
        // pero handleRouteChange lo hará centralizadamente.
        
        window.history.pushState({}, '', path);
        await this.handleRouteChange();
    }

    /**
     * Intercepta clics en etiquetas <a> para evitar recargas.
     * @private
     * @returns {void}
     */
    #setupLinkInterceptor() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            const target = link.getAttribute('target');

            // Solo interceptar enlaces internos, con href válido y sin target="_blank"
            if (href && href.startsWith('/') && !href.startsWith('//') && target !== '_blank') {
                e.preventDefault();
                this.navigate(href);
            }
        });
    }

    /**
     * Procesa el cambio de ruta y renderiza el componente.
     * @async
     * @returns {Promise<void>}
     */
    async handleRouteChange() {
        const path = window.location.pathname;
        this.currentPath = path;
        
        // 1. Intentar coincidencia exacta
        let route = this.routes.find(r => r.path === path);
        
        // 2. Si no hay coincidencia exacta y es una ruta de workspace (no /auth), 
        // intentar cargar el módulo workspace si no está cargado.
        if (!route && !path.startsWith('/auth') && !ModuleLoader.isLoaded('workspace')) {
            console.log(`[Router] -> Ruta "${path}" no encontrada. Intentando carga dinámica: workspace...`);
            await ModuleLoader.load('workspace');
            route = this.routes.find(r => r.path === path);
        }

        // 3. Fallback al wildcard '*' si aún no hay ruta
        if (!route) {
            route = this.routes.find(r => r.path === '*');
        }

        // --- MANEJO DE ERRORES Y GUARDIAS ---
        if (route && route.requiresAuth) {
            const { RouterGuards } = await import('./guards.js');
            if (!RouterGuards.requiresAuth()) {
                console.warn('[Router] -> 401 Unauthorized. Redirigiendo a login...');
                return this.navigate('/auth/login');
            }
        }

        // Si la ruta no existe, mostrar 404
        if (!route) {
            console.error(`[Router] -> 404 Not Found: ${path}`);
            return this.#renderError('404');
        }

        console.log(`[Router] -> Navegando a: ${path}`);

        // Emitir evento previo para que el Kernel pueda anticipar cambios de layout
        const isAuth = path.startsWith('/auth');
        const needsLayoutSwitch = this.prevPath && (isAuth !== this.prevPath.startsWith('/auth'));
        
        eventBus.emit('router:before-change', { path, route });
        
        // --- SINCRONIZACIÓN DE LAYOUT ---
        if (needsLayoutSwitch) {
            console.log('[Router] -> Detectado cambio de layout. Esperando al Kernel...');
            await new Promise(resolve => {
                const timeout = setTimeout(resolve, 1000); // Fail-safe 1s
                eventBus.once('kernel:layout-ready', () => {
                    clearTimeout(timeout);
                    resolve();
                });
            });
        }

        const getSlot = () => {
            if (isAuth) return document.getElementById('auth-content-slot');
            return document.getElementById('workspace-dynamic-content') || document.getElementById('app');
        };

        let contentSlot = getSlot();

        // Si el slot sigue sin existir, intentar un pequeño reintento final
        if (!contentSlot) {
            await new Promise(resolve => setTimeout(resolve, 100)); 
            contentSlot = getSlot();
        }
        
        if (contentSlot) {
            // Limpiar animaciones previas para re-disparar
            contentSlot.classList.remove('view-enter');
            
            // Animación de salida si ya hay contenido (Transición fluida)
            if (contentSlot.innerHTML.trim() !== '') {
                contentSlot.classList.add('view-exit');
                await new Promise(resolve => setTimeout(resolve, 250)); // Duración de view-fade-out-down
                contentSlot.classList.remove('view-exit');
            }

            void contentSlot.offsetWidth; // Force reflow
            
            // Desmontar vista previa si implementa destroy/unmount
            if (this.currentRoute?.component) {
                try {
                    if (typeof this.currentRoute.component.destroy === 'function') {
                        this.currentRoute.component.destroy();
                    } else if (typeof this.currentRoute.component.unmount === 'function') {
                        this.currentRoute.component.unmount();
                    }
                } catch (err) {
                    console.error('[Router] Error al desmontar vista previa:', err);
                }
            }
            this.currentRoute = route;

            // Inyectar el componente
            if (route.component && typeof route.component.render === 'function') {
                contentSlot.innerHTML = route.component.render();
                
                // Aplicar animación de entrada
                contentSlot.classList.add('view-enter');

                if (typeof route.component.init === 'function') {
                    // Evitar dependencias cíclicas y limpiar promesas innecesarias
                    route.component.init();
                }
            }
        } else {
            console.error('[Router] -> Error Crítico: No se encontró un contenedor de renderizado válido.');
        }

        this.prevPath = path;
        eventBus.emit('router:changed', { path, route });
    }

    /**
     * Renderiza una vista de error específica.
     * @private
     * @async
     * @param {string} code - Código de error (404, 401, 403).
     * @returns {Promise<void>}
     */
    async #renderError(code) {
        try {
            // Carga dinámica de la página de error para ahorrar bundle inicial
            // Nota: Aquí se asume que las páginas de error están en shared/pages/
            const { default: ErrorPage } = await import(`../../shared/pages/Error${code}.js`);
            
            const contentSlot = document.getElementById('workspace-dynamic-content') || 
                               document.getElementById('auth-content-slot') || 
                               document.getElementById('app');
            
            if (contentSlot) {
                contentSlot.innerHTML = ErrorPage.render();
                if (ErrorPage.init) ErrorPage.init();
            }
        } catch (err) {
            console.error(`[Router] Error al cargar la vista de error ${code}:`, err);
            // Fallback ultra-básico si falla el import
            const app = document.getElementById('app');
            if (app) app.innerHTML = `<h1>Error ${code}</h1><p>Algo salió mal.</p>`;
        }
    }
}

export const router = new Router();
export default router;
