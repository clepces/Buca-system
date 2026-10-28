/**
 * Error404 - Página de Recurso No Encontrado
 * =========================================================================
 * Se muestra cuando una ruta no coincide con ninguna configurada.
 */
import { router } from '@/core/router/router.js';

export const Error404 = {
    render: () => {
        return `
            <div class="error-page view-enter">
                <div class="error-container">
                    <div class="error-glass-card">
                        <div class="error-badge">404</div>
                        <h2 class="error-title">Página no encontrada</h2>
                        <p class="error-message">Lo sentimos, el recurso que intentas acceder no existe o ha sido movido.</p>
                        <div class="error-actions d-flex gap-2 justify-content-center">
                            <button id="btn-err-back" class="btn btn-secondary-glass">
                                <i class="bi bi-arrow-left"></i> Volver atrás
                            </button>
                            <button id="btn-err-home" class="btn btn-primary">
                                <i class="bi bi-house-door"></i> Volver al Inicio
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        const btnBack = document.getElementById('btn-err-back');
        const btnHome = document.getElementById('btn-err-home');
        if (btnBack) btnBack.onclick = () => window.history.back();
        if (btnHome) btnHome.onclick = () => router.navigate('/workspace');
    }
};

export default Error404;
