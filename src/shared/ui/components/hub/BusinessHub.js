/**
 * @fileoverview BusinessHub Component
 * @module shared/ui/components/hub/BusinessHub
 * @description Gestiona el carrusel y las tarjetas de unidades de negocio.
 */

import { escapeHTML } from '@/shared/utils/security.js';

export const BusinessHub = {
    /**
     * Renderiza el HUB de negocios completo.
     * @param {Array} businesses - Lista de negocios a mostrar.
     * @returns {string} HTML string.
     */
    render(businesses = []) {
        // Si no hay negocios, usamos mocks por ahora (paridad con WidgetGrid legacy)
        const items = businesses.length > 0 ? businesses : [
            { name: 'Distribuidora BUCA', type: 'Retail / Alimentos', status: 'Active', progress: '92%', color: 'primary', location: 'Sede Central', invoices: 14, alerts: 2 },
            { name: 'Textiles El Faro', type: 'Manufactura', status: 'Warning', progress: '45%', color: 'accent', location: 'Zona Industrial', invoices: 5, alerts: 12 },
            { name: 'Logística Global', type: 'Transporte', status: 'Active', progress: '78%', color: 'success', location: 'Puerto Cabello', invoices: 32, alerts: 0 }
        ];

        return `
            <section class="ws-section ws-business-hub">
                <div class="section-header">
                    <h2 class="section-title"><i class="bi bi-briefcase"></i> Mis Negocios</h2>
                    <div class="carousel-nav-group">
                        <div class="carousel-arrows">
                            <button class="nav-arrow prev" onclick="window.scrollCarousel('prev')" title="Anterior">
                                <i class="bi bi-chevron-left"></i>
                            </button>
                            <button class="nav-arrow next" onclick="window.scrollCarousel('next')" title="Siguiente">
                                <i class="bi bi-chevron-right"></i>
                            </button>
                        </div>
                        <button class="btn-view-all" onclick="window.openModal('Todos mis Negocios')">
                            Ver todos <span><i class="bi bi-chevron-right"></i></span>
                        </button>
                    </div>
                </div>
                
                <div class="business-carousel-wrapper">
                    <div class="carousel-edge-fade left"></div>
                    <div class="carousel-edge-fade right"></div>
                    <div class="business-carousel" id="business-carousel-main">
                        ${items.map(b => this.renderCard(b)).join('')}
                        <div class="business-card create-new" onclick="window.openCreateBusiness()">
                            <div class="create-icon"><i class="bi bi-plus-lg"></i></div>
                            <span class="create-label">Crear Negocio</span>
                            <span class="create-subtext">Nueva unidad ERP</span>
                        </div>
                        <div class="carousel-spacer"></div>
                    </div>
                </div>
            </section>
        `;
    },

    /**
     * Renderiza una tarjeta de negocio individual.
     * @param {Object} business - Datos del negocio.
     * @returns {string} HTML string.
     */
    renderCard(business) {
        const { name, type, status, progress, color, location, invoices, alerts } = business;
        const statusClass = status.toLowerCase() === 'active' ? 'badge--eco' : 'badge--warning';
        
        return `
            <div class="business-card business-card--${color}">
                <div class="bc-header">
                    <div class="bc-badge-group">
                        <span class="bc-category">${escapeHTML(type)}</span>
                        <span class="bc-location"><i class="bi bi-geo-alt"></i> ${escapeHTML(location)}</span>
                    </div>
                </div>
                <div class="bc-body">
                    <div class="bc-main-info">
                        <h3 class="bc-name" title="${escapeHTML(name)}">${escapeHTML(name)}</h3>
                        <span class="badge ${statusClass}">${status}</span>
                    </div>
                    
                    <div class="bc-erp-summary">
                        <div class="erp-item">
                            <span class="erp-label">Facturas</span>
                            <span class="erp-value">${invoices}</span>
                        </div>
                        <div class="erp-item ${alerts > 5 ? 'critical' : ''}">
                            <span class="erp-label">Stock Crit.</span>
                            <span class="erp-value">${alerts}</span>
                        </div>
                    </div>

                    <div class="bc-progress-zone">
                        <div class="bc-progress-info">
                            <span class="label">Rendimiento Operativo</span>
                            <span class="value">${progress}</span>
                        </div>
                        <div class="bc-progress-bar">
                            <div class="bc-progress-fill" style="width: ${progress}">
                                <div class="shine-effect"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bc-footer">
                    <button class="btn btn-ghost w-full" data-business="${escapeHTML(name)}" onclick="window.enterBusiness(this.dataset.business)">
                        <span>Entrar a Gestión</span>
                        <i class="bi bi-arrow-right-short"></i>
                    </button>
                </div>
            </div>
        `;
    }
};
