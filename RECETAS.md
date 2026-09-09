# Cómo se capturan recetas en ForX

Reglamento para cualquiera que dé de alta recetas, por el editor o por carga en
lote. **`COSTEO.md` manda sobre este documento**; aquí se traduce a instrucciones
de captura.

Lo que se escribe aquí no es cosmético: cada receta alimenta el costo por pax del
día y el semáforo. Una cantidad mal capturada no se ve rara en pantalla — se ve
como un costo, y se toman decisiones con él.

---

## 1. La plantilla

```
NOMBRE: Pollo Ranchero
REGION: Mexico
CARNICO: Pollo
TIPO: Guisado
TIEMPO: 60
PORCIONES_BASE: 50
INGREDIENTES:
* Pierna y muslo deshuesado: 7500 g
* Jitomate: 3000 g
* Chile jalapeño: 500 g
* Aceite: 250 ml
PROCEDIMIENTO:
1. Sofreír el pollo hasta dorar
2. Agregar la salsa y dejar a fuego bajo 20 minutos
```

Para varias recetas, sepáralas con una línea que tenga `---`:

```
NOMBRE: Primera receta
...

---

NOMBRE: Segunda receta
...
```

**Solo lee este formato de texto.** No acepta CSV, ni JSON, ni Excel, ni archivos
de ningún tipo: no existe un solo `<input type="file">` en toda la app. ForX
*exporta* a Excel, pero no importa de ahí. Si tienes las recetas en una hoja de
cálculo, hay que convertirlas a este formato antes de pegarlas.

---

## 2. Los campos

| Campo | ¿Obligatorio? | Default | Qué acepta |
|---|---|---|---|
| `NOMBRE:` | **Sí** | — | Texto libre. Es la llave de la receta |
| `REGION:` | No | `Mexico` | Texto libre |
| `CARNICO:` | No | `Mixto` | Texto libre |
| `TIPO:` | No | `guisado` | Solo distingue si contiene "garnacha" |
| `TIEMPO:` | No | `60` | Minutos. Extrae solo los dígitos |
| `PORCIONES_BASE:` | No | `50` | También `PORCIONES BASE:` con espacio |

`PROCEDIMIENTO:` también responde a `PREPARACION:` o `PREPARACIÓN:`.

**Sin `NOMBRE:` el bloque entero se ignora**, sin aviso individual. Es el único
campo que no tiene default.

`TIPO:` solo tiene dos valores reales: cualquier cosa que contenga "garnacha" es
garnacha, y **todo lo demás es guisado**. Escribir `TIPO: Postre` produce un
guisado, no un error.

---

## 3. Los ingredientes

Una línea por ingrediente:

```
* Nombre del ingrediente: cantidad unidad
```

- La viñeta es **opcional**: sirve `*`, `-`, `•`, o ninguna
- Los **dos puntos son obligatorios** — separan nombre de cantidad
- La unidad es opcional; si falta, **se asume gramos**

### Unidades

| Unidad | Se guarda como |
|---|---|
| `g` | gramos |
| `kg` | gramos (×1000, automático) |
| `ml` | mililitros |
| `l` | mililitros (×1000, automático) |
| `pz` | piezas — **con la salvedad de abajo** |

⚠ **`porcion` es válida en el editor pero NO en la carga por lotes.** El parser de
lotes solo reconoce `g`, `kg`, `ml`, `l` y `pz`. Una línea con `porcion` en un lote
se descarta.

### La trampa de `pz`

Una receta en piezas solo se puede costear si existe una conversión a gramos
declarada (`CONV_PZ`). Hoy solo existen para:

| Ingrediente | Gramos por pieza |
|---|---|
| Tortilla de maíz | 22.2 |
| Tortilla de harina / tortillina | 25.5 |
| Bolillo / pan bolillo | 60 |

Para cualquier otro ingrediente, `pz` **bloquea el costo** en vez de inventar un
peso. Si tu ingrediente se compra por kilo, captúralo en gramos aunque en la
cocina se cuente por pieza.

---

## 4. La regla que más cuesta: `PORCIONES_BASE`

**Las cantidades son el TOTAL para esas porciones, no lo que lleva una porción.**

```
PORCIONES_BASE: 50
* Pollo: 7500 g        ← 7500 g para las 50 porciones = 150 g por porción
```

ForX divide entre la base y luego multiplica por los comensales del menú. Si
pegas cantidades **que ya venían por porción** y dejas `PORCIONES_BASE: 50`, se
dividen dos veces y la receta queda en gramos absurdos.

Ya pasó: dejó recetas de **0.8 g de elote** en el catálogo, y hubo que repararlas
a mano multiplicando por su base.

**Si tus cantidades ya son por porción, escribe `PORCIONES_BASE: 1`.**

### La red de seguridad

Si el peso por porción sale **menor a 20 g**, la carga se detiene y pregunta:

> "X" queda en ~N g por porción. Esto suele significar que las cantidades pegadas
> YA estaban por porción y PORCIONES_BASE las está dividiendo otra vez.

**Cancelar omite esa receta** para que la corrijas. Aceptar la guarda de todos
modos y la marca como sospechosa en el resumen.

Ese diálogo es **bloqueante y aparece una vez por receta**. Si pegas 40 recetas
mal formadas, son 40 diálogos seguidos — otra razón para revisar la base antes de
pegar, no después.

---

## 5. Qué se descarta solo

Una línea de ingrediente que no cumpla el formato **se descarta y se reporta** en
el resumen. No se guarda a medias ni se inventan valores. Se descarta cuando:

