# Pendientes abiertos

Levantado el **2026-09-10**. Cada punto trae qué es, por qué importa y qué haría
falta, para poder retomarlo sin esta conversación.

Estado verificado contra producción el mismo día, no supuesto.

---

## 1. Decisiones que esperan al dueño

### 1.1 Tortillas cobradas dos veces en 58 recetas

**58 recetas listan tortilla de maíz entre sus ingredientes**, y la canasta de
complementos (§4.3) ya cobra 10 tortillas aparte. Se está pagando dos veces.

- Todas son de **maíz** — ninguna de harina, así que la canasta las cubre todas
- 56 con `1 pz`, una con `2 pz` (Tacos de pollo), una con `40 g` (Entomatadas)
- Precio del banco: $27.78/kg → **$0.617 por pieza**
- **Total: $37.06** en todo el catálogo · promedio **$0.64** por receta

El dueño pidió ver la lista antes de decidir; se entregó como CSV el 2026-09-10
(`tortillas-en-recetas.csv`), con una columna que separa **13 recetas donde la
tortilla va frita** (tostadas, dorados, flautas — $8.06) de las 45 donde va tal
cual.

**Falta decidir:** si se quita el renglón en las 58, solo en las 45, o en
ninguna. Y luego **construir la acción guiada** — a 58 recetas de producción no
conviene a mano ni a ciegas: vista previa, confirmación y aplicar, como la
limpieza de §3.3.

### 1.2 Almacenaje: el techo de 1 MiB

`datos/recetas` iba en **56.1%** (587,750 B, 417 recetas) el 2026-09-10, y creció
de 68 a 435 recetas en un solo día. Techo estimado: **~743 recetas**.

Al llegar, el guardado **falla contra la nube** y las recetas se quedan en el
navegador de quien capturó. No degrada: corta.

Las opciones, con su costo, están en **`DATOS.md` §2**. Recomendación: un
documento por receta. **Blaze no mueve este límite** — es estructural de
Firestore.

**Conviene hacerlo con margen.** Migrar con 300 recetas de holgura es tranquilo;
migrar con el guardado ya fallando es una urgencia con datos en riesgo.

### 1.3 Respaldo automático

El **botón de respaldo ya existe** (Catálogo → 💾 Respaldo, desplegado el
2026-09-10). Pero es manual, y depende de que alguien se acuerde.

Falta **Blaze + exportaciones programadas de Firestore** (`DATOS.md` §3.B). Ese
es el motivo real para subir de plan.

---

## 2. Acciones del dueño, sin código de por medio

### 2.1 `datos/config` no existe

Sigue en **404**. Mientras no se guarde desde el panel **con sesión de `ops@`**,
cada navegador usa los valores por omisión del código y ningún cambio se
comparte.

Afecta directo a lo decidido el 2026-09-10: **producción $20** y **2 porciones**
están en el código como default, pero no en la nube.

### 2.2 Borrar `sistema-menu-cicsa/datos/precios`

Documento **muerto**: 43 precios, última escritura el **16/jul/2026**. ForX lee
los precios de `cicsa-egresos/datos/precios`; ninguno de los 7 repos locales lo
referencia.

Se entregó copia de rescate el 2026-09-10 (`RESCATE-datos-precios-muerto.json`).
⚠ **El botón de respaldo NO cubre este documento** — esa copia es el único
rescate.

Se borra desde la consola de Firebase. **Salvedad:** la app de Egresos no está en
local, así que no se pudo leer su código; la verificación cubre los repos
disponibles más el hecho de que lleva dos meses sin escribirse.

### 2.3 Emparejar los 14 SKU de Grill Express

La columna `codigo_forx` **ya existe en producción** (el SQL se corrió el
2026-09-09), pero los 15 platillos la tienen en `NULL`.

La asignación decidida es `GX-001`…`GX-014` en orden comercial; `especial_dia`
**no recibe código** porque rota. Está en `COSTEO.md` §10.1 y §10.2.

