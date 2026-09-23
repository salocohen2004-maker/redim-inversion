function VistaSoluciones(main, datos) {
  const soluciones = datos.soluciones.soluciones;
  const problemas = datos.problemas.problemas;
  const tituloProblema = (id) => problemas.find((p) => p.id === id)?.titulo || "Dato pendiente de validación";

  main.innerHTML = `
    <section aria-labelledby="titulo-soluciones">
      <div class="seccion-header">
        <h1 id="titulo-soluciones">Soluciones</h1>
        <p class="intro">Recomendaciones orientadas a atender los problemas identificados, con institución responsable, plazo sugerido e indicador para evaluar avances.</p>
      </div>
      ${soluciones.length ? `<div class="tarjetas-grid">
        ${soluciones.map((s) => `
          <div class="tarjeta">
            <div style="margin-bottom:0.5em">${badgeEvidencia(s.nivel_evidencia)}</div>
            <p><strong>Recomendación:</strong> ${escaparHTML(s.recomendacion)}</p>
            <p><strong>Problema que atiende:</strong> ${escaparHTML(tituloProblema(s.problema_id))}</p>
            <p><strong>Institución responsable:</strong> ${escaparHTML(s.institucion_responsable)}</p>
            <p><strong>Plazo sugerido:</strong> ${escaparHTML(s.plazo_sugerido)}</p>
            <p><strong>Indicador de seguimiento:</strong> ${escaparHTML(s.indicador_seguimiento)}</p>
            ${fichaTrazabilidad({ estado_validacion: s.estado_validacion })}
          </div>
        `).join("")}
      </div>` : estadoVacio("No hay recomendaciones registradas todavía.")}
    </section>
  `;
}
