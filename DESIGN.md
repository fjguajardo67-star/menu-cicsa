---
name: ForX
description: Sistema de menús para comedor industrial — marino profundo, escala cálida reservada al estado.
colors:
  # Marca — tomados del vector del logotipo, fuente autoritativa
  brand-navy: "#0C255C"
  brand-ramp-red: "#D83021"
  brand-ramp-orange: "#EA7630"
  brand-ramp-amber: "#F9C043"
  sparx-accent: "#E95B2D"
  # Superficies oscuras (tema primario)
  dark-bg: "#05122F"
  dark-surface: "#0A1F4E"
  dark-surface-2: "#062350"
  dark-sidebar: "#000C22"
  dark-border: "#123063"
  dark-text: "#E9F0FC"
  dark-text-2: "#A9BCDD"
  dark-text-3: "#7C8FB4"
  # Superficies claras
  light-bg: "#F3F6FC"
  light-surface: "#FFFFFF"
  light-surface-2: "#E9EFFA"
  light-border: "#D3DCEC"
  light-text: "#0B1B3A"
  light-text-2: "#3C4E73"
  light-text-3: "#5F6E8B"
  # Acento interactivo — frío a propósito, nunca significa estado
  accent-light: "#0E9FB0"
  accent-dark: "#16C0D2"
  on-accent: "#05122F"
  # Rellenos de estado = la rampa de la marca
  status-ok: "#12A863"
  status-warn: "#F9C043"
  status-caution: "#EA7630"
  status-crit: "#D83021"
  on-warm: "#2A1206"
  on-crit: "#FFFFFF"
  # Tintas de estado para TEXTO, una por tema
  ink-ok-dark: "#2ABF7B"
  ink-warn-dark: "#F9C043"
  ink-caution-dark: "#EA7630"
  ink-crit-dark: "#FF6B52"
  ink-ok-light: "#0C6339"
  ink-warn-light: "#6E4E00"
  ink-caution-light: "#8F3D00"
  ink-crit-light: "#A81F16"
typography:
  display:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.015em"
  body:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "normal"
  figure:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  label:
    fontFamily: "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif"
    fontSize: "9.5px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.13em"
  print:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "7px"
  md: "9px"
  lg: "11px"
  xl: "14px"
  pill: "99px"
spacing:
  xs: "5px"
  sm: "9px"
  md: "14px"
  lg: "18px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  card-day:
    backgroundColor: "{colors.dark-surface}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.lg}"
    padding: "14px 15px 13px"
  pill-status:
    rounded: "{rounded.pill}"
    padding: "3px 9px 3px 7px"
    typography: "{typography.label}"
  input-field:
    backgroundColor: "{colors.dark-bg}"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.sm}"
    padding: "7px 9px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text}"
    rounded: "{rounded.md}"
    padding: "9px 11px"
  swap-control:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text-3}"
    rounded: "{rounded.md}"
    size: "30px"
---

# Design System: ForX

## Overview

ForX es la herramienta con la que se forja el menú de un comedor industrial. El
nombre juega con *fork* y *forge*; el sistema visual sale del logotipo, no de
una paleta inventada.

La tesis del sistema cabe en una frase: **la rampa cálida del logotipo es la
escala del semáforo.** El degradado rojo → ámbar de la marca no es decoración —
es exactamente el rango que COSTEO.md usa para decir si un día pierde dinero.
Por eso el marino domina la superficie, los cálidos quedan reservados a
comunicar estado, y todo lo interactivo usa un acento frío. Si el naranja fuera
además el color de lo clickeable, dejaría de significar "margen mínimo,
revisar", y detectar el día que pierde dinero es el trabajo central del
producto.

El tema oscuro es el primario, y no por moda: la identidad cálida de ForX
funciona mucho mejor sobre marino. Medido — `#F9C043` da 9.59:1 sobre superficie
oscura y 1.66:1 contra blanco.

Es una herramienta que se opera, no un documento que se lee. La densidad manda
sobre el aire, y el resumen va antes del detalle.

## Colors

### Marca

Tomados del vector del logotipo, que es la fuente autoritativa. Un PNG previo
daba valores más saturados; quedaron descartados.

- **`brand-navy` `#0C255C`** — el azul del logotipo. Ancla la identidad y da la
  familia de superficies oscuras.
- **Rampa de la marca** — `#D83021` → `#EA7630` → `#F9C043`, con `#E64328`,
  `#EB7C32` y `#F2BE43` como medios del degradado original.
