/**
 * Workspace Routes - Navegación del Área de Trabajo
 */
import WorkspacePage from './pages/WorkspacePage.js';

export const workspaceRoutes = [
    {
        path: '/',
        component: WorkspacePage,
        title: 'Inicio',
        requiresAuth: true
    },
    {
        path: '/workspace',
        component: WorkspacePage,
        title: 'Tablero de Control',
        requiresAuth: true
    },
    {
        path: '/workspace/settings',
        component: { render: () => '<h2>Configuración del Negocio</h2>' },
        title: 'Ajustes',
        requiresAuth: true
    }
];

export default workspaceRoutes;
