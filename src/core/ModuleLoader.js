/**
 * ModuleLoader - Gestor de Carga Bajo Demanda
 * =========================================================================
 * Implementa Dynamic Imports para cargar módulos solo cuando son requeridos,
 * reduciendo el bundle inicial y optimizando el bus de datos.
 * =========================================================================
 */
export class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
    }

    /**
     * Carga e inicializa un módulo dinámicamente.
     * @param {string} moduleName - Nombre de la carpeta del módulo.
     * @returns {Promise<any>} Instancia del módulo.
     */
    async load(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }

        try {
            console.log(`[ModuleLoader] -> Descargando módulo: ${moduleName}...`);

            // Importación dinámica de ES6
            const moduleExport = await import(`../modules/${moduleName}/index.js`);
            const instance = moduleExport.default || moduleExport;

            if (instance && typeof instance.init === 'function') {
                instance.init();
            }

            this.loadedModules.set(moduleName, instance);
            return instance;

        } catch (error) {
            console.error(`[ModuleLoader] -> Error cargando el módulo ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Verifica si un módulo ya está en memoria.
     */
    isLoaded(moduleName) {
        return this.loadedModules.has(moduleName);
    }
}

export default new ModuleLoader();
