import { uiState } from '@/core/state/ui.js';
import { CONFIG } from '@/core/config/config.js';
import { tiers, defaultPostProcess } from '@/core/engine/profiles/index.js';
import { detectHardware } from '@/core/engine/utils/hardwareDetector.js';
import { FPSMonitor } from '@/core/engine/monitors/FPSMonitor.js';
import { ThermalGuard } from '@/core/engine/monitors/ThermalGuard.js';
import { MemoryGuard } from '@/core/engine/monitors/MemoryGuard.js';
import { ResourceThrottle } from '@/core/engine/services/ResourceThrottle.js';
import { ReflowGuard } from '@/core/engine/safety/ReflowGuard.js';
import { GhostSanitizer } from '@/core/engine/safety/GhostSanitizer.js';
import { storage } from '@/core/storage/StorageAdapter.js';

/**
 * GraphicsEngine - El motor neural de BUCA
 * =========================================================================
 * Gestiona el rendimiento visual, la calibración de hardware y los efectos
 * de post-procesado dinámicos.
 */
export class GraphicsEngine {
    static #instance = null;
    static VERSION = '5.2.0';

    // Propiedades de Gestión de Assets (Unificadas de Graphics.js)
    activeElements = new Set();
    mutationObserver = null;
    intersectionObserver = null;

    constructor() {
        if (GraphicsEngine.#instance) {
            return GraphicsEngine.#instance;
        }

        this.profile = 'balanced';
        this.fps = 60;
        this.latency = 0; // Latencia en ms
        this.startTime = Date.now();
        this.storageKey = CONFIG.STORAGE.PERFORMANCE;
        this.isPaused = false;
        this.isCalibrating = false;
        this.isManualMode = false;
        
        this.tiers = tiers;
        this.dpr = window.devicePixelRatio || 1;
        this.blurFactor = Math.max(0.4, 1 / this.dpr);
        this.postProcess = { ...defaultPostProcess };
        
        this.fpsMonitor = new FPSMonitor(this);
        this.thermalMonitor = new ThermalGuard(this);
        this.memoryGuard = new MemoryGuard(this);
        this.resourceThrottler = new ResourceThrottle(this);
        this.reflowGuard = new ReflowGuard(this);
        this.ghostSanitizer = new GhostSanitizer(this);

        this._visibilityHandler = this.#handleVisibilityChange.bind(this);
        this._resizeHandler = this.#handleResize.bind(this);

        this.#setupVisibilityListener();
        this.#setupRescaleListener();
        
        // Sincronización con el sistema de estado reactivo (v4.8.0)
        this.#initTelemetrySync();
        this.#initAssetManagement();

        GraphicsEngine.#instance = this;
    }

