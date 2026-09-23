function VistaResumen(main, datos) {
  const r = datos.resumen;
  main.innerHTML = `
    <section aria-labelledby="titulo-resumen">
      <div class="seccion-header">
        <h1 id="titulo-resumen">Resumen ejecutivo</h1>
        <p class="intro">Síntesis de los principales hallazgos de la investigación y de las razones por las que invertir en los derechos de la niñez y la adolescencia importa.</p>
      </div>

      <h2>Principales hallazgos</h2>
      <div class="tarjetas-grid">
        ${r.hallazgos_principales.map((h) => `
          <div class="tarjeta">
            <div style="margin-bottom:0.5em">${badgeEvidencia(h.etiqueta_evidencia)}</div>
            <p>${escaparHTML(h.texto)}</p>
            ${fichaTrazabilidad({ ...h, fuente: DataStore.obtenerFuentePorId(h.fuente_id)?.titulo })}
          </div>
        `).join("")}
      </div>

      <h2 class="espacio-arriba">¿Por qué invertir en los derechos de la niñez?</h2>
      <div class="tarjetas-grid">
        ${r.por_que_invertir.map((p) => `
          <div class="tarjeta">
            <h3>${escaparHTML(p.titulo)}</h3>
            <p>${escaparHTML(p.texto)}</p>
            ${p.fuente_id ? fichaTrazabilidad({ ...p, fuente: DataStore.obtenerFuentePorId(p.fuente_id)?.titulo }) : ""}
          </div>
        `).join("")}
      </div>

      <h2 class="espacio-arriba">Mensajes clave</h2>
      <div class="bloque-explicativo">
        <ul>
          ${r.mensajes_clave.map((m) => `<li>${escaparHTML(m)}</li>`).join("")}
        </ul>
        <p class="texto-pequeno texto-muted mt-0">Estos mensajes se editan directamente en <code>data/resumen.json</code>, sin necesidad de modificar el código del sitio.</p>
      </div>
    </section>
  `;
}
