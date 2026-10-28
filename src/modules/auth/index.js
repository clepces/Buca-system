/**
 * Módulo Auth - Orquestador de Identidad
 * =========================================================================
 * Punto de entrada del módulo. Coordina las fases de login y autorización
 * integrándose con el Kernel y el EventBus.
 * =========================================================================
 */
import { AUTH_EVENTS } from './constants/auth.constants.js';
import { eventBus } from '@/core/eventBus/index.js';
import DeviceFingerprint from '@/core/security/DeviceFingerprint.js';

import { router } from '@/core/router/router.js';
import { authRoutes } from './routes.js';

export const AuthModule = {
    /**
     * Inicializa los listeners del módulo.
     */
    init() {
        console.log('[Auth] -> Módulo inicializado');
        router.addRoutes(authRoutes);
        this.setupListeners();
    },

    /**
     * Configura la escucha de eventos globales.
     */
    setupListeners() {
        eventBus.on(AUTH_EVENTS.LOGIN_START, async (credentials) => {
            await this.handleLogin(credentials);
        });
    },

    /**
     * Ciclo de vida del Login (Fase 1 y 2).
     */
    // eslint-disable-next-line no-unused-vars
    async handleLogin({ email, password }) {
        try {
            console.log(`[Auth] -> Iniciando Phase 1: Identity para ${email}`);
            
            // Simulación de Auth de Firebase (Fase 1)
            // const user = await firebaseService.login(email, password);
            
            // Phase 2: Device Authorization
            const fingerprint = await DeviceFingerprint.generate();
            console.log(`[Auth] -> Fingerprint generado: ${fingerprint}`);
            
            // Emitir evento para que el Kernel o UI reaccionen
            eventBus.emit(AUTH_EVENTS.DEVICE_CHALLENGE, { fingerprint });
            
        } catch (error) {
            console.error('[Auth] -> Error en login:', error);
        }
    }
};

export default AuthModule;
