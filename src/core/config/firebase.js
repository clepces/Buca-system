import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { ENV } from './environment.js';

/**
 * Firebase Module - BUCA Modular
 * =========================================================================
 * Maneja la inicialización de Firebase siguiendo el patrón de arquitectura centralizada.
 */

let app;
let auth;
let db;
let functions;

export const initFirebase = () => {
    if (app) return { app, auth, db, functions };

    console.log('[Firebase] Initializing Modular Services...');

    try {
        app = initializeApp(ENV.FIREBASE);
        auth = getAuth(app);
        // Habilitar Persistencia Offline Nativa (Sustituye database.js legacy y getFirestore)
        db = initializeFirestore(app, {
            localCache: persistentLocalCache({
                tabManager: persistentMultipleTabManager()
            })
        });
        functions = getFunctions(app);

        // [GUARDIÁN DE PRESUPUESTO]
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

        if (isLocalhost || ENV.USE_EMULATOR) {
            console.warn('%c 🛡️ BUCA SECURITY: MODO EMULADOR ACTIVO ', 'background: #2563eb; color: #fff; font-weight: bold; padding: 4px 8px; border-radius: 4px;');
            
            const authHost = isLocalhost ? 'http://localhost:9099' : ENV.EMULATOR_HOSTS.AUTH;
            const dbHost = isLocalhost ? 'localhost' : ENV.EMULATOR_HOSTS.FIRESTORE;
            const dbPort = isLocalhost ? 8080 : ENV.EMULATOR_HOSTS.FIRESTORE_PORT;
            const fnPort = isLocalhost ? 5001 : ENV.EMULATOR_HOSTS.FUNCTIONS_PORT;

            connectAuthEmulator(auth, authHost, { disableWarnings: true });
            connectFirestoreEmulator(db, dbHost, dbPort);
            connectFunctionsEmulator(functions, dbHost, fnPort);

            console.log(`[Firebase] Emulators connected: Auth(${authHost}), Firestore(${dbHost}:${dbPort})`);
        }
    } catch (error) {
        console.error('[Firebase] Critical Initialization Error:', error);
    }

    return { app, auth, db, functions };
};

export default initFirebase;
