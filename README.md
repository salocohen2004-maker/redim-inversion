# Inversión en los Derechos de la Niñez y la Adolescencia — Micrositio (prototipo)

Prototipo académico interno, elaborado en el marco de un servicio social realizado en la Red por los Derechos de la Infancia en México (REDIM). **No es una publicación oficial de REDIM** y su contenido está sujeto a revisión.

**Estado actual: todos los datos de este micrositio son reales**, tomados de 10 fuentes citadas (REDIM, UNICEF México/SIPINNA y CIEP; ver `data/fuentes.json` y la sección "Biblioteca de fuentes" del sitio). No queda ningún registro marcado `"es_demostracion": true` ni ninguna etiqueta "Dato de demostración" en la interfaz. Donde una cifra específica no se encontró publicada en ninguna fuente consultada, el campo correspondiente se dejó como `null` y se muestra "Dato pendiente de validación" en vez de inventarla — eso es intencional, no un error. Cada dato indica además su estado de certeza ("Validado", "En revisión" o "Pendiente"; ver `data/config.json → sitio.aviso_demostracion` para la explicación completa de estos tres estados).

## Propósito

Ofrecer al equipo de REDIM una herramienta interna, gratuita y sin dependencias de pago, para:

- presentar avances de la investigación sobre inversión pública en niñez y adolescencia;
- explorar el presupuesto (evolución, composición, programas);
- relacionar la inversión con indicadores sociales, distinguiendo siempre correlación de causalidad;
- documentar problemas, brechas y posibles soluciones;
- dejar trazabilidad (fuente, año, fecha de consulta, estado de validación) en cada dato;
- poder actualizarse después editando archivos de datos, sin tocar el código.

## Requisitos y restricciones cumplidas

- Solo HTML5, CSS3 y JavaScript vanilla. Sin frameworks, sin build, sin paquetes.
- Sin backend ni base de datos: los datos están en archivos JSON locales dentro de `data/`.
- Sin librerías externas de pago ni con suscripción. Las gráficas (líneas, barras, barras apiladas) están hechas a mano en SVG, sin ninguna dependencia externa que instalar.
- No se hace ninguna llamada a APIs externas ni se envían datos del usuario a ningún servicio.
- Se puede abrir localmente (con un servidor local, ver abajo) y publicarse como sitio estático en cualquier servicio gratuito.

## Estructura de archivos

```
index.html              Página única; el enrutador (js/router.js) cambia el contenido según #seccion
css/
  styles.css             Todos los estilos del sitio
js/
  utils.js               Formato de números/moneda, badges de estado, exportar CSV, helpers
  dataStore.js            Carga los JSON de data/ con fetch()
  charts.js               Gráficas SVG accesibles (línea, barras, barras apiladas)
  components.js            Tarjetas de indicadores, cadena inversión→resultados, tabla interactiva
  router.js                Enrutador por hash (#portada, #resumen, ...)
  app.js                   Arranque del sitio, construcción del menú
  views/                   Un archivo por sección (portada.js, resumen.js, presupuesto.js, ...)
data/
  config.json              Título, indicadores destacados, categorías de derechos, menú
  resumen.json              Hallazgos principales, mensajes clave, razones para invertir
  presupuesto.json           Serie anual y composición por derecho
  programas.json              Tabla de programas presupuestarios
  indicadores.json             Indicadores sociales (pobreza, educación, salud, etc.)
  problemas.json                Tarjetas de problemas y brechas
  soluciones.json                Tarjetas de recomendaciones
  fuentes.json                    Biblioteca de fuentes
  glosario.json                    Definiciones de términos
assets/                    Carpeta reservada para logotipos y recursos oficiales de REDIM (vacía por ahora)
```

No existían archivos previos en la carpeta del proyecto antes de esta primera versión, así que no hubo nada que preservar ni sobrescribir.

## Cómo abrirlo localmente

Los navegadores no permiten que una página abierta con doble clic (`file://...`) lea archivos `data/*.json` con `fetch()`, por razones de seguridad. Por eso este sitio necesita un servidor local mínimo — algo normal en cualquier sitio que lee datos de archivos separados, y totalmente gratuito.

### Opción más simple (con Python, ya viene instalado en Mac)

```bash
cd "REDIM - CLAUDE"
python3 -m http.server 8000
```

Luego abre `http://localhost:8000` en tu navegador.

### Alternativas igualmente gratuitas

- Con Node.js: `npx serve .`
- Con la extensión "Live Server" de VS Code (clic derecho sobre `index.html` → "Open with Live Server").

Si abres `index.html` con doble clic sin servidor, el sitio te mostrará un aviso explicando este mismo paso.

## Cómo modificar los datos

Todos los textos y cifras visibles viven en `data/*.json`. Edita el archivo correspondiente con cualquier editor de texto y recarga la página (no hay que tocar el código). Cada archivo tiene un campo `"nota"` o `"es_demostracion"` recordando que su contenido es de prueba hasta que se sustituya.

Campos de trazabilidad recomendados en cada registro numérico: `valor`, `unidad`, `anio`, `territorio`, `grupo_poblacional`, `fuente` (y opcionalmente `fuente_id` para vincularlo con `data/fuentes.json`), `url`, `fecha_consulta`, `estado_validacion` (`"validado"`, `"en_revision"`, `"pendiente"` o `"demostracion"`) y `notas_metodologicas`.

## Cómo agregar una nueva fuente

