import { storage } from '@/core/storage/StorageAdapter.js';

/**
 * EmulatorModal - Aviso de Seguridad para Entornos de Desarrollo
 * =========================================================================
 * Muestra una advertencia persistente cuando el sistema detecta que está
 * corriendo sobre los Firebase Emulators.
 */
class EmulatorModal {
    constructor() {
        this.overlay = null;
    }

    /**
     * Muestra el modal si no ha sido aceptado permanentemente.
     */
    show() {
        if (this.overlay) return;

        this._createDOM();
        document.body.appendChild(this.overlay);

        // Forzar reflow para animación
        requestAnimationFrame(() => {
            this.overlay.classList.add('active');
        });
    }

    /**
     * Cierra el modal con animación.
     */
    hide() {
        if (!this.overlay) return;

        this.overlay.classList.remove('active');
        setTimeout(() => {
            if (this.overlay) {
                this.overlay.remove();
                this.overlay = null;
            }
        }, 400);
    }

    /**
     * Crea la estructura DOM con diseño Corporate Hybrid Glass.
     * @private
     */
    _createDOM() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'glass-modal-overlay';
        this.overlay.style.zIndex = '20000'; // Prioridad máxima

        this.overlay.innerHTML = `
            <div class="glass-modal" style="max-width: 450px;">
                <div class="modal-header">
                    <div class="modal-title-group">
                        <h3 class="modal-title">
                            <i class="bi bi-shield-exclamation text-warning"></i>
                            Modo Emulador
                        </h3>
                        <span class="modal-subtitle">Seguridad de Desarrollo</span>
                    </div>
                    <button class="modal-close-btn" id="emu-close-x">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="mb-0">
                        Se ha detectado que <strong>BUCA ERP</strong> está operando en un entorno local con 
                        <strong>Firebase Emulators</strong>. 
                    </p>
                    <div class="alert-glass-warning mt-3" style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.2); padding: 15px; border-radius: 12px; font-size: 0.85rem; color: var(--text-main);">
                        <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                        No utilice credenciales de producción. Los datos son volátiles y locales.
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-glass" id="emu-cancel-btn" style="padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border-glass); background: transparent; color: var(--text-main); cursor: pointer;">
                        Ignorar
                    </button>
                    <button class="btn-glass primary" id="emu-ok-btn" style="padding: 8px 24px; border-radius: 8px; background: var(--buca-blue); color: white; border: none; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px var(--buca-blue-glow);">
                        Entendido, no mostrar más
                    </button>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    /**
     * Gestiona los clics en los botones.
     * @private
     */
    _bindEvents() {
        const btnOk = this.overlay.querySelector('#emu-ok-btn');
        const btnCancel = this.overlay.querySelector('#emu-cancel-btn');
        const btnX = this.overlay.querySelector('#emu-close-x');

        btnOk.onclick = async () => {
            await storage.set('emulator_warning_accepted', true);
            this.hide();
        };

        btnCancel.onclick = () => this.hide();
        btnX.onclick = () => this.hide();
    }
}

export default new EmulatorModal();
