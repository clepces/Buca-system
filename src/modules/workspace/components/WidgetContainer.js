/**
 * WidgetContainer - Receptáculo de Widgets Neurales
 */
export const WidgetContainer = {
    render(widgets = []) {
        return `
            <div class="glass-grid" id="main-workspace-grid">
                ${widgets.map(w => `<div id="slot-${w.id}"></div>`).join('')}
            </div>
        `;
    }
};
export default WidgetContainer;
