/**
 * MainLayout - Estructura Base de la Aplicación
 * =========================================================================
 * Define los slots donde se inyectarán los componentes dinámicos.
 * Mantiene la paridad con el proyecto modular pero simplificado para diseño.
 */
export const MainLayout = {
    render: () => {
        return `
            <!-- Capa de desenfoque de fondo -->
            <div class="bg-overlay" aria-hidden="true"></div>

            <!-- Header Stack -->
            <div id="header-stack" class="layout-header-container">
                <div id="topbar-slot"></div>
                <div id="workspace-nav-slot"></div>
            </div>

            <!-- Workspace Principal -->
            <main class="workspace-area">
                <div class="workspace-fade top"></div>
                <div class="workspace-internal container-max">
                    <div id="workspace-dynamic-content"></div>
                    <div class="bottom-spacer"></div>
                </div>
            </main>

            <!-- Dock y Footer Slots -->
            <div id="dock-slot"></div>
            <div id="footer-slot"></div>

            <!-- Modal Base -->
            <div id="modal-base" class="glass-modal-overlay" aria-hidden="true" onclick="closeModalOutside(event)">
                <div class="glass-modal">
                    <div class="modal-header">
                        <div class="header-title">
                            <h3 id="modal-title">Vista Resumida</h3>
                            <span class="modal-subtitle">Información del Sistema</span>
                            <p class="modal-description" id="modal-description">Resumen detallado.</p>
                        </div>
                        <div class="header-actions">
                            <button class="modal-close-btn" data-action="ui:close_modal" onclick="closeModal()">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                    <div class="modal-body" id="modal-body-content"></div>
                    <div class="modal-footer">
                        <button class="btn btn-ghost" data-action="ui:close_modal" onclick="closeModal()">Cerrar</button>
                        <button class="btn btn-primary px-4">Confirmar</button>
                    </div>
                </div>
            </div>
        `;
    }
};
