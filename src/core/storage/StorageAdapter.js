/**
 * StorageAdapter - Orquestador Inteligente de Persistencia
 * =========================================================================
 * Selecciona dinámicamente el motor de guardado según el hardware (Tier).
 * Implementa Namespacing para evitar colisiones entre módulos.
 * =========================================================================
 */
import LocalDriver from './drivers/LocalDriver.js';
import IndexedDBDriver from './drivers/IndexedDBDriver.js';

class StorageAdapter {
    constructor() {
        this.driver = null;
        this._initialized = false;
    }

    /**
     * Inicializa el motor de guardado basándose en el Tier de rendimiento.
     * @param {string} tier - 'L0', 'L1', 'L2', 'L3'
     */
    init(tier = 'L0') {
        if (this._initialized) return;

        // Estrategia: Tier L0/L1 usan LocalStorage. L2/L3 usan IndexedDB.
        if (tier === 'L2' || tier === 'L3') {
            this.driver = new IndexedDBDriver();
            console.log('[Storage] -> Motor Avanzado Activado (IndexedDB)');
        } else {
            this.driver = new LocalDriver();
            console.log('[Storage] -> Motor Ligero Activado (LocalStorage)');
        }

        this._initialized = true;
    }

    /**
     * Crea un "Cajón" (Namespace) específico para un módulo.
     * @param {string} namespace 
     */
    forModule(namespace) {
        return {
            set: (key, value) => this.set(`${namespace}:${key}`, value),
            get: (key) => this.get(`${namespace}:${key}`),
            remove: (key) => this.remove(`${namespace}:${key}`)
        };
    }

    async set(key, value) {
        if (!this._initialized) this.init(); // Fallback a L0 si no se ha inicializado
        return await this.driver.set(key, value);
    }

    async get(key) {
        if (!this._initialized) this.init();
        return await this.driver.get(key);
    }

    async remove(key) {
        if (!this._initialized) this.init();
        return await this.driver.remove(key);
    }
}

export const storage = new StorageAdapter();
export default storage;
