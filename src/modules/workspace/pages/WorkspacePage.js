/**
 * WorkspacePage - Vista Principal del Ecosistema
 */
import { sessionState } from '@/core/state/session.js';
import DashboardPage from './DashboardPage.js';

export const WorkspacePage = {
    render() {
        const { user } = sessionState.get();
        const displayName = user?.displayName || user?.email || 'Usuario';
        
        return `
            <div class="workspace-layout glass-panel fade-in">
                <main id="workspace-content" class="flex-grow-1 p-3 p-md-4">
                    <header class="mb-4">
                        <h1 class="h3 fw-bold text-primary mb-1">Bienvenido a BUCA, ${displayName}</h1>
                        <p class="text-muted small">Panel de Gestión Centralizada</p>
                    </header>
                    <section class="row g-3" id="widget-container">
                        ${DashboardPage.render()}
                    </section>
                </main>
            </div>
        `;
    },
    init() {
        console.log('[WorkspacePage] -> Iniciando lógica de widgets');
        DashboardPage.init();
    }
};
export default WorkspacePage;
