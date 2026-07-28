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

**Fuera de alcance del semáforo:** los platillos de A la Carta. No tienen línea
de contrato ni precio de venta individual en esta app; su módulo es solo costeo
MP y R&D.

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

```
MP_disponible   = precio_linea - costo_produccion - costo_complementos_por_pax
umbral_verde    = precio_linea * (1 - margen_objetivo) - costo_produccion - costo_complementos_por_pax
umbral_amarillo = precio_linea * 0.90                  - costo_produccion - costo_complementos_por_pax
umbral_naranja  = MP_disponible
```

`margen_objetivo` es configurable en Admin. **Default: 15 %.**

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

| Condición sobre el MP del día | Color | Significado |
|---|---|---|
| `MP <= umbral_verde` | Verde | Cumple el margen objetivo |
| `MP <= umbral_amarillo` | Amarillo | Gana, por debajo del objetivo |
| `MP <= umbral_naranja` | Naranja | Margen mínimo, revisar |
| `MP > umbral_naranja` | Rojo | Pierde dinero |

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

## 8. Orden de trabajo

1. **§3 Integridad del dato.** Validación al guardar + parsers sin invento +
   reporte de faltantes. Con el reporte a la vista: respaldo, borrado de las
   recetas de prueba y seed limpio. Verificar días entre $30 y $55 por pax
2. **Cobertura del banco (lado Egresos).** Validar los genéricos que el seed
   usa — los ~10 de mayor impacto (cerdo, carne de res, pollo, res, carne
   molida, pechuga, tomatillo, crema, leche) recuperan ~91 % del costo real
3. **§4 Config:** líneas de contrato, costo de producción, complementos
4. **§5 Semáforo**

No montar el semáforo sobre datos sin validar.
