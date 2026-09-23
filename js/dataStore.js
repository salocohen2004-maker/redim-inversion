/* Carga los archivos de datos locales (JSON) y los expone como un objeto único. */

const ARCHIVOS_DATOS = {
  config: "data/config.json",
  resumen: "data/resumen.json",
  presupuesto: "data/presupuesto.json",
  programas: "data/programas.json",
  indicadores: "data/indicadores.json",
  problemas: "data/problemas.json",
  soluciones: "data/soluciones.json",
  fuentes: "data/fuentes.json",
  glosario: "data/glosario.json"
};

const DataStore = {
  datos: null,

  async cargar() {
    const entradas = Object.entries(ARCHIVOS_DATOS);
    const resultados = await Promise.all(
      entradas.map(async ([clave, ruta]) => {
        const respuesta = await fetch(ruta, { cache: "no-store" });
        if (!respuesta.ok) {
          throw new Error(`No se pudo cargar ${ruta} (HTTP ${respuesta.status})`);
        }
        return [clave, await respuesta.json()];
      })
    );
    this.datos = Object.fromEntries(resultados);
    return this.datos;
  },

  obtenerFuentePorId(id) {
    if (!this.datos || !id) return null;
    return (this.datos.fuentes.fuentes || []).find((f) => f.id === id) || null;
  },

  obtenerCategoriaDerecho(id) {
    if (!this.datos) return null;
    return (this.datos.config.categorias_derechos || []).find((c) => c.id === id) || null;
  }
};
