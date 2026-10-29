/**
 * EventBus - Sistema de comunicación desacoplado de grado empresarial
 * =========================================================================
 * Estructura modular ES6+ (2026).
 * 
 * MEJORAS GENERALES RESPECTO AL ORIGINAL:
 * 1. RENDIMIENTO O(1): Se migró de un objeto plano '{}' a 'Map' y 'Set' nativos. 
 *    Esto elimina las búsquedas secuenciales lentas (filtros de arrays) al desuscribir.
 * 2. PARAMETRIZACIÓN ROBUSTA: Reemplaza el parámetro único 'data' por el operador 
 *    Rest '...args' para permitir cualquier cantidad de argumentos.
 * 3. CONTROL DE ERRORES (AISLAMIENTO): Un suscriptor roto ya no interrumpe el flujo 
 *    de la aplicación ni detiene a los demás oyentes.
 */
class EventBus {
    constructor() {
        /**
         * MEJORA: Uso de 'Map' en lugar de un objeto literal '{}'.
         * BENEFICIO: Evita colisiones con propiedades heredadas del prototipo de JS 
         * (como 'toString' o 'watch') y ofrece un rendimiento significativamente más 
         * rápido en la inserción y borrado frecuente de eventos en aplicaciones masivas.
         */
        this.events = new Map();

        /**
         * MEJORA: Sistema de Tuberías Globales (Middlewares).
         * BENEFICIO: Permite interceptar, auditar, transformar o cancelar eventos globalmente 
         * antes de que lleguen a sus destinos (ideal para sistemas de logs, analíticas o seguridad).
         */
        this.middlewares = new Set();
    }

    /**
     * Registra un middleware global.
     * @param {Function} middleware Función interceptora: (event, ...args) => boolean|void
     * @returns {Function} Función para remover el middleware dinámicamente.
     */
    use(middleware) {
        if (typeof middleware !== 'function') {
            throw new TypeError('[EventBus] El middleware debe ser una función ejecutable.');
        }
        this.middlewares.add(middleware);
        return () => this.middlewares.delete(middleware);
    }

    /**
     * Suscribirse a un evento
     * @param {string} event Nombre del evento (Soporta nombres exactos o comodines con '*')
     * @param {Function} callback Función a ejecutar cuando se emita el evento
     * @returns {Function} Función de desuscripción limpia e inmediata (Limpieza atómica)
     */
    on(event, callback) {
        // MEJORA: Validación defensiva en tiempo de ejecución.
        // BENEFICIO: Falla rápido y con un error claro si un módulo intenta pasar un objeto en vez de una función.
        if (typeof callback !== 'function') {
            throw new TypeError('[EventBus] El callback debe ser una función.');
        }

        /**
         * MEJORA: Estructura interna basada en 'Set' en lugar de arrays '[]'.
         * BENEFICIO: El método '.has()' de Map comprueba la existencia de inmediato. 
         * Además, un 'Set' impide por diseño añadir el mismo callback duplicado por accidente.
         */
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);