- **`sparx-accent` `#E95B2D`** — solo el bloque "Sparx AI" de la firma.

### Superficies

El tema oscuro deriva del marino de marca: fondo `#05122F`, tarjetas `#0A1F4E`,
sidebar `#000C22`. El tema claro usa un blanco con sesgo azul (`#F3F6FC`),
elegido a propósito y no heredado: un crema o un gris neutro romperían el
parentesco con el marino.

El sidebar es oscuro **en los dos temas**. Por eso el logotipo del sidebar usa
siempre la variante clara.

### Estado

Cuatro bandas con significado financiero, definido en COSTEO.md:

| Banda | Relleno | Significa |
|---|---|---|
| Verde | `#12A863` | Cumple el margen objetivo |
| Amarillo | `#F9C043` | Gana, por debajo del objetivo |
| Naranja | `#EA7630` | Margen mínimo, revisar |
| Rojo | `#D83021` | Pierde dinero |

El verde no existe en el logotipo, y está bien: es señal, no marca.

### Named Rules

**La Regla del Relleno y la Tinta.** Los colores de la marca son **rellenos**
—segmentos del medidor, barra de distribución, la marca misma—, no colores de
texto. Como texto casi no sirven sobre fondo claro. Cada tema tiene sus tintas
propias, verificadas contra su fondo real con composición alpha:

| | Oscuro sobre `#0A1F4E` | Claro sobre `#FFFFFF` |
|---|---|---|
| Verde | `#2ABF7B` · 6.70:1 | `#0C6339` |
| Amarillo | `#F9C043` · 9.59:1 | `#6E4E00` |
| Naranja | `#EA7630` · 5.41:1 | `#8F3D00` |
| Rojo | `#FF6B52` · 5.67:1 | `#A81F16` |

En oscuro, el ámbar y el naranja **auténticos del logotipo** pasan sin retoque.
Solo el rojo necesita aclararse: `#D83021` da 3.31:1 y no alcanza.

**La Regla del Frío Interactivo.** Botones, ítem activo del sidebar, enlaces,
focus y el selector de línea usan el acento frío (`#0E9FB0` claro, `#16C0D2`
oscuro). Ningún cálido es clickeable; ningún frío significa estado.

**La Regla de la Tinta por Luminancia.** La tinta sobre un relleno se elige por
la luminancia del relleno, no por su familia. Los cálidos claros piden tinta
oscura (`#2A1206`); el rojo profundo pide blanca (4.81:1 contra 3.68:1 de la
oscura). El acento teal es brillante, así que también pide tinta marino: 8.38:1
contra 2.21:1 del blanco.

**La Regla del Piso AA.** Todo texto pasa 4.5:1 contra su fondo compuesto, o
3:1 si es grande. Verificado en 33 elementos por tema. Peor caso actual: 4.89:1
en oscuro, 4.74:1 en claro.

## Typography

Una sola familia en toda la interfaz: **IBM Plex Sans**, auto-hospedada en
`fuentes/plex-latin-var.woff2`: fuente variable con eje `wght` 300–700,
subseteada a latin (cobertura completa del español verificada), 31.9 KB en una
sola petición. Licencia SIL OFL en `fuentes/OFL-IBMPlexSans.txt`. La regla:

```css
@font-face{
  font-family:"IBM Plex Sans";
  src:url("/fuentes/plex-latin-var.woff2") format("woff2-variations");
  font-weight:300 700; font-style:normal; font-display:swap;
}
```

Sin italic a propósito: el sistema no la usa. El peso máximo del eje es 700.

La elección tiene razones, no gusto: herencia industrial y de ingeniería, que le
va a un comedor industrial; **cifras tabulares por defecto** — los diez dígitos
miden 600/1000 em en todo el eje de pesos, medido en la fuente, así que la
alineación de columnas no depende de activar ninguna feature —; buena cobertura
del español; y no está entre las familias que el detector marca como
sobreexpuestas — al contrario de Inter, que sí lo está.

Los cinco generadores de impresión **conservan Arial**. La razón es operativa:
el documento tiene que salir igual en cualquier impresora de cocina sin depender
de una fuente instalada o embebida.

### Hierarchy

