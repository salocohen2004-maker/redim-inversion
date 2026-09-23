function VistaMetodologia(main) {
  main.innerHTML = `
    <section aria-labelledby="titulo-metodologia">
      <div class="seccion-header">
        <h1 id="titulo-metodologia">Metodología</h1>
        <p class="intro">Definiciones, fórmulas y criterios utilizados para construir las cifras y clasificaciones de este micrositio. Todas las cifras provienen de fuentes reales (ver <a href="#fuentes">Biblioteca de fuentes</a>); esta sección explica cómo se usaron, dónde se calculó algo a partir de un dato publicado, y qué límites tiene el análisis. Sigue pendiente de revisión formal por el equipo de investigación de REDIM.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Qué se considera "inversión en niñez y adolescencia" (NNA)</h3>
        <p>Este micrositio usa como base el <strong>Anexo Transversal 18 "Recursos para la Atención de Niñas, Niños y Adolescentes" (ATNNA)</strong> del Presupuesto de Egresos de la Federación, que existe desde 2012 y que es la fuente que tanto REDIM como UNICEF México usan en los documentos citados en este sitio. El Anexo 18 agrupa los recursos que distintas dependencias federales etiquetan específicamente para la atención de NNA, dentro de sus propios programas presupuestarios.</p>
        <p class="texto-pequeno texto-muted mt-0">Esto significa que las cifras de este micrositio no cubren necesariamente todo el gasto público que beneficia indirectamente a la niñez (por ejemplo, infraestructura carretera o seguridad pública en general), sino específicamente lo que el gobierno federal etiqueta como dirigido a NNA.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Presupuesto nominal vs. presupuesto real</h3>
        <p>El <strong>presupuesto nominal</strong> se expresa en los precios vigentes del año en que se reporta. El <strong>presupuesto real</strong> ajustaría esa cifra por inflación, para comparar montos de distintos años en términos equivalentes (a precios constantes de un año base).</p>
        <p class="texto-pequeno texto-muted mt-0">Este micrositio <strong>no calculó de forma independiente ningún monto real (deflactado) en pesos absolutos</strong>: ninguna de las fuentes consultadas publica esa cifra directamente para el Anexo 18 completo, y no quisimos construirla combinando el presupuesto nominal con un índice de inflación por nuestra cuenta, porque eso sería introducir un supuesto metodológico propio no verificado. Por eso, en "Panorama de la inversión", el campo de presupuesto real aparece como "Dato pendiente de validación": lo que sí se muestra es la <em>variación real anual</em> en porcentaje, tal como la publica cada fuente.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Ajuste por inflación en las variaciones reales publicadas</h3>
        <p>Cuando este micrositio muestra una "variación real" (por ejemplo, en Panorama de la inversión o en los Programas presupuestarios), esa cifra <strong>no la calculamos nosotros</strong>: es la que publica la fuente original (REDIM o UNICEF México), quienes a su vez la calculan usando una inflación estimada o proyectada por la Secretaría de Hacienda y Crédito Público (SHCP) en sus Pre-Criterios Generales de Política Económica, no la inflación definitiva del Índice Nacional de Precios al Consumidor (INPC) del INEGI. Por eso esas cifras y las fuentes que las respaldan están marcadas como <strong>"En revisión"</strong> en lugar de "Validado": pueden diferir del dato final una vez que el INEGI publique la inflación definitiva del periodo correspondiente.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Cómo se calcularon los datos derivados (a partir de una variación publicada)</h3>
        <p>En varios puntos de este micrositio (por ejemplo, algunos años de "Inversión y resultados sociales" y de "Programas presupuestarios") no se encontró publicado el valor absoluto de un año específico, pero sí se encontró publicado el valor de un año cercano <em>y</em> la variación porcentual entre ambos años. En esos casos, se calculó el valor faltante con una simple regla de tres a partir del dato conocido y la variación publicada; por ejemplo, si un año X vale 100 y la fuente indica "+10% respecto al año anterior", el año anterior se calculó como 100 ÷ 1.10 ≈ 90.9. Esto se documenta siempre en el campo "Nota metodológica" de ese punto específico, indicando de qué cifra y de qué variación se partió, para que cualquier persona pueda verificar el cálculo.</p>
        <p class="texto-pequeno texto-muted mt-0">Este micrositio no combinó cifras de dos fuentes distintas para calcular un dato que ninguna de las dos publica directamente; el cálculo siempre parte de dos cifras publicadas por la <em>misma</em> fuente.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Fórmulas utilizadas</h3>
        <ul>
          <li><strong>Inversión per cápita</strong> = Presupuesto destinado a NNA ÷ Población de NNA. (Este micrositio usa la cifra de inversión per cápita publicada directamente por UNICEF México, no la calcula a partir de una cifra de población propia.)</li>
          <li><strong>Variación anual (nominal o real)</strong> = ((Valor del año actual ÷ Valor del año anterior) − 1) × 100.</li>
          <li><strong>Porcentaje del PIB</strong> = (Presupuesto nominal destinado a NNA ÷ PIB nominal del mismo año) × 100.</li>
        </ul>
      </div>

      <div class="bloque-explicativo">
        <h3>Sectores de gasto vs. principios generales de la niñez</h3>
        <p>Este micrositio distingue dos niveles de clasificación que no son comparables entre sí (ver la sección <a href="#derechos">Derechos</a>): los <strong>principios generales</strong> de la Convención sobre los Derechos del Niño (transversales, sin monto asociado) y los <strong>sectores de gasto</strong> (educación, salud, alimentación y protección social). La única fuente real encontrada con una distribución del gasto por sector (UNICEF México) solo usa tres sectores —educación, salud y protección social— más un residual "Otros"; no incluye "alimentación" como sector agregado, aunque sí existen programas alimentarios específicos identificables (por ejemplo, LICONSA) que este micrositio sí incluye en la tabla de Programas presupuestarios.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Criterios para incluir información</h3>
        <ul>
          <li>Se priorizaron fuentes que citan explícitamente su origen primario (SHCP, DOF, INEGI, CONEVAL, SESNSP, Secretaría de Salud, SEP) sobre fuentes que no especifican de dónde obtuvieron un dato.</li>
          <li>Cuando una cifra se extrajo de una gráfica dentro de un documento y el texto no permitía confirmar sin ambigüedad a qué año o categoría correspondía cada número, esa cifra <strong>no se incluyó</strong>, aunque el documento la mencionara. Solo se usaron cifras confirmables en el texto narrativo de cada fuente.</li>
          <li>Cuando dos fuentes independientes publicaron el mismo dato (por ejemplo, la pobreza en NNA de 2022: 45.8%, confirmada por UNICEF/CONEVAL y por dos balances anuales distintos de REDIM), se marcó como "Validado" en lugar de "En revisión".</li>
          <li>No se incluyó la categoría "subejercicio" en Problemas y brechas porque no se encontraron datos verificados que la respalden.</li>
        </ul>
      </div>

      <div class="bloque-explicativo">
        <h3>Limitaciones conocidas</h3>
        <ul>
          <li>Las cifras de 2025 y 2026 en varias fuentes son aprobadas/proyectadas al momento de su publicación, no cifras de ejercicio final; el % del PIB de esos años usa como base el PIB de 2015-2024 del INEGI porque el PIB definitivo de 2025-2026 todavía no existe.</li>
          <li>Los indicadores sociales de 2025 que citan las fuentes (por ejemplo, homicidios o desapariciones) suelen ser parciales (enero-noviembre), por lo que este micrositio evita mostrarlos junto a cifras de año completo como si fueran directamente comparables.</li>
          <li>Un mismo indicador puede tener rangos de edad ligeramente distintos entre una fuente y otra (por ejemplo, rezago educativo "0-17 años" vs. "3-17 años"); cuando esto ocurre se documenta en la nota metodológica del punto correspondiente y ese punto se marca "En revisión" en lugar de "Validado".</li>
          <li>La composición del gasto por sector (educación/salud/protección social) es un promedio 2016-2023, no una serie año por año, porque no se encontró una fuente que publicara esa desagregación anualmente.</li>
          <li>No se investigó ni se afirma ninguna relación causal entre la inversión pública y los indicadores sociales de este micrositio (ver "Inversión y resultados sociales"): las observaciones que combinan ambos tipos de datos están etiquetadas como "descriptivas" o "hipótesis", nunca como "evidencia causal".</li>
        </ul>
      </div>

      <div class="bloque-explicativo">
        <h3>Fecha de corte de la información</h3>
        <p>La investigación de fuentes para este micrositio se realizó el 22 de septiembre de 2026. Cada dato individual también indica su propia "fecha de consulta" y, cuando aplica, el año fiscal o de medición exacto al que corresponde.</p>
      </div>

      <div class="bloque-explicativo">
        <h3>Fuentes utilizadas</h3>
        <p>Este micrositio usa 9 fuentes reales: 5 análisis anuales de REDIM sobre el Presupuesto de Egresos de la Federación (2022 a 2026), 2 Balances Anuales de REDIM (2023 y 2025), el informe "Análisis de la inversión pública en infancia y adolescencia en México 2012-2023" de UNICEF México, y un boletín del CIEP sobre inversión en primera infancia. Consulta el detalle completo, con enlaces y fechas de consulta, en la sección <a href="#fuentes">Biblioteca de fuentes</a>.</p>
      </div>
    </section>
  `;
}
