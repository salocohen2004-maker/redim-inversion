/* Componentes reutilizables de interfaz: tarjetas de indicadores, cadena de
   inversión→resultados y tabla interactiva (filtros + búsqueda + orden +
   columnas ocultables + vista de tarjetas en móvil + descarga CSV). */

function renderTarjetasIndicadores(items) {
  if (!items || !items.length) return estadoVacio("No hay indicadores destacados disponibles.");
  return `<div class="tarjetas-grid" role="list">${items.map((it) => {
    const variacionHTML = (it.variacion_pct === null || it.variacion_pct === undefined)
      ? ""
      : `<span class="variacion ${it.variacion_pct >= 0 ? "positiva" : "negativa"}">${formatearPorcentaje(it.variacion_pct)} vs. año anterior</span>`;
    const esMoneda = it.unidad && it.unidad.includes("pesos");
    const valorHTML = esMoneda
      ? formatearMonto(it.valor, null, { soloNumero: true })
      : formatearNumero(it.valor, it.valor < 100 && !Number.isInteger(it.valor) ? 1 : 0);
    const fuenteHTML = it.fuente
      ? `<div class="texto-pequeno texto-muted" style="margin-top:0.4em">Fuente: ${it.url ? `<a href="${escaparHTML(it.url)}" target="_blank" rel="noopener">${escaparHTML(it.fuente)}</a>` : escaparHTML(it.fuente)}${it.fecha_consulta ? ` · consultado ${escaparHTML(it.fecha_consulta)}` : ""}</div>`
      : "";
    return `<div class="indicador-tarjeta" role="listitem">
      <div class="etiqueta">${escaparHTML(it.etiqueta)}</div>
      <div class="valor">${valorHTML}</div>
      <div class="unidad">${escaparHTML(it.unidad || "")} · ${escaparHTML(it.anio || "")}</div>
      ${variacionHTML ? `<div>${variacionHTML}</div>` : ""}
      <div style="margin-top:0.5em">${badgeEstado(it.estado_validacion)}</div>
      ${fuenteHTML}
    </div>`;
  }).join("")}</div>`;
}

function renderCadenaFlujo() {
  const pasos = ["Inversión pública", "Programas presupuestarios", "Servicios entregados", "Derechos de la niñez", "Resultados sociales"];
  return `<div class="cadena-flujo" role="list" aria-label="Cadena conceptual de la inversión pública en niñez">
    ${pasos.map((p, i) => `${i > 0 ? '<div class="flecha" aria-hidden="true">→</div>' : ""}<div class="paso" role="listitem">${escaparHTML(p)}</div>`).join("")}
  </div>`;
}

/**
 * Crea una tabla interactiva con filtros, búsqueda, orden por columna,
 * columnas secundarias ocultables, vista de tarjetas en móvil y descarga
 * en CSV de los datos actualmente filtrados.
 * config: {
 *   columnas: [{ clave, etiqueta, ordenable, formato(valor, fila), csv(fila), numerico, secundaria }],
 *   datos, filtros: [{ clave, etiqueta, obtenerOpciones(datos), predicado(fila, val) }],
 *   busqueda: { camposClave: [...], placeholder },
 *   csvNombreArchivo, tituloTabla
 * }
 */
