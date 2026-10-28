/**
 * BaseClient - Corazón de la Comunicación Externa BNE
 * =========================================================================
 * Evolución del HttpClient con soporte para Interceptores, Timeouts
 * y Resiliencia Nativa.
 * =========================================================================
 */
import { storage } from '@/core/storage/StorageAdapter.js';

export class BaseClient {
    constructor(baseURL = '', timeout = 10000) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.interceptors = {
            request: [],
            response: []
        };
    }

    /**
     * Registra un interceptor de petición.
     */
    addRequestInterceptor(fn) {
        this.interceptors.request.push(fn);
    }

    /**
     * Ejecuta una petición con control total del ciclo de vida.
     */
    async request(endpoint, options = {}) {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeout);

        // 1. Aplicar Interceptores de Petición (Inyección de Tokens, etc)
        let config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            signal: controller.signal
        };

        for (const interceptor of this.interceptors.request) {
            config = await interceptor(config);
        }

        const url = `${this.baseURL}${endpoint}`;

        try {
            const response = await fetch(url, config);
            clearTimeout(id);

            // 2. Manejo de Errores HTTP
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw {
                    status: response.status,
                    message: errorBody.message || 'Error en la comunicación API',
                    data: errorBody
                };
            }

            const data = await response.json();

            // 3. Aplicar Interceptores de Respuesta
            let finalData = data;
            for (const interceptor of this.interceptors.response) {
                finalData = await interceptor(finalData);
            }

            return finalData;

        } catch (error) {
            if (error.name === 'AbortError') {
                console.error(`[API] -> Timeout alcanzado en: ${url}`);
                throw new Error('La petición ha tardado demasiado tiempo.');
            }
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, body, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) });
    }
}

export const api = new BaseClient();

// --- CONFIGURACIÓN DE INTERCEPTORES POR DEFECTO ---

// Inyección automática del Token de Auth
api.addRequestInterceptor(async (config) => {
    const authStorage = storage.forModule('auth');
    const token = await authStorage.get('token');
    
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
});

export default api;