| Rol | Tamaño | Peso | Uso |
|---|---|---|---|
| `display` | 19px | 700 | Título de superficie |
| `figure` | 20–22px | 700 | Costo por pax, precio de línea |
| `body` | 13.5–14px | 400–650 | Nombres de platillo, texto corrido |
| `label` | 9.5–10px | 700 | Etiquetas versalitas, `letter-spacing: 0.13em` |
| `meta` | 10.5–11px | 600 | Cárnico, unidades, avisos |

### Named Rules

**La Regla de las Cifras Tabulares.** Todo número que se compara en columna
lleva `font-variant-numeric: tabular-nums`. Sin eso las cifras de costo bailan
y la tabla deja de ser legible de un barrido.

**La Regla del Tracking en Versalitas.** Las etiquetas en mayúsculas nunca van
sin `letter-spacing`. A 9.5px, apretadas, son ilegibles.

## Layout

Cascarón de dos columnas: sidebar fijo de **264px** y área principal fluida. El
sidebar es `position: sticky` a altura completa con scroll propio; la barra
superior de la superficie también es sticky.

La rejilla de días es `repeat(auto-fill, minmax(288px, 1fr))` con `gap: 14px`.
El ancho mínimo de 288px es lo que necesita una tarjeta para mostrar tres
platillos con su costo sin que el nombre se rompa.

El espaciado se resuelve con `gap` en flex y grid, nunca con márgenes por
elemento: en un archivo único los márgenes se duplican y se colapsan sin que se
note de dónde viene.

### Responsive

Debajo de **900px** el cascarón colapsa a una columna y el sidebar se vuelve
horizontal con los ítems en fila. Ahí los ítems de navegación **suben** de 13.5px
a 14px y su padding crece: el rango real de dispositivos va de tablet Windows en
cocina a escritorio amplio, y son exigencias opuestas — densidad legible para
trabajo analítico prolongado, y objetivos táctiles grandes con lectura a
distancia de brazo.

Cualquier contenido ancho —tablas, diagramas— scrollea en su propio contenedor
con `overflow-x: auto`. El cuerpo de la página nunca scrollea de lado.

## Elevation & Depth

Híbrido, con el peso en el **escalonado tonal**. La jerarquía se lee por
diferencia de superficie (fondo → tarjeta → superficie elevada), y la sombra
solo la confirma. En el tema oscuro la sombra apenas se percibe, así que el
escalonado tonal carga casi todo el trabajo.

### Shadow Vocabulary

- **Tarjeta en reposo** (`0 1px 2px rgba(11,27,58,.06), 0 8px 24px rgba(11,27,58,.07)` en claro; `0 1px 2px rgba(0,0,0,.4), 0 10px 30px rgba(0,0,0,.35)` en oscuro): la sombra por defecto de tarjetas y paneles.
- **Modal** (`0 24px 70px rgba(0,0,0,.45)`): único nivel realmente elevado del sistema.

### Named Rules

**La Regla del Borde Siempre.** Toda superficie lleva borde de 1px además de su
sombra. En tema oscuro la sombra no separa lo suficiente y sin borde las
tarjetas se disuelven en el fondo.

## Shapes

Geometría de esquinas suaves y consistentes, sin ángulos rectos y sin cápsulas
excepto donde la forma comunica algo. La escala sube con la superficie: controles
7px, ítems de navegación y candidatos 9px, tarjetas 11px, modal 14px. Las
píldoras de estado son el único `99px` — su forma de cápsula las separa de todo
lo demás, que es justo lo que se busca.

**La Regla del Sin Rail.** Ninguna tarjeta lleva una franja de color en su
borde. Es el tell más reconocible de UI generada por IA, y el detector lo marca
en el diseño anterior (`side-tab`, `border-left: 4px`). El estado se comunica con
píldora, glifo y posición en el medidor.

## Components

### Buttons

- **Shape:** esquinas suaves (`7px`).
- **Primary:** relleno acento con tinta marino `#05122F` (8.38:1), padding `8px 14px`, peso 650.
- **Hover / Focus:** el primario aclara a `accent-dark`; el focus siempre es un anillo visible de 2px con `outline-offset`, nunca solo un cambio de color.
- **Ghost:** fondo transparente, borde del sistema, texto del color base. Para acciones secundarias como "Lista de compras".

### Chips

Las píldoras de estado son el vocabulario de banda. Fondo con tinte del relleno
al 12–14%, borde de la tinta al 42–48%, texto en la tinta del tema. **Cada banda
lleva un glifo distinto** — círculo, cuadro, triángulo, rombo — así el tono no es
el único portador del significado, que además resuelve daltonismo en el eje
naranja/rojo/amarillo, el más difícil.

