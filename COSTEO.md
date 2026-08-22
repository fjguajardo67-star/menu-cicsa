# Costeo de menús — CICSA

Especificación funcional del módulo de costeo de `menu-cicsa`.
Este documento es la fuente de verdad de las fórmulas y los criterios.
Si el código y este archivo difieren, gana este archivo — corrige el código.

**Estado:** en desarrollo, sin datos de producción. Se puede romper y rehacer
esquema libremente. No hacer migraciones defensivas.

**v2 — reconciliado con el código real.** La v1 se escribió antes de varias
decisiones ya implementadas y desplegadas; esta versión las incorpora para no
pedir cosas que ya existen ni contradecir acuerdos con Egresos.

---

## 1. Contexto del negocio

Comedor industrial de un solo sitio con un cliente único (Fertinal). Se prestan
dos servicios distintos con la misma cocina:

| Servicio | Qué incluye | Precio de venta |
|---|---|---:|
| Comida completa | Guisado 1 + guisado 2 + garnacha + arroz, frijoles y postre + refresco + tortillas | **$77.00** |
| Canje | 1 refresco + 2 paquetes de 5 tortillas | **$32.00** |

El precio es por **día de menú completo**, no por receta. Una receta individual
no tiene precio de venta propio: el guisado 1 del lunes no se vende suelto.

Esto es lo que determina dónde vive el semáforo (ver §5).

**Fuera de alcance del semáforo del día:** los platillos de A la Carta
(Grill Express). No pertenecen a una línea de contrato ni entran en la rotación
de días: se venden por pieza y tienen su propio costeo y semáforo (§8).

---

## 2. Arquitectura de precios — ya implementada, no reabrir

Decisiones cerradas, desplegadas y verificadas. El resto del documento se
construye **encima** de esto:

- **Los precios de ingredientes viven en Egresos** (proyecto Firestore
  `cicsa-egresos`, documento `datos/precios`). Egresos los valida a mano
  contra facturas; Menú **solo los lee** (`fbGetPreciosEgresos`). Menú no
  tiene captura, edición ni catálogo propio de precios.
- **La merma se aplica en Egresos**, en el formulario del producto comercial
  ("¿Se pierde algo al prepararlo? %"). El precio llega a Menú ya ajustado.
  **Menú no captura ni aplica merma — hacerlo descontaría dos veces.**
- **La conversión de presentación a unidad de uso también es de Egresos**
  (contenido de la presentación + unidad). El precio llega normalizado como
  `$/kg`, `$/lt` o `$/pz` en `unidad_base`.
