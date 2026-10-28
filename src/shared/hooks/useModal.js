/**
 * useModal - Hook de Gestión de Ventanas Glass
 * =========================================================================
 * Centraliza la lógica de apertura y cierre de modales con estética
 * Glassmorphism, asegurando el bloqueo de scroll y accesibilidad.
 * =========================================================================
 */
export const useModal = () => {
    
    /**
     * Abre el modal base con contenido dinámico.
     * @param {Object} config - { title, subtitle, description, body }
     */
    const open = ({ title, subtitle, description, body }) => {
        if (window.openModal) {
            window.openModal(title, subtitle, description);
            
            const bodyEl = document.getElementById('modal-body-content');
            if (bodyEl && body) {
                bodyEl.innerHTML = body;
            }
        }
    };

    /**
     * Cierra el modal activo.
     */
    const close = () => {
        if (window.closeModal) {
            window.closeModal();
        }
    };

    return { open, close };
};

export default useModal;
