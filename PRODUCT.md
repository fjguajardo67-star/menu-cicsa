# PRODUCT.md — Sistema Menú CICSA

Verdad de producto duradera. Las decisiones visuales (paleta, tipografía,
componentes, conceptos de página) **no** viven aquí: viven en DESIGN.md.
Las fórmulas y criterios de costeo viven en COSTEO.md, que es su fuente de verdad.

## Propósito

Planear, costear y publicar los menús de un comedor industrial, y producir los
documentos operativos que la cocina y compras usan cada día. El sistema
convierte recetas y precios validados en un menú por día con su costo, su margen
y un semáforo que avisa cuándo un día se sale de lo rentable.

## Plataforma

`web`. Sin app nativa. Se usa en tres contextos de hardware distintos, y los
tres importan por igual:

| Contexto | Dispositivo | Situación de uso |
|---|---|---|
| Administración y compras | Windows, escritorio | Sesión larga, pantalla grande, alta densidad de datos |
| Operación / dueño del sistema | macOS, escritorio | Configuración, revisión y trabajo sobre el propio sistema |
| Cocina | Windows, tablet | De pie, consulta rápida, posiblemente con las manos ocupadas |

Instalable como PWA (manifest e íconos ya existen) para acceso desde pantalla
de inicio. El rango real a soportar va de tablet a escritorio amplio; no hay
evidencia de uso en teléfono como caso principal.

## Usuarios y trabajos

**Administración** — Costea el menú, vigila el margen contra el precio de
contrato, revisa el semáforo del día y configura los parámetros del negocio
(líneas de contrato, costo de producción, complementos, margen objetivo).
Necesita ver muchos días a la vez y detectar rápido lo que está fuera de rango.

**Compras** — Trabaja de la lista de compras y de los precios. Su pregunta es
qué hay que comprar y a qué costo, no cómo se ve el menú.

**Cocina** — Consulta el menú del día y las recetas, y trabaja de los
documentos impresos. Es el usuario con menos tiempo y peores condiciones de
lectura.

**Administrador del sistema** — Único rol con escritura. Da de alta recetas,
valida datos, guarda configuración y publica.

## Contexto de operación

- **Una instalación sirve a un comedor.** No hay multi-tenancy y no debe
  diseñarse: el modelo de crecimiento es **replicar el app por comedor**, no
  agregar un selector de sitios. No hay que inventar interfaz para sitios
  múltiples.
- Un comedor puede atender a **más de un cliente cuando comparten cocina**. Ese
  caso ya está resuelto a nivel de datos con líneas de contrato configurables
  (`config.lineas` con alta de líneas) y no necesita código nuevo — pero sí
  tiene consecuencia de diseño: cuando hay más de una línea, *contra cuál se
  está costeando* determina si el semáforo significa algo, así que la línea
  activa tiene que ser visible en todo momento y no un control secundario.
- Instalaciones distintas operan bajo **razones sociales distintas**. De ahí la
  restricción de centralizar la identidad legal, más abajo.
- Alrededor de **500 comensales** por día en la operación actual.
- Los servicios se venden por **día de menú completo**, no por receta. Hoy
  configurados: **Comida completa** ($77.00) y **Canje** ($32.00).
- **Grill Express / A la Carta** se vende por pieza, con costeo y semáforo
  propios, fuera de la rotación de días y de las líneas de contrato.

## Capacidades

Menú (armado y costeo por día) · Agregar receta · Catálogo de recetas ·
A la Carta / Grill Express · Precios · Generar receta con IA · Exportar.

La navegación actual son siete pestañas. No es un compromiso: puede
reorganizarse si el rediseño lo justifica.

## Terminología del dominio

Guisado 1 y 2 · garnacha · canje · comensal · merma · línea de contrato ·
semáforo del día · RA · complementos · desechables · genérico (insumo sin
precio validado).

## Restricciones duraderas

- **COSTEO.md gana.** Si el código y COSTEO.md difieren, se corrige el código.
- **Los precios no se inventan.** Viven en el proyecto Firestore
  `cicsa-egresos` (`datos/precios`), validados a mano contra facturas reales en
  la app de Egresos. Menú solo los lee. Sin precio validado el sistema muestra
  $0 y la marca "⚠ sin precio" — nunca un número estimado. La merma y la
  conversión de presentación se aplican solo en Egresos.
