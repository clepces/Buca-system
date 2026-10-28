import GraphicsEngine from '@/core/engine/engine.js';
import { uiState } from '@/core/state/ui.js';
import { CONFIG } from '@/core/config/config.js';


/**
 * PerformanceModal - Panel de control de Buca Neural Graphics Engine
 * Versión 4.6.0 - Sincronización total, controles de desarrollo y footer global
 */
class PerformanceModal {
    /**
     * Constructor de la clase PerformanceModal.
     */
    constructor() {
        /** @type {HTMLElement|null} El overlay del modal */
        this.overlay = null;
        /** @type {Function|null} Desuscripción del estado */
        this.unsubscribe = null;
        /** @type {Object} Caché de estadísticas previas para optimizar DOM */
        this.prevStats = {};
    }

    /**
     * Muestra el modal de rendimiento e inicia la telemetría.
     * @returns {void}
     */
    show() {
        if (!this.overlay) {
            this.createDOM();
        }

        // Sincronización Total (Single Source of Truth)
        this.prevStats = {}; // Reset cache para forzar repintado
        this.syncInitialState();

        this.overlay.classList.add('active');
        this.startTelemetry();
        
        // Activar listeners de motor solo cuando sea visible
        this.setupEngineListeners();

        document.body.style.overflow = 'hidden';
    }

