/**
 * Routes Configuration - Buca Modular
 * =========================================================================
 * Define el mapa de navegación base de la aplicación.
 * Las rutas específicas de cada módulo se registran dinámicamente.
 */

export const routes = [
    // El mapa base se mantiene minimalista para optimizar el bundle inicial.
    // Los módulos (Auth, Workspace, etc.) inyectarán sus propias rutas
    // mediante router.addRoutes() durante su inicialización.
    
    // El wildcard '*' es manejado internamente por el router.js 
    // para mostrar la vista de Error404 de forma dinámica.
];

export default routes;
