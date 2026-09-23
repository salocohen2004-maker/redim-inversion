function VistaPresupuesto(main, datos) {
  const serie = datos.presupuesto.serie_anual;
  const anios = serie.map((s) => s.anio);
  const estadoFiltro = { desde: Math.min(...anios), hasta: Math.max(...anios) };

  main.innerHTML = `
    <section aria-labelledby="titulo-presupuesto">
      <div class="seccion-header">
        <h1 id="titulo-presupuesto">Panorama de la inversión</h1>
        <p class="intro">Evolución del presupuesto destinado a niñas, niños y adolescentes: monto nominal, peso relativo respecto al PIB y al Presupuesto de Egresos de la Federación, y variación real anual.</p>
      </div>

      <p class="texto-pequeno texto-muted" role="note">Aviso: para el % del PIB y el % del PEF, una segunda fuente independiente (SITAN 2026 de UNICEF/SIPINNA) reporta cifras distintas a las que se muestran aquí (tomadas de REDIM) para los mismos años. Ver <a href="#metodologia">Metodología</a> para el detalle de esta discrepancia entre fuentes.</p>

      <form class="panel-filtros" id="filtro-periodo" aria-label="Filtro por periodo">
        <div class="campo-filtro">
          <label for="anio-desde">Desde (año)</label>
          <select id="anio-desde">${anios.map((a) => `<option value="${a}">${a}</option>`).join("")}</select>
        </div>
        <div class="campo-filtro">
          <label for="anio-hasta">Hasta (año)</label>
          <select id="anio-hasta">${anios.map((a) => `<option value="${a}">${a}</option>`).join("")}</select>
        </div>
      </form>

      <div class="grafica-bloque">
        <div class="grafica-titulo">Evolución del presupuesto nominal</div>
        <p class="grafica-descripcion">Monto nominal (a precios corrientes) destinado a NNA. El monto real (ajustado por inflación, en pesos constantes) está pendiente de validación: las fuentes consultadas publican la variación real anual en porcentaje (ver "Variación anual real" más abajo), pero no un monto real absoluto en pesos constantes.</p>
        <div class="grafica-svg-contenedor" id="grafica-nominal-real"></div>
      </div>

      <div class="grid-2">
        <div class="grafica-bloque">
          <div class="grafica-titulo">Porcentaje del PIB</div>
          <p class="grafica-descripcion">Inversión en NNA como proporción del Producto Interno Bruto.</p>
          <div class="grafica-svg-contenedor" id="grafica-pib"></div>
        </div>
        <div class="grafica-bloque">
          <div class="grafica-titulo">Porcentaje del Presupuesto de Egresos</div>
          <p class="grafica-descripcion">Inversión en NNA como proporción del Presupuesto de Egresos de la Federación.</p>
          <div class="grafica-svg-contenedor" id="grafica-pef"></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="grafica-bloque">
          <div class="grafica-titulo">Inversión por niña, niño o adolescente</div>
          <p class="grafica-descripcion">Monto nominal por NNA, tal como lo publica UNICEF México (no un cálculo propio de este micrositio). Disponible solo para 2018-2023; no se encontró esta cifra para años posteriores.</p>
          <div class="grafica-svg-contenedor" id="grafica-percapita"></div>
        </div>
        <div class="grafica-bloque">
          <div class="grafica-titulo">Variación anual real</div>
          <p class="grafica-descripcion">Cambio porcentual del presupuesto real respecto al año anterior.</p>
          <div class="grafica-svg-contenedor" id="grafica-variacion"></div>
        </div>
      </div>

      <div class="espacio-arriba">
        <button type="button" class="boton boton-secundario" id="descargar-presupuesto">Descargar CSV (periodo filtrado)</button>
      </div>
    </section>
  `;

  const selDesde = main.querySelector("#anio-desde");
  const selHasta = main.querySelector("#anio-hasta");
  selDesde.value = estadoFiltro.desde;
  selHasta.value = estadoFiltro.hasta;

  function serieFiltrada() {
    const desde = Number(selDesde.value), hasta = Number(selHasta.value);
    const [min, max] = desde <= hasta ? [desde, hasta] : [hasta, desde];
    return serie.filter((s) => s.anio >= min && s.anio <= max);
  }

  const PRIORIDAD_ESTADO = { pendiente: 1, en_revision: 2, demostracion: 3, validado: 4 };

  function construirMeta(s, unidad, opciones = {}) {
    const { campo, notaMetodologica } = opciones;
    const relevantes = campo ? s.filter((r) => campo(r) !== null && campo(r) !== undefined) : s;
    if (!relevantes.length) return null;
    const aniosS = s.map((r) => r.anio);
    const fuentesUnicas = [...new Set(relevantes.map((r) => r.fuente).filter(Boolean))];
    const estadosPresentes = [...new Set(relevantes.map((r) => r.estado_validacion))];
    estadosPresentes.sort((a, b) => (PRIORIDAD_ESTADO[a] || 99) - (PRIORIDAD_ESTADO[b] || 99));
    const notas = notaMetodologica || relevantes[relevantes.length - 1].notas_metodologicas;
    return {
      unidad,
      periodo: aniosS.length > 1 ? `${Math.min(...aniosS)}–${Math.max(...aniosS)}` : String(aniosS[0]),
      fuente: fuentesUnicas.join("; "),
      estado: estadosPresentes[0],
      fechaConsulta: relevantes[relevantes.length - 1].fecha_consulta,
      notaMetodologica: notas,
      esDemostracion: relevantes.some((r) => r.es_demostracion)
    };
  }

  function dibujar() {
    const s = serieFiltrada();

    const seriesNominalReal = [
      { etiqueta: "Nominal", color: "#8A4B22", puntos: s.map((r) => ({ x: r.anio, y: r.presupuesto_nominal.valor, unidad: r.presupuesto_nominal.unidad, fuente: r.fuente, estado: r.estado_validacion })) },
      { etiqueta: "Real (precios constantes)", color: "#1F4B43", puntos: s.map((r) => ({ x: r.anio, y: r.presupuesto_real.valor, unidad: r.presupuesto_real.unidad, fuente: r.fuente, estado: r.estado_validacion })) }
    ].filter((serie) => serie.puntos.some((p) => p.y !== null && p.y !== undefined));

    Charts.lineChart(main.querySelector("#grafica-nominal-real"), {
      ariaLabel: "Evolución del presupuesto nominal",
      tituloTabla: "Presupuesto nominal por año",
      meta: construirMeta(s, "millones de pesos (MXN)", { campo: (r) => r.presupuesto_nominal.valor ?? r.presupuesto_real.valor }),
      series: seriesNominalReal
    });

    Charts.lineChart(main.querySelector("#grafica-pib"), {
      ariaLabel: "Porcentaje del PIB destinado a NNA",
      tituloTabla: "Porcentaje del PIB por año",
      meta: construirMeta(s, "% del PIB", { campo: (r) => r.pct_pib.valor }),
      series: [{ etiqueta: "% del PIB", color: "#265D8E", puntos: s.map((r) => ({ x: r.anio, y: r.pct_pib.valor, unidad: r.pct_pib.unidad, fuente: r.fuente, estado: r.estado_validacion })) }]
    });

    Charts.lineChart(main.querySelector("#grafica-pef"), {
      ariaLabel: "Porcentaje del Presupuesto de Egresos destinado a NNA",
      tituloTabla: "Porcentaje del Presupuesto de Egresos por año",
      meta: construirMeta(s, "% del Presupuesto de Egresos de la Federación", { campo: (r) => r.pct_pef.valor }),
      series: [{ etiqueta: "% del PEF", color: "#7A4B8A", puntos: s.map((r) => ({ x: r.anio, y: r.pct_pef.valor, unidad: r.pct_pef.unidad, fuente: r.fuente, estado: r.estado_validacion })) }]
    });

    Charts.lineChart(main.querySelector("#grafica-percapita"), {
      ariaLabel: "Inversión nominal por NNA",
      tituloTabla: "Inversión nominal por NNA por año",
      mensajeVacio: "Dato pendiente de validación: no se encontró una cifra oficial de inversión per cápita por NNA. Calcularla requeriría cruzar el presupuesto con una proyección de población (CONAPO/INEGI), y se prefirió no estimarla sin una fuente que lo publique así.",
      meta: construirMeta(s, "pesos (MXN) por NNA al año", { campo: (r) => r.inversion_per_capita.valor }),
      series: [{ etiqueta: "Inversión por NNA", color: "#3A7A5E", puntos: s.map((r) => ({ x: r.anio, y: r.inversion_per_capita.valor, unidad: r.inversion_per_capita.unidad, fuente: r.fuente, estado: r.estado_validacion })) }]
    });

    Charts.barChart(main.querySelector("#grafica-variacion"), {
      ariaLabel: "Variación anual real del presupuesto",
      tituloTabla: "Variación anual real por año",
      meta: construirMeta(s, "% variación real anual", { campo: (r) => r.variacion_anual_real_pct.valor }),
      datos: s.filter((r) => r.variacion_anual_real_pct.valor !== null).map((r) => ({
        etiqueta: String(r.anio), valor: r.variacion_anual_real_pct.valor, unidad: "%",
        color: r.variacion_anual_real_pct.valor >= 0 ? "#216B4A" : "#8C2E2E",
        fuente: r.fuente, estado: r.estado_validacion
      }))
    });
  }

  dibujar();
  selDesde.addEventListener("change", dibujar);
  selHasta.addEventListener("change", dibujar);

  main.querySelector("#descargar-presupuesto").addEventListener("click", () => {
    const s = serieFiltrada();
    descargarCSV("panorama_inversion.csv", s, [
      { etiqueta: "Año", valor: "anio" },
      { etiqueta: "Presupuesto nominal (MDP)", valor: (r) => r.presupuesto_nominal.valor },
      { etiqueta: "Presupuesto real (MDP)", valor: (r) => r.presupuesto_real.valor },
      { etiqueta: "% del PIB", valor: (r) => r.pct_pib.valor },
      { etiqueta: "% del PEF", valor: (r) => r.pct_pef.valor },
      { etiqueta: "Inversión por NNA (MXN)", valor: (r) => r.inversion_per_capita.valor },
      { etiqueta: "Variación anual real (%)", valor: (r) => r.variacion_anual_real_pct.valor },
      { etiqueta: "Fuente", valor: "fuente" },
      { etiqueta: "Estado de validación", valor: "estado_validacion" }
    ]);
  });
}
