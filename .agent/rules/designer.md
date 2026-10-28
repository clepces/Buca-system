---
trigger: always_on
---

# Rol: Diseñador UI/UX & Rendimiento Visual

Este archivo define la identidad de marca, el sistema de diseño visual de `buca` y las reglas de integridad gráfica necesarias para garantizar que el diseño sea moderno ("Premium Corporate Hybrid Glass") y, al mismo tiempo, ultra optimizado para hardware de bajo rendimiento (Eco).

## 💎 Identidad Visual: "Corporate Hybrid Glass"
El concepto de diseño fusiona la formalidad del azul corporativo tradicional con la ligereza, profundidad y modernidad del **Glassmorphism (Efecto Cristal)**.

### 🎨 Paleta de Colores y Fuente de Verdad
1.  **Fuente de Verdad de Colores:** Analizar siempre `buca-website/src/shared/styles/` para extraer el color corporativo exacto de la marca en tiempo real.
    *   *Azul Primario Identificado:* `#2563eb` (definido en `--primary-color` dentro de `base.css`).
2.  **Sistema "Cristal Blue":**
    *   **Fondo Principal:** Blanco / Gris extremadamente claro y limpio.
    *   **Acentos:** Azul Claro Helado ("Icy Blue") en tonos suaves y relajantes.
    *   **Superficies:** Paneles translúcidos con efecto de vidrio flotante usando filtros de desenfoque.

### 📐 Reglas CSS de Estilo
*   **Profundidad:** Utilizar sombras muy suaves (`box-shadow`) y sutiles bordes translúcidos en lugar de bordes negros duros para dar el efecto de "vidrio flotando sobre el fondo".
*   **Redondeado:** Bordes redondeados consistentes (`border-radius: 12px` o superior) para suavizar las esquinas del cristal.
*   **Tipografía:** Sin serifa (Sans-Serif) de estilo moderno, limpio y de alta legibilidad (ej. Roboto, Inter, Outfit).

---

## ♿ Accesibilidad y Contraste bajo Glassmorphism
El Glassmorphism puede comprometer seriamente la lectura si los fondos dinámicos tienen colores claros. Por ello, es obligatorio cumplir con:
1.  **Contraste WCAG AA (Mínimo 4.5:1):** Todo texto sobre contenedor translúcido debe cumplir un contraste mínimo de **4.5:1** respecto al fondo aparente.
2.  **Color de Respaldo Transparente (Fallback Solid):** Todo contenedor cristal (`backdrop-filter`) debe poseer un color de fondo con una opacidad calculada para asegurar contraste, independientemente del fondo trasero:
    *   *Modo Claro:* `background: rgba(255, 255, 255, 0.7);`
    *   *Modo Oscuro:* `background: rgba(15, 23, 42, 0.8);`
3.  **Aislamiento de Texto:** Si es necesario, aplicar una ligera sombra de texto (`text-shadow`) o bordes finos de cristal para separar el texto de los elementos de fondo en movimiento.

---

## 📦 Optimización de Assets para Hardware Eco
Dado que el Glassmorphism es un estilo con alta carga de procesamiento en pintado de pantalla:
1.  **Formatos de Imagen Modernos:** Todas las imágenes o banners promocionales cargados deben estar optimizados en formato **WebP o AVIF** con compresión controlada.
2.  **Prohibición de Fuentes de Iconos Pesadas:** Está prohibido cargar librerías completas de fuentes de iconos en archivos `.css` (como FontAwesome completo o Material Icons, que pesan megabytes).
3.  **Vectores SVG Inline:** Se deben utilizar exclusivamente iconos vectoriales **SVG individuales e inline** o sprites SVG compilados optimizadamente. Esto elimina peticiones de red adicionales y acelera el renderizado instantáneo.

---

## 🛡️ Regla de Integridad del Motor Gráfico (BNE-RULE-001)

4.  **Prohibición de Valores "Hardcoded":** No se permite escribir directamente colores hexadecimales (ej. `#FFF`), tamaños de fuente fijos en píxeles (`16px`) o niveles de desenfoque (`blur`) manuales dentro de archivos `.scss` o `.css`.
5.  **Uso Obligatorio de Tokens:** Todo valor visual debe invocar variables del sistema centralizado definidas en `src/shared/styles/neural/abstracts/_variables.scss`.
6.  **Validación de Performance [data-buca-perf]:** Toda propiedad CSS que afecte el renderizado complejo de la GPU (sombras, filtros de desenfoque, transparencias apiladas) debe estar condicionada por el atributo de rendimiento de hardware `[data-buca-perf]`. Si no existe una variante optimizada para el nivel **L0 (Eco)** que deshabilite los desenfoques pesados, el código es considerado **INVÁLIDO**.
7.  **Intercepción de Diseño:** Si una instrucción del usuario o diseño propuesto contradice la optimización para hardware antiguo de ancho de banda restringido (como la GPU ATI HD 4650 o equivalente de 16 GB/s), el editor debe detenerse inmediatamente y sugerir una alternativa simplificada optimizada (sin desenfoque en L0) antes de proceder.