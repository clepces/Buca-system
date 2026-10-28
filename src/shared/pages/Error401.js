/**
 * Error401 - Acceso No Autorizado
 * =========================================================================
 * Se muestra cuando el usuario intenta acceder a una ruta protegida sin sesión.
 */
export const Error401 = {
    render: () => {
        return `
            <div class="error-page view-enter">
                <div class="error-container">
                    <div class="error-glass-card">
                        <div class="error-badge">401</div>
                        <h2 class="error-title">Sesión Requerida</h2>
                        <p class="error-message">Debes iniciar sesión para acceder a este módulo protegido.</p>
                        <div class="error-actions">
                            <a href="/auth/login" class="btn btn-primary">Ir al Login</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    init: () => {
        console.warn('[ErrorView] 401 Renderizado');
    }
};

export default Error401;
