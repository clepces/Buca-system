

/**
 * ProfilePanel - Subcomponente Rico del Header
 * =========================================================================
 * Gestiona la información del usuario, accesos rápidos y controles del motor.
 * Refactorizado para Seguridad Total (Event Delegation).
 */
export const ProfilePanel = {
    render: (tierCode = 'L1') => {
        return `
            <div id="panel-profile" class="glass-panel glass-panel--rich">
                <!-- Arrastre Táctil (Solo Visual en CSS) -->
                <div class="panel-mobile-handle d-md-none"></div>

                <!-- Header de Perfil -->
                <div class="panel-profile-zone d-flex align-items-center gap-3 p-3">
                    <div class="profile-avatar-lg position-relative flex-shrink-0">
                        DT
                        <span class="status-dot position-absolute bottom-0 end-0 bg-success border border-white rounded-circle"></span>
                    </div>
                    <div class="profile-info flex-grow-1 overflow-hidden">
                        <h6 class="profile-name mb-0 text-truncate fw-bold">David Tovar</h6>
                        <span class="profile-email text-muted small text-truncate d-block">admin@buca.com.ve</span>
                    </div>
                    <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-2" style="font-size: 0.7rem;">Enterprise</span>
                    
                    <!-- Botón Cerrar (Solo Móvil) -->
                    <button class="btn btn-sm btn-icon d-md-none ms-2" data-action="header:toggle_panel" data-target="panel-profile">
                        <i class="bi bi-chevron-down"></i>
                    </button>
                </div>

                <!-- Acceso Rápido (Bootstrap Scroll) -->
                <div class="px-3 pb-2 border-bottom">
                    <span class="panel-section-title d-block mb-2 text-uppercase fw-bold text-muted" style="font-size: 0.65rem; letter-spacing: 0.5px;">Acceso Rápido</span>
                    <div class="panel-quick-controls d-flex align-items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0 d-md-none" data-action="ui:toggle_theme">
                            <i class="bi bi-moon-stars"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0" data-action="header:toggle_fullscreen">
                            <i class="bi bi-arrows-fullscreen"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0 d-md-none" data-action="header:toggle_panel" data-target="panel-language">
                            <i class="bi bi-translate"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0 d-md-none" data-action="ui:open_rate">
                            <i class="bi bi-currency-exchange"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0" data-action="ui:open_performance">
                            <i class="bi bi-speedometer2"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-icon rounded-circle flex-shrink-0" data-action="ui:open_terminal">
                            <i class="bi bi-terminal"></i>
                        </button>
                    </div>
                </div>

                <!-- ÁREA DE SCROLL -->
                <div class="panel-scroll-area flex-grow-1 overflow-y-auto px-2 py-3">
                    <!-- Sección: Cuenta -->
                    <div class="list-group list-group-flush mb-4">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted" style="font-size: 0.65rem;">Mi Cuenta</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_profile">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-person-badge text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Perfil & Datos</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Edita tu información personal</div>
                            </div>
                            <i class="bi bi-chevron-right text-muted small"></i>
                        </button>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_security">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-shield-lock text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Seguridad PIN</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Configurar Llave Maestra</div>
                            </div>
                            <i class="bi bi-chevron-right text-muted small"></i>
                        </button>
                    </div>

                    <!-- Sección: Motor -->
                    <div class="list-group list-group-flush mb-4">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted" style="font-size: 0.65rem;">Motor de Rendimiento</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_performance">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-speedometer2 text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Buca Engine</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Niveles de renderizado</div>
                            </div>
                            <span class="badge bg-primary rounded-pill small" id="profile-engine-badge">${tierCode}</span>
                        </button>
                    </div>

                    <!-- Sección: Sistema -->
                    <div class="list-group list-group-flush">
                        <div class="px-2 mb-2"><span class="panel-section-title text-uppercase fw-bold text-muted" style="font-size: 0.65rem;">Sistema & Widgets</span></div>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:open_settings">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-gear-wide-connected text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Centro de Control</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Ajustes generales</div>
                            </div>
                        </button>
                        <button class="list-group-item list-group-item-action d-flex align-items-center gap-3 border-0 rounded-3 mb-1 py-2 px-2" data-action="ui:manage_widgets">
                            <div class="icon-box-sm bg-light rounded-2 p-2"><i class="bi bi-grid-3x3-gap text-primary"></i></div>
                            <div class="flex-grow-1">
                                <div class="fw-bold small">Gestión de Widgets</div>
                                <div class="text-muted" style="font-size: 0.7rem;">Personaliza tu dashboard</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- FOOTER -->
                <div class="panel-footer-bar p-3 border-top d-flex justify-content-between align-items-center bg-light-subtle">
                    <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2 px-3 rounded-pill" data-action="ui:logout">
                        <i class="bi bi-box-arrow-right"></i>
                        <span>Cerrar Sesión</span>
                    </button>
                    <button class="btn btn-link text-muted btn-sm p-0" data-action="ui:open_settings">
                        <i class="bi bi-gear-fill h5 mb-0"></i>
                    </button>
                </div>
            </div>
        `;
    }
};
