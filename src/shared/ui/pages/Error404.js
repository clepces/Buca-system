/**
 * Error404 - Vista de Página No Encontrada
 * =========================================================================
 * Proporciona una interfaz elegante de cristal para errores de navegación.
 */
export const Error404 = {
    render() {
        return `
            <div class="error-container animate__animated animate__zoomIn">
                <div class="error-glass-card">
                    <div class="error-badge">404</div>
                    <h2 class="error-title">Ruta Extraviada</h2>
                    <p class="error-message">
                        Lo sentimos, el módulo o sección que buscas no está disponible <br>
                        en este entorno o ha sido movido.
                    </p>
                    
                    <div class="error-actions">
                        <button onclick="window.history.back()" class="btn-secondary-glass">
                            <i class="bi bi-arrow-left"></i> Volver atrás
                        </button>
                        <a href="/auth/login" class="btn-primary">
                            <span>Ir al Inicio</span>
                            <i class="bi bi-house-door"></i>
                        </a>
                    </div>
                </div>
            </div>
        `;
    }
};

export default Error404;
