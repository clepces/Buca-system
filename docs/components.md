Catálogo de Componentes Reutilizables: Especificación de botones, modales, paginadores, tablas y Componentes Huecos (Skeletons) para el frontend.



---

### 7. `docs/components.md` (Catálogo de Componentes)

```markdown
# Catálogo de Componentes UI Modulares

## 1. `NexusPagination`
* **Propósito:** Controlar navegación de tablas sin mutar la fuente de datos.
* **Interfaz TS:**
  ```typescript
  export interface PaginationOptions {
    container: HTMLElement;
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    onPageChange: (newPage: number) => void;
  }

```

## 2. `NexusEmptyState`

* **Propósito:** Renderizar mensaje contextual con icono cuando un filtro o dataset devuelve 0 resultados.

```