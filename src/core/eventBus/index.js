/**
 * EventBus - Sistema de comunicación desacoplado
 * =========================================================================
 * Permite la comunicación entre módulos sin dependencias directas.
 */
class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * Suscribirse a un evento
     * @param {string} event Nombre del evento
     * @param {function} callback Función a ejecutar
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return () => this.off(event, callback);
    }

    /**
     * Suscribirse a un evento para que se ejecute una sola vez
     * @param {string} event Nombre del evento
     * @param {function} callback Función a ejecutar
     * @returns {function} Función de desuscripción
     */
    once(event, callback) {
        const onceWrapper = (data) => {
            this.off(event, onceWrapper);
            callback(data);
        };
        return this.on(event, onceWrapper);
    }

    /**
     * Desuscribirse de un evento
     * @param {string} event Nombre del evento
     * @param {function} callback Función a eliminar
     */
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }

    /**
     * Emitir un evento
     * @param {string} event Nombre del evento
     * @param {any} data Datos asociados
     */
    emit(event, data) {
        if (!this.events[event]) return;
        // Copiar el array antes de iterar para prevenir condiciones de carrera si un callback se desuscribe durante la iteración (ej. once)
        const listeners = [...this.events[event]];
        listeners.forEach(callback => callback(data));
    }
}

export const eventBus = new EventBus();
export default eventBus;
