const NOMBRES_CATEGORIA_INDICADOR = {
  pobreza: "Pobreza",
  educacion: "Educación",
  salud: "Salud",
  alimentacion: "Alimentación",
  violencia: "Violencia",
  proteccion: "Protección"
};

function VistaImpacto(main, datos) {
  const indicadores = datos.indicadores.indicadores;
  const relaciones = datos.indicadores.relaciones_inversion_indicador;

  main.innerHTML = `
    <section aria-labelledby="titulo-impacto">
      <div class="seccion-header">
        <h1 id="titulo-impacto">Inversión y resultados sociales</h1>
        <p class="intro">Explora un indicador social a la vez y su posible relación con la inversión en niñez y adolescencia: pobreza, educación, salud, alimentación, violencia y protección.</p>
      </div>

      <div class="aviso-demostracion" role="note">
        <span class="icono" aria-hidden="true">ℹ</span>
        <div>
          <strong>Correlación no es causalidad.</strong>
          <p style="margin:0.3em 0 0">Que la inversión y un indicador social se muestren cerca en el tiempo no significa que uno cause al otro. Cada interpretación de esta sección se etiqueta según su nivel de evidencia: <em>descriptiva</em> (solo describe lo observado), <em>asociación</em> (dos variables se mueven juntas, sin establecer causa), <em>evidencia causal</em> (existe un diseño metodológico que permite atribuir causalidad) o <em>hipótesis</em> (planteamiento aún no evaluado con datos).</p>
        </div>
      </div>

      <div class="panel-filtros" aria-label="Selección de indicador">
        <div class="campo-filtro">
          <label for="selector-indicador">Indicador social</label>
          <select id="selector-indicador">
            ${indicadores.map((ind) => `<option value="${ind.id}">${escaparHTML(ind.nombre)} (${escaparHTML(NOMBRES_CATEGORIA_INDICADOR[ind.categoria] || ind.categoria)})</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="grafica-bloque" id="bloque-grafica-indicador">
        <div class="grafica-titulo" id="titulo-grafica-indicador"></div>
        <p class="grafica-descripcion" id="descripcion-grafica-indicador"></p>
        <div class="grafica-svg-contenedor" id="grafica-indicador"></div>
      </div>

      <div class="bloque-explicativo" id="bloque-interpretacion"></div>
    </section>
  `;

  const selector = main.querySelector("#selector-indicador");
  const tituloGrafica = main.querySelector("#titulo-grafica-indicador");
  const descripcionGrafica = main.querySelector("#descripcion-grafica-indicador");
  const bloqueInterpretacion = main.querySelector("#bloque-interpretacion");

  function dibujar() {
    const ind = indicadores.find((i) => i.id === selector.value) || indicadores[0];
    const ultimo = ind.serie[ind.serie.length - 1];
    const anios = ind.serie.map((s) => s.anio);

    tituloGrafica.textContent = ind.nombre;
    descripcionGrafica.textContent = `Categoría: ${NOMBRES_CATEGORIA_INDICADOR[ind.categoria] || ind.categoria}`;

    Charts.lineChart(main.querySelector("#grafica-indicador"), {
      ariaLabel: ind.nombre,
      tituloTabla: ind.nombre,
      meta: {
        unidad: ind.unidad,
        periodo: anios.length > 1 ? `${Math.min(...anios)}–${Math.max(...anios)}` : String(anios[0]),
        fuente: ultimo.fuente,
        estado: ultimo.estado_validacion,
        fechaConsulta: ultimo.fecha_consulta,
        notaMetodologica: ultimo.notas_metodologicas,
        esDemostracion: ultimo.es_demostracion
      },
      series: [{
        etiqueta: ind.nombre, color: "#265D8E",
        puntos: ind.serie.map((s) => ({ x: s.anio, y: s.valor, unidad: ind.unidad, fuente: s.fuente, estado: s.estado_validacion }))
      }]
    });

    const relacion = relaciones.find((r) => r.indicador_id === ind.id);
    if (relacion) {
      bloqueInterpretacion.innerHTML = `
        <h3>Interpretación</h3>
        <div style="margin-bottom:0.5em">${badgeEvidencia(relacion.etiqueta_evidencia)}</div>
        <p>${escaparHTML(relacion.texto_conclusion)}</p>
        ${fichaTrazabilidad({ estado_validacion: relacion.estado_validacion, fuente: DataStore.obtenerFuentePorId(relacion.fuente_id)?.titulo })}
      `;
    } else {
      bloqueInterpretacion.innerHTML = `
        <h3>Interpretación</h3>
        ${estadoVacio("Aún no se ha registrado una interpretación para este indicador.")}
      `;
    }
  }

  dibujar();
  selector.addEventListener("change", dibujar);
}
