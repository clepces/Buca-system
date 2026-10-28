/**
 * NotificationsPanel - Subcomponente del Header
 * =========================================================================
 * Renderiza el dropdown de notificaciones del sistema.
 */
export const NotificationsPanel = {
    render: () => {
        return `
            <div id="panel-notifications" class="glass-panel glass-panel--standard">
                <div class="panel-header"><i class="bi bi-bell-fill"></i> Notificaciones</div>
                <div class="panel-scroll-area">
                    <div class="panel-empty">
                        <i class="bi bi-bell-slash"></i>
                        <span>No hay notificaciones</span>
                        <span style="font-size: 0.75rem; opacity: 0.6;">Las alertas del sistema aparecerán aquí</span>
                    </div>
                </div>
            </div>
        `;
    }
};
