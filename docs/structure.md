Árbol de Directorios Maestro: Muestra el mapa de carpetas exacto, reglas de dónde va cada archivo y convenciones de nombres (kebab-case, camelCase). Evita que la IA cree carpetas duplicadas.

---

### 2. `docs/structure.md` (Estructura y Árbol de Directorios)

```markdown
# Arquitectura y Árbol de Directorios Maestro

## 1. Reglas de Gobernanza de Código
1. **Aislamiento Estricto:** Ningún código fuente sin compilar reside en `public/`.
2. **Límite de Líneas:** Ningún archivo debe superar las 300 líneas de código.
3. **Nomenclatura:** Todos los archivos y carpetas utilizan estrictamente `kebab-case`.
4. **Cero Dependencias JS:** Desarrollo modular en Vanilla JS/TS sin frameworks pesados.

---

## 2. Árbol de Directorios
```text
[nombre-proyecto]/
├── .env.example
├── composer.json
├── package.json
├── tsconfig.json
├── docs/                      # Documentación técnica
├── src/                       # Código fuente de desarrollo
│   ├── backend/               # Arquitectura MVC (Controllers, Services, Repositories)
│   ├── frontend/              # Módulos TypeScript (API Client, Components, State)
│   └── interface/scss/        # Arquitectura SASS (Patrón 7-1)
├── public/                    # Archivos públicos servidos
│   ├── index.php              # Front Controller (App Shell)
│   └── assets/                # CSS y JS compilados
├── storage/                   # Logs, bases de datos SQLite y respaldos
└── tests/                     # Suite de pruebas automatizadas

```
