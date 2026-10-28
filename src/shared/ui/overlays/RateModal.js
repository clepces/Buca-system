/**
 * RateModal Component - BUCA Website
 * =========================================================================
 * Manages exchange rate updates with a premium Glassmorphism UI.
 * Adapted for the Website from Modular V4.0.0.
 */

export const RateModal = {
    /** @type {string} ID único del modal en el DOM */
    id: 'rate-management-modal',
    /** @type {number} Tasa de cambio actual */
    currentRate: 475.96, // Valor por defecto

    /**
     * Muestra el modal de gestión de tasa e inicializa eventos.
     * @returns {void}
     */
    show() {
        console.log('[RateModal] -> Initializing Fintech-style Interface');
        this._render();
        const modal = document.getElementById(this.id);
        if (modal) {
            modal.classList.add('active');
            this._bindEvents();
        }
    },

    /**
     * Oculta el modal y limpia el DOM tras la animación.
     * @returns {void}
     */
    hide() {
        const modal = document.getElementById(this.id);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 400); // Wait for animation then clean up
        }
        if (this._dropdownCloseHandler) {
            document.removeEventListener('click', this._dropdownCloseHandler);
            this._dropdownCloseHandler = null;
        }
        document.body.style.overflow = '';
    },

    /**
     * Formatea un número de tasa al estilo Fintech (fracciones pequeñas).
     * @private
     * @param {number} rate - El valor de la tasa.
     * @returns {string} HTML formateado.
     */
    _formatFintechRate(rate) {
        const rateStr = Number(rate).toFixed(4);
        const [integer, fraction] = rateStr.split('.');
        const mainFraction = fraction.substring(0, 2);
        const extraFraction = fraction.substring(2);

        return `
            <div class="fintech-rate-display d-flex align-items-baseline">
                <span class="currency-symbol me-1">Bs.</span>
                <span class="rate-integer">${integer}</span>
                <span class="rate-separator">.</span>
                <span class="rate-fraction-main">${mainFraction}</span>
                <span class="rate-fraction-extra">${extraFraction}</span>
            </div>
        `;
    },

    /**
     * Genera e inyecta el HTML del modal en el <body>.
     * @private
     * @returns {void}
     */
    _render() {
        if (document.getElementById(this.id)) {
            document.getElementById(this.id).remove();
        }

        const modalHtml = `
            <div id="${this.id}" class="glass-modal-overlay" onclick="RateModal.hide()">
                <div class="glass-modal modal-md animate-fadeIn" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <div class="header-title">
                            <h3 class="modal-title">Gestión de Tasa</h3>
                            <span class="modal-subtitle">Mercado Cambiario</span>
                            <p class="modal-description">Control de la tasa oficial BCV para cálculos bi-monetarios en tiempo real.</p>
                        </div>

                        <div class="header-content"></div>

                        <div class="header-actions">
                            <button class="accion-btn" id="btn-refresh-rate-header" title="Refrescar Tasa">
                                <i class="bi bi-arrow-repeat"></i>
                            </button>
                            
                            <div style="position: relative;">
                                <button class="accion-group-btn" id="rate-actions-trigger" title="Opciones Avanzadas">
                                    <i class="bi bi-three-dots"></i>
                                </button>
                                <div class="glass-dropdown-menu" id="rate-dropdown-menu">
                                    <div class="dropdown-header">Acciones de Tasa</div>
                                    <div class="dropdown-item" id="drop-sync-header">
                                        <i class="bi bi-cloud-download"></i> Sincronizar BCV
                                    </div>
                                    <div class="dropdown-item">
                                        <i class="bi bi-bar-chart-steps"></i> Ver Historial
                                    </div>
                                    <div class="dropdown-divider"></div>
                                    <div class="dropdown-item">
                                        <i class="bi bi-file-earmark-excel"></i> Exportar a Excel
                                    </div>
                                    <div class="dropdown-item danger">
                                        <i class="bi bi-trash-fill"></i> Limpiar Caché
                                    </div>
                                </div>
                            </div>

                            <button class="modal-close-btn" id="rate-close-modal-btn" title="Cerrar"><i class="bi bi-x"></i></button>
                        </div>
                    </div>

                    <div class="modal-body">
                        <div class="rate-update-container">
                            <!-- Hero Card: Current Status -->
                            <div class="premium-glass-card">
                                <div class="rate-badge">
                                    <i class="bi bi-lightning-charge-fill me-1"></i> Tasa en Tiempo Real
                                </div>
                                
                                <div id="rate-hero-display" class="my-3">
                                    ${this._formatFintechRate(this.currentRate)}
                                </div>

                                <div id="rate-status-info" class="small text-muted">
                                    <i class="bi bi-clock-history me-1"></i> Última actualización: ${new Date().toLocaleString()}
                                </div>
                                
                                <div id="sync-spinner" class="d-none mt-3">
                                    <div class="spinner-grow spinner-grow-sm text-primary" role="status"></div>
                                    <span class="ms-2 small text-primary fw-bold">Sincronizando con BCV...</span>
                                </div>
                            </div>

                            <!-- Manual Input Section -->
                            <div class="manual-adjustment-zone mt-4">
                                <label class="form-label small fw-bold text-uppercase text-muted px-2">Ajuste Manual de Tasa (BS. / USD)</label>
                                <div class="glass-input-premium shadow-sm">
                                    <div class="input-icon-group">
                                        <i class="bi bi-currency-dollar symbol-usd"></i>
                                        <i class="bi bi-arrow-left-right divider"></i>
                                        <i class="bi bi-currency-exchange symbol-bs"></i>
                                    </div>
                                    <input type="number" step="any" id="manual-rate-input" 
                                           class="premium-input-field" 
                                           value="${this.currentRate}" 
                                           placeholder="0.0000">
                                    <button class="premium-input-btn btn-sync-hover" id="btn-sync-api" title="Sincronizar con BCV">
                                        <i class="bi bi-cloud-download"></i>
                                    </button>
                                </div>
                                <div class="mt-2 text-center text-sm">
                                    <small class="text-muted"><i class="bi bi-info-circle me-1"></i> Use esta zona para corregir discrepancias del mercado oficial.</small>
                                </div>
                            </div>

                            <!-- Responsive History (Grid Based) -->
                            <div class="rate-history-section mt-5">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <h4 class="section-title-sm mb-0">Historial Reciente</h4>
                                    <span class="badge badge--primary">Últimos 5 días</span>
                                </div>
                                
                                <div class="glass-history-list">
                                    <div class="history-item header">
                                        <div class="h-col">Fecha</div>
                                        <div class="h-col">Valor</div>
                                        <div class="h-col text-end">Variación</div>
                                    </div>
                                    <div class="history-item">
                                        <div class="h-col fw-bold">15/04/2026</div>
                                        <div class="h-col">476.12</div>
                                        <div class="h-col text-end text-success fw-bold">
                                            +0.15% <i class="bi bi-caret-up-fill"></i>
                                        </div>
                                    </div>
                                    <div class="history-item">
                                        <div class="h-col fw-bold">14/04/2026</div>
                                        <div class="h-col">475.90</div>
                                        <div class="h-col text-end text-danger fw-bold">
                                            -0.05% <i class="bi bi-caret-down-fill"></i>
                                        </div>
                                    </div>
                                    <div class="history-item">
                                        <div class="h-col fw-bold">13/04/2026</div>
                                        <div class="h-col">475.98</div>
                                        <div class="h-col text-end text-success fw-bold">
                                            +0.08% <i class="bi bi-caret-up-fill"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button class="btn btn-ghost" id="rate-cancel-btn">Cancelar</button>
                        <button class="btn btn-primary px-4" id="btn-apply-rate">Actualizar Tasa Global</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Vincula los eventos interactivos del modal.
     * @private
     * @returns {void}
     */
    _bindEvents() {
        const btnRefreshHeader = document.getElementById('btn-refresh-rate-header');
        const closeBtn = document.getElementById('rate-close-modal-btn');
        const cancelBtn = document.getElementById('rate-cancel-btn');
        const applyBtn = document.getElementById('btn-apply-rate');
        const input = document.getElementById('manual-rate-input');
        const syncBtn = document.getElementById('btn-sync-api');

        const trigger = document.getElementById('rate-actions-trigger');
        const menu = document.getElementById('rate-dropdown-menu');
        const dropSync = document.getElementById('drop-sync-header');

        // Close logic
        if (closeBtn) closeBtn.onclick = () => this.hide();
        if (cancelBtn) cancelBtn.onclick = () => this.hide();

        // Header Actions Connect
        if (btnRefreshHeader) {
            btnRefreshHeader.onclick = (e) => {
                e.stopPropagation();
                this._syncWithAPI(true); // Sincronización global inmediata
            };
        }

        if (trigger && menu) {
            trigger.onclick = (e) => {
                e.stopPropagation();
                menu.classList.toggle('active');
            };

            this._dropdownCloseHandler = (e) => {
                if (!trigger.contains(e.target)) menu.classList.remove('active');
            };
            document.addEventListener('click', this._dropdownCloseHandler);
        }

        if (dropSync) dropSync.onclick = () => this._syncWithAPI(true);

        if (applyBtn && input) {
            applyBtn.onclick = () => {
                const newRate = parseFloat(input.value);
                if (!isNaN(newRate) && newRate > 0.0001 && newRate < 1000000) {
                    this.currentRate = newRate;
                    this._updatePageRates(newRate);
                    this.hide();
                } else {
                    alert('Error: Por favor ingrese una tasa real y válida para los cálculos del sistema.');
                }
            };
        }

        // Live Preview: Update Hero while typing
        if (input) {
            input.oninput = () => {
                const val = parseFloat(input.value);
                if (!isNaN(val) && val > 0) {
                    const display = document.getElementById('rate-hero-display');
                    if (display) display.innerHTML = this._formatFintechRate(val);
                }
            };
        }

        if (syncBtn) {
            syncBtn.onclick = () => this._syncWithAPI(false); // Solo actualiza el modal, usuario debe confirmar
        }
    },

    /**
     * Sincroniza la tasa con una API externa (mockeado).
     * @private
     * @param {boolean} autoUpdate - Si se debe aplicar la tasa globalmente tras sincronizar.
     * @returns {Promise<void>}
     */
    async _syncWithAPI(autoUpdate = false) {
        const spinner = document.getElementById('sync-spinner');
        const heroDisplay = document.getElementById('rate-hero-display');
        const input = document.getElementById('manual-rate-input');
        const syncBtn = document.getElementById('btn-sync-api');

        if (spinner) spinner.classList.remove('d-none');
        if (syncBtn) syncBtn.disabled = true;

        try {
            // Mock de sincronización (para el sitio web)
            await new Promise(resolve => setTimeout(resolve, 1500));
            const mockRate = parseFloat((this.currentRate + (Math.random() * 0.5 - 0.25)).toFixed(4));
            
            this.currentRate = mockRate;
            if (heroDisplay) heroDisplay.innerHTML = this._formatFintechRate(mockRate);
            if (input) input.value = mockRate;
            
            // Si autoUpdate es true, actualizamos los widgets de la página inmediatamente
            if (autoUpdate) {
                this._updatePageRates(mockRate);
            }

            console.log(`[RateModal] -> API Sync Success: ${mockRate}`);
        } catch (err) {
            console.error('[RateModal] Sync failed:', err);
            alert('No se pudo conectar con el servicio de tasas oficial.');
        } finally {
            if (spinner) spinner.classList.add('d-none');
            if (syncBtn) syncBtn.disabled = false;
        }
    },

    /**
     * Actualiza todos los widgets y disparadores de tasa en la página.
     * @private
     * @param {number} newRate - El nuevo valor de la tasa.
     * @returns {void}
     */
    async _updatePageRates(newRate) {
        console.log(`[RateModal] -> Broadcasting Global Update: Bs. ${newRate}`);

        // Integración con GlobalState (v5.2.0)
        try {
            const { globalState } = await import('@/core/state/global.js');
            globalState.updateRates({ bcv: newRate });
        } catch (e) {
            console.error('[RateModal] Error syncing with globalState:', e);
        }

        // 1. Buscar en Pills de Header
        document.querySelectorAll('.pill-amount').forEach(el => {
            const pill = el.closest('.glass-pill');
            if (pill) {
                const label = pill.querySelector('.pill-label')?.textContent;
                if (label && label.includes('TASA BCV')) {
                    el.textContent = Number(newRate).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    
                    // Efecto visual de actualización
                    pill.classList.add('pulse-update');
                    setTimeout(() => pill.classList.remove('pulse-update'), 1500);
                }
            }
        });

        // 2. Buscar por ID común o clase de tasa
        const globalRateElements = document.querySelectorAll('#global-bcv-rate, .bcv-rate-value');
        globalRateElements.forEach(el => {
            el.textContent = Number(newRate).toFixed(2);
        });
        
        // 3. Disparar evento global para otros componentes JS (GraphicsEngine, etc.)
        window.dispatchEvent(new CustomEvent('buca:rate_change', { 
            detail: { 
                rate: newRate,
                timestamp: new Date().toISOString()
            } 
        }));
    }
};

window.RateModal = RateModal;
window.openRateModal = () => RateModal.show();
