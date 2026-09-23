function VistaDerechos(main, datos) {
  const categorias = datos.config.categorias_derechos;
  const principios = categorias.filter((c) => c.grupo_derecho === "principio_general");
  const sectores = categorias.filter((c) => c.grupo_derecho === "sector");
  const composicion = datos.presupuesto.composicion_por_derecho;
  const notaTaxonomia = datos.config.taxonomia_derechos_nota;

  function tarjetasGrupo(lista) {
    return `<div class="tarjetas-grid">
      ${lista.map((c) => `
        <div class="tarjeta" style="border-left:4px solid ${c.color}">
          <h3>${escaparHTML(c.nombre)}</h3>
          <p class="texto-pequeno">${escaparHTML(c.descripcion)}</p>
        </div>
      `).join("")}
    </div>`;
  }

  main.innerHTML = `
    <section aria-labelledby="titulo-derechos">
      <div class="seccion-header">
        <h1 id="titulo-derechos">Derechos</h1>
        <p class="intro">La inversión en NNA puede relacionarse con dos niveles de clasificación distintos: los principios generales de la niñez y los sectores de gasto público. No son categorías paralelas ni comparables entre sí.</p>
      </div>

      <div class="aviso-demostracion" role="note">
        <span class="icono" aria-hidden="true">⚠</span>
        <div>
          <strong>Clasificación pendiente de validación metodológica.</strong>
          <p style="margin:0.3em 0 0">${escaparHTML(notaTaxonomia)}</p>
        </div>
      </div>

      <h2>Principios generales de derechos (Convención sobre los Derechos del Niño)</h2>
      <p class="texto-pequeno texto-muted">Estos cuatro principios son transversales: orientan la interpretación de todos los demás derechos y no corresponden a partidas de gasto. Por eso se presentan aquí únicamente como tarjetas explicativas, sin montos, porcentajes ni gráficas.</p>
      ${tarjetasGrupo(principios)}

      <h2 class="espacio-arriba">Sectores de gasto</h2>
      <p class="texto-pequeno texto-muted">A diferencia de los principios generales, estos sectores sí agrupan programas presupuestarios identificables y por eso es posible comparar montos entre ellos.</p>
      ${tarjetasGrupo(sectores)}

      <p class="texto-pequeno texto-muted espacio-arriba">Se encontraron dos periodos reales (no una serie año por año): un promedio 2016-2023 (UNICEF, informe 2012-2023) y un dato específico de 2025 (UNICEF/SIPINNA, SITAN 2026). Comparar ambos sugiere una tendencia real: la participación de educación aumentó frente al promedio histórico, mientras salud y protección social disminuyeron; pero al ser solo dos puntos de fuentes distintas, esto es una observación descriptiva, no una serie validada año con año.</p>
      <div class="grid-2">
        <div class="grafica-bloque">
          <div class="grafica-titulo">Promedio 2016-2023</div>
          <p class="grafica-descripcion">Participación promedio de cada sector en el gasto en desarrollo social para NNA. No incluye "alimentación" como sector aparte (ver nota metodológica).</p>
          <div class="grafica-svg-contenedor" id="grafica-sectores-promedio"></div>
        </div>
        <div class="grafica-bloque">
          <div class="grafica-titulo">2025 (aprobado)</div>
          <p class="grafica-descripcion">Participación de cada sector en el gasto para NNA del ejercicio fiscal 2025, según el Anexo Transversal 18 aprobado.</p>
          <div class="grafica-svg-contenedor" id="grafica-sectores-2025"></div>
        </div>
      </div>

      <div class="bloque-explicativo espacio-arriba" role="note">
        <h3>Evolución año por año, por principio: aún no disponible</h3>
        <p>Este micrositio no muestra una gráfica de evolución anual de la composición del gasto por <strong>principio general</strong>, porque los cuatro principios de la niñez son transversales: un mismo programa presupuestario puede contribuir a varios principios a la vez, y repartir un monto entre ellos sin una metodología validada llevaría a contar el mismo gasto más de una vez.</p>
        <p class="texto-pequeno texto-muted mt-0">Cuando REDIM valide una metodología de asignación por principio que evite la doble contabilización, esta sección podrá mostrar la evolución correspondiente.</p>
      </div>

      <p class="texto-pequeno texto-muted espacio-arriba">Las categorías y su grupo de clasificación se definen en <code>data/config.json</code> (campo <code>categorias_derechos</code>) y pueden añadirse o modificarse ahí sin tocar el código.</p>
    </section>
  `;

  function metaComposicion(filas) {
    if (!filas.length) return null;
    const f = filas[filas.length - 1];
    return {
      unidad: "% del gasto social para NNA",
      periodo: f.periodo,
      fuente: f.fuente,
      estado: f.estado_validacion,
      fechaConsulta: f.fecha_consulta,
      notaMetodologica: f.notas_metodologicas,
      esDemostracion: f.es_demostracion
    };
  }

  function dibujarSectores(contenedorId, periodo, ariaLabel) {
    const filas = sectores
      .map((cat) => composicion.find((c) => c.derecho_id === cat.id && c.periodo === periodo))
      .filter(Boolean);
    Charts.barChart(main.querySelector(contenedorId), {
      ariaLabel,
      tituloTabla: ariaLabel,
      meta: metaComposicion(filas),
      datos: filas.map((f) => {
        const cat = sectores.find((c) => c.id === f.derecho_id);
        return {
          etiqueta: cat?.nombre || f.derecho_id,
          valor: f.porcentaje_gasto_desarrollo_social_nna.valor,
          unidad: f.porcentaje_gasto_desarrollo_social_nna.unidad,
          color: cat?.color,
          fuente: f.fuente,
          estado: f.estado_validacion
        };
      })
    });
  }

  dibujarSectores("#grafica-sectores-promedio", "Promedio 2016-2023", "Distribución del gasto en desarrollo social para NNA por sector, promedio 2016-2023");
  dibujarSectores("#grafica-sectores-2025", "2025 (aprobado)", "Distribución del gasto en desarrollo social para NNA por sector, 2025 aprobado");
}
