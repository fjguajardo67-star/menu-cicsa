# ForX — handoff de sesión (2026-08-02)

Estado para retomar en un chat nuevo. Léelo completo antes de tocar nada.

## Qué es esto

**ForX** (antes "Sistema Menú CICSA") — repo `~/Documents/GitHub/menu-cicsa`,
deploy automático a `menu-cicsa.cicsacomedores.com.mx` (GitHub Pages desde `main`).
App de un solo archivo: `index.html` + `estilos.css` (CSS ya extraído), HTML/CSS/JS
vanilla, sin framework ni build. **Sin tests, sin CI.**

Documentos que mandan sobre el código:
- **`COSTEO.md`** — spec funcional. "Si el código y este archivo difieren, gana este archivo."
- **`PRODUCT.md`** — verdad de producto (marca, voz, renombre a ForX, compromisos).

## Arquitectura confirmada — cadena de datos

```
Egresos  →  precios de insumos   →  ForX
ForX     →  costos de platillos  →  Grill Express
```

Cada dato tiene **un solo dueño**; los demás leen.
**ForX es el ÚNICO generador de costos de menús y recetas.** Grill Express no
calcula costos: los consume.

- Precios en Firestore **`cicsa-egresos/datos/precios`**, validados a mano contra
  facturas en la app de Egresos. ForX **solo lee**. No inventa precios: sin precio
  validado ⇒ $0 + marca "⚠ sin precio".
- Merma y conversión de presentación se aplican **solo en Egresos**.
- Escrituras a `sistema-menu-cicsa/datos/*` exigen admin (Google Sign-In, allowlist
  `facturacion@` y `ops@cicsacomedores.com`). Lectura pública.

## ⚠️ Regla de seguridad al probar

**Siempre inyectar un guard que bloquee PATCH/DELETE a Firestore** antes del script
de la app al servir una copia de prueba. Ya hubo 2 incidentes de escritura accidental
a producción.

## Flujo de trabajo

El agente **no puede crear ni mergear PRs**. Rama → commit → push → pasarle al
usuario el link `pull/new/<rama>` → él mergea → verificar deploy → borrar rama.
**Nunca commit directo a `main`** (push a main = deploy).

## BLOQUEADORES ACTIVOS

1. **`datos/alacarta` da 404** — los platillos de Grill Express viven solo en
   localStorage, no suben a Firestore. Hay un fix reciente (`70420cf`) pero el
   documento sigue sin existir. **Ninguna otra app puede leer los platillos.**
   Reproducir: entrar como admin, guardar un platillo, verificar si el doc se crea.
2. **`datos/config` da 404** — la config de negocio (líneas de contrato, costo de
   producción, complementos, margen) nunca se ha guardado desde Admin. Vive solo
   en el navegador. Falta además el valor real de **complementos** (hoy $0, lo que
   hace el semáforo optimista).

## SKU / código de platillo — DECIDIDO 2026-08-07

**`GX-XXX` es el SKU maestro** y **ForX desglosa por variante**. El razonamiento
completo quedó en `COSTEO.md` §10.1 y §10.2 — que es la spec y manda sobre el código.

En corto: Grill Express (`~/grill-express`, Express+Supabase, deploy Railway) conserva
su PK `clave` con los **15 platillos en producción** (`hamburguesa_res`, `alitas_bbq`,
`alitas_casa`, `alitas_picantes`, `boneless_bbq`, `boneless_casa`, `rollo_boneless`,
`pechuga_plancha`, `milanesa_pollo`, `filete_pescado`, `ensalada_grill`,
`ensalada_atun`, `ensalada_boneless`, `especial_dia`, `hamburguesa_pollo`, todos a
**$77.00**) y **agrega una columna `codigo_forx`**. ForX captura las variantes como
platillos separados, así que son ~15 recetas, no ~5. `especial_dia` no recibe código
propio: rota, y hereda el `G-XXX` del guisado del día.

Falta implementar:
1. SQL de `codigo_forx` en `~/grill-express/schema.sql` (lo pega el dueño en Supabase).
2. El emparejamiento inicial de los 15 — **a mano, una vez**. Sin match automático por
   nombre: es la adivinanza que §2 de `COSTEO.md` prohíbe.

## Pendientes operativos del usuario (no código)

1. **🧹 Limpieza guiada** (Catálogo, como admin): repara recetas 65→56. Respaldo ya
   entregado.
2. **~17 genéricos en Egresos**: Pierna y muslo, Pechuga, Ajo, Sal, Aceite, Consomé
   de pollo, Chile guajillo, Crema, Consomé de res, Pimienta, Mantequilla, Tomatillo,
   Comino, Leche… Cada uno apaga un ⚠ y enciende colores en el semáforo.
   **No validar "Agua"** (debe costear $0).
3. **Desechables en Egresos** (caja, bolsa, servilleta, vaso) para que Grill Express
   los pueda costear.
4. **Íconos PWA de Egresos**: PNG listos en `~/Downloads/egresos-iconos/`.

## Notas sueltas

- **Logo oficial en SVG:** el usuario lo tiene; pedírselo si se necesita. El emblema solo
  se obtiene con `viewBox="0 0 512 512"`.
- **Impeccable** (skill de diseño) instalada global en `~/.claude/skills/impeccable`,
  con **hook desactivado a propósito** (`IMPECCABLE_HOOK_DISABLED=1` en
  `~/.claude/settings.json`). No reactivar.
  - En ForX: solo comandos de **lectura** (`critique`/`audit`) sobre `estilos.css`.
    **Ignorar** `index.html` y los 5 generadores de impresión (`genLista`,
    `imprimirMenu`, `imprimirRA`, `exportarLibro`, `imprimirAlacarta`) — usan Arial
    a propósito y `PRODUCT.md` lo exige (impresoras de cocina).
- **Figma MCP** requiere autorización OAuth; no funciona en sesión no interactiva.
