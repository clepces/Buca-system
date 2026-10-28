import { BaseState } from './BaseState.js';
import { eventBus } from '../eventBus/index.js';
import { CONFIG } from '../config/config.js';

/**
 * UIState - Gestión de estado de la Interfaz y el Motor
 * =========================================================================
 * Centraliza el estado de modales, notificaciones y rendimiento.
 */
class UIState extends BaseState {
    constructor() {
        super({
            activeModal: null,
            isOnline: navigator.onLine,
            isLoading: false,
            // Estado del Motor Gráfico (Nuevo)
            graphics: {
                profile: 'balanced',
                fps: 60,
                isManualMode: false,
                isPaused: false
            }
        });
    }

    /**
     * Actualiza el estado del motor gráfico
     * @param {object} stats 
     */
    updateGraphics(stats) {
        this.set({
            graphics: { ...this._state.graphics, ...stats }
        });
        
        // Emitir evento para componentes legacy
        eventBus.emit(CONFIG.EVENTS.GRAPHICS.PROFILE_UPDATE, stats);
    }
}

export const uiState = new UIState();
export default uiState;
