/**
 * Error403 - Acceso Denegado (Forbidden)
 * =========================================================================
 * Se muestra cuando el usuario tiene sesión pero no tiene el rol necesario.
 */
export const Error403 = {
    render: () => {
        return `
            <div class="error-page view-enter">
                <div class="error-container">
                    <div class="error-glass-card">
                        <div class="error-badge">403</div>
                        <h2 class="error-title">Acceso Denegado</h2>
                        <p class="error-message">No tienes permisos suficientes para visualizar este contenido o realizar esta acción.</p>
                        <div class="error-actions">
                            <a href="/" class="btn btn-primary">Volver al Dashboard</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        console.warn('[ErrorView] 403 Renderizado');
    }
};

export default Error403;
