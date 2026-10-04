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

/* ---------- 4. Presentación ---------- */
const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toFixed(2);

function crear(tag, texto, clase) {
  const el = document.createElement(tag);
  if (texto !== undefined) el.textContent = texto;
  if (clase) el.className = clase;
  return el;
}

function mostrarMensaje(texto, tipo) {
  const el = $("mensaje");
  el.textContent = texto;
  el.className = "mensaje" + (tipo ? " " + tipo : "");
}

function renderTabla() {
  const cuerpo = $("tabla-alumnos");
  cuerpo.replaceChildren();
  nombres.slice(0, totalAlumnos).forEach((nombre, i) => {
    const prom = promedioAlumno(i);
    const aprobado = prom >= NOTA_APROBACION;
    const fila = document.createElement("tr");
    fila.append(crear("td", nombre));
    notas[i].forEach((n) => fila.append(crear("td", String(n), "num")));
    fila.append(crear("td", fmt(prom), "num"));
    const celdaEstado = document.createElement("td");
    celdaEstado.append(
      crear("span", aprobado ? "Aprobado" : "Reprobado", "estado " + (aprobado ? "aprobado" : "reprobado"))
    );
    fila.append(celdaEstado);
    cuerpo.append(fila);
  });
}

function renderResumen() {
  const resumen = $("resumen");
  resumen.replaceChildren();
  const items = [
    ...promediosCertificados().map((p, i) => [`Promedio del curso C${i + 1}`, fmt(p)]),
    ["Promedio final del curso", fmt(promedioGeneral())],
    ["Aprobados", String(contarAprobados())],
    ["Reprobados", String(contarReprobados())],
  ];
  items.forEach(([etiqueta, valor]) => {
    const bloque = document.createElement("div");
    bloque.append(crear("dt", etiqueta), crear("dd", valor));
    resumen.append(bloque);
  });
}

function renderRanking() {
  const lista = $("ranking-lista");
  lista.replaceChildren();
  ranking().forEach(({ nombre, promedio }) => {
    const li = crear("li", nombre + " ");
    li.append(crear("span", fmt(promedio), "prom"));
    lista.append(li);
  });
}

function renderContador() {
  const lleno = totalAlumnos >= MAX_ALUMNOS;
  $("contador").textContent = lleno
    ? "Curso completo: ya registraste los 10 alumnos."
    : `Alumnos registrados: ${totalAlumnos} de ${MAX_ALUMNOS}`;
  $("btn-agregar").disabled = lleno;
}

function renderTodo() {
  $("resultados").hidden = totalAlumnos === 0;
  if (totalAlumnos > 0) {
    renderTabla();
    renderResumen();
    renderRanking();
  }
  renderContador();
}

/* ---------- 5. Eventos ---------- */
const campos = {
  nombre: $("nombre"),
  notas: [$("c1"), $("c2"), $("c3")],
};

function marcarInvalido(input, invalido) {
  input.classList.toggle("invalido", invalido);
  input.setAttribute("aria-invalid", String(invalido));
}

function agregarAlumno(evento) {
  evento.preventDefault();

  if (totalAlumnos >= MAX_ALUMNOS) {
    mostrarMensaje("El curso ya tiene 10 alumnos.", "error");
    return;
  }

  const entradas = [campos.nombre, ...campos.notas];
  const resultados = [
    validarNombre(campos.nombre.value),
    ...campos.notas.map((input, i) => validarNota(input.value, i + 1)),
  ];

  entradas.forEach((input, i) => marcarInvalido(input, !resultados[i].ok));

  const primerError = resultados.findIndex((r) => !r.ok);
  if (primerError !== -1) {
    mostrarMensaje(resultados[primerError].error, "error");
    entradas[primerError].focus();
    return;
  }

  nombres[totalAlumnos] = resultados[0].valor;
  resultados.slice(1).forEach((r, c) => { notas[totalAlumnos][c] = r.valor; });
  totalAlumnos++;

  $("formulario").reset();
  mostrarMensaje(`Se agregó a ${resultados[0].valor}.`, "ok");
  renderTodo();
  campos.nombre.focus();
}

function reiniciarCurso() {
  if (totalAlumnos === 0) return;
  if (!confirm("¿Borrar todos los alumnos y sus notas?")) return;
  nombres.fill(null);
  notas.forEach((fila) => fila.fill(null));
  totalAlumnos = 0;
  $("formulario").reset();
  [campos.nombre, ...campos.notas].forEach((i) => marcarInvalido(i, false));
  mostrarMensaje("Curso reiniciado.", "ok");
  renderTodo();
}

$("formulario").addEventListener("submit", agregarAlumno);
$("btn-reiniciar").addEventListener("click", reiniciarCurso);
[campos.nombre, ...campos.notas].forEach((input) =>
  input.addEventListener("input", () => marcarInvalido(input, false))
);

renderTodo();