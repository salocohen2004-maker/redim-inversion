/* Gráficas accesibles en SVG, sin dependencias externas.
   Cada gráfica incluye: una tabla equivalente visible bajo demanda ("Ver
   datos en tabla"), una ficha de metadatos (unidad, periodo, fuente, estado,
   fecha de consulta, nota metodológica) y, cuando los datos son de
   demostración, una marca de agua discreta sobre el área de dibujo. */

const SVG_NS = "http://www.w3.org/2000/svg";

function crearSVG(w, h) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
  svg.setAttribute("width", "100%");
  svg.setAttribute("role", "img");
  svg.style.height = "auto";
  return svg;
}

function elSVG(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

function asegurarTooltip(contenedor) {
  let tip = contenedor.querySelector(".tooltip-grafica");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "tooltip-grafica";
    tip.setAttribute("role", "status");
    tip.hidden = true;
    contenedor.style.position = "relative";
    contenedor.appendChild(tip);
  }
  return tip;
}

function ligarTooltip(marca, tip, contenedorPosicion, textoHTML) {
  const mostrar = (evt) => {
    tip.innerHTML = textoHTML;
    tip.hidden = false;
    const rectContenedor = contenedorPosicion.getBoundingClientRect();
    const rectMarca = marca.getBoundingClientRect();
    tip.style.left = `${rectMarca.left - rectContenedor.left + rectMarca.width / 2}px`;
    tip.style.top = `${rectMarca.top - rectContenedor.top}px`;
  };
  const ocultar = () => { tip.hidden = true; };
  marca.addEventListener("mouseenter", mostrar);
  marca.addEventListener("mouseleave", ocultar);
  marca.addEventListener("focus", mostrar);
  marca.addEventListener("blur", ocultar);
}

function escalaLineal(dominio, rango) {
  const [d0, d1] = dominio;
  const [r0, r1] = rango;
  const div = (d1 - d0) || 1;
  return (v) => r0 + ((v - d0) / div) * (r1 - r0);
}

function insertarMarcaAgua(contenedor, esDemostracion) {
  if (esDemostracion === false) return;
  contenedor.classList.add("con-marca-agua");
  const marca = document.createElement("div");
  marca.className = "marca-agua-demo";
  marca.setAttribute("aria-hidden", "true");
  marca.innerHTML = "<span>Datos de demostración</span>";
  contenedor.appendChild(marca);
}

function renderFichaGrafica(meta) {
  if (!meta) return "";
  const partes = [];
  if (meta.unidad) partes.push(`<span class="item"><dt>Unidad:</dt> <dd>${escaparHTML(meta.unidad)}</dd></span>`);
  if (meta.periodo) partes.push(`<span class="item"><dt>Periodo:</dt> <dd>${escaparHTML(meta.periodo)}</dd></span>`);
  if (meta.fuente) partes.push(`<span class="item"><dt>Fuente:</dt> <dd>${escaparHTML(meta.fuente)}</dd></span>`);
  partes.push(`<span class="item"><dt>Estado:</dt> <dd>${badgeEstado(meta.estado)}</dd></span>`);
  if (meta.fechaConsulta) partes.push(`<span class="item"><dt>Fecha de consulta:</dt> <dd>${escaparHTML(meta.fechaConsulta)}</dd></span>`);
  const nota = meta.notaMetodologica ? `<div class="nota-metodologica">Nota metodológica: ${escaparHTML(meta.notaMetodologica)}</div>` : "";
  return `<dl class="ficha-grafica">${partes.join("")}${nota}</dl>`;
}

function crearDetalleTabla(titulo, encabezados, filas) {
  const details = document.createElement("details");
  details.className = "ver-datos-tabla";
  const summary = document.createElement("summary");
  summary.textContent = "Ver datos en tabla";
  details.appendChild(summary);

  const contTabla = document.createElement("div");
  contTabla.className = "tabla-contenedor";
  contTabla.setAttribute("tabindex", "0");
  contTabla.setAttribute("role", "region");
  contTabla.setAttribute("aria-label", `${titulo}, tabla desplazable`);

  const tabla = document.createElement("table");
  tabla.className = "tabla-datos";
  const caption = document.createElement("caption");
  caption.textContent = titulo;
  tabla.appendChild(caption);
  const thead = document.createElement("thead");
  thead.innerHTML = `<tr>${encabezados.map((h) => `<th scope="col">${escaparHTML(h)}</th>`).join("")}</tr>`;
  tabla.appendChild(thead);
  const tbody = document.createElement("tbody");
  filas.forEach((fila) => {
    const tr = document.createElement("tr");
    tr.innerHTML = fila.map((celda, i) => `<td data-etiqueta="${escaparHTML(encabezados[i] || "")}">${escaparHTML(celda)}</td>`).join("");
    tbody.appendChild(tr);
  });
  tabla.appendChild(tbody);
  contTabla.appendChild(tabla);
  details.appendChild(contTabla);
  return details;
}

