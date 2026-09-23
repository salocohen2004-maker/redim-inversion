function VistaProgramas(main, datos) {
  const categorias = datos.config.categorias_derechos;
  const nombreDerecho = (id) => categorias.find((c) => c.id === id)?.nombre || id;
  const programas = datos.programas.programas.map((p) => ({
    ...p,
    presupuesto_nominal_valor: p.presupuesto_nominal.valor,
    presupuesto_real_valor: p.presupuesto_real.valor,
    variacion_valor: p.variacion_pct.valor
  }));

  main.innerHTML = `
    <section aria-labelledby="titulo-programas">
      <div class="seccion-header">
        <h1 id="titulo-programas">Programas presupuestarios</h1>
        <p class="intro">Listado filtrable de programas presupuestarios relacionados con niñas, niños y adolescentes, con su presupuesto nominal y real, variación y derecho relacionado.</p>
      </div>
      <div id="tabla-programas"></div>
    </section>
  `;

  crearTablaInteractiva(main.querySelector("#tabla-programas"), {
    datos: programas,
    tituloTabla: "Programas presupuestarios",
    csvNombreArchivo: "programas_presupuestarios.csv",
    busqueda: { camposClave: ["nombre", "ramo_institucion"], placeholder: "Buscar por nombre o ramo…" },
    filtros: [
      {
        clave: "anio", etiqueta: "Año",
        obtenerOpciones: (d) => [...new Set(d.map((p) => p.anio))].sort((a, b) => b - a).map((a) => ({ value: a, label: a })),
        predicado: (f, v) => String(f.anio) === v
      },
      {
        clave: "derecho_id", etiqueta: "Derecho relacionado",
        obtenerOpciones: () => categorias.map((c) => ({ value: c.id, label: c.nombre })),
        predicado: (f, v) => f.derecho_id === v
      },
      {
        clave: "estado_validacion", etiqueta: "Estado",
        obtenerOpciones: (d) => [...new Set(d.map((p) => p.estado_validacion))].map((e) => ({ value: e, label: ETIQUETAS_ESTADO[e] || e })),
        predicado: (f, v) => f.estado_validacion === v
      }
    ],
    columnas: [
      { clave: "nombre", etiqueta: "Programa", ordenable: true, formato: (v, f) => `${escaparHTML(v)}${f.advertencias_metodologicas ? `<br><span class="texto-pequeno texto-muted">⚠ ${escaparHTML(f.advertencias_metodologicas)}</span>` : ""}` },
      { clave: "ramo_institucion", etiqueta: "Ramo / institución", ordenable: true, formato: (v) => escaparHTML(v) },
      { clave: "anio", etiqueta: "Año", ordenable: true, numerico: true, formato: (v) => escaparHTML(v) },
      { clave: "presupuesto_nominal_valor", etiqueta: "Presupuesto nominal (millones de pesos, MXN)", ordenable: true, numerico: true, csv: (f) => f.presupuesto_nominal.valor, formato: (v) => formatearMonto(v, null, { soloNumero: true }) },
      { clave: "presupuesto_real_valor", etiqueta: "Presupuesto real (millones de pesos, MXN)", ordenable: true, numerico: true, secundaria: true, csv: (f) => f.presupuesto_real.valor, formato: (v) => formatearMonto(v, null, { soloNumero: true }) },
      { clave: "variacion_valor", etiqueta: "Variación", ordenable: true, numerico: true, formato: (v, f) => v === null ? "Dato pendiente de validación" : `<span class="${v >= 0 ? "variacion positiva" : "variacion negativa"}" title="${escaparHTML(f.variacion_pct.unidad)}">${formatearPorcentaje(v)}</span>` },
      { clave: "derecho_id", etiqueta: "Derecho relacionado", ordenable: true, formato: (v) => escaparHTML(nombreDerecho(v)) },
      { clave: "fuente", etiqueta: "Fuente", ordenable: false, secundaria: true, formato: (v) => escaparHTML(v) },
      { clave: "estado_validacion", etiqueta: "Estado", ordenable: true, formato: (v) => badgeEstado(v) }
    ]
  });
}
