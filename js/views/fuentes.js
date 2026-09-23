function VistaFuentes(main, datos) {
  const fuentes = datos.fuentes.fuentes.map((f) => ({ ...f, datos_respaldados_texto: (f.datos_respaldados || []).join("; ") }));

  main.innerHTML = `
    <section aria-labelledby="titulo-fuentes">
      <div class="seccion-header">
        <h1 id="titulo-fuentes">Biblioteca de fuentes</h1>
        <p class="intro">Todas las fuentes utilizadas en este micrositio, con su tipo de documento, institución, año, enlace, fecha de consulta y los datos o afirmaciones que respaldan.</p>
      </div>
      <div id="tabla-fuentes"></div>
    </section>
  `;

  crearTablaInteractiva(main.querySelector("#tabla-fuentes"), {
    datos: fuentes,
    tituloTabla: "Biblioteca de fuentes",
    csvNombreArchivo: "biblioteca_fuentes.csv",
    busqueda: { camposClave: ["titulo", "descripcion", "datos_respaldados_texto"], placeholder: "Buscar por título, descripción o dato…" },
    filtros: [
      {
        clave: "tipo_documento", etiqueta: "Tipo de documento",
        obtenerOpciones: (d) => [...new Set(d.map((f) => f.tipo_documento))].map((t) => ({ value: t, label: t })),
        predicado: (f, v) => f.tipo_documento === v
      },
      {
        clave: "institucion", etiqueta: "Institución",
        obtenerOpciones: (d) => [...new Set(d.map((f) => f.institucion))].map((i) => ({ value: i, label: i })),
        predicado: (f, v) => f.institucion === v
      },
      {
        clave: "anio", etiqueta: "Año",
        obtenerOpciones: (d) => [...new Set(d.map((f) => f.anio))].sort((a, b) => b - a).map((a) => ({ value: a, label: a })),
        predicado: (f, v) => String(f.anio) === v
      }
    ],
    columnas: [
      { clave: "titulo", etiqueta: "Título", ordenable: true, formato: (v) => escaparHTML(v) },
      { clave: "tipo_documento", etiqueta: "Tipo de documento", ordenable: true, formato: (v) => escaparHTML(v) },
      { clave: "institucion", etiqueta: "Institución", ordenable: true, formato: (v) => escaparHTML(v) },
      { clave: "anio", etiqueta: "Año", ordenable: true, numerico: true, formato: (v) => escaparHTML(v) },
      { clave: "enlace", etiqueta: "Enlace", ordenable: false, formato: (v) => v ? `<a href="${escaparHTML(v)}" target="_blank" rel="noopener">Ver documento</a>` : "Dato pendiente de validación" },
      { clave: "fecha_consulta", etiqueta: "Fecha de consulta", ordenable: true, secundaria: true, formato: (v) => escaparHTML(v) },
      { clave: "descripcion", etiqueta: "Descripción", ordenable: false, secundaria: true, formato: (v) => escaparHTML(v) },
      { clave: "datos_respaldados_texto", etiqueta: "Datos respaldados", ordenable: false, secundaria: true, formato: (v) => escaparHTML(v) },
      { clave: "estado_validacion", etiqueta: "Estado", ordenable: true, formato: (v) => badgeEstado(v) }
    ]
  });
}
