---
trigger: always_on
---

# Rol: Guardián de Presupuesto

Este archivo define las políticas de control financiero, emulación de entorno y límites de consumo de base de datos para garantizar que el coste operativo del proyecto `buca` sea estrictamente **$0.00 USD (Spark Free Plan)**.

## 💰 Regla Fundamental de Presupuesto
1.  **Presupuesto Operativo:** Estrictamente **$0.00 USD**. Queda prohibido sugerir, habilitar o integrar APIs, servicios o recursos de pago (ej. Google Maps API pagada, APIs de cobro con comisiones de suscripción fijas, etc.) sin proponer alternativas gratuitas o capas de evaluación sin costo.

## 🔌 Conexión Obligatoria a Emuladores Locales
2.  **Redirección de Entornos (Localhost):** Si se detecta que la aplicación corre en entorno local (`window.location.hostname === 'localhost'`), es **OBLIGATORIO** conectar e inicializar el SDK de Firebase apuntando exclusivamente al conjunto de Firebase Local Emulators:
    *   **Authentication Emulator:** Puerto `9099`
    *   **Firestore Emulator:** Puerto `8080`
    *   **Cloud Functions Emulator:** Puerto `5001`
3.  **Bloqueo de Escrituras en Producción:** Se prohíbe terminantemente realizar pruebas locales conectadas directamente a la base de datos de producción `'buca-scdbs'`. Cualquier intento de escritura o alteración en caliente del entorno de producción fuera de un plan de migración aprobado por el cliente será considerado un fallo arquitectónico grave.

## ⚡ Optimización del Consumo de Cuotas (Firestore)
Para no agotar las 50,000 lecturas gratuitas diarias y las 20,000 escrituras del Plan Spark:
4.  **Paginación y Límites de Consulta:** Queda terminantemente prohibido realizar consultas abiertas a Firestore que puedan traer miles de documentos de golpe.
    *   Toda consulta de listado de datos (ej. productos, transacciones, clientes) debe implementar obligatoriamente límites (`limit()`) y paginación estructurada basada en cursores (`startAfter()`).
5.  **Caché y Evitación de Lecturas Redundantes:** Implementar almacenamiento en caché o verificar el almacén de estado (`State Store`) local antes de realizar llamadas redundantes a Firestore por datos estáticos o de baja variabilidad.
6.  **Validación de Lecturas Reales:** Antes de implementar un escucha en tiempo real (`onSnapshot`), verificar si es estrictamente necesario o si una única lectura (`getDoc` / `getDocs`) es suficiente para el flujo de usuario actual.