function cerrarBloqueGrafica(contenedor, meta, titulo, encabezados, filas) {
  if (meta) contenedor.insertAdjacentHTML("beforeend", renderFichaGrafica(meta));
  contenedor.appendChild(crearDetalleTabla(titulo, encabezados, filas));
}

const Charts = {
  /**
   * Gráfica de línea para evolución histórica (una o varias series).
   * opciones: { series: [{ etiqueta, color, puntos:[{x,y,unidad,fuente,estado}] }],
   *             ariaLabel, tituloTabla, meta, altura }
   */
  lineChart(contenedor, opciones) {
    contenedor.innerHTML = "";
    const { series, ariaLabel, tituloTabla, meta, altura, mensajeVacio } = opciones;
    const puntosTotales = series.flatMap((s) => s.puntos);
    if (!puntosTotales.length) {
      contenedor.innerHTML = estadoVacio(mensajeVacio || "No hay datos disponibles para esta gráfica.");
      return;
    }
    const ys = puntosTotales.map((p) => p.y).filter((v) => v !== null && v !== undefined);
    if (!ys.length) {
      contenedor.innerHTML = estadoVacio(mensajeVacio || "No hay datos disponibles para esta gráfica.");
      return;
    }
    const W = 680, H = altura || 220, M = { top: 16, right: 20, bottom: 34, left: 60 };
    const xs = puntosTotales.map((p) => p.x);
    const xDom = [Math.min(...xs), Math.max(...xs)];
    const yMin = Math.min(0, ...ys);
    const yMax = Math.max(...ys) * 1.12 || 1;
    const xEsc = escalaLineal(xDom, [M.left, W - M.right]);
    const yEsc = escalaLineal([yMin, yMax], [H - M.bottom, M.top]);

    const svg = crearSVG(W, H);
    svg.setAttribute("aria-label", ariaLabel);

    const nTicksY = 4;
    for (let i = 0; i <= nTicksY; i++) {
      const v = yMin + ((yMax - yMin) * i) / nTicksY;
      const y = yEsc(v);
      svg.appendChild(elSVG("line", { x1: M.left, x2: W - M.right, y1: y, y2: y, class: "linea-cuadricula" }));
      const txt = elSVG("text", { x: M.left - 8, y: y + 4, "text-anchor": "end", class: "marca-eje" });
      txt.textContent = formatearNumero(v, Math.abs(yMax) < 10 ? 1 : 0);
      svg.appendChild(txt);
    }
    const aniosUnicos = [...new Set(xs)].sort((a, b) => a - b);
    aniosUnicos.forEach((anio) => {
      const x = xEsc(anio);
      const txt = elSVG("text", { x, y: H - M.bottom + 18, "text-anchor": "middle", class: "marca-eje" });
      txt.textContent = anio;
      svg.appendChild(txt);
    });

    series.forEach((serie) => {
      const puntosValidos = serie.puntos.filter((p) => p.y !== null && p.y !== undefined);
      if (puntosValidos.length > 1) {
        const d = puntosValidos.map((p, i) => `${i === 0 ? "M" : "L"}${xEsc(p.x)},${yEsc(p.y)}`).join(" ");
        svg.appendChild(elSVG("path", { d, fill: "none", stroke: serie.color, "stroke-width": 2.5 }));
      }
      puntosValidos.forEach((p) => {
        const c = elSVG("circle", {
          cx: xEsc(p.x), cy: yEsc(p.y), r: 4.5,
          fill: serie.color, stroke: "#fff", "stroke-width": 1.5,
          tabindex: "0", class: "punto-dato",
          "aria-label": `${serie.etiqueta}, ${p.x}: ${formatearNumero(p.y, 1)} ${p.unidad || ""}. Fuente: ${p.fuente || "no especificada"}. Estado: ${(ETIQUETAS_ESTADO[p.estado] || "pendiente")}.`
        });
        svg.appendChild(c);
      });
    });

    contenedor.appendChild(svg);
    insertarMarcaAgua(contenedor, meta ? meta.esDemostracion : true);

    if (series.length > 1) {
      const leyenda = document.createElement("div");
      leyenda.className = "grafica-leyenda";
      leyenda.innerHTML = series.map((s) => `<span class="item"><span class="muestra" style="background:${s.color}"></span>${escaparHTML(s.etiqueta)}</span>`).join("");
      contenedor.appendChild(leyenda);
    }

    const tooltip = asegurarTooltip(contenedor);
    contenedor.querySelectorAll(".punto-dato").forEach((marca, idx) => {
      const todos = series.flatMap((s) => s.puntos.filter((p) => p.y !== null && p.y !== undefined).map((p) => ({ ...p, etiqueta: s.etiqueta })));
      const p = todos[idx];
      if (!p) return;
      const html = `<strong>${escaparHTML(p.etiqueta)} · ${p.x}</strong><br>${formatearNumero(p.y, 1)} ${escaparHTML(p.unidad || "")}<br>Fuente: ${escaparHTML(p.fuente || "no especificada")}`;
      ligarTooltip(marca, tooltip, contenedor, html);
    });

    const filas = puntosTotales.map((p) => [p.x, formatearNumero(p.y, 2), p.unidad || "", p.fuente || "", ETIQUETAS_ESTADO[p.estado] || ""]);
    cerrarBloqueGrafica(contenedor, meta, tituloTabla || ariaLabel, ["Año", "Valor", "Unidad", "Fuente", "Estado"], filas);
  },

  /**
   * Gráfica de barras verticales para comparar categorías.
   * opciones: { datos: [{ etiqueta, valor, color, unidad, fuente, anio, estado }],
   *             ariaLabel, tituloTabla, meta, altura }
   */
  barChart(contenedor, opciones) {
    contenedor.innerHTML = "";
    const { datos, ariaLabel, tituloTabla, meta, altura } = opciones;
    if (!datos || !datos.length) {
      contenedor.innerHTML = estadoVacio("No hay datos disponibles para esta gráfica.");
      return;
    }
    const W = 680, H = altura || 250, M = { top: 16, right: 20, bottom: 74, left: 60 };
    const valores = datos.map((d) => d.valor || 0);
    const yMin = Math.min(0, ...valores);
    const yMax = Math.max(0, ...valores) * 1.15 || 1;
    const yEsc = escalaLineal([yMin, yMax], [H - M.bottom, M.top]);
    const anchoBanda = (W - M.left - M.right) / datos.length;
    const anchoBarra = Math.min(56, anchoBanda * 0.6);

    const svg = crearSVG(W, H);
    svg.setAttribute("aria-label", ariaLabel);

    for (let i = 0; i <= 4; i++) {
      const v = yMin + ((yMax - yMin) * i) / 4;
      const y = yEsc(v);
      svg.appendChild(elSVG("line", { x1: M.left, x2: W - M.right, y1: y, y2: y, class: "linea-cuadricula" }));
      const txt = elSVG("text", { x: M.left - 8, y: y + 4, "text-anchor": "end", class: "marca-eje" });
      txt.textContent = formatearNumero(v, 0);
      svg.appendChild(txt);
    }

    datos.forEach((d, i) => {
      const cx = M.left + anchoBanda * i + anchoBanda / 2;
      const v = d.valor || 0;
      const yTop = yEsc(Math.max(0, v));
      const yBottom = yEsc(Math.min(0, v));
      const rect = elSVG("rect", {
        x: cx - anchoBarra / 2, y: yTop, width: anchoBarra, height: Math.max(0, yBottom - yTop),
        fill: d.color || "var(--color-primary)", tabindex: "0", class: "barra-dato",
        "aria-label": `${d.etiqueta}: ${formatearNumero(d.valor, 1)} ${d.unidad || ""}. Fuente: ${d.fuente || "no especificada"}.`
      });
      svg.appendChild(rect);
      const etiqueta = elSVG("text", {
        x: cx, y: H - M.bottom + 16, "text-anchor": "end", class: "marca-eje",
        transform: `rotate(-35 ${cx} ${H - M.bottom + 16})`
      });
      etiqueta.textContent = d.etiqueta;
      svg.appendChild(etiqueta);
    });

    contenedor.appendChild(svg);
    insertarMarcaAgua(contenedor, meta ? meta.esDemostracion : true);

    const tooltip = asegurarTooltip(contenedor);
    contenedor.querySelectorAll(".barra-dato").forEach((marca, idx) => {
      const d = datos[idx];
      const html = `<strong>${escaparHTML(d.etiqueta)}</strong>${d.anio ? " · " + d.anio : ""}<br>${formatearNumero(d.valor, 1)} ${escaparHTML(d.unidad || "")}<br>Fuente: ${escaparHTML(d.fuente || "no especificada")}`;
      ligarTooltip(marca, tooltip, contenedor, html);
    });

    const filas = datos.map((d) => [d.etiqueta, formatearNumero(d.valor, 2), d.unidad || "", d.fuente || "", ETIQUETAS_ESTADO[d.estado] || ""]);
    cerrarBloqueGrafica(contenedor, meta, tituloTabla || ariaLabel, ["Categoría", "Valor", "Unidad", "Fuente", "Estado"], filas);
  },

  /**
   * Gráfica de barras apiladas para composición presupuestaria.
   * opciones: { categorias, series: [{ etiqueta, color, valores }], ariaLabel,
   *             tituloTabla, unidad, meta, altura }
   */
  stackedBarChart(contenedor, opciones) {
    contenedor.innerHTML = "";
    const { categorias, series, ariaLabel, tituloTabla, unidad, meta, altura } = opciones;
    if (!categorias || !categorias.length || !series || !series.length) {
      contenedor.innerHTML = estadoVacio("No hay datos disponibles para esta gráfica.");
      return;
    }
    const W = 680, H = altura || 250, M = { top: 16, right: 20, bottom: 42, left: 64 };
    const totales = categorias.map((_, i) => series.reduce((acc, s) => acc + (s.valores[i] || 0), 0));
    const yMax = Math.max(...totales) * 1.1 || 1;
    const yEsc = escalaLineal([0, yMax], [H - M.bottom, M.top]);
    const anchoBanda = (W - M.left - M.right) / categorias.length;
    const anchoBarra = Math.min(70, anchoBanda * 0.55);

    const svg = crearSVG(W, H);
    svg.setAttribute("aria-label", ariaLabel);

    for (let i = 0; i <= 4; i++) {
      const v = (yMax * i) / 4;
      const y = yEsc(v);
      svg.appendChild(elSVG("line", { x1: M.left, x2: W - M.right, y1: y, y2: y, class: "linea-cuadricula" }));
      const txt = elSVG("text", { x: M.left - 8, y: y + 4, "text-anchor": "end", class: "marca-eje" });
      txt.textContent = formatearNumero(v, 0);
      svg.appendChild(txt);
    }

    const marcasInfo = [];
    categorias.forEach((cat, i) => {
      const cx = M.left + anchoBanda * i + anchoBanda / 2;
      let acumulado = 0;
      series.forEach((s) => {
        const v = s.valores[i] || 0;
        const yTop = yEsc(acumulado + v);
        const yBottom = yEsc(acumulado);
        const rect = elSVG("rect", {
          x: cx - anchoBarra / 2, y: yTop, width: anchoBarra, height: Math.max(0, yBottom - yTop),
          fill: s.color, tabindex: "0", class: "barra-dato",
          "aria-label": `${s.etiqueta}, ${cat}: ${formatearNumero(v, 1)} ${unidad || ""}.`
        });
        svg.appendChild(rect);
        marcasInfo.push({ etiqueta: s.etiqueta, cat, valor: v });
        acumulado += v;
      });
      const etiqueta = elSVG("text", { x: cx, y: H - M.bottom + 20, "text-anchor": "middle", class: "marca-eje" });
      etiqueta.textContent = cat;
      svg.appendChild(etiqueta);
    });

    contenedor.appendChild(svg);
    insertarMarcaAgua(contenedor, meta ? meta.esDemostracion : true);

    const leyenda = document.createElement("div");
    leyenda.className = "grafica-leyenda";
    leyenda.innerHTML = series.map((s) => `<span class="item"><span class="muestra" style="background:${s.color}"></span>${escaparHTML(s.etiqueta)}</span>`).join("");
    contenedor.appendChild(leyenda);

    const tooltip = asegurarTooltip(contenedor);
    contenedor.querySelectorAll(".barra-dato").forEach((marca, idx) => {
      const info = marcasInfo[idx];
      const html = `<strong>${escaparHTML(info.etiqueta)}</strong> · ${escaparHTML(String(info.cat))}<br>${formatearNumero(info.valor, 1)} ${escaparHTML(unidad || "")}`;
      ligarTooltip(marca, tooltip, contenedor, html);
    });

    const filas = [];
    categorias.forEach((cat, i) => series.forEach((s) => filas.push([cat, s.etiqueta, formatearNumero(s.valores[i] || 0, 2), unidad || ""])));
    cerrarBloqueGrafica(contenedor, meta, tituloTabla || ariaLabel, ["Periodo", "Categoría", "Valor", "Unidad"], filas);
  }
};
