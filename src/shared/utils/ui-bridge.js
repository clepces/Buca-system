/**
 * UI Bridge - Global Window Functions
 * =========================================================================
 * Expone funciones al objeto global window para asegurar compatibilidad
 * con manejadores de eventos inline en el HTML (legacy bridge).
 */

import kernel from '@/core/kernel.js';
import { eventBus } from '@/core/eventBus/index.js';
import GraphicsEngine from '@/core/engine/engine.js';
import PerformanceModal from '@/shared/ui/overlays/PerformanceModal.js';
import { RateModal } from '@/shared/ui/overlays/RateModal.js';
import { CONFIG } from '@/core/config/config.js';

export const initUIBridge = () => {
    
    // ── TEMA Y UI ───────────────────────────────────────────
    window.toggleTheme = () => {
        const htmlElem = document.documentElement;
        const currentTheme = htmlElem.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElem.setAttribute('data-theme', newTheme);
        localStorage.setItem(CONFIG.STORAGE.THEME, newTheme);
        kernel.updateThemeUI(newTheme);
    };

    window.updateThemeUI = (theme) => kernel.updateThemeUI(theme);

    // ── MOTOR GRÁFICO (BNE) ──────────────────────────────────
    window.toggleEcoMode = () => {
        if (GraphicsEngine.profile === 'eco') {
            GraphicsEngine.applyTier('balanced');
        } else {
            GraphicsEngine.applyTier('eco');
        }
    };

    window.openPerformanceSettings = () => PerformanceModal.show();
    window.recalibrateEngine = () => GraphicsEngine.calibrate();

    // ── NAVEGACIÓN Y DOCK ────────────────────────────────────
    window.scrollDock = (amount) => {
        const dock = document.getElementById('dock-scrollable');
        if (dock) dock.scrollBy({ left: amount, behavior: 'smooth' });
    };

    window.updateDockArrows = () => {
        const dock = document.getElementById('dock-scrollable');
        const arrows = document.querySelectorAll('.nav-arrow');
        if (!dock || arrows.length < 2) return;
        
        const leftArrow = arrows[0];
        const rightArrow = arrows[1];
        
        leftArrow.style.display = dock.scrollLeft <= 5 ? 'none' : 'flex';
        rightArrow.style.display = Math.ceil(dock.scrollLeft + dock.clientWidth) >= dock.scrollWidth - 5 ? 'none' : 'flex';
    };

    // ── MODALES Y DIÁLOGOS ───────────────────────────────────
    window.openModal = (title, subtitle = 'Información del Sistema', description = 'Resumen detallado de la métrica u operación seleccionada.') => {
        const modal = document.getElementById('modal-base');
        const titleEl = document.getElementById('modal-title');
        const subtitleEl = modal?.querySelector('.modal-subtitle');
        const descEl = document.getElementById('modal-description');

        if (modal && titleEl) {
            titleEl.innerText = title;
            if (subtitleEl) subtitleEl.innerText = subtitle;
            if (descEl) descEl.innerText = description;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeModal = () => {
        const modal = document.getElementById('modal-base');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    window.closeModalOutside = (event) => {
        if (event.target.classList.contains('glass-modal-overlay')) window.closeModal();
    };

    window.openRateModal = () => RateModal.show();
    window.openTerminal = () => window.openModal('Terminal Buca');
    window.openSettings = () => window.openModal('Configuraciones del Sistema');
    window.openHelp = () => window.openModal('Asistencia y Soporte');
    window.openCreateBusiness = () => window.openModal('Registrar Nuevo Negocio', 'Buca Startup Wizard', 'Complete los pasos visuales para dar de alta su nueva unidad de negocio.');
    
    window.enterBusiness = (name) => {
        console.log(`[UIBridge] -> Entering business: ${name}`);
        eventBus.emit('router:navigate', { path: '/workspace' });
    };
};