function crearTablaInteractiva(contenedor, config) {
  const idBase = `tabla-${Math.random().toString(36).slice(2, 8)}`;
  const estado = {
    filtros: {},
    busqueda: "",
    ordenClave: null,
    ordenAsc: true,
    columnasOcultas: new Set(),
    panelColumnasAbierto: false
  };

  function columnasVisibles() {
    return config.columnas.filter((c) => !(c.secundaria && estado.columnasOcultas.has(c.clave)));
  }

  function datosFiltrados() {
    let filas = config.datos.slice();
    if (estado.busqueda) {
      const q = estado.busqueda.toLowerCase();
      filas = filas.filter((f) => (config.busqueda?.camposClave || []).some((c) => String(f[c] ?? "").toLowerCase().includes(q)));
    }
    Object.entries(estado.filtros).forEach(([clave, val]) => {
      if (!val) return;
      const filtro = config.filtros.find((f) => f.clave === clave);
      if (filtro) filas = filas.filter((f) => filtro.predicado(f, val));
    });
    if (estado.ordenClave) {
      const col = config.columnas.find((c) => c.clave === estado.ordenClave);
      filas.sort((a, b) => {
        let va = a[estado.ordenClave], vb = b[estado.ordenClave];
        if (col?.numerico) { va = Number(va) || 0; vb = Number(vb) || 0; }
        else { va = String(va ?? ""); vb = String(vb ?? ""); }
        if (va < vb) return estado.ordenAsc ? -1 : 1;
        if (va > vb) return estado.ordenAsc ? 1 : -1;
        return 0;
      });
    }
    return filas;
  }

  function render() {
    const filas = datosFiltrados();
    const columnas = columnasVisibles();
    contenedor.innerHTML = "";

    const panel = document.createElement("div");
    panel.className = "panel-filtros";
    panel.setAttribute("role", "search");

    if (config.busqueda) {
      const campo = document.createElement("div");
      campo.className = "campo-filtro";
      const idBusqueda = `busqueda-${idBase}`;
      campo.innerHTML = `<label for="${idBusqueda}">Buscar</label><input type="search" id="${idBusqueda}" placeholder="${escaparHTML(config.busqueda.placeholder || "Buscar…")}">`;
      const input = campo.querySelector("input");
      input.addEventListener("input", debounce(() => { estado.busqueda = input.value; render(); }, 200));
      input.value = estado.busqueda;
      panel.appendChild(campo);
    }

    (config.filtros || []).forEach((filtro) => {
      const campo = document.createElement("div");
      campo.className = "campo-filtro";
      const idSel = `filtro-${filtro.clave}-${idBase}`;
      const opciones = filtro.obtenerOpciones(config.datos);
      campo.innerHTML = `<label for="${idSel}">${escaparHTML(filtro.etiqueta)}</label>
        <select id="${idSel}">
          <option value="">Todos</option>
          ${opciones.map((o) => `<option value="${escaparHTML(o.value)}">${escaparHTML(o.label)}</option>`).join("")}
        </select>`;
      const select = campo.querySelector("select");
      select.value = estado.filtros[filtro.clave] || "";
      select.addEventListener("change", () => { estado.filtros[filtro.clave] = select.value; render(); });
      panel.appendChild(campo);
    });

    const columnasSecundarias = config.columnas.filter((c) => c.secundaria);
    if (columnasSecundarias.length) {
      const panelCol = document.createElement("div");
      panelCol.className = "panel-columnas";
      if (estado.panelColumnasAbierto) panelCol.setAttribute("data-abierto", "true");
      const btnCol = document.createElement("button");
      btnCol.type = "button";
      btnCol.className = "boton boton-secundario";
      btnCol.setAttribute("aria-expanded", String(estado.panelColumnasAbierto));
      btnCol.setAttribute("aria-haspopup", "true");
      btnCol.textContent = "Columnas";
      btnCol.addEventListener("click", () => {
        estado.panelColumnasAbierto = !estado.panelColumnasAbierto;
        render();
      });
      panelCol.appendChild(btnCol);

      const lista = document.createElement("div");
      lista.className = "lista-columnas";
      lista.setAttribute("role", "group");
      lista.setAttribute("aria-label", "Mostrar u ocultar columnas secundarias");
      columnasSecundarias.forEach((col) => {
        const idChk = `col-${col.clave}-${idBase}`;
        const label = document.createElement("label");
        const chk = document.createElement("input");
        chk.type = "checkbox";
        chk.id = idChk;
        chk.checked = !estado.columnasOcultas.has(col.clave);
        chk.addEventListener("change", () => {
          if (chk.checked) estado.columnasOcultas.delete(col.clave);
          else estado.columnasOcultas.add(col.clave);
          estado.panelColumnasAbierto = true;
          render();
        });
        label.appendChild(chk);
        label.append(col.etiqueta);
        lista.appendChild(label);
      });
      panelCol.appendChild(lista);
      panel.appendChild(panelCol);
    }

    const botonDescarga = document.createElement("button");
    botonDescarga.type = "button";
    botonDescarga.className = "boton boton-secundario";
    botonDescarga.textContent = "Descargar CSV (datos filtrados)";
    botonDescarga.addEventListener("click", () => {
      descargarCSV(
        config.csvNombreArchivo || "datos.csv",
        filas,
        config.columnas.map((c) => ({ etiqueta: c.etiqueta, valor: c.csv || c.clave }))
      );
    });
    panel.appendChild(botonDescarga);

    contenedor.appendChild(panel);

    const contTabla = document.createElement("div");
    contTabla.className = "tabla-contenedor tabla-responsiva-tarjetas";
    contTabla.setAttribute("tabindex", "0");
    contTabla.setAttribute("role", "region");
    contTabla.setAttribute("aria-label", `${config.tituloTabla || "Tabla de datos"}, desplazable`);

    if (!filas.length) {
      contTabla.innerHTML = estadoVacio("No hay resultados para los filtros seleccionados.");
      contenedor.appendChild(contTabla);
      return;
    }

    const tabla = document.createElement("table");
    tabla.className = "tabla-datos como-tarjetas";
    tabla.innerHTML = `<caption class="sr-only">${escaparHTML(config.tituloTabla || "Tabla de datos")}</caption>`;

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    columnas.forEach((col) => {
      const th = document.createElement("th");
      th.setAttribute("scope", "col");
      if (col.numerico) th.classList.add("num");
      if (col.ordenable) {
        const activa = estado.ordenClave === col.clave;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.setAttribute("aria-label", `Ordenar por ${col.etiqueta}${activa ? (estado.ordenAsc ? ", ascendente, clic para descendente" : ", descendente, clic para ascendente") : ""}`);
        btn.innerHTML = `${escaparHTML(col.etiqueta)} <span aria-hidden="true">${activa ? (estado.ordenAsc ? "▲" : "▼") : "↕"}</span>`;
        btn.addEventListener("click", () => {
          if (estado.ordenClave === col.clave) estado.ordenAsc = !estado.ordenAsc;
          else { estado.ordenClave = col.clave; estado.ordenAsc = true; }
          render();
        });
        th.appendChild(btn);
      } else {
        th.textContent = col.etiqueta;
      }
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    filas.forEach((fila) => {
      const tr = document.createElement("tr");
      columnas.forEach((col) => {
        const td = document.createElement("td");
        if (col.numerico) td.classList.add("num");
        td.setAttribute("data-etiqueta", col.etiqueta);
        td.innerHTML = col.formato ? col.formato(fila[col.clave], fila) : escaparHTML(fila[col.clave] ?? "");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
    tabla.appendChild(tbody);
    contTabla.appendChild(tabla);
    contenedor.appendChild(contTabla);

    const resumen = document.createElement("p");
    resumen.className = "texto-pequeno texto-muted";
    resumen.style.marginTop = "0.6em";
    resumen.textContent = `Mostrando ${filas.length} de ${config.datos.length} registros.`;
    contenedor.appendChild(resumen);
  }

  render();
}
