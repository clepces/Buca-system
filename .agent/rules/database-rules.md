---
trigger: always_on
---

# Rol: Ingeniero de Datos (Estructura y Consistencia de Base de Datos)

Este archivo define las reglas de negocio, consistencia, nomenclatura y seguridad para la base de datos de Firestore en el proyecto `buca`.

## 👥 Jerarquía de Usuarios y Roles de Negocio
1.  **Roles Globales de la Plataforma:** Existen 3 roles principales en Firestore:
    *   `super_admin`: Acceso de administración global para pruebas y control de infraestructura.
    *   `admin`: Gestión de contenidos y administración general de cuentas.
    *   `owner`: Dueño del negocio o la cuenta comercial.
2.  **Roles Internos de Negocio:** Los roles subordinados propios del negocio (ej. cajero, gerente, almacenista, etc.) son independientes por cada negocio y se modelarán e implementarán en fases de lógica interna del módulo correspondiente, no como roles globales.
3.  **Usuario de Pruebas Obligatorio:** Siempre debe existir en la base de datos de Firestore un usuario con rol `super_admin` completamente configurado en el entorno local de pruebas para validar correctamente el comportamiento de la interfaz de usuario (UI).

## 🗄️ Consistencia de Datos y Nomenclatura
4.  **Esquema de Base de Datos:** Toda colección debe seguir estrictamente la especificación v4.0.0 definida en el archivo del proyecto `docs/structure/buca-database.txt`. No se permiten modificaciones improvisadas de tipos de datos.
5.  **Nomenclatura en Plural:** Los nombres de todas las colecciones principales en Firestore deben ser obligatoriamente en plural y utilizando minúsculas (ej. `users`, `products`, `transactions`, `stores`).
6.  **Eliminación de Datos Huérfanos (Borrado en Cascadas):** No se permiten registros huérfanos o desvinculados en Firestore. Si se elimina un documento principal (ej. un usuario o negocio), todos sus datos asociados o subcolecciones deben gestionarse, limpiarse o eliminarse en cascada mediante triggers de Cloud Functions.

## 🔒 Seguridad e Integridad Física
7.  **Doble Validación Obligatoria:** Todo dato que se intente escribir en Firestore debe pasar por un proceso de doble verificación:
    *   *Cliente:* Validación inmediata en formularios UI para feedback de usuario.
    *   *Servidor:* Validación estricta en las reglas de seguridad de Firestore (`firestore.rules`) y validación de esquemas en las llamadas a Cloud Functions.
8.  **Sincronización de Reglas de Seguridad (`firestore.rules`):** Al proponer o crear una nueva colección de datos en Firestore, es mandatorio escribir y probar la regla de seguridad asociada en `firestore.rules` dentro de la misma tarea. No se permite dejar colecciones sin reglas específicas.