⚠ **No hay UI para capturarlo.** Hoy tocaría hacerlo en el editor de tablas de
Supabase, renglón por renglón. Se propuso agregar el campo al renglón del
Catálogo de `~/grill-express/public/admin.html`, junto a `Hamburguesas · grill`;
sin decidir.

### 2.4 PR sin mergear en grill-express

`sku-codigo-forx` sigue abierto. El SQL **ya corrió en Supabase**, pero
`schema.sql` en el repo no lo refleja — y ese archivo es la fuente de verdad
para la próxima vez que alguien lo pegue.

---

## 3. Deudas técnicas conocidas

### 3.1 El sync pisa las recetas locales sin avisar

`sincronizarDesdeFirebase` hace `recetas = r` con lo que traiga la nube
([index.html](index.html), busca `fbGet('datos', 'recetas')`). Una receta que
solo exista en este navegador **desaparece al recargar**, sin confirmación.

Los platillos de `alacarta` **sí** están protegidos: ahí hay un `confirm` que
avisa antes de descartar lo local. Las recetas no lo tienen.

Costó un susto el 2026-09-09: un lote de 10 recetas quedó atrapado en un
navegador y se habría perdido al recargar.

### 3.2 La precondición del guardado nunca se probó contra Firestore real

`fbSetSiSigueIgual` usa `currentDocument.updateTime` para no pisar el trabajo de
otra persona. Se probó **contra un Firestore simulado**, no el real.

Si la respuesta real trae otra forma, el conflicto se leería como error y el
guardado fallaría en vez de reintentar. **Señal de que pasa:** aparece
*"⚠ La nube está recibiendo cambios de otra persona. Intenta de nuevo."*

### 3.3 Un borrado puede revivir

Si A borra una receta y B todavía la tiene local porque sincronizó antes del
borrado, el guardado de B la repone. Es la limitación conocida de fusionar sobre
un documento único; se cierra con §1.2.

### 3.4 58 recetas tipificadas mal

Enchiladas, tacos, quesadillas y tostadas están como **`tipo: guisado`** aunque
por contenido son garnachas. Distorsiona la generación del menú, que reparte
guisados y garnachas por separado.

### 3.5 `porcion` sirve en el editor pero no en carga por lotes

`UNIDADES_VALIDAS` incluye `porcion`, pero el parser del lote solo acepta
`g|kg|ml|l|pz`. Una línea con `porcion` en un lote **se descarta sin que sea
obvio por qué**. Documentado en `RECETAS.md` §3; falta decidir si se corrige en
el código o se deja como está.

### 3.6 `exportarPrecios()` arma su CSV sin escapar

Concatena directo, así que un ingrediente con coma en el nombre le rompe las
columnas. El exportador del reporte de faltantes sí escapa (`_csvCampo`); este
quedó atrás.

---

## 4. Fuera de este repo

### 4.1 Go Lunch — el servicio en Railway sigue llamándose `cicsa-comedor`

El repo se renombró a `go-lunch` el 2026-09-09, pero el nombre del servicio vive
en el panel de Railway y no se puede cambiar desde el código. Mientras tanto, los
logs de Railway siguen mostrando el nombre viejo.

### 4.2 Grill Express — Supabase Pro

Estaba en proceso el 2026-09-09. El motivo es **"Daily backups stored for 7
days"**: hoy esa base no tiene respaldo, y ahí viven la tabla `clientes` con los
hashes de PIN y todo el historial de `pedidos_grill`.

Ojo con **"From $25.00"**: el compute va aparte. Y no agregar Log Drains — son
$60 al mes y no hacen falta.

### 4.3 Grill Express — el compute está en NANO

`t4g.nano`, medio giga de RAM, al **49% en reposo**. No es bloqueador: con ~125
empleados de Go Lunch el volumen es mínimo. Pero conviene medir en hora de comida
una semana después de que Go Lunch entre en producción, no en reposo.

Las conexiones **no** son el cuello: las dos apps usan el cliente REST de
Supabase, así que no abren conexiones directas a Postgres.
