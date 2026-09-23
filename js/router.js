/* Enrutador simple basado en el hash de la URL (#seccion). */

const Router = {
  vistas: {},
  main: null,
  tituloBase: "",
  primeraCarga: true,

  registrar(id, fn) {
    this.vistas[id] = fn;
  },

  init(mainEl) {
    this.main = mainEl;
    window.addEventListener("hashchange", () => this.navegar());
    this.navegar();
  },

  idActual() {
    const hash = (location.hash || "#portada").replace("#", "");
    return this.vistas[hash] ? hash : "portada";
  },

  navegar() {
    const id = this.idActual();
    document.querySelectorAll(".sitio-nav a").forEach((a) => {
      const esActual = a.getAttribute("data-seccion") === id;
      if (esActual) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });

    const nav = document.querySelector(".sitio-nav");
    if (nav && nav.classList.contains("abierto") && window.innerWidth <= 840) {
      nav.classList.remove("abierto");
      const toggle = document.querySelector(".nav-toggle");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
    document.querySelectorAll(".nav-item-tiene-submenu.submenu-abierto").forEach((li) => {
      li.classList.remove("submenu-abierto");
      const boton = li.querySelector(".nav-caret, .nav-boton");
      if (boton) boton.setAttribute("aria-expanded", "false");
    });

    try {
      this.vistas[id](this.main, DataStore.datos);
    } catch (err) {
      console.error("Error al renderizar la sección:", err);
      this.main.innerHTML = `<div class="mensaje-error-datos"><p><strong>Ocurrió un error al mostrar esta sección.</strong></p><p>Detalle técnico: <code>${escaparHTML(err.message)}</code></p></div>`;
    }

    if (this.primeraCarga) {
      // En la carga inicial no se roba el foco: así el enlace "Saltar al
      // contenido" y el menú siguen siendo lo primero alcanzable con Tab.
      this.primeraCarga = false;
      return;
    }

    const encabezado = this.main.querySelector("h1, h2");
    if (encabezado) {
      encabezado.setAttribute("tabindex", "-1");
      encabezado.focus({ preventScroll: false });
    }
    const header = document.querySelector(".sitio-header");
    const alturaHeader = header ? header.offsetHeight : 60;
    window.scrollTo({ top: this.main.offsetTop - alturaHeader - 16, behavior: "smooth" });
  }
};
