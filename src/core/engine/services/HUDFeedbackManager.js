
/**
 * HUD Feedback Manager
 * 
 * Reemplaza al antiguo NotificationManager.
 * Emite alertas en formato HUD y responde a estados de Pánico Térmico
 * del Buca Neural Engine.
 */
class HUDFeedbackManager {
    constructor() {
        this.toastQueue = [];
        this.isProcessing = false;
        this.container = null;
        this.init();
    }

    init() {
        // Aseguramos de correr después de que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupContainer());
        } else {
            this.setupContainer();
        }

        // BNE Event
        window.addEventListener('buca:notification', (e) => {
            this.pushFeedback(e.detail);
        });
        
        // Legacy Modular Event (Bridge)
        window.addEventListener('UI:NOTIFICATION_PUSH', (e) => {
            this.pushFeedback(e.detail);
        });
    }

    setupContainer() {
        this.container = document.getElementById('buca-hud-feedback-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'buca-hud-feedback-container';
            this.container.className = 'hud-feedback-container';
            document.body.appendChild(this.container);
        }
    }

    pushFeedback(data) {
        const options = typeof data === 'string' 
            ? { message: data, type: 'info', duration: 4000 } 
            : data;

        this.toastQueue.push(options);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.toastQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const currentToast = this.toastQueue.shift();
        
        await this.renderToast(currentToast);
        
        // Efecto Spring de separación (Staggering)
        setTimeout(() => {
            this.processQueue();
        }, 150);
    }

    renderToast(options) {
        return new Promise((resolve) => {
            if (!this.container) this.setupContainer();

            const toast = document.createElement('div');
            
            // ¿El motor está en pánico?
            const isThermalThrottle = document.documentElement.classList.contains('buca-thermal-throttle');
            
            toast.className = `hud-toast hud-toast--${options.type || 'info'} ${isThermalThrottle ? 'hud-toast--eco' : 'hud-toast--glass'}`;

            toast.innerHTML = `
                <div class="hud-toast-icon">
                    ${this.getIconForType(options.type)}
                </div>
                <div class="hud-toast-content">
                    <span class="hud-toast-message">${options.message}</span>
                </div>
                <button class="hud-toast-close" title="Cerrar">&times;</button>
            `;

            this.container.appendChild(toast);

            // Animate In (Reflow forzado para transición segura)
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    toast.classList.add('show');
                });
            });

            const duration = options.duration || 4000;
            let timeout;

            const removeToast = () => {
                clearTimeout(timeout);
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast.parentNode) toast.parentNode.removeChild(toast);
                    resolve();
                }, 300); // 300ms de transición CSS
            };

            const closeBtn = toast.querySelector('.hud-toast-close');
            if (closeBtn) {
                closeBtn.onclick = removeToast;
            }

            timeout = setTimeout(removeToast, duration);
        });
    }

    getIconForType(type) {
        switch(type) {
        case 'success': return '<i class="bi bi-check2-circle"></i>';
        case 'warning': return '<i class="bi bi-exclamation-triangle"></i>';
        case 'error': return '<i class="bi bi-x-octagon"></i>';
        default: return '<i class="bi bi-info-circle"></i>';
        }
    }
}

export default new HUDFeedbackManager();
