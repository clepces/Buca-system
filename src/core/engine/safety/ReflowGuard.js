/**
 * ReflowGuard - Prevención de layouts thrashing y mutaciones masivas
 * Rescatado de Legacy Engine (GraphicsManager.js)
 */
export class ReflowGuard {
    constructor(engine) {
        this.engine = engine;
        this.reflowCount = 0;
        this.lastReflowCheck = Date.now();
        this.observer = null;
    }

    start() {
        this.observer = new MutationObserver(() => {
            this.reflowCount++;
            const now = Date.now();
            if (now - this.lastReflowCheck > 1000) {
                if (this.reflowCount > 80) { 
                    // Evitar degradación en cascada: esperar al menos 5s entre ajustes automáticos
                    if (!this._lastDegradeTime || now - this._lastDegradeTime > 5000) {
                        console.warn(`[ReflowGuard] Reflow excesivo detectado: ${this.reflowCount}/s. Degradando.`);
                        document.documentElement.classList.add('buca-reflow-throttle');
                        this.engine.degrade();
                        this._lastDegradeTime = now;
                    }
                } else {
                    document.documentElement.classList.remove('buca-reflow-throttle');
                }
                this.reflowCount = 0;
                this.lastReflowCheck = now;
            }
        });

        this.observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    }

    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}
