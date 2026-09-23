function VistaGlosario(main, datos) {
  const terminos = datos.glosario.terminos;
  main.innerHTML = `
    <section aria-labelledby="titulo-glosario">
      <div class="seccion-header">
        <h1 id="titulo-glosario">Glosario</h1>
        <p class="intro">Definiciones de los conceptos técnicos utilizados en este micrositio.</p>
      </div>
      <dl class="definicion-lista">
        ${terminos.map((t) => `<dt>${escaparHTML(t.termino)}</dt><dd>${escaparHTML(t.definicion)}</dd>`).join("")}
      </dl>
    </section>
  `;
}
