/**
 * Error404 - Página de Recurso No Encontrado
 * =========================================================================
 * Se muestra cuando una ruta no coincide con ninguna configurada.
 */
export const Error404 = {
    render: () => {
        return `
            <div class="error-page view-enter">
                <div class="error-container">
                    <div class="error-glass-card">
                        <div class="error-badge">404</div>
                        <h2 class="error-title">Página no encontrada</h2>
                        <p class="error-message">Lo sentimos, el recurso que intentas acceder no existe o ha sido movido.</p>
                        <div class="error-actions">
                            <a href="/" class="btn btn-primary">Volver al Inicio</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        console.warn('[ErrorView] 404 Renderizado');
    }
};

export default Error404;
