const admin = require('firebase-admin');

// Configuración para conectar a los emuladores locales
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';

admin.initializeApp({
    projectId: 'demo-buca' // ID de proyecto para emuladores
});

const db = admin.firestore();
const auth = admin.auth();

async function seedSuperAdmin() {
    const email = 'superadmin@buca.com';
    const password = 'Password123!';
    const uid = 'super-admin-id-001';

    console.log('--- Iniciando Seeding de Super Admin ---');

    try {
        // 1. Crear o actualizar en Auth
        let user;
        try {
            user = await auth.getUserByEmail(email);
            console.log('Usuario ya existe en Auth. Actualizando...');
            await auth.updateUser(user.uid, { password });
        } catch (e) {
            user = await auth.createUser({
                uid,
                email,
                password,
                displayName: 'Super Admin Buca',
                emailVerified: true
            });
            console.log('Usuario creado en Auth.');
        }

        // 2. Establecer Custom Claims
        await auth.setCustomUserClaims(user.uid, { role: 'super_admin' });
        console.log('Custom claims establecidos (role: super_admin).');

        // 3. Crear documento en Firestore (Colección plural - Regla 32)
        await db.collection('users').doc(user.uid).set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: 'super_admin',
            status: 'active',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLogin: null,
            preferences: {
                theme: 'dark',
                language: 'es'
            }
        });
        console.log('Documento de usuario creado en Firestore (/users).');

        console.log('✅ Seeding completado con éxito.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        process.exit(1);
    }
}

seedSuperAdmin();
