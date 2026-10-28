/**
 * MemoryGuard - Prevención de fugas de memoria RAM
 * Rescatado de Legacy Engine (GraphicsManager.js)
 */
export class MemoryGuard {
    constructor(engine) {
        this.engine = engine;
        this.checkInterval = null;
    }

    start() {
        if (!performance.memory) {
            console.debug('[MemoryGuard] performance.memory no soportado.');
            return;
        }

        const checkMemory = () => {
            const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
            const usage = (usedJSHeapSize / jsHeapSizeLimit) * 100;

            if (usage > 80) {
                console.warn('[MemoryGuard] RAM Crítica detectada. Purgando estados visuales...');
                document.documentElement.classList.add('buca-thermal-throttle');
                this.engine.applyTier('eco');
                window.dispatchEvent(new CustomEvent('buca:perf_critical_network_pause'));
            } else if (usage < 50) {
                // Remove the throttle class if memory usage drops back down
                document.documentElement.classList.remove('buca-thermal-throttle');
            }
        };

        this.checkInterval = setInterval(checkMemory, 5000);
    }

    stop() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }
}
