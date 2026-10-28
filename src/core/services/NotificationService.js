/**
 * NotificationService - Centralizador de Comunicaciones del Ecosistema BNE
 * =========================================================================
 * Integra servicios de terceros (EmailJS, SMS, Push) utilizando la arquitectura
 * resiliente de BaseClient para evitar duplicación de código en los módulos.
 */
import { BaseClient } from '@/core/api/BaseClient.js';
import { ENDPOINTS } from '@/core/api/endpoint.js';

// Configuración Corporativa de EmailJS (Desde Variables de Entorno)
const EMAIL_CONFIG = {
    SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_7tp426h', 
    TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_uf6oc8e', 
    PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'zsNADkNE3WBrYJdw1',   
};

// Instancia de cliente externa sin interceptores de Auth
const emailClient = new BaseClient(ENDPOINTS.SERVICES.NOTIFICATIONS.EMAILJS);

export const NotificationService = {
    
    /**
     * Envía un correo electrónico transaccional utilizando EmailJS.
     * @param {Object} templateParams Parámetros requeridos por la plantilla.
     * @returns {Promise<boolean>}
     */
    async sendEmail(templateParams) {
        try {
            console.log(`[NotificationService] -> Enviando correo a ${templateParams.to_mail}...`);
            
            await emailClient.post('/email/send', {
                service_id: EMAIL_CONFIG.SERVICE_ID,
                template_id: EMAIL_CONFIG.TEMPLATE_ID,
                user_id: EMAIL_CONFIG.PUBLIC_KEY,
                template_params: templateParams
            });
            
            console.log('[NotificationService] -> ✅ Correo transaccional enviado con éxito.');
            return true;
        } catch (error) {
            console.error('[NotificationService] -> ❌ Error en el envío:', error.message || error);
            return false;
        }
    },

    /**
     * Envía un código OTP para validación (Auth, Dispositivo, Operaciones críticas).
     * @param {string} email Correo del destinatario.
     * @param {string} userName Nombre del destinatario.
     * @param {string} code Código OTP numérico.
     * @param {string} context Mensaje de contexto para el correo.
     * @returns {Promise<boolean>}
     */
    async sendOTP(email, userName, code, context = 'Se ha solicitado un código de verificación de seguridad:') {
        if (!email) return false;

        const params = {
            to_mail: email,
            to_name: userName || 'Usuario Corporativo',
            code: code,
            message: context,
            current_year: new Date().getFullYear(),
        };

        const success = await this.sendEmail(params);
        if (!success) {
            console.warn(`[DEV FALLBACK] Código OTP generado localmente: ${code}`);
        }
        return success;
    },

    /**
     * (Placeholder) Envío de SMS a futuro.
     */
    async sendSMS(phone, message) {
        console.log(`[NotificationService] -> Preparado para integración SMS en ${phone}: ${message}`);
        // Implementación futura con Twilio/MessageBird
        return true;
    }
};

export default NotificationService;
