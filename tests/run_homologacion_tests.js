#!/usr/bin/env node
"use strict";

// Prueba las funciones REALES de index.html. ForX sigue siendo un HTML único, por eso se
// extraen por nombre en vez de mantener una segunda copia de la lógica de homologación.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");

function extraerFuncion(nombre) {
  const inicio = html.indexOf("function " + nombre + "(");
  if (inicio < 0) throw new Error("No encontré la función " + nombre);
  const cuerpo = html.indexOf("{", inicio);
  let nivel = 0;
  let cadena = null;
  let comentario = null;

  for (let i = cuerpo; i < html.length; i++) {
    const c = html[i];
    const previo = html[i - 1];
    if (comentario === "//") {
      if (c === "\n") comentario = null;
      continue;
    }
    if (comentario === "/*") {
      if (previo === "*" && c === "/") comentario = null;
      continue;
    }
    if (cadena) {
      if (c === cadena && previo !== "\\") cadena = null;
      continue;
    }
    if (c === "'" || c === '"' || c === "`") {
      cadena = c;
      continue;
    }
    if (c === "/" && html[i + 1] === "/") {
      comentario = "//";
      continue;
    }
    if (c === "/" && html[i + 1] === "*") {
      comentario = "/*";
      continue;
    }
    // Saltar literales de expresión regular; pueden contener comillas o llaves que no forman
    // parte de la estructura JavaScript de la función.
    if (c === "/") {
      let j = i - 1;
      while (j >= 0 && /\s/.test(html[j])) j--;
      const anterior = j >= 0 ? html[j] : "(";
      if ("(,=:[!&|?{};+-*%~^".includes(anterior) ||
          /\breturn$/.test(html.slice(Math.max(0, j - 6), j + 1))) {
        let enClase = false;
        for (i++; i < html.length; i++) {
          const r = html[i];
          if (r === "\\") { i++; continue; }
          if (r === "[") enClase = true;
          else if (r === "]") enClase = false;
          else if (r === "/" && !enClase) break;
          else if (r === "\n") break;
        }
        continue;
      }
    }
    if (c === "{") nivel++;
    if (c === "}" && --nivel === 0) return html.slice(inicio, i + 1);
  }
  throw new Error("Llaves desbalanceadas en " + nombre);
}

const contexto = {
  precios: {},
  descarga: null,
  dl: (contenido, nombre, tipo) => { contexto.descarga = { contenido, nombre, tipo }; },
  toast: () => {}
};
vm.createContext(contexto);
vm.runInContext(
  ["_csvCampo", "_normIng", "_palabraEn", "_palabrasEquivalentes", "_nombreEquivalente",
    "_partesAliasHistorico", "resolverClaveBanco", "exportarPrecios"]
    .map(extraerFuncion).join("\n"),
  contexto
);

let pasaron = 0;
function prueba(nombre, fn) {
  fn();
  pasaron++;
  console.log("ok - " + nombre);
}

prueba("normaliza guiones, puntuación, mayúsculas y acentos", () => {
  assert.equal(contexto._normIng("  CHILE—SERRANO, "), "chile serrano");
});

prueba("recupera un alias exacto dentro de una llave histórica", () => {
  contexto.precios = { "Tomate, Jitomate, Tomate rojo": { precio: 31 } };
  assert.equal(contexto.resolverClaveBanco("JITOMATE"), "Tomate, Jitomate, Tomate rojo");
});

prueba("recupera tortilla plural desde una llave histórica separada con punto", () => {
  contexto.precios = { "Tortilla Maiz. Tortilla": { precio: 27.78 } };
  assert.equal(contexto.resolverClaveBanco("tortillas de maiz"), "Tortilla Maiz. Tortilla");
});

prueba("una llave independiente tolera plural simple y el conector de", () => {
  contexto.precios = { "Tortilla Maiz": { precio: 27.78 } };
  assert.equal(contexto.resolverClaveBanco("Tortillas de maíz"), "Tortilla Maiz");
});

prueba("no extiende una llave histórica por aproximación culinaria", () => {
  contexto.precios = { "Consomé, Caldo de Pollo": { precio: 42 } };
  assert.equal(contexto.resolverClaveBanco("Consomé de res"), null);
});

prueba("un alias ambiguo se queda sin precio", () => {
  contexto.precios = {
    "Chile, Chile serrano": { precio: 20 },
    "Chile, Chile jalapeño": { precio: 25 }
  };
  assert.equal(contexto.resolverClaveBanco("Chile"), null);
});

prueba("una llave canónica independiente gana a las históricas", () => {
  contexto.precios = {
    "Chile": { precio: 18 },
    "Chile, Chile serrano": { precio: 20 }
  };
  assert.equal(contexto.resolverClaveBanco("chile"), "Chile");
});

prueba("conserva la coincidencia por palabra completa", () => {
  contexto.precios = { Elote: { precio: 17 }, Papa: { precio: 28 } };
  assert.equal(contexto.resolverClaveBanco("elote en grano"), "Elote");
  assert.equal(contexto.resolverClaveBanco("papaya"), null);
});

prueba("el CSV conserva nombres con comas y la unidad base", () => {
  contexto.precios = {
    "Alitas, Alitas IQF": { precio: 59, unidad_base: "kg", fecha: "2026-07-20" }
  };
  contexto.exportarPrecios();
  assert.ok(contexto.descarga.contenido.startsWith("\ufeffIngrediente,"));
  assert.ok(contexto.descarga.contenido.includes(
    '"Alitas, Alitas IQF",59,kg,2026-07-20'
  ));
  assert.equal(contexto.descarga.tipo, "text/csv;charset=utf-8");
});

console.log("\n" + pasaron + " pruebas de homologación pasaron");
