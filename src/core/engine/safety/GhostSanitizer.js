/**
 * GhostSanitizer - Limpieza de capas con will-change y opacity: 0
 * Rescatado de Legacy Engine (GraphicsManager.js)
 */
export class GhostSanitizer {
    constructor(engine) {
        this.engine = engine;
        this.interval = null;
    }

    start() {
        this.interval = setInterval(() => {
            this.sanitize();
        }, 30000); // Chequeo cada 30 segundos
    }

    sanitize() {
        if (this.engine.isPaused) return;

        if ('requestIdleCallback' in window) {
            requestIdleCallback(this.#performSanitize.bind(this));
        } else {
            setTimeout(this.#performSanitize.bind(this), 100);
        }
    }

    #performSanitize() {
        const ghosts = document.querySelectorAll('.hidden:not([data-bne-ignore])');
        let sanitizedCount = 0;
        ghosts.forEach(el => {
            if (el.style.display !== 'none') {
                el.style.display = 'none';
                sanitizedCount++;
            }
        });
        
        if (sanitizedCount > 0) {
            console.debug(`[GhostSanitizer] Eliminadas ${sanitizedCount} capas ocultas de la GPU.`);
        }
    }

    stop() {
        if (this.interval) clearInterval(this.interval);
    }
}
