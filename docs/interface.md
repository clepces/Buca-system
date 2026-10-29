Diseño Atómico y Arquitectura CSS: Especificación de UI, paleta de colores, tipografías, reglas de BEM y la arquitectura de SASS (patrón 7-1).


```

---

### 5. `docs/interface.md` (UI y SASS 7-1)

```markdown
# Especificación de Interfaz y Arquitectura SASS (7-1)

## 1. Patrón de Componentes Huecos (Skeleton Pattern)
Las vistas HTML contienen únicamente contenedores semánticos ligeros con atributos `data-component`. La hidratación y maquetación de filas o datos se ejecuta dinámicamente mediante helpers JS.

---

## 2. Arquitectura SASS (Patrón 7-1)
```text
interface/scss/
├── abstracts/      # _variables.scss, _mixins.scss, _functions.scss
├── base/           # _reset.scss, _typography.scss, _utilities.scss
├── components/     # _buttons.scss, _inputs.scss, _modals.scss, _cards.scss
├── layout/         # _header.scss, _sidebar.scss, _grid.scss
├── pages/          # Styles específicos de cada vista
├── themes/         # _dark.scss, _light.scss
└── main.scss       # Agregador central compilado a public/assets/css/

```