1. Añade un objeto nuevo al arreglo `fuentes` en `data/fuentes.json`, con un `id` único (por ejemplo `"fte-2026-01"`).
2. En los registros de otros archivos (`presupuesto.json`, `programas.json`, `indicadores.json`, etc.) que citen esa fuente, usa ese mismo `id` en el campo `fuente_id`.
3. La fuente aparecerá automáticamente en la sección "Biblioteca de fuentes".

## Cómo añadir una gráfica

Las funciones reutilizables están en `js/charts.js`:

- `Charts.lineChart(contenedor, { series, ariaLabel, tituloTabla })` — evolución en el tiempo.
- `Charts.barChart(contenedor, { datos, ariaLabel, tituloTabla })` — comparación entre categorías (admite valores negativos).
- `Charts.stackedBarChart(contenedor, { categorias, series, ariaLabel, tituloTabla, unidad })` — composición.

Para usarlas: agrega un `<div class="grafica-svg-contenedor" id="mi-grafica"></div>` en el HTML de la vista (`js/views/*.js`) y llama a la función correspondiente pasándole los datos ya filtrados. Cada gráfica genera automáticamente su tabla de datos alterna para lectores de pantalla y su tooltip accesible por teclado.

## Cómo añadir o modificar una categoría de derecho

Edita el arreglo `categorias_derechos` en `data/config.json` (campos `id`, `nombre`, `descripcion`, `color`). Los datos de composición presupuestaria en `data/presupuesto.json` (`composicion_por_derecho`) y de programas en `data/programas.json` (`derecho_id`) deben usar el mismo `id`.

## Cómo agregar o corregir un dato real

1. Verifica la cifra con su fuente antes de capturarla; prioriza fuentes que citen su origen primario (SHCP, DOF, INEGI, CONEVAL, SESNSP) sobre las que no lo hagan.
2. Si la cifra viene de una gráfica dentro de un documento y el texto no permite confirmar sin ambigüedad a qué año o categoría corresponde cada número, no la incluyas — usa solo cifras confirmables en el texto narrativo de la fuente (ver "Metodología" para el porqué de esta regla).
3. Escribe o actualiza el valor en el archivo `data/*.json` correspondiente, manteniendo la misma estructura de campos.
4. Completa `fuente`, `fuente_id` (agregando la fuente a `data/fuentes.json` si es nueva, ver abajo), `url`, `fecha_consulta`, `notas_metodologicas` y `estado_validacion` (`"validado"` si no hay ningún supuesto de por medio, `"en_revision"` si el dato usa una estimación o una definición no perfectamente comparable, `"pendiente"` si se buscó y no se encontró).
5. Pon `"es_demostracion": false`.
6. Si no encuentras el dato en ninguna fuente, deja el valor en `null` (se mostrará "Dato pendiente de validación") — nunca inventes una cifra para rellenar un hueco.
7. Actualiza `sitio.fecha_actualizacion` en `data/config.json`.
8. Si el nuevo dato usa un cálculo (por ejemplo, derivar un año a partir de otro y una variación % publicada), documenta el cálculo en `notas_metodologicas` de ese mismo registro.

## Cómo publicar gratuitamente como sitio estático

Cualquiera de estas opciones gratuitas sirve, sin necesidad de backend:

- **GitHub Pages**: sube la carpeta a un repositorio y activa Pages en la configuración del repositorio.
- **Netlify / Vercel (plan gratuito)**: arrastra la carpeta del proyecto a su panel de despliegue, o conecta el repositorio.
- **Cloudflare Pages**: similar, conectando el repositorio o subiendo la carpeta.

En todos los casos, como el sitio es 100% estático (HTML/CSS/JS + JSON), no requiere configuración de servidor especial.

## Lista de control antes de publicar

### Editorial

- [ ] Ningún archivo de `data/` tiene `"es_demostracion": true` restante, salvo que se publique intencionalmente como demo. (Al 2026-09-22, el sitio completo pasa esta prueba: 0 registros demo.)
- [ ] Cada texto "Dato pendiente de validación" que quede corresponde a un dato que genuinamente no se encontró publicado, no a algo que simplemente no se buscó todavía.
- [ ] Cada cifra tiene `fuente`, `anio`, `fecha_consulta` y `estado_validacion` correctos.
- [ ] Las conclusiones de la sección "Inversión y resultados sociales" tienen la etiqueta de evidencia correcta (`descriptiva`, `asociacion`, `evidencia_causal` o `hipotesis`).
- [ ] `sitio.fecha_actualizacion` en `data/config.json` está al día.
- [ ] Se sustituyó el espacio reservado del logotipo por los recursos oficiales autorizados por REDIM (si aplica).

### Técnica

- [ ] El sitio abre sin errores en la consola del navegador (F12 → Consola).
- [ ] Todos los enlaces internos (`#portada`, `#resumen`, etc.) funcionan.
- [ ] Se probó en anchos de 375px, 768px y 1440px.
- [ ] Se navegó todo el sitio solo con teclado (Tab, Enter, flechas en los `<select>`).
- [ ] Ninguna llamada de red sale hacia dominios externos (pestaña "Network" del navegador).
- [ ] El botón "Descargar CSV" funciona en cada sección que lo tiene.

## Cómo verificar rápidamente que no queda ningún dato ficticio

En una terminal, dentro de la carpeta del proyecto:

```bash
grep -rl "\"es_demostracion\": true" data/
```

Este comando debe devolver "sin resultados". (El siguiente comando SÍ puede devolver resultados — no es un error, solo lista los huecos honestamente pendientes que quedan por investigar):

```bash
grep -rl "Dato pendiente de validación" data/
```
