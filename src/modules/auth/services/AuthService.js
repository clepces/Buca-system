/**
 * AuthService - Comunicador con Firebase Auth
 * =========================================================================
 * Orquestador de la lógica de autenticación del módulo Auth.
 * =========================================================================
 */
import FirebaseProvider from './FirebaseProvider.js';
import { eventBus } from '@/core/eventBus/index.js';
import { sessionState } from '@/core/state/session.js';

export const AuthService = {
    /**
     * Intenta iniciar sesión y emite eventos según el resultado.
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<Object>} Resultado de la operación
     */
    async login(email, password) {
        console.log(`[AuthService] -> Intentando login para ${email}`);
        try {
            const userCredential = await FirebaseProvider.login(email, password);
            const user = userCredential.user;
            
            sessionState.set({ isAuthenticated: true, user: { uid: user.uid, email: user.email } });
            eventBus.emit('auth:login-success', { user });
            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en autenticación:', error.message);
            eventBus.emit('auth:login-failed', { error });
            return { success: false, error: error.code };
        }
    },

    /**
     * Registra un nuevo usuario en la plataforma.
     */
    async register(email, password, name) {
        try {
            const userCredential = await FirebaseProvider.register(email, password, name);
            const user = userCredential.user;
            
            sessionState.set({ isAuthenticated: true, user: { uid: user.uid, email: user.email } });
            eventBus.emit('auth:register-success', { user });
            return { success: true, user };
        } catch (error) {
            console.error('[AuthService] Fallo en registro:', error.message);
            eventBus.emit('auth:register-failed', { error });
            return { success: false, error: error.code };
        }
    },

    /**
     * Envía enlace de recuperación.
     */
    async recoverPassword(email) {
        try {
            await FirebaseProvider.recoverPassword(email);
            return { success: true };
        } catch (error) {
            console.error('[AuthService] Fallo en recuperación:', error.message);
            return { success: false, error: error.code };
        }
    },

    /**
     * Cierra la sesión y notifica al sistema.
     */
    async logout() {
        try {
            await FirebaseProvider.logout();
            sessionState.clear();
            eventBus.emit('auth:logout-success');
            window.location.reload(); // Recarga para limpiar estado
        } catch (error) {
            console.error('[AuthService] Error al cerrar sesión:', error);
        }
    },

};

export default AuthService;