- No tiene la forma `nombre: cantidad [unidad]`
- La cantidad es **cero o negativa**
- El nombre pasa de **60 caracteres**
- El nombre parece un paso de procedimiento: empieza con `Prepara`, `Sirve`,
  `Licúa`, `Calienta`, `Mezcla`, `Coloca`, `Agrega`, `Cocina`, `Porciones:`,
  `Ver receta` o `Paso N`

Esa última regla existe porque cargas viejas metieron pasos como si fueran
ingredientes. Si un ingrediente legítimo empieza con esas palabras, renómbralo.

**Una receta sin ningún ingrediente válido no se guarda** — aparece en la lista de
errores del resumen.

---

## 6. Nombres de ingrediente: escríbelos como el banco

El costo sale de cruzar el nombre contra el banco de precios de Egresos. Si no
cruza, el ingrediente **cuesta $0 y marca "⚠ sin precio"** — la receta se guarda,
pero costea de menos y ensucia el semáforo.

Reglas prácticas:

- **Mayúsculas, acentos y espacios no importan.** `Ajo`, `ajo` y `AJO` son el
  mismo ingrediente
- **Usa el genérico, no la preparación.** `Jitomate`, no
  `jitomates picados finamente`
- **No metas el corte ni el estado en el nombre** si el precio es del insumo
  crudo: `Papa`, no `papa cocida y machacada`
- Un nombre nuevo que no exista en Egresos **no se inventa** — hay que darlo de
  alta allá

Antes de capturar mucho, saca el CSV del **Reporte de faltantes** (Catálogo →
Reporte de faltantes → Exportar lista) para ver qué genéricos ya existen y cuáles
faltan por validar en Egresos.

---

## 7. Duplicados

**Dentro del mismo lote pegado**, una receta con nombre repetido se omite siempre,
sin preguntar. Solo entra la primera.

**Contra el catálogo existente**, decide el selector *Si hay duplicado*:

| Opción | Qué hace |
|---|---|
| **Omitir** | Deja la receta existente intacta y descarta la pegada |
| **Reemplazar** | Sobrescribe la existente con la nueva |

La comparación es por nombre en minúsculas. `Pollo Ranchero` y `pollo ranchero`
son la misma receta.

---

## 8. Cuántas recetas por lote

**No hay límite en el código.** Los límites son otros y conviene conocerlos:

**El techo real es el documento en la nube.** Todas las recetas viven en un solo
documento de Firestore (`datos/recetas`), y Firestore corta en **1 MiB por
documento**. Medición del 2026-08-19:

| Dato | Valor |
|---|---|
| Recetas en la nube | 58 |
| Peso del documento | 95,376 bytes — **9.1%** del límite |
| Promedio por receta | ~1,644 bytes |
| **Techo aproximado** | **~637 recetas** |

Al pasarse, el guardado **falla contra la nube** y las recetas se quedan solo en
el navegador. Hay margen de sobra, pero es un techo duro, no una degradación
suave: conviene revisar el porcentaje cuando el catálogo pase de las 400.

**Recomendación práctica: lotes de 20 a 40 recetas.** No por una restricción
técnica, sino porque el resumen de resultados se vuelve inmanejable más arriba, y
porque si algo salió mal prefieres revisar 30 recetas y no 200.

---

## 9. Antes de pegar — lista de verificación

1. ¿Cada receta tiene `NOMBRE:`?
2. ¿`PORCIONES_BASE` corresponde a **cantidades totales**? Si ya son por porción,
   ¿está en `1`?
3. ¿Los ingredientes usan `nombre: cantidad unidad`, con dos puntos?
4. ¿Los nombres son genéricos como los de Egresos, sin la preparación?
5. ¿Ninguna línea de ingrediente es en realidad un paso?
6. ¿Estás **con la sesión de captura iniciada**? Ver §9.1

### 9.1 La cuenta de captura — esto no es opcional

**Todo el que capture recetas entra con `ops@cicsacomedores.com`.** Es la cuenta
compartida del equipo y ya está autorizada; no hace falta pedir permisos ni dar
de alta a nadie.

**Sin esa sesión la receta se guarda solo en tu navegador y nunca sube a la
nube.** Nadie más la ve, no aparece en el menú de los demás, y se pierde al
limpiar el navegador. Peor: la app te dice que la carga salió bien, porque la
carga *sí* funcionó — lo que falló fue la subida.

Ya pasó el **2026-09-09**: un lote de 10 recetas cargado sin sesión quedó atrapado
en una sola computadora.

**Cómo verificar antes de pegar:** en la barra lateral, abajo, debe decir
`ops@cicsacomedores.com` con un botón **Salir**. Si en su lugar ves
"Iniciar sesión (admin)", **no estás autenticado** y lo que cargues no va a subir.

Si al entrar Google no te pregunta por la cuenta y te rechaza sola, es que está
reutilizando otra sesión: sal de esa cuenta en Google, o usa una ventana privada.

---

## 10. Después de cargar

1. Lee el **resumen**: agregadas, duplicadas, reemplazadas, errores y líneas
   descartadas. Las descartadas son las que hay que corregir y volver a pegar
2. Abre el **Reporte de faltantes** y mira si aparecieron ingredientes sin precio
   nuevos. Cada uno es un genérico por validar en Egresos
3. Revisa el **costo por pax** de los días afectados. Un salto raro casi siempre
   es `PORCIONES_BASE` mal puesta, no un precio malo
