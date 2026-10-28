/**
 * AuthValidator - Inteligencia del Módulo Auth
 * =========================================================================
 * Contiene las reglas de negocio puras para la validación de fases
 * y el procesamiento de retos de seguridad.
 * =========================================================================
 */
export const AuthValidator = {
    /**
     * Valida si una contraseña cumple con los estándares corporativos.
     * @param {string} password 
     * @returns {boolean}
     */
    isValidPassword(password) {
        // Mínimo 8 caracteres, al menos una letra y un número
        const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        return regex.test(password);
    },

    /**
     * Procesa la huella digital del dispositivo y determina si requiere reto.
     * @param {string} fingerprint 
     * @param {string} registeredFingerprint 
     * @returns {boolean} True si requiere verificación adicional.
     */
    requiresDeviceChallenge(fingerprint, registeredFingerprint) {
        if (!registeredFingerprint) return true;
        return fingerprint !== registeredFingerprint;
    },

    /**
     * Valida el PIN de reto (6 dígitos).
     * @param {string} pin 
     * @returns {boolean}
     */
    isValidChallengePin(pin) {
        return /^\d{6}$/.test(pin);
    }
};

export default AuthValidator;
