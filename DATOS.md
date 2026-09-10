# Almacenaje y respaldo — opciones para decidir

Preparado el **2026-09-10** a petición del dueño, con medidas reales de
producción. **Nada de esto está implementado**: es el material para elegir.

---

## 1. Dónde estamos hoy

Todo vive en Firestore, proyecto `sistema-menu-cicsa`, un documento por
concepto. Medido el 2026-09-10:

| Documento | Tamaño | Contenido | % de 1 MiB |
|---|---:|---:|---:|
| `datos/recetas` | **587,750 B** | 417 recetas | **56.1%** |
| `datos/alacarta` | 9,623 B | 7 platillos | 0.9% |
| `datos/borradas` | 1,170 B | 33 nombres | 0.1% |
| `datos/precios` | 4,049 B | 43 — **muerto**, ya no se lee | 0.4% |
| `datos/config` | — | **no existe** | — |
| `datos/omitidas` | — | no existe aún | — |
| `cicsa-egresos/datos/precios` | 61,910 B | 380 precios | 5.9% |

### El problema

**Firestore corta en 1 MiB por documento.** No es una cuota del plan: es un
límite estructural, igual en Spark que en Blaze. Pagar no lo mueve.

`datos/recetas` va en **56%** y creció de 68 a 435 recetas en un solo día
(9→10 de septiembre). Al promedio actual de ~1,410 bytes por receta, el techo
está en **~743 recetas**: quedan unas 300.

Al llegar, el guardado **falla contra la nube** y las recetas se quedan en el
navegador de quien capturó. No degrada: corta de golpe.

### El costo de leerlo entero

El sync trae **6 documentos en cada carga de página**, ~645 KB. De esos,
**el 89% es `datos/recetas`** — se descarga completo aunque no haya cambiado
nada.

| Cargas/día | Egress/mes | Lecturas/mes |
|---:|---:|---:|
| 10 | 0.18 GiB | 1,800 |
| 50 | 0.92 GiB | 9,000 |
| 200 | 3.69 GiB | 36,000 |

Muy por debajo de cualquier cuota. **El volumen no es el problema; el tamaño
del documento sí.**

---

## 2. Almacenaje — tres caminos

### A. Un documento por receta *(recomendado)*

`datos/recetas` deja de ser un arreglo y pasa a ser la colección `recetas/`,
con un documento por receta.

**Lo que resuelve**

- El techo de 1 MiB **deja de existir** en la práctica: el límite pasa a ser
  por receta (~1.4 KB contra 1 MiB), no por catálogo
- Dos personas editando recetas **distintas** ya no compiten por el mismo
  documento. El guardado con fusión de ayer deja de ser un parche y pasa a
  cubrir solo el caso real de edición simultánea de la *misma* receta
- El sync puede traer **solo lo que cambió** en vez de 587 KB cada vez
- Las reglas de Firestore por fin pueden distinguir *crear* de *borrar*: hoy
  las recetas son un bloque JSON opaco para las reglas, y por eso no se pudo
  dar acceso de captura sin dar acceso de borrado

**Lo que cuesta**

- Tocar `sincronizarDesdeFirebase`, `saveRecetas` y su fusión, la limpieza
  guiada, el reporte de faltantes y la exportación
- **Migrar 417 recetas de producción**, con respaldo y verificación
- Es el cambio más grande que se le ha hecho al almacenamiento

### B. Partir en bloques

`recetas_1`, `recetas_2`… de ~200 recetas cada uno.

**A favor:** mucho menos trabajo que A. Corre el techo a varios miles.

**En contra:** mantiene la escritura del arreglo completo y su carrera; sigue
descargando bloques enteros; y agrega la pregunta de en qué bloque va cada
receta, que es una complicación nueva sin beneficio propio. **Aplaza el
problema en vez de resolverlo.**

### C. No hacer nada, y podar

Quedan ~300 recetas de margen. Con el toggle de "Omitir" ya se puede sacar una
receta de rotación sin borrarla, pero **eso no libera espacio**: sigue guardada.

Solo sirve si el catálogo va a dejar de crecer. Después de pasar de 68 a 435 en
un día, no parece el caso.

### Recomendación

**A.** B es trabajo que hay que rehacer después, y C depende de que el catálogo
deje de crecer justo cuando está creciendo más rápido.

Conviene hacerlo **antes** de acercarse al techo: migrar con 300 recetas de
margen es un trabajo tranquilo; migrar con el guardado ya fallando es una
urgencia con datos en riesgo.

---

## 3. Respaldo — hoy no hay ninguno

Ni automático ni manual. `COSTEO.md` §3.3 exige *"respaldo descargable primero
(JSON de `datos/recetas`)"* antes de la limpieza guiada, pero **ese botón no
existe en la app**: el respaldo de aquella vez se hizo a mano, una sola vez.

Hoy, un borrado accidental o una escritura mala se lleva las 417 recetas sin
vuelta atrás.

### A. Botón de respaldo en la app

Descarga un JSON con recetas, alacarta, borradas, omitidas y config.

**A favor:** gratis, funciona en Spark, se implementa en poco tiempo, y cierra
el hueco que la propia spec exige. Sirve de inmediato.

**En contra:** **es manual**. Depende de que alguien se acuerde, y el día que
importa suele ser el día que no se acordó.

### B. Exportaciones programadas de Firestore *(requiere Blaze)*

Firestore exporta solo a un bucket de Cloud Storage, en el horario que se
configure.

**A favor:** automático, sin código, cubre **todos** los documentos.

**En contra:** exige Blaze y crear el bucket. El costo es de centavos a este
volumen (~660 KB), pero conviene ponerle **regla de retención** al bucket para
que no acumule exportaciones para siempre.

### C. Point-in-time recovery *(requiere Blaze)*

Permite volver a cualquier instante de los últimos 7 días.

**A favor:** es lo único que salva de un borrado que se descubre horas después.

**En contra:** Blaze, y la ventana es de 7 días. Igual que en Supabase: protege
del accidente que notas pronto, no del que descubres el mes que viene.

### Recomendación

**A + B.** El botón cierra el hueco hoy y no depende de nada; las exportaciones
programadas quitan el factor humano. C es un extra barato si ya estás en Blaze.

Si vas a subir a Blaze, **es por esto** — no por el techo de 1 MiB, que Blaze no
mueve.

---

## 4. Orden sugerido

1. **Botón de respaldo** — poco trabajo, cierra el hueco de §3.3, y hay que
   tenerlo *antes* de migrar nada
2. **Blaze + exportaciones programadas** — automatiza lo anterior
3. **Un documento por receta** — con respaldo ya funcionando y ~300 recetas de
   margen, sin prisa

Los tres son independientes: cada uno sirve por sí solo si los otros no se hacen.

---

## 5. Aparte, para limpiar

- **`sistema-menu-cicsa/datos/precios` (4 KB, 43 entradas) está muerto.** Los
  precios se leen de `cicsa-egresos` desde que se quitó el catálogo propio.
  Nadie lo lee y nadie lo escribe. Borrarlo evita que alguien lo confunda con la
  fuente buena.
- **`datos/config` sigue sin existir.** Mientras no se guarde desde el panel con
  sesión de admin, cada navegador usa los valores por omisión del código y
  cualquier cambio local no se comparte.