        return () => this.off(event, callback);
    }

    /**
     * Suscribirse a un evento para que se ejecute una sola vez
     * @param {string} event Nombre del evento
     * @param {Function} callback Función a ejecutar
     * @returns {Function} Función de desuscripción
     */
    once(event, callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('[EventBus] El callback debe ser una función.');
        }

        /**
         * MEJORA: Wrapper con operador Rest '...args' y enlace de propiedad estática '.originalListener'.
         * BENEFICIO: Conserva la flexibilidad de recibir múltiples datos. Al enlazar la función 
         * original al wrapper, permite que el desarrollador pueda desuscribir el evento invocando 
         * directamente a 'off(event, callbackOriginal)', resolviendo una limitación del diseño básico.
         */
        const onceWrapper = (...args) => {
            this.off(event, onceWrapper);
            callback(...args);
        };

        onceWrapper.originalListener = callback;
        return this.on(event, onceWrapper);
    }

    /**
     * Desuscribirse de un evento
     * @param {string} event Nombre del evento
     * @param {Function} callback Función original o wrapper que se desea eliminar
     */
    off(event, callback) {
        const listeners = this.events.get(event);
        if (!listeners) return;

        /**
         * MEJORA: Eliminación directa en Set mediante '.delete()'.
         * BENEFICIO: En el código original se usaba '.filter()', lo cual obligaba a recorrer todo el array (O(N)). 
         * Con Set, la eliminación ocurre en tiempo constante O(1), optimizando drásticamente el rendimiento de la CPU.
         */
        if (listeners.delete(callback)) {
            // MEJORA: Recolección y liberación de memoria activa.
            // BENEFICIO: Si un evento ya no tiene escuchas, se elimina del mapa por completo, evitando fugas de memoria.
            if (listeners.size === 0) this.events.delete(event);
            return;
        }

        // Búsqueda de respaldo si lo que se intenta desuscribir es un evento registrado con .once()
        for (const listener of listeners) {
            if (listener.originalListener === callback) {
                listeners.delete(listener);
                break;
            }
        }

        if (listeners.size === 0) this.events.delete(event);
    }

    /**
     * Recupera de forma optimizada los suscriptores asociados, evaluando patrones comodín.
     * @private
     */
    _getListeners(event) {
        const matched = new Set();

        // 1. Coincidencia directa exacta O(1)
        if (this.events.has(event)) {
            this.events.get(event).forEach(cb => matched.add(cb));
        }

        /**
         * MEJORA: Sistema de resolución por comodines (Wildcards '*').
         * BENEFICIO: Permite que módulos transversales (como logs o analíticas) capturen múltiples 
         * eventos relacionados (ej: 'auth:*' atrapa 'auth:login' y 'auth:logout') usando expresiones regulares rápidas.
         */
        for (const [registeredEvent, listeners] of this.events.entries()) {
            if (registeredEvent.includes('*')) {
                const regexPattern = '^' + registeredEvent.replace(/\*/g, '.*') + '$';
                const regex = new RegExp(regexPattern);
                
                if (regex.test(event)) {
                    listeners.forEach(cb => matched.add(cb));
                }
            }
        }

        return [...matched];
    }

    /**
     * Ejecuta secuencialmente los middlewares registrados antes de procesar la emisión.
     * @private
     */
    _runMiddlewares(event, args) {
        for (const middleware of this.middlewares) {
            try {
                const result = middleware(event, ...args);
                if (result === false) return false; // Un middleware retornando false cancela el evento
            } catch (error) {
                console.error(`[EventBus] Error en Middleware al procesar "${event}":`, error);
            }
        }
        return true;
    }

    /**
     * Emitir un evento síncrono
     * @param {string} event Nombre del evento
     * @param {...any} args Datos ilimitados asociados al evento
     */
    emit(event, ...args) {
        // Ejecución de la capa de ciclo de vida (middlewares)
        if (!this._runMiddlewares(event, args)) return;

        const targets = this._getListeners(event);
        
        targets.forEach(callback => {
            /**
             * MEJORA: Auditoría de rendimiento con 'performance.now()'.
             * BENEFICIO: Monitorea la velocidad del hilo principal de JS. Si un suscriptor tarda más de 
             * 16.6ms (el equivalente a perder 1 frame de renderizado), emite una advertencia en consola para depuración.
             */
            const start = performance.now();
            try {
                /**
                 * MEJORA: Bloque de aislamiento seguro 'try / catch' e inyección múltiple '...args'.
                 * BENEFICIO: Si el Callback del 'Módulo A' falla críticamente por un error de código interno, 
                 * la excepción es capturada de forma segura. El 'Módulo B' y el resto de la aplicación continúan 
                 * su ejecución sin inmutarse ni colapsar.
                 */
                callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error crítico en el suscriptor de "${event}":`, error);
            } finally {
                const duration = performance.now() - start;
                if (duration > 16) {
                    console.warn(`[EventBus][Performance Warning] El suscriptor de "${event}" tardó ${duration.toFixed(2)}ms en responder.`);
                }
            }
        });
    }

    /**
     * MEJORA: Emisión de eventos Asíncronos paralelos concurrentes ('emitAsync').
     * BENEFICIO: Permite que el emisor use 'await eventBus.emitAsync()' y se detenga 
     * de forma garantizada hasta que todos los módulos asíncronos enlazados (peticiones HTTP, 
     * cargas de archivos, timers) terminen sus operaciones en segundo plano de manera exitosa.
     * @param {string} event Nombre del evento
     * @param {...any} args Datos ilimitados asociados
     */
    async emitAsync(event, ...args) {
        if (!this._runMiddlewares(event, args)) return;

        const targets = this._getListeners(event);
        
        // Mapea los objetivos concurrentemente transformándolos en un arreglo de promesas nativas
        const promises = targets.map(async (callback) => {
            try {
                await callback(...args);
            } catch (error) {
                console.error(`[EventBus] Error Asíncrono detectado en "${event}":`, error);
            }
        });

        // Espera a que todas las operaciones paralelas finalicen
        await Promise.all(promises);
    }

    /**
    * MEJORA: Método de purga total ('clear').
    * BENEFICIO: Facilita la limpieza completa de listeners y middlewares. Es indispensable para realizar
    * Pruebas Unitarias aisladas (Testing) o para soportar arquitecturas con HMR (Hot Module Replacement) sin acumular basura.
    */
    clear() {
        this.events.clear();
        this.middlewares.clear();
    }
}

// Instancia única (Patrón Singleton) lista para exportar en tu arquitectura modular
export const eventBus = new EventBus();
export default eventBus;