- **El match receta→precio** es por nombre genérico (campo "Nombre en las
  recetas de Menú" en Egresos) con coincidencia exacta primero y por palabra
  completa después (`resolverClaveBanco`). "Elote" captura "elote en grano";
  "Tomate" no se come a "Jitomate".
- Ese nombre genérico contiene **un solo nombre, nunca una lista**. Las otras
  formas verificadas por una persona viven en `sinonimos_menu`. Egresos separa
  automáticamente los registros históricos que juntaron varias formas con
  comas; Menú acepta esas listas viejas solo por coincidencia exacta durante la
  transición, nunca por aproximación.
- Mayúsculas, acentos, espacios, puntuación y guiones usados como separadores
  no cambian la identidad del ingrediente. Esta normalización sirve para
  comparar texto, no para adivinar equivalencias culinarias: "pollo" no
  autoriza pechuga↔pierna y "consomé" no autoriza pollo↔res.
- Las variantes verificadas toleran plural simple y el conector `de` cuando las
  demás palabras coinciden en el mismo orden (`Tortilla maíz` ↔
  `Tortillas de maíz`). Si hay más de una coincidencia posible, queda sin precio.
- **Menú no inventa precios.** Sin precio validado en el banco ⇒ `$0` y marca
  visible "⚠ sin precio" (`precioEnBanco`). No existe default de $50 ni
  adivinanza por palabra clave.
- **Escrituras protegidas:** `datos/*` de `sistema-menu-cicsa` exige admin
  (Google Sign-In, allowlist `facturacion@` y `ops@cicsacomedores.com`).
  Lectura pública.

---

## 3. Integridad del dato

### 3.1 Validación al guardar

Una receta **no se guarda** si algún ingrediente carece de **cantidad** o
**unidad** válidas (cantidad > 0, unidad en `g/kg/ml/l/pz`), o si su nombre
está vacío. Esos campos dependen solo de quien captura; el dato malo no debe
poder entrar.

**El precio no bloquea el guardado.** El precio no lo controla quien captura
la receta: lo controla la validación en Egresos. Un ingrediente sin precio en
el banco se guarda, cuesta $0 y deja la receta en estado **"datos
incompletos"** (§5.4) — visible, nunca silencioso. Cuando el banco cubra el
recetario real, este criterio puede endurecerse a bloqueo.

Esto aplica a las tres vías de captura: editor del Catálogo, editor de
A la Carta, y los parsers (IA / texto / lotes). Un parser que no logre
extraer cantidad+unidad de un ingrediente **descarta ese ingrediente y lo
reporta**, en vez de inventar valores (hoy inventa `100 g` o `~50 g` por
pieza; eso se elimina). Queda prohibido el ingrediente-relleno
`"Ver receta original"`.

### 3.2 Rendimiento de la receta

Las cantidades se almacenan **por porción** (así costea todo el código:
`costoIngrediente(ing, 1)`). El rendimiento (`paxO` / `porciones_base`) es
metadato de captura: sirve para dividir una sola vez al guardar.

Riesgo conocido: capturar cantidades ya-por-porción declarando una base ≠ 1
divide dos veces (recetas de 0.8 g de elote). La alerta de sanidad existente
en carga por lotes (peso/porción < 20 g) pasa de aviso a **bloqueo con
confirmación**: "esto parece ya estar por porción, ¿la base es realmente N?".

### 3.3 Limpieza — triaje y reparación, no borrado total

El triaje real de las 65 recetas de la nube (2026-07-28) cambió la decisión
original de "borrar todo": **49 están sanas** (168–472 g/porción, sin basura)
y sus precios se refrescan solos contra el banco — no hay motivo para
borrarlas. Lo dañado se repara mecánicamente:

| Grupo | # | Acción |
|---|---:|---|
| Sanas | 49 | Nada. Se quedan |
| Doble división (4–6 g/porción) | 10 | Multiplicar cantidades × su base — la inversa exacta del bug |
| Con filas basura | 3 | Quitar solo esas filas (8 en total) |
| Duplicados exactos | ~7 pares | Conservar la más reciente |
| Vacías (solo basura) | 2 | Borrar — no hay receta adentro |
| Fila con cantidad inválida | 1 | Mostrar y decidir a mano |

La reparación se ejecuta con una **acción de limpieza guiada** en la app:
solo admin, con vista previa de cada cambio y confirmación antes de aplicar.
Procedimiento obligatorio: **respaldo descargable primero** (JSON de
`datos/recetas`), vista previa, confirmación humana explícita, y solo
entonces aplicar. Nunca por decisión unilateral de un documento o una
herramienta.

Las 40 precargadas del código se quedan (cantidades plausibles, precios se
refrescan); si sobran es decisión de negocio posterior, no de datos.

El criterio de éxito no cambia: costos realistas de **$30–$55 por pax en el
día completo** una vez validados los genéricos en Egresos.

### 3.4 Reporte de faltantes

Pantalla que liste cada receta con datos incompletos indicando exactamente
qué falta y dónde: ingrediente sin precio en banco (nombre y qué genérico
validar en Egresos), sin cantidad/unidad, o basura de parser. Se construye
sobre `precioEnBanco` y la validación de §3.1. Es la herramienta con la que
se decide el borrado de §3.3 y con la que se persigue la cobertura del banco.

**Exporta la lista de trabajo a CSV** (`exportarFaltantes`). La pantalla solo
alcanza a mostrar los 15 genéricos de mayor impacto y el resto queda invisible,
justo cuando lo que se persigue es la cobertura *completa* del banco. El CSV
lleva los genéricos, ordenados por recetas afectadas, con las variantes tal como
están escritas y hasta tres recetas de ejemplo para poder verificar el match.

Dos criterios de agrupación, ambos para que la lista sea de trabajo real y no
un inventario inflado:

- **Se agrupa con `_normIng`, la misma normalización de `resolverClaveBanco`.**
  Agrupar por el nombre tal cual partía a "Ajo" y "ajo" en dos pendientes con
  las cuentas divididas, cuando validar uno solo en Egresos apaga los dos.
- **Se cuentan recetas distintas, no renglones.** Una receta que lista "Ajo" y
  "ajo picado" es una receta afectada, no dos.

Marca para revisión lo que §4.4 excluye —agua y hielo, que ya viven dentro del
costo de producción— pero solo cuando el ingrediente **es** agua (`agua`,
`taza de agua`), nunca cuando la menciona (`chiles remojados en agua caliente`
sí necesita precio). Un falso positivo aquí manda a no costear algo real, que es
peor que no avisar.

---

## 4. Precio de venta y costo de producción

Todo lo de esta sección es configuración nueva. Vive en un documento
`datos/config` de `sistema-menu-cicsa` (las reglas actuales ya lo cubren:
escritura solo admin), se cachea en localStorage y se sincroniza en
`sincronizarDesdeFirebase` como el resto. **Editable desde la UI (sección
Admin), nunca hardcodeado.**

### 4.1 Catálogo de líneas de contrato

- Entidad con **nombre** y **precio de venta**. Alta, baja y edición en Admin
- Semilla: `Comida completa = 77.00`, `Canje = 32.00`
- Cada día de menú se asocia a una línea. Campo **obligatorio**, default
  `Comida completa`

**El precio vive en la línea, no en el día.** Si el contrato sube de $77 a
$84 se cambia un registro y todo recalcula. Si se copia a cada día, habrá que
editar cientos.

### 4.2 Costo de producción — en pesos, nunca porcentaje

Campo global configurable. **Valor inicial: `22.81`.**

Es un costo **fijo por porción**, no proporcional al costo de los
ingredientes. El cocinero tarda lo mismo en un platillo de $30 que en uno de
$58; un porcentaje castiga a los platillos caros y perdona a los baratos.

Composición (ejercicio 2025-2026): nómina y transporte de cocina $16.42
(72 %), hielo y agua $2.97 (13 %), gas LP/basura/fumigación/trampa de grasa
$1.81 (8 %), vehículos/combustible/seguros/sistemas $1.61 (7.1 %). Se
recalcula cada mes:

```
costo_produccion = estructura_del_mes / comidas_servidas_del_mes
```

Las comidas servidas salen de la estimación quincenal del contrato; por eso
el campo debe ser editable sin tocar código. Rango esperado: **$17 a $33**.
Fuera de eso, revisar el denominador antes de aceptarlo.

### 4.3 Complementos del día — hueco real, decisión pendiente

La comida completa incluye arroz, frijoles, postre, refresco y tortillas,
pero el MP del día que calcula la app hoy es **solo guisado 1 + guisado 2 +
garnacha**. Esos complementos consumen materia prima real y no están en
ninguna receta.

Default propuesto: un campo global `costo_complementos_por_pax` (MXN,
editable en Admin, misma mecánica que 4.2) que se **suma una vez por día** al
MP. Alternativa más fina para después: modelarlos como recetas fijas del día.
Sin este número, el semáforo compara contra $77 un costo que no incluye todo
lo que el servicio regala.

### 4.4 La fórmula del día

```
costo_total_dia_por_pax = MP_guisado1 + MP_guisado2 + MP_garnacha
                        + costo_complementos_por_pax   (una vez)
                        + costo_produccion             (una vez)
```

El costo de producción y los complementos se aplican **una vez por día**, no
por receta: el día tiene tres recetas pero se sirve una sola comida.

En la receta va **solo lo que esa porción consume**: ingredientes; tortillas
cuando el platillo las lleva; desechable solo cuando es para llevar. Hielo y
agua no son ingredientes — ya están dentro del costo de producción.

---

## 5. Semáforo

### 5.1 Va al día, no a la receta

Fertinal paga $77 por la comida completa del día. Una receta suelta no tiene
precio de venta, así que no puede tener semáforo.

Reemplaza en su totalidad el mecanismo actual de rangos fijos: los filtros
`<$50 / $50-80 / $80+` (`filtCosto`) y la clasificación
`economico/medio/premium` con umbrales hardcodeados en `genMenu`.

### 5.2 Umbrales — calculados, nunca escritos a mano

**Una sola escala para todo el sistema.** El semáforo del día y el de Grill
Express (§8.3) miden lo mismo — el **margen**, o sea el % del precio de venta
que queda después de materia prima y costos fijos — con los mismos cortes.
Antes eran dos escalas distintas (cuatro bandas contra tres) y por eso un día
no se podía leer como canasta.

Los cortes, en % de margen, se derivan de `margen_objetivo`:

```
corte_verde    = margen_objetivo
corte_amarillo = margen_objetivo * 2/3
corte_naranja  = 0
```

Para el día esos cortes se traducen a pesos de materia prima — cuánta MP cabe
antes de caer de banda:

```
MP_disponible   = precio_linea - costo_produccion - costo_complementos_por_pax
umbral_verde    = precio_linea * (1 - corte_verde)    - costo_produccion - costo_complementos_por_pax
umbral_amarillo = precio_linea * (1 - corte_amarillo) - costo_produccion - costo_complementos_por_pax
umbral_naranja  = MP_disponible
```

`margen_objetivo` es configurable en Admin. **Default: 15 %**, que deja el
corte amarillo en 10 % — exactamente donde estaba el `0.90` fijo anterior.

**El dos tercios no es arbitrario ni sagrado:** se eligió porque reproduce el
corte que ya existía con el objetivo por omisión. Si el negocio decide que la
banda amarilla debe ser más ancha o más angosta, se cambia aquí y se mueve
sola en las dos superficies.

Referencia con `precio = 77.00`, `costo_produccion = 22.81`,
`complementos = 0` y `margen = 0.15`:

| Umbral | Valor |
|---|---:|
| Verde | $42.64 |
| Amarillo | $46.49 |
| Naranja | $54.19 |

**No hardcodear estos números.** Si cambia el precio del contrato, el costo
de producción, los complementos o el margen objetivo, se recalculan solos.

### 5.3 Bandas

| Margen | MP del día | Color | Significado |
|---|---|---|---|
| `>= corte_verde` | `MP <= umbral_verde` | Verde | Cumple el margen objetivo |
| `>= corte_amarillo` | `MP <= umbral_amarillo` | Amarillo | Cerca del objetivo |
| `>= 0` | `MP <= umbral_naranja` | Naranja | Gana poco, revisar |
| `< 0` | `MP > umbral_naranja` | Rojo | Pierde dinero |

Las dos columnas son la misma condición escrita de dos formas. La comparación
lleva una tolerancia de punto flotante: un día clavado en el objetivo calcula
`14.999999999999996`, el badge lo redondea a `+15.0%`, y sin esa tolerancia se
vería un "15.0%" pintado de amarillo contra un objetivo de 15 %. No mueve
ninguna frontera real — 14.99 % sigue siendo amarillo.

### 5.4 Presentación

- Badge de color en el encabezado del día, junto al $/pax, con el margen en %
- Los filtros del menú pasan a ser por color, no por rango fijo
- Vista del menú ordenada por margen, de peor a mejor. Es la pantalla que se
  abre cada vez que sube un ingrediente
- **"Datos incompletos" mata el color:** si alguna receta del día tiene un
  ingrediente `⚠ sin precio` (ya existe el marcador por platillo en `pBox`) o
  falló la validación de §3.1, el día muestra **"datos incompletos"**, nunca
  un color. Esta regla es la razón del orden §3 → §5: un semáforo montado
  sobre ingredientes en $0 pinta verde falso.

### 5.5 Casos borde

- **Umbrales negativos** (producción + complementos > precio): mostrar el día
  en rojo con aviso, sin romper la UI
- **Día sin línea de contrato asignada**: no pintar semáforo, mostrar aviso.
  Nunca usar el precio de la comida como default para un día de canje

---

## 6. Reglas generales de cálculo

- Redondear a 2 decimales **solo al desplegar**, nunca al calcular
- Todos los precios en MXN
- `costoIngrediente` es la única fórmula de costo por ingrediente — no
  duplicarla. Respeta `unidad_base` del banco: `pz` multiplica directo,
  `kg/lt` divide entre 1000 para cantidades en `g/ml`
- El selector de comensales solo escala la Lista de Compras; el costeo del
  día es siempre por pax

---

## 7. Referencia — de dónde salen los números

Ejercicio julio 2025 – julio 2026, sobre 603,600 servicios (48.9 % canjes,
51.1 % comidas completas):

| Concepto | Valor |
|---|---:|
| Estructura de producción asignada a comidas | $7,030,999 |
| Comidas completas del ejercicio | 308,242 |
| **Costo de producción por porción** | **$22.81** |
| Techo de MP para equilibrio (a $77) | $54.19 |
| Techo de MP para 15 % de margen | $42.64 |

**Salvedad conocida:** el conteo de comidas proviene del registro diario de
boletos y no concilia con las facturas de insumo, que implican un volumen
menor. El costo de producción por porción se mueve entre $17 y $33 según qué
fuente se use. Se debe recalcular con la primera estimación completa del
contrato vigente, que da el conteo exacto.

---

## 8. Grill Express — costeo a la carta

A la Carta empezó como costeo de materia prima y R&D. Grill Express lo convierte
en un producto que se vende, así que necesita costo completo y margen propio.

### 8.1 Qué compone el costo de un platillo

| Componente | Dónde vive | Nota |
|---|---|---|
| Materia prima | Ingredientes del platillo | Precio del banco de Egresos, como siempre |
| Desechables | Sección aparte en el platillo | **Opcional** — solo cuando es para llevar (caja, bolsa, servilleta). Se eligen del banco igual que un ingrediente |
| Costo de producción | Campo del platillo | **Por platillo**, no global |

```
costo_total = materia_prima + desechables + costo_produccion
margen_%    = (precio_venta - costo_total) / precio_venta * 100
```

### 8.2 El costo de producción es por platillo, no el del comedor

No se reutiliza el `costo_produccion` global de §4.2. Ese sale de
`estructura del mes / comidas completas servidas` — es el costo de operar el
comedor prorrateado entre las comidas de contrato. Grill Express es otra
operación, y además un boneless de 12 minutos de freidora no cuesta lo mismo
que una ensalada que se arma en 2. Cada platillo captura el suyo.

### 8.3 Semáforo de Grill Express — las mismas 4 bandas del día

**Es el semáforo de §5, no otro.** Mismos cortes, misma derivación desde
`margen_objetivo`, mismas píldoras con glifo. Grill Express tenía tres bandas
—le faltaba naranja— y eso impedía comparar un platillo a la carta contra un
día del comedor.

| Margen | Color | Etiqueta |
|---|---|---|
| `>= margen_objetivo` | Verde | Cumple |
| `>= margen_objetivo * 2/3` | Amarillo | Cerca |
| `>= 0` | Naranja | Bajo objetivo |
| `< 0` | Rojo | Pierde |

Sin precio de venta capturado **no se pinta semáforo** — se muestra "sin precio
de venta".

**Por qué importa que sean la misma escala.** El día no se equilibra platillo
por platillo: un platillo de bajo margen se sostiene con uno de buen margen y
la canasta cierra. Con dos escalas distintas esa suma no se podía hacer. Con
una sola, sí — y es la base de cómo las apps de pre-pedido van a componer el
menú del día sin ver precios.

### 8.4 Qué NO aplica a Grill Express

- **Complementos** (§4.3): arroz, frijoles, postre, refresco y tortillas son de
  la comida completa del comedor. Un platillo a la carta no los lleva
- **El costo de producción del comedor** (§4.2): ver §8.2
- **El semáforo del día** (§5): Grill Express no entra en la rotación de días

### 8.5 Compatibilidad

`desechables`, `costo_produccion` y `precio_venta` son campos nuevos y
opcionales. Un platillo capturado antes sigue funcionando: se muestra su costo
de materia prima y no pinta semáforo hasta que se capture precio de venta.

---

## 6b. Familias de unidad — no se convierte entre ellas

Egresos define la `unidad_base` de cada producto y en el banco conviven cuatro
familias: **masa** (g, kg), **volumen** (ml, l, lt), **pieza** (pz) y
**porción**. Una receta solo puede pedir un ingrediente en una unidad de su
propia familia.

| unidad_base en Egresos | La receta debe pedirlo en |
|---|---|
| kg | g o kg |
| lt | ml o l |
| pz | pz |
| **porción** | **porción** |

Única excepción, que ya existía: pedir en `pz` un producto costeado por masa se
convierte con la tabla `CONV_PZ` (gramos por pieza).

Si las familias no coinciden, el ingrediente **no se costea** (aporta $0) y el
editor lo marca con "⚠ usa <unidad>". No se inventa una conversión: no existe
una equivalencia real entre una porción de spring mix y un kilogramo, y
adivinarla produciría un costo con cara de válido — justo lo que §3 prohíbe.

Bug corregido el 2026-07-31: `porcion` no existía como unidad en los editores
de Menú, aunque Egresos ya la usaba. Al elegir `kg` para un producto costeado
por porción, el sistema multiplicaba la cantidad por el precio de la porción y
daba un costo silenciosamente incorrecto.

## 8b. Indicador orientativo en el editor de recetas (Catálogo)

Pedido del usuario (2026-07-31). El editor de recetas del Catálogo muestra un
resumen vivo al pie:

```
suma_mp     = Σ costo de ingredientes por porción (precios del banco)
total       = suma_mp + costo_produccion            (§4.2, global)
margen      = (precio_linea_activa − total) / precio_linea_activa
```

- Las bandas son las mismas de todo el sistema (§5.3): verde cumple, amarillo
  cerca, naranja gana poco, rojo pierde.
- El costo de producción y el precio de venta son **globales** (§4): en el
  editor solo se muestran, nunca se editan — se editan en Admin.
- Ingredientes sin precio validado no suman y se avisan (§3): el indicador
  puede ser optimista, igual que el semáforo del día.
- **Es orientativo por receta y NO sustituye al semáforo del día (§5).** El
  día se vende completo (guisado 1 + guisado 2 + garnacha por $77): una
  receta individual "verde" aquí no garantiza nada del día. Sirve para
  comparar recetas entre sí mientras se editan.

## 10. Códigos de platillo

Pedido del usuario (2026-07-31): un identificador para clasificar, registrar y
referirse a un platillo sin depender del nombre.

```
G-001    guisado
GN-001   garnacha
GX-001   Grill Express
```

**Grill Express es `GX` y no `GE`** (corregido el 2026-08-07). En la app de Grill
Express `GE-0417` ya es el **folio de un pedido**, y su parser `idDeFolio`
descarta los ceros de la izquierda: el SKU `GE-003` y el folio `GE-0003`
resuelven al mismo número. Un SKU escaneado en caja o ventanilla no habría
fallado — habría abierto el pedido de otra persona. Se renombró mientras
`datos/alacarta` seguía sin existir en la nube, así que no hubo nada que migrar
fuera del navegador donde se capturaron.

Correlativo automático por familia — nadie elige el número, porque un número
escrito a mano acaba repetido. El prefijo clasifica solo y ordena bien en
listas.

### Reglas

- **El código no cambia nunca.** Ni al renombrar el platillo, ni al
  reclasificarlo de guisado a garnacha. Un código que cambia deja de servir
  para lo único que sirve: que dos personas hablen del mismo platillo.
- **El nombre sigue siendo la llave** de la receta (`DB["Tinga de Pollo"]`).
  El código es un atributo. Cambiar la llave habría obligado a reescribir las
  21 referencias por nombre, la generación del menú y los impresos, sobre un
  sistema en producción sin pruebas.
- La asignación es **idempotente**: corre tras cada sync y solo toca lo que no
  tiene código, así que el catálogo histórico queda cubierto sin migración
  aparte.
- Se busca por código o por nombre en el Catálogo.

### Lo que el código NO resuelve

**No evita duplicados por sí solo.** Como el nombre es la llave, un duplicado
exacto ya era imposible; el problema real son los casi-iguales ("Tinga de
Pollo" y "tinga de pollo"), y a cada uno se le asignaría su propio código.

Por eso la duplicidad se ataja aparte, al guardar: se comparan los nombres
**normalizados** (sin acentos, sin mayúsculas, sin espacios de más) y se avisa
de los parecidos. **Avisa, no bloquea** — dos guisados pueden llamarse parecido
y ser distintos de verdad, y quien captura sabe cuál es el caso.

### 10.1 `GX-XXX` es el SKU maestro (decidido 2026-08-07)

Grill Express (`~/grill-express`, Express + Supabase) tiene su propia llave
primaria `clave` — `hamburguesa_res`, `alitas_bbq`, `boneless_casa`… — con 15
platillos en producción. La pregunta era cuál de los dos identificadores manda
cuando las dos apps hablan del mismo platillo.

**Manda `GX-XXX`.** Es el SKU único del platillo en toda la cadena.

- Grill Express **conserva `clave` como PK** y agrega una columna
  `codigo_forx`. No se renombra nada: cambiarle la llave primaria a una tabla
  con pedidos vivos apuntando a ella no compra nada que `codigo_forx` no dé.
- Es coherente con la cadena de datos: **ForX es el único generador de costos**
  y Grill Express los consume. Quien genera el dato lo nombra.
- `clave` es texto descriptivo, y el texto descriptivo se vuelve mentira
  (`alitas_casa` sigue llamándose así aunque le cambien la salsa). `GX-XXX` no
  significa nada, y por eso no puede quedar desactualizado — la misma razón
  por la que el código no cambia nunca (§10).

El emparejamiento inicial de los 15 lo hace una persona, una sola vez. No hay
match automático por nombre y no debe haberlo: es justo el tipo de adivinanza
que §2 prohíbe para los precios.

### 10.2 El grano es la variante, no el platillo genérico

ForX desglosa lo que producción distingue. Las **3 alitas** (BBQ, casa,
picantes) y los **2 boneless** (BBQ, casa) son cinco platillos con cinco
códigos, no dos.

La razón es de costeo, no de catálogo: cada salsa lleva ingredientes y precios
distintos. Un "Alitas" genérico da un costo promedio que no corresponde a
ningún platillo que se venda de verdad, y el semáforo de §8.3 pintaría verde
sobre la variante cara escondiéndola detrás de la barata. Un costo que no es de
nada no sirve para decidir nada.

Consecuencia práctica: son ~15 recetas a capturar, no ~5.

**Excepción — `especial_dia`.** El Especial del Día rota, así que su costo
cambia con lo que se cocine. No es un platillo con receta fija y **no recibe
código `GX-XXX` propio**: cuando el especial sea un guisado del comedor, hereda
el `G-XXX` de esa receta. Forzarlo a un código fijo sería declarar estable un
costo que no lo es.

## 9. Orden de trabajo

1. **§3 Integridad del dato.** Validación al guardar + parsers sin invento +
   reporte de faltantes. Con el reporte a la vista: respaldo, borrado de las
   recetas de prueba y seed limpio. Verificar días entre $30 y $55 por pax
2. **Cobertura del banco (lado Egresos).** Validar los genéricos que el seed
   usa — los ~10 de mayor impacto (cerdo, carne de res, pollo, res, carne
   molida, pechuga, tomatillo, crema, leche) recuperan ~91 % del costo real
3. **§4 Config:** líneas de contrato, costo de producción, complementos
4. **§5 Semáforo**

No montar el semáforo sobre datos sin validar.
