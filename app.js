"use strict";

/* ==========================================================
   Programa de notas de alumnos
   Estructura:
   1. Datos (arreglo de nombres + matriz de notas)
   2. Validaciones
   3. Cálculos (funciones de orden superior)
   4. Presentación (DOM)
   5. Eventos
   ========================================================== */

/* ---------- 1. Datos ---------- */
const MAX_ALUMNOS = 10;
const NUM_CERTIFICADOS = 3;
const NOTA_MIN = 0;
const NOTA_MAX = 100;
const NOTA_APROBACION = 55;

// Arreglo unidimensional de largo 10 para los nombres
const nombres = new Array(MAX_ALUMNOS).fill(null);
// Matriz de 10 filas x 3 columnas para las notas
const notas = Array.from({ length: MAX_ALUMNOS }, () =>
  new Array(NUM_CERTIFICADOS).fill(null)
);
let totalAlumnos = 0;

/* ---------- 2. Validaciones ---------- */
function validarNombre(texto) {
  const nombre = texto.trim();
  if (nombre === "") return { ok: false, error: "Escribe el nombre del alumno." };
  if (nombre.length < 2) return { ok: false, error: "El nombre debe tener al menos 2 letras." };
  if (!/^[\p{L}][\p{L}\s'.-]*$/u.test(nombre)) {
    return { ok: false, error: "El nombre solo puede tener letras y espacios." };
  }
  const repetido = nombres
    .slice(0, totalAlumnos)
    .some((n) => n.toLowerCase() === nombre.toLowerCase());
  if (repetido) return { ok: false, error: `Ya existe un alumno llamado "${nombre}".` };
  return { ok: true, valor: nombre };
}

function validarNota(texto, numero) {
  if (texto.trim() === "") return { ok: false, error: `Ingresa la nota del certamen ${numero}.` };
  const valor = Number(texto);
  if (!Number.isFinite(valor)) return { ok: false, error: `La nota del certamen ${numero} no es un número válido.` };
  if (valor < NOTA_MIN || valor > NOTA_MAX) {
    return { ok: false, error: `La nota del certamen ${numero} debe estar entre ${NOTA_MIN} y ${NOTA_MAX}.` };
  }
  return { ok: true, valor };
}

/* ---------- 3. Cálculos ---------- */
const sumar = (a, b) => a + b;
const promedioDe = (lista) => lista.reduce(sumar, 0) / lista.length;

// Notas de los alumnos registrados (ignora filas vacías de la matriz)
const filasRegistradas = () => notas.slice(0, totalAlumnos);

const promedioAlumno = (indice) => promedioDe(notas[indice]);

const promediosAlumnos = () =>
  filasRegistradas().map((_, i) => promedioAlumno(i));

const promedioCertificado = (columna) =>
  promedioDe(filasRegistradas().map((fila) => fila[columna]));

const promediosCertificados = () =>
  Array.from({ length: NUM_CERTIFICADOS }, (_, c) => promedioCertificado(c));

const promedioGeneral = () => promedioDe(promediosAlumnos());

const contarAprobados = () =>
  promediosAlumnos().filter((p) => p >= NOTA_APROBACION).length;

const contarReprobados = () => totalAlumnos - contarAprobados();

function ranking() {
  return nombres
    .slice(0, totalAlumnos)
    .map((nombre, i) => ({ nombre, promedio: promedioAlumno(i) }))
    .sort((a, b) => b.promedio - a.promedio);
}