    /**
     * Inicializa los observadores de assets para carga dinámica.
     * @private
     */
    #initAssetManagement() {
        // 1. IntersectionObserver: Gestiona qué assets deben procesarse
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.activeElements.add(entry.target);
                    this.processElement(entry.target);
                } else {
                    this.activeElements.delete(entry.target);
                }
            });
        }, { 
            rootMargin: '100px',
            threshold: 0.01 
        });

        // 2. MutationObserver: Detectar nuevos elementos en el DOM
        this.mutationObserver = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) this.observeNewNodes(node);
                }
            }
        });

        this.mutationObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Escanea y observa nuevos nodos para optimización visual.
     */
    observeNewNodes(root) {
        const selector = '[data-buca-asset], [data-perf-src], [data-src-default]';
        if (root.matches && root.matches(selector)) {
            this.intersectionObserver.observe(root);
        }
        root.querySelectorAll(selector).forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Escaneo inicial del DOM.
     */
    scan() {
        const selector = '[data-buca-asset], [data-perf-src], [data-src-default]';
        document.querySelectorAll(selector).forEach(el => {
            this.intersectionObserver.observe(el);
        });
    }

    /**
     * Procesa un elemento individual según el perfil de rendimiento activo.
     */
    processElement(el) {
        if (!el) return;
        
        const tier = this.profile;
        const tierData = this.tiers[tier];
        const highResSuffix = this.dpr > 1.2 ? '@2x' : '';
        
        const newSrc = el.getAttribute(`data-src-${tier}`) || 
                       el.getAttribute(`data-src-${tierData.id}`) || 
                       (highResSuffix ? el.getAttribute(`data-src${highResSuffix}`) : null) ||
                       el.getAttribute('data-src-default') ||
                       el.getAttribute('src');

        if (newSrc && el.src !== newSrc) {
            this.#applySourceWithTransition(el, newSrc);
        }

        if (el.tagName === 'VIDEO') {
            if (tier === 'eco') {
                el.pause();
                el.style.opacity = '0.3';
            } else {
                el.style.opacity = '1';
                el.play().catch(() => {}); 
            }
        }
    }

    #applySourceWithTransition(el, src) {
        if (el.tagName === 'IMG') {
            el.style.filter = 'blur(10px)';
            el.style.opacity = '0.7';
            el.style.transition = 'filter 0.4s ease, opacity 0.4s ease';
            
            const tempImg = new Image();
            tempImg.onload = () => {
                el.src = src;
                el.style.filter = 'none';
                el.style.opacity = '1';
            };
            tempImg.src = src;
        } else {
            el.src = src;
        }
    }

    /**
     * Inicia el reporte periódico de estadísticas al uiState.
     */
    #initTelemetrySync() {
        this._stateSyncInterval = setInterval(() => {
            if (this.isPaused || document.hidden) return;
            
            const stats = this.getCurrentStats();
            uiState.updateGraphics({
                fps: stats.fps,
                latency: stats.latency,
                memory: stats.vramUsed,
                objects: stats.objects,
                uptime: stats.uptime,
                dpr: stats.dpr,
                isManualMode: this.isManualMode,
                profile: this.profile
            });
        }, 1000);
    }

    #handleResize() {
        const newDpr = window.devicePixelRatio || 1;
        if (newDpr !== this.dpr) {
            this.dpr = newDpr;
            this.blurFactor = Math.max(0.4, 1 / this.dpr);
            this.applyTier(this.profile);
        }
    }

    #handleVisibilityChange() {
        if (document.hidden) {
            this.isPaused = true;
        } else {
            this.isPaused = false;
            if (this.fpsMonitor) this.fpsMonitor.lastFrameTime = performance.now();
        }
    }

    #setupRescaleListener() {
        window.addEventListener('resize', this._resizeHandler);
    }

    #setupVisibilityListener() {
        document.addEventListener('visibilitychange', this._visibilityHandler);
    }

    /**
     * Limpia recursos, detiene monitores de rendimiento y remueve observadores globales (Evita fugas de memoria y CPU).
     */
    destroy() {
        window.removeEventListener('resize', this._resizeHandler);
        document.removeEventListener('visibilitychange', this._visibilityHandler);
        
        // 1. Detener monitores de rendimiento y guardias activos (Evitar hilos huérfanos)
        if (this.fpsMonitor) this.fpsMonitor.stop();
        if (this.thermalMonitor) {
            if (this.thermalMonitor.stop) this.thermalMonitor.stop();
            else if (this.thermalMonitor.disconnect) this.thermalMonitor.disconnect();
        }
        if (this.memoryGuard && this.memoryGuard.stop) this.memoryGuard.stop();
        if (this.reflowGuard && this.reflowGuard.stop) this.reflowGuard.stop();
        if (this.ghostSanitizer && this.ghostSanitizer.stop) this.ghostSanitizer.stop();
        if (this.resourceThrottler && this.resourceThrottler.stop) this.resourceThrottler.stop();

        // 2. Detener el reporte periódico de telemetría al uiState
        if (this._stateSyncInterval) {
            clearInterval(this._stateSyncInterval);
            this._stateSyncInterval = null;
        }

        // 3. Desconectar observadores del DOM (Libera memoria de nodos pesados)
        if (this.mutationObserver) {
            this.mutationObserver.disconnect();
            this.mutationObserver = null;
        }
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
            this.intersectionObserver = null;
        }

        // 4. Limpiar lista de elementos activos y resetear instancia del Singleton
        this.activeElements.clear();
        GraphicsEngine.#instance = null;
        
        console.log('[GraphicsEngine] Destroyed and cleaned up fully.');
    }

    async init() {
        console.log('%c 🚀 BUCA NEURAL ENGINE: Initializing Modular Phase 4... ', 'background: #2563eb; color: #fff; font-weight: bold;');

        const savedConfig = await storage.get(this.storageKey);
        if (savedConfig) {
            this.profile = savedConfig.profile || 'balanced';
            this.isManualMode = savedConfig.isManualMode || false;
            if (savedConfig.postProcess) this.postProcess = { ...this.postProcess, ...savedConfig.postProcess };
            this.applyTier(this.profile);
        } else {
            await this.calibrate();
        }

        this.startMonitors();
        
        return {
            tier: this.tiers[this.profile].id,
            profile: this.profile,
            stats: this.getCurrentStats()
        };
    }

    async calibrate() {
        if (this.isCalibrating) return;
        this.isCalibrating = true;

        console.log('%c 🧪 Calibrating hardware performance... ', 'color: #8b5cf6;');
        this.applyTier('balanced');

        return new Promise((resolve) => {
            let frames = 0;
            const start = performance.now();

            const bench = () => {
                frames++;
                if (performance.now() - start < 1000) {
                    requestAnimationFrame(bench);
                } else {
                    const hw = detectHardware();
                    let suggestion = hw.suggestion;

                    if (frames > 55 && suggestion !== 'ultra' && suggestion !== 'pro') {
                        // VRAM Guard ensures we don't go ultra without enough ram
                    } else if (frames < 30) {
                        suggestion = 'eco';
                    }

                    if (hw.memory < 3.5 && (suggestion === 'ultra' || suggestion === 'pro')) {
                        console.warn('[GraphicsEngine] VRAM Guard: Memoria insuficiente. Forzando degradación.');
                        suggestion = 'balanced';
                    }

                    console.log(`%c 🏁 Calibración completa: ${frames} FPS | DPR: ${this.dpr} | Mem: ${hw.memory}GB. Sugerido: ${suggestion} `, 'color: #10b981; font-weight: bold;');

                    if (!this.isManualMode) {
                        this.applyTier(suggestion);
                    }

                    this.isCalibrating = false;
                    resolve(suggestion);
                }
            };
            requestAnimationFrame(bench);
        });
    }

    applyTier(tier) {
        if (!this.tiers[tier]) return;

        const hw = detectHardware();
        if (!this.isManualMode && hw.memory < 4 && (tier === 'ultra' || tier === 'pro')) {
            tier = 'balanced';
        }

        this.profile = tier;
        const tierData = this.tiers[tier];

        const root = document.documentElement;
        root.setAttribute('data-buca-perf', tierData.id);
        root.setAttribute('data-buca-manual', this.isManualMode ? 'true' : 'false');
        root.style.setProperty('--buca-tier-num', tierData.num);
        root.style.setProperty('--buca-blur-factor', this.blurFactor);

        // Core Effects
        root.setAttribute('data-buca-bloom', this.postProcess.bloom);
        root.setAttribute('data-buca-grain', this.postProcess.grain);
        root.setAttribute('data-buca-reflections', this.postProcess.glassReflections);
        root.setAttribute('data-buca-shadows', this.postProcess.shadows);
        root.setAttribute('data-buca-aa', this.postProcess.antiAliasing);
        
        // Intensity & Quality Modifiers
        root.style.setProperty('--buca-bloom-intensity', this.postProcess.bloomIntensity);
        root.style.setProperty('--buca-blur-modifier', this.postProcess.blurIntensity);
        root.style.setProperty('--buca-grain-intensity', this.postProcess.grainIntensity);
        root.style.setProperty('--buca-shadow-quality', this.postProcess.shadowQuality);
        root.style.setProperty('--buca-particle-density', this.postProcess.particleDensity);

        storage.set(this.storageKey, {
            profile: tier,
            isManualMode: this.isManualMode,
            postProcess: this.postProcess,
            timestamp: Date.now()
        });

        window.dispatchEvent(new CustomEvent(CONFIG.EVENTS.GRAPHICS.TIER_CHANGED, {
            detail: {
                tier,
                id: tierData.id,
                num: tierData.num,
                isManual: this.isManualMode,
                isLowPerf: tier === 'eco' || tier === 'balanced'
            }
        }));

        // Actualizar assets activos con el nuevo perfil
        this.activeElements.forEach(el => this.processElement(el));

        // Integración con el nuevo Estado Reactivo (Portado de Modular)
        uiState.updateGraphics({
            tier,
            id: tierData.id,
            isManualMode: this.isManualMode,
            timestamp: Date.now()
        });
    }

    setControlMode(isManual) {
        this.isManualMode = isManual;
        this.applyTier(this.profile);
    }

    setPostProfile(effect, value) {
        if (Object.prototype.hasOwnProperty.call(this.postProcess, effect)) {
            this.postProcess[effect] = value;
            this.applyTier(this.profile);
        }
    }

    startMonitors() {
        this.fpsMonitor.start();
        this.thermalMonitor.start();
        this.memoryGuard.start();
        this.reflowGuard.start();
        this.ghostSanitizer.start();
    }

    degrade() {
        if (this.isManualMode) return;
        const sequence = ['eco', 'balanced', 'pro', 'ultra'];
        const currentIndex = sequence.indexOf(this.profile);
        if (currentIndex > 0) {
            this.applyTier(sequence[currentIndex - 1]);
        }
    }

    upgrade() {
        if (this.isManualMode) return;
        const sequence = ['eco', 'balanced', 'pro', 'ultra'];
        const currentIndex = sequence.indexOf(this.profile);
        if (currentIndex < sequence.length - 1) {
            this.applyTier(sequence[currentIndex + 1]);
        }
    }

    #cachedObjectCount = 0;
    #lastObjectCountTime = 0;

    #getObjectCount() {
        const now = Date.now();
        if (now - this.#lastObjectCountTime > 5000) {
            this.#cachedObjectCount = document.querySelectorAll('*').length;
            this.#lastObjectCountTime = now;
        }
        return this.#cachedObjectCount;
    }

    getCurrentStats() {
        const memoryInfo = window.performance?.memory;
        const jsHeap = memoryInfo ?
            (memoryInfo.usedJSHeapSize / (1024 * 1024 * 1024)).toFixed(2) :
            '0.00';

        return {
            version: GraphicsEngine.VERSION,
            fps: this.fps,
            latency: this.latency.toFixed(1),
            uptime: Math.floor((Date.now() - this.startTime) / 1000),
            profile: this.profile,
            tier: this.tiers[this.profile],
            memory: navigator.deviceMemory || 4,
            vramUsed: jsHeap, // Renombrado internamente para claridad
            cores: navigator.hardwareConcurrency || 4,
            dpr: this.dpr.toFixed(1),
            blurFactor: this.blurFactor.toFixed(2),
            isManualMode: this.isManualMode,
            isPaused: this.isPaused,
            objects: this.#getObjectCount(),
            postProcess: { ...this.postProcess }
        };
    }
}
