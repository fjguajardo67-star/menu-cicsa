# Costeo de menús — CICSA

Especificación funcional del módulo de costeo de `menu-cicsa`.
Este documento es la fuente de verdad de las fórmulas y los criterios.
Si el código y este archivo difieren, gana este archivo — corrige el código.

**Estado:** en desarrollo, sin datos de producción. Se puede romper y rehacer
esquema libremente. No hacer migraciones defensivas.

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

---

## 2. El problema que este módulo resuelve

Hoy la app calcula costos pero no los compara contra nada. No hay precio de
venta ni costo de producción, así que no se puede saber si un menú gana o
pierde dinero.

Además, la captura permite guardar recetas incompletas. El resultado visible:
días completos costeados en $1.28 o $0.16 por pax cuando deberían andar en $45,
con una dispersión de 17× entre días. No es un error de fórmula global — son
recetas guardadas a medias.

**Orden de ataque: primero la integridad del dato (§3), luego el precio (§4),
luego el semáforo (§5).** Un semáforo montado sobre datos que mienten pinta
todo verde y da confianza falsa.

---

## 3. Integridad del dato

### 3.1 Validación en el modelo, no en la UI

Una receta **no se guarda** si algún ingrediente carece de:

- precio
- cantidad
- unidad

El dato malo no debe poder entrar. Detectarlo después es perseguir recetas
rotas para siempre.

### 3.2 Campos obligatorios adicionales

| Campo | Dónde | Notas |
|---|---|---|
| Rendimiento de la receta | Receta | Cuántas porciones rinde |
| Piezas o kilos de la presentación | Ingrediente | Cómo se convierte el precio de compra a precio por unidad de uso |
| Merma | Ingrediente | **Opcional**, en %. Si viene vacía cuenta como 0 |

### 3.3 Limpieza

Borrar las recetas de prueba con datos incompletos en vez de repararlas.
Dejar un seed limpio de 5 o 6 recetas bien capturadas que sirvan de referencia
y que produzcan costos realistas: **entre $30 y $55 por pax en el día completo**.

### 3.4 Reporte de faltantes

Pantalla o comando que liste las recetas con datos incompletos e indique
exactamente qué campo falta en cuál ingrediente.

---

## 4. Precio de venta y costo de producción

### 4.1 Catálogo de líneas de contrato (nuevo)

No existe hoy. La app solo maneja costos.

- Entidad con **nombre** y **precio de venta**
- Alta, baja y edición desde configuración
- Semilla: `Comida completa = 77.00`, `Canje = 32.00`
- Cada día de menú se asocia a una línea. Campo **obligatorio**, default
  `Comida completa`

**El precio vive en la línea, no en el día.** Si el contrato sube de $77 a $84
se cambia un solo registro y todo el menú se recalcula. Si se copia a cada día,
habrá que editar cientos.

### 4.2 Costo de producción — en pesos, nunca porcentaje

Campo global configurable. **Valor inicial: `22.81`.**

Es un costo **fijo por porción**, no proporcional al costo de los ingredientes.
La razón es física: el cocinero tarda lo mismo en un platillo de $30 que en uno
de $58, el gas es el mismo y la nómina es la misma. Un porcentaje castiga a los
platillos caros y perdona a los baratos.

Qué contiene los $22.81 (ejercicio 2025-2026):

| Componente | Por porción | % |
|---|---:|---:|
| Nómina y transporte de cocina | $16.42 | 72.0 % |
| Hielo y agua | $2.97 | 13.0 % |
| Gas LP, basura, fumigación, trampa de grasa | $1.81 | 8.0 % |
| Vehículos, combustible, seguros, sistemas | $1.61 | 7.1 % |
| **Total** | **$22.81** | |

Se recalcula cada mes:

```
costo_produccion = estructura_del_mes / comidas_servidas_del_mes
```

Las comidas servidas salen de la estimación quincenal del contrato. Por eso el
campo tiene que ser editable sin tocar código.

Rango esperado según el conteo de comidas: **$17 a $33**. Si el resultado cae
fuera, revisar el denominador antes de aceptarlo.

### 4.3 Se suma una vez por día

El costo de producción se aplica **una vez por día de menú**, no por cada
receta del día. El día tiene tres recetas (guisado 1, guisado 2, garnacha) pero
se sirve una sola comida.

```
costo_total_dia_por_pax = MP_del_dia_por_pax + costo_produccion
```

### 4.4 Qué va en la receta y qué no

En la receta va **solo lo que esa porción consume**, con su precio real:

- Ingredientes
- Tortillas, cuando el platillo las lleva
- Desechable, **solo cuando es para llevar**. Los platillos consumidos en
  comedor no lo llevan

Fuera de la receta va **el costo de producción**, igual para todos. El hielo y
el agua están ahí dentro: no son ingrediente de ninguna receta en particular,
son costo de tener el comedor operando.

---

## 5. Semáforo

### 5.1 Va al día, no a la receta

Fertinal paga $77 por la comida completa del día. Una receta suelta no tiene
precio de venta, así que no puede tener semáforo.

Reemplaza el filtro actual de rangos fijos (`<$50` / `$50-80` / `$80+`), que
está bien ubicado a nivel día pero mal calibrado y sin costo de producción.

### 5.2 Umbrales — calculados, nunca escritos a mano

```
umbral_verde    = precio * (1 - margen_objetivo) - costo_produccion
umbral_amarillo = precio * 0.90               - costo_produccion
umbral_naranja  = precio                      - costo_produccion
```

`margen_objetivo` es configurable. **Default: 15 %.**

Con `precio = 77.00`, `costo_produccion = 22.81` y `margen_objetivo = 0.15`:

| Umbral | Valor |
|---|---:|
| Verde | $42.64 |
| Amarillo | $46.49 |
| Naranja | $54.19 |

**No hardcodear estos números.** Si cambia el precio del contrato, el costo de
producción o el margen objetivo, deben recalcularse solos.

### 5.3 Bandas

| Condición sobre el MP del día | Color | Significado |
|---|---|---|
| `MP <= umbral_verde` | Verde | Cumple el margen objetivo |
| `MP <= umbral_amarillo` | Amarillo | Gana, por debajo del objetivo |
| `MP <= umbral_naranja` | Naranja | Margen mínimo, revisar |
| `MP > umbral_naranja` | Rojo | Pierde dinero |

### 5.4 Presentación

- Badge de color en el encabezado del día, junto al costo por pax, con el
  margen resultante en %
- Los filtros pasan a ser por color, no por rango fijo
- Vista del menú ordenada por margen, de peor a mejor. Es la pantalla que se
  abre cada vez que sube un ingrediente
- Si el día tiene alguna receta incompleta: **"datos incompletos"**, nunca un
  color. Una receta sin validar no puede pintar semáforo

### 5.5 Casos borde

- **Umbrales negativos**: si el costo de producción supera al precio, los
  umbrales salen negativos. Manejarlo sin romper la UI
- **Día sin línea de contrato asignada**: no pintar semáforo, mostrar aviso.
  Nunca usar el precio de la comida como default para un día de canje

---

## 6. Reglas generales de cálculo

- Redondear a 2 decimales **solo al desplegar**, nunca al calcular
- Todos los precios en MXN
- Los precios de ingredientes vienen del sistema de compras y se actualizan
  con cada factura procesada. Este módulo los consume, no los edita

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

1. **§3 Integridad del dato.** Cerrar antes de seguir. Cargar recetas reales y
   verificar que los costos por día caigan entre $30 y $55 por pax
2. **§4 Precio de venta y costo de producción**
3. **§5 Semáforo**

No montar el semáforo sobre datos sin validar.
