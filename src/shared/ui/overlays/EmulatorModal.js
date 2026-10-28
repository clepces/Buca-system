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
        this.overlay.style.zIndex = '3100';

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
                    <button class="modal-close-btn" id="emu-close-x" aria-label="Cerrar modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <p class="mb-0 text-main">
                        Se ha detectado que <strong>BUCA ERP</strong> está operando en un entorno local con 
                        <strong>Firebase Emulators</strong>. 
                    </p>
                    <div class="alert alert-warning bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-3 mt-3 p-3 small text-main d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill text-warning me-2 fs-5"></i>
                        <span>No utilice credenciales de producción. Los datos son volátiles y locales.</span>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" id="emu-cancel-btn">
                        Ignorar
                    </button>
                    <button class="btn btn-primary px-4" id="emu-ok-btn">
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
