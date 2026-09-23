function VistaProblemas(main, datos) {
  const problemas = datos.problemas.problemas;
  main.innerHTML = `
    <section aria-labelledby="titulo-problemas">
      <div class="seccion-header">
        <h1 id="titulo-problemas">Problemas y brechas</h1>
        <p class="intro">Principales problemas identificados en torno a la inversión pública en niñas, niños y adolescentes. Cada tarjeta indica la evidencia disponible, la población afectada y la fuente correspondiente.</p>
      </div>
      ${problemas.length ? `<div class="tarjetas-grid">
        ${problemas.map((p) => `
          <div class="tarjeta">
            <h3>${escaparHTML(p.titulo)}</h3>
            <p><strong>Problema:</strong> ${escaparHTML(p.problema)}</p>
            <p><strong>Evidencia:</strong> ${escaparHTML(p.evidencia)}</p>
            <p><strong>Población afectada:</strong> ${escaparHTML(p.poblacion_afectada)}</p>
            ${fichaTrazabilidad({ estado_validacion: p.estado_validacion, fuente: DataStore.obtenerFuentePorId(p.fuente_id)?.titulo })}
          </div>
        `).join("")}
      </div>` : estadoVacio("No hay problemas registrados todavía.")}
      <p class="texto-pequeno texto-muted espacio-arriba">Nota: la categoría "subejercicio" solo se incluirá en esta sección cuando existan datos verificados que la respalden, conforme a los lineamientos del proyecto.</p>
    </section>
  `;
}