La píldora **abraza su contenido** (`align-self: flex-start`). A todo el ancho
de la tarjeta se lee como una barra de acento, que es el cliché que este sistema
evita.

### Cards / Containers

- **Corner Style:** `11px`.
- **Background:** `dark-surface` / `light-surface`.
- **Shadow Strategy:** tarjeta en reposo; ver Elevation.
- **Border:** 1px del borde del tema, obligatorio.
- **Internal Padding:** `14px 15px 13px`.
- **Hover:** el borde toma el color del acento. Sin desplazamiento ni escala.

### Inputs / Fields

Fondo un paso más oscuro que su contenedor, borde de 1px, radio `7px`. El focus
es un `outline` de 2px del acento con `outline-offset: 1px`. Los `select` del
sidebar viven sobre superficie oscura, así que usan fondo translúcido blanco al
7% y borde blanco al 16%.

### Navigation

Sidebar vertical, ítems de 13.5px peso 600 con ícono de 16px a `opacity: .72`.
El ítem activo lleva fondo del acento al 16%, borde del acento al 42% y texto
blanco, con `aria-current="page"`. Debajo de 900px pasa a fila horizontal con
tipografía y padding mayores.

### Línea de contrato activa (firma)

Bloque de primer nivel en la cabecera del sidebar, con su precio en tipografía
`figure`. No es un control secundario y no puede vivir en una barra de filtros:
cuando un comedor atiende a más de un cliente con la misma cocina, *contra qué
línea se está costeando* determina si el semáforo significa algo. Si la línea
está mal, todos los colores mienten.

### Medidor de umbrales (firma)

El componente que define el sistema. Una pista de 7px con los cuatro umbrales de
COSTEO.md como segmentos proporcionales de la rampa, y una aguja de 2.5px con
halo del color de la superficie marcando la materia prima del día.

Responde algo que una insignia de color no puede: **qué tan cerca está el día de
cambiar de banda.** Cuando faltan $2.50 o menos para el borde superior, lo dice
con texto ("a $1.65 del borde"). Un día verde a punto de no serlo es información
que el semáforo por sí solo esconde.

### Control de cambio por platillo

Botón de ícono de 30px, callado en reposo (borde tenue, sin relleno) para no
competir con el costo ni con la banda. **Siempre visible, nunca solo en hover:**
la tablet de cocina no tiene hover. Área táctil de 44px vía pseudo-elemento, más
grande que el control visible. Los platillos fijos ("⭐ Especial") muestran
candado en su lugar y no se pueden cambiar.

## Do's and Don'ts

### Do:

- **Do** reservar la rampa cálida (`#D83021`–`#F9C043`) exclusivamente para
  estado, y usar el acento frío para todo lo interactivo.
- **Do** elegir la tinta sobre un relleno por su luminancia: oscura `#2A1206`
  sobre cálidos claros, blanca sobre el rojo, marino sobre el acento teal.
- **Do** mantener `tabular-nums` en toda cifra que se compare en columna.
- **Do** codificar el estado de forma redundante: color, glifo, etiqueta y
  posición en el medidor.
- **Do** dejar visibles los controles táctiles en reposo, con 44px de área.
- **Do** conservar Arial y fondo claro en los cinco generadores de impresión.
- **Do** usar `forx-mark.svg` para cualquier uso por debajo de ~96px.
- **Do** usar `forx-logo-dark.svg` sobre cualquier superficie oscura.

### Don't:

- **Don't** usar los colores de la rampa como texto sobre fondo claro:
  `#F9C043` da 1.66:1 contra blanco.
- **Don't** poner el logotipo marino sobre superficie oscura: 1.09:1, invisible.
- **Don't** poner una franja de color en el borde de una tarjeta.
- **Don't** dejar una píldora de estado a todo el ancho de su contenedor.
- **Don't** usar el logotipo completo por debajo de 96px: a 32px es ilegible.
- **Don't** meter degradados en los documentos que se imprimen: el láser
  monocromo los convierte en mancha. Usar `forx-logo-mono.svg`.
- **Don't** cambiar qué calcula el semáforo ni sus criterios: eso vive en
  COSTEO.md y solo cambia su presentación.
- **Don't** introducir un paso de build sin aprobación explícita: el deploy
  directo a Pages es una decisión de producto, registrada en PRODUCT.md.
