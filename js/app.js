/* Arranque del micrositio: carga de datos, construcción de navegación y
   registro de vistas en el enrutador. */

async function iniciarSitio() {
  const main = document.getElementById("contenido-principal");

  try {
    const datos = await DataStore.cargar();
    construirNavegacion(datos.config);
    document.title = `${datos.config.sitio.titulo_proyecto} · REDIM (prototipo)`;
  } catch (err) {
    console.error("Error al cargar los datos del sitio:", err);
    main.innerHTML = `
      <div class="mensaje-error-datos">
        <h1>No se pudieron cargar los datos</h1>
        <p>Este sitio necesita un servidor local para leer los archivos de <code>data/*.json</code>, porque los navegadores no permiten leer archivos locales directamente al abrir <code>index.html</code> con doble clic.</p>
        <p>Para verlo correctamente, abre una terminal en esta carpeta y ejecuta:</p>
        <p><code>python3 -m http.server 8000</code></p>
        <p>y luego visita <code>http://localhost:8000</code> en tu navegador. Consulta el archivo <code>README.md</code> para más detalles y alternativas gratuitas.</p>
        <p class="texto-pequeno">Detalle técnico: ${escaparHTML(err.message)}</p>
      </div>
    `;
    return;
  }

  Router.registrar("portada", VistaPortada);
  Router.registrar("resumen", VistaResumen);
  Router.registrar("presupuesto", VistaPresupuesto);
  Router.registrar("derechos", VistaDerechos);
  Router.registrar("programas", VistaProgramas);
  Router.registrar("impacto", VistaImpacto);
  Router.registrar("problemas", VistaProblemas);
  Router.registrar("soluciones", VistaSoluciones);
  Router.registrar("metodologia", VistaMetodologia);
  Router.registrar("fuentes", VistaFuentes);
  Router.registrar("glosario", VistaGlosario);

  Router.init(main);
}

function construirNavegacion(config) {
  document.getElementById("aviso-banner-texto").textContent = config.sitio.leyenda_prototipo;

  const navLista = document.getElementById("lista-navegacion");
  navLista.innerHTML = config.navegacion.map((item, i) => {
    if (!item.submenu) {
      return `<li><a href="#${item.id}" data-seccion="${item.id}">${escaparHTML(item.etiqueta)}</a></li>`;
    }
    const idSubmenu = `submenu-${i}`;
    const disparador = item.id
      ? `<a href="#${item.id}" data-seccion="${item.id}">${escaparHTML(item.etiqueta)}</a>
         <button type="button" class="nav-caret" aria-expanded="false" aria-haspopup="true" aria-controls="${idSubmenu}">
           <span class="caret" aria-hidden="true">▾</span><span class="sr-only">Mostrar submenú de ${escaparHTML(item.etiqueta)}</span>
         </button>`
      : `<button type="button" class="nav-boton" aria-expanded="false" aria-haspopup="true" aria-controls="${idSubmenu}">
           ${escaparHTML(item.etiqueta)} <span class="caret" aria-hidden="true">▾</span>
         </button>`;
    return `<li class="nav-item-tiene-submenu">
      <div class="nav-item-fila">${disparador}</div>
      <ul class="submenu" id="${idSubmenu}">
        ${item.submenu.map((sub) => `<li><a href="#${sub.id}" data-seccion="${sub.id}">${escaparHTML(sub.etiqueta)}</a></li>`).join("")}
      </ul>
    </li>`;
  }).join("");

  const toggle = document.getElementById("boton-menu");
  const nav = document.getElementById("navegacion-principal");
  toggle.addEventListener("click", () => {
    const abierto = nav.classList.toggle("abierto");
    toggle.setAttribute("aria-expanded", String(abierto));
  });

  function cerrarSubmenu(li) {
    li.classList.remove("submenu-abierto");
    const disparador = li.querySelector(".nav-caret, .nav-boton");
    if (disparador) disparador.setAttribute("aria-expanded", "false");
  }
  function cerrarTodosLosSubmenus(excepto) {
    nav.querySelectorAll(".nav-item-tiene-submenu.submenu-abierto").forEach((li) => {
      if (li !== excepto) cerrarSubmenu(li);
    });
  }

  nav.querySelectorAll(".nav-caret, .nav-boton").forEach((disparador) => {
    disparador.addEventListener("click", () => {
      const li = disparador.closest(".nav-item-tiene-submenu");
      const yaAbierto = li.classList.contains("submenu-abierto");
      cerrarTodosLosSubmenus(li);
      if (yaAbierto) {
        cerrarSubmenu(li);
      } else {
        li.classList.add("submenu-abierto");
        disparador.setAttribute("aria-expanded", "true");
      }
    });
  });

  document.addEventListener("click", (evt) => {
    if (!nav.contains(evt.target)) cerrarTodosLosSubmenus(null);
  });
  nav.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      const li = evt.target.closest(".nav-item-tiene-submenu");
      cerrarTodosLosSubmenus(null);
      const disparador = li ? li.querySelector(".nav-caret, .nav-boton") : null;
      if (disparador) disparador.focus();
    }
  });
}

document.addEventListener("DOMContentLoaded", iniciarSitio);
