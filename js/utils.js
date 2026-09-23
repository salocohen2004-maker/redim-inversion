/* Utilidades compartidas: formato, exportación CSV, etiquetas de estado. */

const ETIQUETAS_ESTADO = {
  validado: "Validado",
  en_revision: "En revisión",
  pendiente: "Pendiente",
  demostracion: "Dato de demostración"
};

const ETIQUETAS_EVIDENCIA = {
  descriptiva: "Descriptiva",
  asociacion: "Asociación",
  evidencia_causal: "Evidencia causal",
  hipotesis: "Hipótesis"
};

function formatearNumero(valor, decimales = 0) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "Dato pendiente de validación";
  return new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
}

/**
 * Función única para mostrar cantidades monetarias. Nunca abrevia con
 * notación compacta ("k", "M"): siempre muestra el número completo con
 * separadores de miles y, salvo que se indique lo contrario, la unidad
 * explícita tal como viene en los datos (pesos, miles de pesos, millones
 * de pesos, miles de millones de pesos, etc.), para evitar lecturas
 * ambiguas como "$850 k millones".
 */
function formatearMonto(valor, unidad, opciones = {}) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "Dato pendiente de validación";
  const { soloNumero = false, decimales = 0 } = opciones;
  const numero = new Intl.NumberFormat("es-MX", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales
  }).format(valor);
  if (soloNumero) return `$${numero}`;
  return `$${numero} ${unidad || "pesos (MXN)"}`;
}

function formatearPorcentaje(valor, decimales = 1) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "Dato pendiente de validación";
  const signo = valor > 0 ? "+" : "";
  return `${signo}${formatearNumero(valor, decimales)}%`;
}

function escaparHTML(texto) {
  if (texto === null || texto === undefined) return "";
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function badgeEstado(estado) {
  const clave = estado || "pendiente";
  const etiqueta = ETIQUETAS_ESTADO[clave] || "Pendiente";
  return `<span class="badge badge-${escaparHTML(clave)}">${escaparHTML(etiqueta)}</span>`;
}

function badgeEvidencia(clave) {
  const etiqueta = ETIQUETAS_EVIDENCIA[clave] || "Hipótesis";
  return `<span class="badge-evidencia">${escaparHTML(etiqueta)}</span>`;
}

function fichaTrazabilidad(registro) {
  if (!registro) return "";
  const partes = [];
  if (registro.fuente) partes.push(`<span class="item"><dt>Fuente:</dt> <dd>${escaparHTML(registro.fuente)}</dd></span>`);
  if (registro.anio) partes.push(`<span class="item"><dt>Año:</dt> <dd>${escaparHTML(registro.anio)}</dd></span>`);
  if (registro.territorio) partes.push(`<span class="item"><dt>Territorio:</dt> <dd>${escaparHTML(registro.territorio)}</dd></span>`);
  if (registro.fecha_consulta) partes.push(`<span class="item"><dt>Consultado:</dt> <dd>${escaparHTML(registro.fecha_consulta)}</dd></span>`);
  if (registro.url) partes.push(`<span class="item"><dt>Enlace:</dt> <dd><a href="${escaparHTML(registro.url)}" target="_blank" rel="noopener">Ver documento original</a></dd></span>`);
  partes.push(`<span class="item">${badgeEstado(registro.estado_validacion)}</span>`);
  if (!partes.length) return "";
  return `<dl class="ficha-trazabilidad">${partes.join("")}</dl>`;
}

function descargarCSV(nombreArchivo, filas, columnas) {
  if (!filas || !filas.length) return;
  const encabezado = columnas.map((c) => c.etiqueta);
  const lineas = [encabezado.join(",")];
  filas.forEach((fila) => {
    const linea = columnas.map((c) => {
      let valor = typeof c.valor === "function" ? c.valor(fila) : fila[c.valor];
      if (valor === null || valor === undefined) valor = "";
      valor = String(valor).replaceAll('"', '""');
      if (/[",\n]/.test(valor)) valor = `"${valor}"`;
      return valor;
    });
    lineas.push(linea.join(","));
  });
  const csv = "﻿" + lineas.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

function debounce(fn, espera = 200) {
  let temporizador = null;
  return (...args) => {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => fn(...args), espera);
  };
}

function estadoVacio(mensaje) {
  return `<div class="estado-vacio">${escaparHTML(mensaje)}</div>`;
}
