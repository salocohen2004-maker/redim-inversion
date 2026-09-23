function VistaPortada(main, datos) {
  const { sitio, indicadores_destacados } = datos.config;
  main.innerHTML = `
    <section aria-labelledby="titulo-portada">
      <div class="seccion-header">
        <p class="texto-pequeno" style="text-transform:uppercase;letter-spacing:0.04em;color:var(--color-accent);font-weight:700;">Red por los Derechos de la Infancia en México (REDIM) — proyecto de servicio social</p>
        <h1 id="titulo-portada">${escaparHTML(sitio.titulo_proyecto)}</h1>
        <p class="intro">${escaparHTML(sitio.descripcion_breve)}</p>
        <p class="texto-pequeno texto-muted">Fecha de actualización de este micrositio: <strong>${escaparHTML(sitio.fecha_actualizacion)}</strong></p>
      </div>

      <div class="aviso-demostracion" role="note">
        <span class="icono" aria-hidden="true">⚠</span>
        <div>
          <strong>Aviso sobre las cifras mostradas.</strong>
          <p style="margin:0.3em 0 0">${escaparHTML(sitio.aviso_demostracion)}</p>
        </div>
      </div>

      <h2>Indicadores destacados</h2>
      ${renderTarjetasIndicadores(indicadores_destacados)}

      <div class="bloque-explicativo espacio-arriba">
        <h3>¿Qué encontrarás en este micrositio?</h3>
        <p>Este espacio interno permite al equipo de REDIM dar seguimiento a la investigación sobre inversión pública en niñas, niños y adolescentes: explorar el presupuesto, revisar su distribución por derechos, consultar programas presupuestarios, relacionar la inversión con indicadores sociales, identificar problemas y brechas, y revisar la metodología y fuentes utilizadas. Usa el menú superior para navegar entre secciones.</p>
      </div>
    </section>
  `;
}
