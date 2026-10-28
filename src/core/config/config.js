/**
 * BUCA Modular - Central Application Configuration
 * Sigue el estándar de buca-app-modular para asegurar compatibilidad de lógica y datos.
 */

export const CONFIG = {
    APP: {
        NAME: 'BUCA Website',
        DESCRIPTION: 'Buca Neural Engine Presentation',
        VERSION: '5.2.0',
        SUPPORT_EMAIL: 'support@buca.com.ve',
        WEBSITE: 'https://buca.com.ve'
    },

    DATABASE: {
        COLLECTIONS: {
            USERS: 'users',
            BUSINESSES: 'businesses',
            PRODUCTS: 'products',
            LOGS: 'system_logs'
        }
    },

    UI: {
        DEFAULT_THEME: 'light',
        GLASS_BLUR: '16px',
        ANIMATION_SPEED: 300
    },

    STORAGE: {
        THEME: 'buca-theme',
        PERFORMANCE: 'buca_performance_config',
        SESSION: 'buca_session_context'
    },

    EVENTS: {
        GRAPHICS: {
            TIER_CHANGED: 'graphics:tier-changed',
            PROFILE_UPDATE: 'graphics:profile-update'
        },
        KERNEL: {
            READY: 'kernel:ready',
            BOOT_PROGRESS: 'kernel:boot:progress'
        }
    }
};

export default CONFIG;