- **Escritura restringida.** Solo administrador, vía Google Sign-In con
  allowlist (`facturacion@` y `ops@cicsacomedores.com`). Lectura pública.
- **Sin build.** Ver `## Stack`.
- **Publicar es desplegar.** Un merge a `main` sale a producción por GitHub
  Pages en el dominio propio. No hay staging ni pruebas automatizadas, así que
  el costo de un error visual o de sintaxis es inmediato y visible al cliente.
- **Los precios, las fórmulas y el semáforo son intocables** en cualquier
  rediseño: cambia cómo se presentan, nunca qué calculan ni sus criterios.
- **La identidad legal tiene que ser un solo dato, no 27.** Hoy el nombre de la
  empresa y su razón social están escritos a mano en 27 lugares de
  `index.html`, varios dentro de los template strings de impresión y hasta en
  los nombres de archivo que generan. Como el modelo de crecimiento es replicar
  el app por comedor, el nombre del producto, la razón social y el slug de
  archivos deben leerse de un único lugar. El riesgo real no es estético: es
  dejar la razón social equivocada en un documento impreso que sale a
  operación.

## Evidencia

Los costos que muestra el sistema se respaldan en facturas reales validadas una
por una en la app de Egresos. No hay estimaciones ni promedios inventados: esa
trazabilidad es una propiedad del producto, no un detalle de implementación.

## Accesibilidad

Dos exigencias opuestas que el diseño tiene que resolver a la vez: densidad
legible en escritorio para trabajo analítico prolongado, y objetivos táctiles
grandes con lectura a distancia de brazo en la tablet de cocina.

## Voz, activos y compromisos de marca

**Renombre en curso: "Sistema Menú CICSA" → "ForX".** Juego de palabras entre
*fork* (el cubierto) y *forge* (forjar): el sistema con el que se forja el menú.
El bloque de firma es "POWERED BY Sparx AI", que corresponde a la generación de
recetas con IA.

- **Comprometido:** el nombre ForX y el bloque Sparx AI. La razón social CICSA —
  Comedores Industriales de Cuauhtémoc S.A. de C.V. — sigue siendo la empresa
  operadora, aunque ya no da nombre al producto.
- **Fijado por brief:** paleta y logotipo. Ya no están abiertos a invención;
  la identidad se deriva del logo entregado (ver `## Identidad entregada`).
- **Resuelto:** una sola familia tipográfica nueva en toda la interfaz, y los
  cinco generadores de impresión conservan Arial. La razón es operativa, no
  estética: el documento tiene que salir igual en cualquier impresora de cocina
  sin depender de una fuente instalada o embebida.
- ForX no lleva CICSA en el nombre, y eso es deliberado: el producto sobrevive
  igual en un comedor con otra razón social.
- Los documentos impresos son piezas operativas de cocina y compras, no
  material de marca, y se imprimen en papel blanco.

## Identidad entregada

El logotipo todavía **no está en el repo**; existe solo como PNG con alfa de
1536×1024 fuera del control de versiones. Colores medidos sobre ese archivo, no
estimados:

| Rol | Valor |
|---|---|
| Azul marino del logotipo | `#002058` — `#002060` |
| Rampa de acento, extremo cálido rojo | `#F83000` |
| Rampa de acento, medios | `#F86000` · `#F88000` |
| Rampa de acento, extremo ámbar | `#F8A800` — `#F8B000` |

Limitaciones del activo tal como está hoy: solo existe en raster, la marca
depende de un degradado, y el bloque "POWERED BY Sparx AI" con su filete es
ilegible por debajo de ~96 px.

## Stack

**Vanilla, sin build** — decisión del usuario, tomada explícitamente sobre la
alternativa de un framework. HTML, CSS y JavaScript a mano, con el CSS ya
separado en `estilos.css`. La razón es operativa: conserva el deploy directo a
GitHub Pages sin pipeline entre el commit y producción. Cualquier propuesta que
introduzca un paso de build cambia ese flujo y necesita aprobación explícita.

## Éxito

Que administración detecte un día fuera de rango sin buscarlo, que compras
salga con su lista sin traducir nada, y que cocina encuentre el menú del día sin
pensar — en los tres dispositivos, sin que ningún número deje de ser trazable a
una factura.