    /**
     * Oculta el modal de rendimiento y detiene la telemetría.
     * @returns {void}
     */
    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            this.stopTelemetry();
            this.removeEngineListeners();
            if (this._notifyTimeout) {
                clearTimeout(this._notifyTimeout);
                this._notifyTimeout = null;
            }
            document.body.style.overflow = '';
        }
    }

    /**
     * Crea el DOM del modal e inyecta el HTML inicial.
     * @returns {void}
     */
    createDOM() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'glass-modal-overlay';
        this.overlay.id = 'perf-modal-overlay';
        this.overlay.setAttribute('data-bne-ignore', 'true'); // Bypass font degradation

        const stats = GraphicsEngine.getCurrentStats();

        this.overlay.innerHTML = `
            <div class="glass-modal modal-xl performance-dashboard">
                <!-- Header Premium -->
                <div class="modal-header">
                    <div class="d-flex align-items-center gap-3">
                        <div class="header-icon-box">
                            <i class="bi bi-cpu-fill"></i>
                            <div class="icon-glow"></div>
                        </div>
                        <div class="modal-title-group">
                            <h3 class="modal-title">Gestor de Rendimiento</h3>
                            <div class="d-flex align-items-center gap-2">
                                <span class="modal-subtitle">BUCA NEURAL ENGINE</span>
                                <span class="engine-version-tag">V${GraphicsEngine.VERSION}</span>
                            </div>
                        </div>
                    </div>

                    <div class="header-telemetry-strip">
                        <div class="tel-item" title="Latencia">
                            <i class="bi bi-activity"></i>
                            <span id="perf-latency">0.0ms</span>
                        </div>
                        <div class="tel-separator"></div>
                        <div class="tel-item" title="Uptime">
                            <i class="bi bi-clock-history"></i>
                            <span id="perf-uptime">0s</span>
                        </div>
                        <div class="tel-separator"></div>
                        <div class="tel-item" title="Memoria">
                            <i class="bi bi-memory"></i>
                            <span id="perf-mini-vram">0.0GB</span>
                        </div>
                    </div>

                    <div class="header-actions">
                        <!-- Quick Access Toggle -->
                        <button class="action-mini-btn toggle-mode" id="btn-quick-mode-toggle" title="Cambiar Modo (Auto/Manual)">
                            <i class="bi ${stats.isManualMode ? 'bi-hand-index-thumb' : 'bi-robot'}"></i>
                        </button>
                        <button class="action-mini-btn recalibrate" id="btn-recalibrate-header" title="Recalibrar Motor">
                            <i class="bi bi-arrow-repeat"></i>
                        </button>
                        <button class="action-mini-btn close modal-close-btn" title="Cerrar">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Tab Navigation -->
                <div class="modal-tabs-nav">
                    <button class="tab-trigger active" data-tab="telemetry">
                        <i class="bi bi-graph-up"></i> Telemetría
                    </button>
                    <button class="tab-trigger" data-tab="profiles">
                        <i class="bi bi-layers"></i> Perfiles Visuales
                    </button>
                    <button class="tab-trigger" data-tab="advanced">
                        <i class="bi bi-sliders2-vertical"></i> Post-Procesado
                    </button>
                    <div class="tab-indicator"></div>
                </div>
                
                <div class="modal-body">
                    <!-- TAB 1: TELEMETRY -->
                    <div class="tab-pane active" id="tab-telemetry">
                        <div class="perf-stats-grid mb-4">
                            <div class="stat-card">
                                <div class="stat-label">RENDIMIENTO REAL</div>
                                <div class="stat-value-group">
                                    <span class="stat-value" id="perf-fps">${stats.fps}</span>
                                    <span class="stat-unit">FPS</span>
                                </div>
                                <div class="stat-mini-chart">
                                    <div class="chart-bar" style="height: 60%"></div>
                                    <div class="chart-bar" style="height: 45%"></div>
                                    <div class="chart-bar" style="height: 80%"></div>
                                    <div class="chart-bar" style="height: 65%"></div>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">RESOLUCIÓN ESCALADA</div>
                                <div class="stat-value-group">
                                    <span class="stat-value" id="perf-dpr">${stats.dpr}</span>
                                    <span class="stat-unit">X</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">MEMORIA ASIGNADA</div>
                                <div class="stat-value-group">
                                    <span class="stat-value" id="perf-vram">${stats.memory}</span>
                                    <span class="stat-unit">GB</span>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">OBJETOS ACTIVOS</div>
                                <div class="stat-value-group">
                                    <span class="stat-value" id="perf-objects">0</span>
                                    <span class="stat-unit">DOM</span>
                                </div>
                            </div>
                        </div>

                        <!-- BNE Security Guards -->
                        <div class="perf-section-card guards-module">
                            <div class="section-header d-flex justify-content-between align-items-start mb-3">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-shield-lock-fill text-primary" style="font-size: 1.3rem;"></i>
                                    <div>
                                        <h4 class="mb-0 fs-6 fw-bold">BNE Security Guards</h4>
                                        <span class="guard-status-summary text-success" id="perf-guards-summary" style="font-size: 0.65rem; font-weight: 700;">
                                            Memory / Reflow / Sanitizer / Throttler
                                        </span>
                                    </div>
                                </div>
                                <span class="badge-status-premium" id="guard-global-status">
                                    <i class="bi bi-shield-check"></i> SISTEMA ACTIVO
                                </span>
                            </div>
                            
                            <div class="guards-grid">
                                <div class="guard-pill" id="guard-memory">
                                    <div class="guard-icon"><i class="bi bi-memory"></i></div>
                                    <div class="guard-info">
                                        <span class="guard-label">Memory</span>
                                        <span class="guard-status text-success">PROTECTED</span>
                                    </div>
                                </div>
                                <div class="guard-pill" id="guard-reflow">
                                    <div class="guard-icon"><i class="bi bi-layers"></i></div>
                                    <div class="guard-info">
                                        <span class="guard-label">Reflow</span>
                                        <span class="guard-status text-success">OPTIMIZED</span>
                                    </div>
                                </div>
                                <div class="guard-pill" id="guard-ghost">
                                    <div class="guard-icon"><i class="bi bi-bug"></i></div>
                                    <div class="guard-info">
                                        <span class="guard-label">Sanitizer</span>
                                        <span class="guard-status text-success">CLEAN</span>
                                    </div>
                                </div>
                                <div class="guard-pill" id="guard-drp">
                                    <div class="guard-icon"><i class="bi bi-lightning"></i></div>
                                    <div class="guard-info">
                                        <span class="guard-label">Throttler</span>
                                        <span class="guard-status text-success">STABLE</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 2: PROFILES -->
                    <div class="tab-pane" id="tab-profiles">
                        <div class="perf-control-mode-banner mb-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="mode-icon">
                                    <i class="bi ${stats.isManualMode ? 'bi-hand-index-thumb' : 'bi-robot'}" id="main-mode-icon"></i>
                                </div>
                                <div>
                                    <span class="d-block small opacity-75">MODO DE CONTROL</span>
                                    <h5 class="mb-0 fw-bold" id="perf-mode-status">${stats.isManualMode ? 'MODO MANUAL' : 'MODO INTELIGENTE'}</h5>
                                </div>
                            </div>
                            <label class="glass-switch">
                                <input type="checkbox" id="perf-mode-toggle" ${stats.isManualMode ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>

                        <div class="profile-cards-container ${stats.isManualMode ? 'manual-active' : 'auto-active'}" id="profiles-section">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    ${this.renderProfileOption('eco', 'L0', 'Ahorro Máximo', 'Sin efectos pesados. Ideal para dispositivos antiguos.')}
                                </div>
                                <div class="col-md-6">
                                    ${this.renderProfileOption('balanced', 'L1', 'Equilibrado', 'Estándar BUCA. Balance entre calidad y fluidez.')}
                                </div>
                                <div class="col-md-6">
                                    ${this.renderProfileOption('pro', 'L2', 'Profesional', 'Experiencia premium con blur avanzado y sombras.')}
                                </div>
                                <div class="col-md-6">
                                    ${this.renderProfileOption('ultra', 'L3', 'Cine / VR', 'Máximo detalle gráfico. Solo para estaciones de trabajo.')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB 3: ADVANCED -->
                    <div class="tab-pane" id="tab-advanced">
                        <div class="perf-section-card post-process-module ${stats.isManualMode ? 'manual-active' : 'auto-active'}" id="post-process-section">
                            <div class="impact-monitor mb-4">
                                <div class="d-flex justify-content-between mb-2">
                                    <span class="small fw-bold">ESTRÉS NEURAL ESTIMADO</span>
                                    <span class="small fw-bold" id="perf-stress-val-header">0%</span>
                                </div>
                                <div class="impact-bar-container">
                                    <div class="impact-bar-fill" id="perf-impact-bar"></div>
                                    <div class="impact-ghost-fill" id="perf-impact-ghost"></div>
                                </div>
                            </div>

                            <div class="post-controls-grid">
                                <div class="controls-column">
                                    <h6 class="column-title">Iluminación y Efectos Base</h6>
                                    ${this.renderToggleControl('bloom', 'Bloom Rendering', 'Resplandor de luces y superficies blancas.', stats.postProcess.bloom, 15)}
                                    ${this.renderRangeControl('bloomIntensity', 'Intensidad Bloom', 'Fuerza del resplandor lumínico.', stats.postProcess.bloomIntensity, 0, 2, 0.1, 10)}
                                    ${this.renderToggleControl('glassReflections', 'Reflejos de Cristal', 'Brillos en tiempo real sobre superficies.', stats.postProcess.glassReflections, 18)}
                                    ${this.renderRangeControl('blurIntensity', 'Opacidad Cristal', 'Intensidad del desenfoque de fondo.', stats.postProcess.blurIntensity, 0, 2, 0.1, 35)}
                                    ${this.renderRangeControl('particleDensity', 'Micro-animación', 'Cantidad de animaciones neurales.', stats.postProcess.particleDensity, 0, 1, 0.1, 22)}
                                </div>
                                <div class="controls-column">
                                    <h6 class="column-title">Texturas, Sombras y Rendimiento</h6>
                                    ${this.renderToggleControl('shadows', 'Sombras Dinámicas', 'Oclusión ambiental y profundidad.', stats.postProcess.shadows, 25)}
                                    ${this.renderRangeControl('shadowQuality', 'Calidad Sombras', 'Nitidez y resolución de sombras.', stats.postProcess.shadowQuality, 0, 1, 0.1, 20)}
                                    ${this.renderToggleControl('grain', 'Film Grain', 'Grano cinematográfico para dar textura.', stats.postProcess.grain, 10)}
                                    ${this.renderRangeControl('grainIntensity', 'Intensidad Grano', 'Visibilidad del ruido visual.', stats.postProcess.grainIntensity, 0, 1, 0.05, 5)}
                                    ${this.renderToggleControl('antiAliasing', 'Suavizado FXAA', 'Suaviza bordes (Futuro: TAA/DLSS soportado).', stats.postProcess.antiAliasing, 12, 'NUEVO')}
                                    ${this.renderRangeControl('fpsLimit', 'Límite V-Sync', 'Control manual de cuadros por segundo.', stats.postProcess.fpsLimit, 30, 120, 15, 5, false)}
                                </div>
                            </div>
                            <div class="post-controls-grid">
                                <div class="controls-column">
                                    <hr class="border-glass my-2">
                                    <span class="small fw-bold opacity-50 mb-2 d-block">PROXIMAMENTE</span>
                                    ${this.renderToggleControl('raytracing', 'Ray Tracing Engine', 'Cálculo de luz física (Desactivado).', false, 45, 'BETA', true)}
                                    ${this.renderToggleControl('vfog', 'Volumetric Fog', 'Simulación de atmósfera densa.', false, 30, 'PRONTO', true)}
                                    ${this.renderToggleControl('ssc', 'Subsurface Scattering', 'Difusión de luz en materiales.', false, 20, 'EN DESARROLLO', true)}
                                </div>
                                <div class="controls-column">
                                    <hr class="border-glass my-2">
                                    <span class="small fw-bold opacity-50 mb-2 d-block">PROXIMAMENTE</span>
                                    ${this.renderRangeControl('parallax', 'Parallax Mapping', 'Profundidad simulada en texturas.', 0.5, 0, 1, 0.1, 15, true, 'BETA', true)}
                                    ${this.renderRangeControl('lod', 'Geometry LOD', 'Optimización de mallas distantes.', 1, 0, 2, 1, 10, false, 'EN DESARROLLO', true)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer Global (Siempre visible) -->
                <div class="modal-footer-info">
                    <div class="info-footer" id="perf-status-message">
                        ${stats.isManualMode
        ? '<i class="bi bi-exclamation-triangle-fill"></i> Modo Manual activo. Las protecciones automáticas están desactivadas.'
        : '<i class="bi bi-shield-fill-check"></i> El motor Neural se auto-ajusta dinámicamente según la carga del sistema.'}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);
        this.setupEventListeners();
        this.updateActiveCard(stats.profile);
    }

    /**
     * Genera el HTML para un control de tipo interruptor (toggle).
     */
    renderToggleControl(effect, title, desc, checked, impact, badge = null, locked = false) {
        const badgeHTML = badge ? `<span class="badge-status-mini ${badge.toLowerCase().replace(/ /g, '-')}">${badge}</span>` : '';
        return `
            <div class="post-control-item ${locked ? 'locked' : ''}" data-impact="${impact}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="control-info">
                        <div class="d-flex align-items-center gap-2">
                            <span class="control-title">${title}</span>
                            ${badgeHTML}
                        </div>
                        <span class="control-desc">${desc}</span>
                    </div>
                    <label class="glass-switch">
                        <input type="checkbox" class="post-toggle" data-effect="${effect}" ${checked ? 'checked' : ''} ${locked ? 'disabled' : ''}>
                        <span class="slider round"></span>
                    </label>
                </div>
            </div>
        `;
    }

    /**
     * Genera el HTML para un control de tipo rango (slider).
     */
    renderRangeControl(effect, title, desc, value, min, max, step, impact, isPercentage = true, badge = null, locked = false) {
        const displayVal = isPercentage ? `${(value * 100).toFixed(0)}%` : value;
        const badgeHTML = badge ? `<span class="badge-status-mini ${badge.toLowerCase().replace(/ /g, '-')}">${badge}</span>` : '';
        return `
            <div class="post-control-item ${locked ? 'locked' : ''}" data-impact="${impact}">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="control-info">
                        <div class="d-flex align-items-center gap-2">
                            <span class="control-title">${title}</span>
                            ${badgeHTML}
                        </div>
                        <span class="control-desc">${desc}</span>
                    </div>
                    <span class="range-value">${displayVal}</span>
                </div>
                <input type="range" class="form-range post-range" data-effect="${effect}" min="${min}" max="${max}" step="${step}" value="${value}" data-is-pct="${isPercentage}" ${locked ? 'disabled' : ''}>
            </div>
        `;
    }

    setupEventListeners() {
        // Lógica de Pestañas
        const tabs = this.overlay.querySelectorAll('.tab-trigger');
        const panes = this.overlay.querySelectorAll('.tab-pane');
        const indicator = this.overlay.querySelector('.tab-indicator');

        const updateIndicator = (activeTab) => {
            if (!indicator) return;
            indicator.style.width = `${activeTab.offsetWidth}px`;
            indicator.style.left = `${activeTab.offsetLeft}px`;
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                panes.forEach(p => p.classList.remove('active'));

                tab.classList.add('active');
                this.overlay.querySelector(`#tab-${target}`).classList.add('active');
                updateIndicator(tab);
            });
        });

        // Inicializar indicador
        setTimeout(() => {
            const activeTab = this.overlay.querySelector('.tab-trigger.active');
            if (activeTab) updateIndicator(activeTab);
        }, 100);

        const btnRecalibrate = this.overlay.querySelector('#btn-recalibrate-header');
        if (btnRecalibrate) btnRecalibrate.onclick = () => this.handleRecalibrate();

        // Quick Access Mode Toggle (Header)
        const btnQuickMode = this.overlay.querySelector('#btn-quick-mode-toggle');
        if (btnQuickMode) {
            btnQuickMode.onclick = () => {
                const isManual = !GraphicsEngine.isManualMode;
                this.setGlobalMode(isManual);

                // Animación de pulso
                btnQuickMode.classList.add('pulse-anim');
                setTimeout(() => btnQuickMode.classList.remove('pulse-anim'), 500);
            };
        }

        // Main Mode Toggle (Tab Profiles)
        const modeToggle = this.overlay.querySelector('#perf-mode-toggle');
        if (modeToggle) {
            modeToggle.addEventListener('change', (e) => {
                this.setGlobalMode(e.target.checked);
            });
        }

        const closeBtn = this.overlay.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.onclick = () => this.hide();

        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.hide();
        });

        // Monitor de Impacto
        const ghost = this.overlay.querySelector('#perf-impact-ghost');
        this.overlay.querySelectorAll('.post-control-item').forEach(item => {
            if (item.classList.contains('locked')) return;
            item.addEventListener('mouseenter', () => {
                if (ghost) ghost.style.width = `${item.dataset.impact || 0}%`;
            });
            item.addEventListener('mouseleave', () => {
                if (ghost) ghost.style.width = '0%';
            });
        });

        this.overlay.querySelectorAll('.profile-card').forEach(card => {
            card.addEventListener('click', () => {
                // Si no está en manual, lo activamos automáticamente para mejorar el flujo
                if (!GraphicsEngine.isManualMode) {
                    GraphicsEngine.setControlMode(true);
                    this.updateUIMode(true);
                }
                
                GraphicsEngine.applyTier(card.dataset.tier);
            });
        });

        this.overlay.querySelectorAll('.post-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                if (!GraphicsEngine.isManualMode) {
                    e.target.checked = !e.target.checked;
                    this.#shakeProfiles();
                    this.#notifyAction('Debes cambiar a MODO MANUAL para editar esto', 'warning');
                    return;
                }
                GraphicsEngine.setPostProfile(toggle.dataset.effect, e.target.checked);
                this.#notifyAction(`${e.target.checked ? 'Activado' : 'Desactivado'}: ${toggle.dataset.effect}`, 'success');
            });
        });

        this.overlay.querySelectorAll('.post-range').forEach(range => {
            range.addEventListener('input', () => {
                if (!GraphicsEngine.isManualMode) {
                    range.value = range.defaultValue;
                    this.#shakeProfiles();
                    this.#notifyAction('Debes cambiar a MODO MANUAL para editar esto', 'warning');
                    return;
                }
                const effect = range.dataset.effect;
                const val = parseFloat(range.value);
                const isPct = range.dataset.isPct === 'true';
                const label = range.parentElement.querySelector('.range-value');
                if (label) label.textContent = isPct ? `${(val * 100).toFixed(0)}%` : val;
                GraphicsEngine.setPostProfile(effect, val);
                this.#notifyAction(`Ajustado ${effect} a ${range.value}`, 'success');
            });
        });

    }

    /**
     * Sincroniza el estado inicial del modal con el motor gráfico.
     */
    syncInitialState() {
        const stats = GraphicsEngine.getCurrentStats();
        this.updateActiveCard(stats.profile);
        this.updateUIMode(stats.isManualMode);
        this.syncPostControls();
    }

    /**
     * Gestiona los listeners del motor gráfico de forma segura.
     */
    setupEngineListeners() {
        if (this._tierListener) return;
        
        this._tierListener = (e) => {
            if (this.overlay && this.overlay.classList.contains('active')) {
                this.updateActiveCard(e.detail.tier);
                this.updateUIMode(e.detail.isManual);
                this.syncPostControls();
            }
        };

        window.addEventListener(CONFIG.EVENTS.GRAPHICS.TIER_CHANGED, this._tierListener);
    }

    removeEngineListeners() {
        if (this._tierListener) {
            window.removeEventListener(CONFIG.EVENTS.GRAPHICS.TIER_CHANGED, this._tierListener);
            this._tierListener = null;
        }
    }

    /**
     * Sincroniza el modo de control globalmente (Engine + UI).
     */
    setGlobalMode(isManual) {
        GraphicsEngine.setControlMode(isManual);
        this.updateUIMode(isManual);
    }

    #shakeProfiles() {
        const section = this.overlay.querySelector('#profiles-section, #post-process-section');
        if (section) {
            section.classList.add('shake');
            setTimeout(() => section.classList.remove('shake'), 500);
        }
    }

    updateUIMode(isManual) {
        const containers = this.overlay.querySelectorAll('.profile-cards-container, .post-process-module');
        const modeStatus = this.overlay.querySelector('#perf-mode-status');
        const msg = this.overlay.querySelector('#perf-status-message');
        const toggle = this.overlay.querySelector('#perf-mode-toggle');
        const headerBtn = this.overlay.querySelector('#btn-quick-mode-toggle');
        const mainIcon = this.overlay.querySelector('#main-mode-icon');

        containers.forEach(c => {
            c.classList.toggle('manual-active', isManual);
            c.classList.toggle('auto-active', !isManual);
        });

        if (modeStatus) modeStatus.textContent = isManual ? 'MODO MANUAL' : 'MODO INTELIGENTE';
        if (toggle) toggle.checked = isManual;

        if (headerBtn) {
            headerBtn.querySelector('i').className = `bi ${isManual ? 'bi-hand-index-thumb' : 'bi-robot'}`;
            headerBtn.classList.toggle('active', isManual);
        }

        if (mainIcon) mainIcon.className = `bi ${isManual ? 'bi-hand-index-thumb' : 'bi-robot'}`;

        if (msg) {
            msg.innerHTML = isManual
                ? '<i class="bi bi-exclamation-triangle-fill"></i> Modo Manual activo. Las protecciones automáticas están desactivadas.'
                : '<i class="bi bi-shield-fill-check"></i> El motor Neural se auto-ajusta dinámicamente para mantener la estabilidad.';
        }
    }

    #notifyAction(message, type = 'success') {
        const msgBox = this.overlay.querySelector('#perf-status-message');
        if (!msgBox) return;
        
        // Save original HTML
        if (!this._originalMsgHTML) {
            this._originalMsgHTML = msgBox.innerHTML;
        }

        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
        const color = type === 'success' ? '#10b981' : '#f59e0b';
        
        msgBox.innerHTML = `<i class="bi ${icon}" style="color: ${color}"></i> <span style="color: ${color}"></span>`;
        // Mitigación XSS: inyectar el mensaje usando textContent en vez de interpolar en innerHTML
        msgBox.querySelector('span').textContent = message;
        msgBox.style.borderLeftColor = color;
        
        if (this._notifyTimeout) clearTimeout(this._notifyTimeout);
        
        this._notifyTimeout = setTimeout(() => {
            msgBox.innerHTML = this._originalMsgHTML;
            msgBox.style.borderLeftColor = '';
            this._originalMsgHTML = null;
        }, 3000);
    }

    syncPostControls() {
        const stats = GraphicsEngine.getCurrentStats();
        this.overlay.querySelectorAll('.post-toggle').forEach(tg => {
            const effect = tg.dataset.effect;
            if (stats.postProcess[effect] !== undefined) tg.checked = stats.postProcess[effect];
        });
        this.overlay.querySelectorAll('.post-range').forEach(range => {
            const effect = range.dataset.effect;
            if (stats.postProcess[effect] !== undefined) {
                const val = stats.postProcess[effect];
                range.value = val;
                const isPct = range.dataset.isPct === 'true';
                const label = range.parentElement.querySelector('.range-value');
                if (label) label.textContent = isPct ? `${(val * 100).toFixed(0)}%` : val;
            }
        });
    }

    async handleRecalibrate() {
        const btn = this.overlay.querySelector('#btn-recalibrate-header');
        if (btn) btn.classList.add('loading');
        await GraphicsEngine.calibrate();
        if (btn) btn.classList.remove('loading');
    }

    renderProfileOption(id, tierCode, name, desc) {
        return `
            <div class="profile-card" data-tier="${id}">
                <div class="profile-tier">${tierCode}</div>
                <div class="profile-content">
                    <span class="profile-title">${name}</span>
                    <span class="profile-description">${desc}</span>
                </div>
                <div class="profile-status-icon">
                    <i class="bi bi-check-circle-fill"></i>
                </div>
            </div>
        `;
    }

    updateActiveCard(activeTier) {
        if (!this.overlay) return;
        this.overlay.querySelectorAll('.profile-card').forEach(card => {
            card.classList.toggle('active', card.dataset.tier === activeTier);
        });
    }

    #updateElementIfChanged(id, newValue, colorProp = null, colorValue = null) {
        const el = document.getElementById(id);
        if (!el) return;
        if (this.prevStats[id] !== newValue) {
            el.textContent = newValue;
            this.prevStats[id] = newValue;
        }
        if (colorProp && this.prevStats[id + '_color'] !== colorValue) {
            el.style[colorProp] = colorValue;
            this.prevStats[id + '_color'] = colorValue;
        }
    }

    startTelemetry() {
        if (this.unsubscribe) this.unsubscribe();

        this.unsubscribe = uiState.subscribe((state) => {
            const stats = state.graphics;
            if (!stats) return;

            this.#updateElementIfChanged('perf-fps', stats.fps, 'color', stats.fps < 30 ? '#ef4444' : '#22c55e');
            this.#updateElementIfChanged('perf-dpr', stats.dpr);
            this.#updateElementIfChanged('perf-vram', stats.memory);
            this.#updateElementIfChanged('perf-mini-vram', `${stats.memory}GB`);
            this.#updateElementIfChanged('perf-objects', stats.objects);

            const stressValHeader = document.getElementById('perf-stress-val-header');
            const impactBar = document.getElementById('perf-impact-bar');

            // Cálculo de Estrés Neural (Compuesto) - Corregido para evitar sombras de lógica
            const fpsStress = stats.fps > 55 ? 10 : (stats.fps > 30 ? 40 : 80);
            
            // Corregido: Evaluar de mayor a menor para evitar que la primera condición atrape todo
            let latencyStress = 5;
            const lat = parseFloat(stats.latency);
            if (lat > 33) latencyStress = 40;
            else if (lat > 20) latencyStress = 15;

            // Memoria: stats.memory es el JS Heap en GB (vramUsed)
            const memoryStress = parseFloat(stats.memory) > 1.2 ? 30 : (parseFloat(stats.memory) > 0.6 ? 15 : 0);

            const finalStress = Math.min(100, fpsStress + latencyStress + memoryStress);

            // OPTIMIZATION: Only update DOM if stress actually changed
            if (this.prevStats['finalStress'] !== finalStress) {
                if (stressValHeader) stressValHeader.textContent = `${finalStress}%`;
                if (impactBar) {
                    impactBar.style.width = `${finalStress}%`;
                    impactBar.style.background = finalStress > 80 ? '#ef4444' : (finalStress > 50 ? '#f59e0b' : '#2563eb');
                }
                this.prevStats['finalStress'] = finalStress;
            }

            this.#updateElementIfChanged('perf-latency', `${stats.latency}ms`);
            this.#updateElementIfChanged('perf-uptime', `${stats.uptime}s`);

            this.#updateGuardsUI(finalStress, stats.isManualMode);
        });
    }

    #updateGuardsUI(stress, isManual) {
        const guards = [
            { id: 'guard-memory', base: 'PROTECTED', stress: 85 },
            { id: 'guard-reflow', base: 'OPTIMIZED', stress: 70 },
            { id: 'guard-ghost', base: 'CLEAN', stress: 90 },
            { id: 'guard-drp', base: 'STABLE', stress: 60 }
        ];
        guards.forEach(g => {
            const el = this.overlay.querySelector(`#${g.id}`);
            if (!el) return;
            const status = el.querySelector('.guard-status');

            let newText = g.base;
            let newClass = 'guard-status text-success';

            if (isManual) {
                newText = 'BYPASSED';
                newClass = 'guard-status text-warning';
            } else if (stress > g.stress) {
                newText = 'THROTTLED';
                newClass = 'guard-status text-danger';
            }

            // OPTIMIZATION: Only update DOM if actually changed
            const cacheKey = `guard_${g.id}`;
            const stateKey = `${newText}_${newClass}`;
            
            if (this.prevStats[cacheKey] !== stateKey) {
                status.textContent = newText;
                status.className = newClass;
                this.prevStats[cacheKey] = stateKey;
            }
        });

        // Update Global Guard Summary
        const summaryEl = this.overlay.querySelector('#perf-guards-summary');
        const globalStatus = this.overlay.querySelector('#guard-global-status');
        
        const globalText = isManual ? 'SISTEMA BYPASSED' : (stress > 80 ? 'SISTEMA BAJO ESTRÉS' : 'SISTEMA ACTIVO');
        const globalClass = isManual ? 'warning' : (stress > 80 ? 'danger' : 'active');

        if (this.prevStats['guard_global'] !== globalText) {
            if (summaryEl) {
                summaryEl.textContent = isManual ? 'Protecciones Desactivadas' : 'Memory / Reflow / Sanitizer / Throttler';
                summaryEl.className = `guard-status-summary ${isManual ? 'text-warning' : 'text-success'}`;
            }
            if (globalStatus) {
                globalStatus.innerHTML = `<i class="bi bi-${globalClass === 'active' ? 'shield-check' : 'shield-exclamation'}"></i> ${globalText}`;
                globalStatus.className = `badge-status-premium status-${globalClass}`;
            }
            this.prevStats['guard_global'] = globalText;
        }
    }

    stopTelemetry() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
    }
}

export default new PerformanceModal();
