// ============================================================
// EXPORTADOR DE CORREOS DE GMAIL A TXT
// Google Apps Script
// ============================================================
//
// FUNCIONAMIENTO:
// 1. Busca hilos asociados a correos enviados durante el periodo.
// 2. Recupera todos los mensajes del periodo dentro de esos hilos.
// 3. Conserva mensajes independientemente de quién sea el remitente.
// 4. Elimina posibles duplicados mediante el ID del mensaje.
// 5. Recupera el cuerpo mediante GmailApp.getPlainBody().
// 6. Si no existe texto plano, intenta recuperar HTML.
// 7. Genera un TXT.
// 8. El TXT se descarga localmente desde el navegador.
// 9. NO guarda archivos en Google Drive.
//
// ============================================================


// ============================================================
// CONFIGURACIÓN GENERAL
// ============================================================

const FECHA_INICIAL = "2026/08/01";
const FECHA_FINAL = "2026/09/01";

const ANIO = 2026;
const MES = 8; // Agosto

const NOMBRE_ARCHIVO =
  "CORREOS_AGOSTO_2026.txt";


// ============================================================
// APLICACIÓN WEB
// ============================================================

function doGet() {

  const html = `
  <!DOCTYPE html>

  <html>

    <head>

      <base target="_top">

      <meta charset="UTF-8">

      <style>

        body {
          font-family: Arial, sans-serif;
          max-width: 750px;
          margin: 50px auto;
          padding: 20px;
          line-height: 1.5;
        }

        h2 {
          margin-bottom: 10px;
        }

        button {
          font-size: 16px;
          padding: 12px 20px;
          cursor: pointer;
        }

        #estado {
          margin-top: 20px;
          font-weight: bold;
        }

        #detalle {
          margin-top: 10px;
          white-space: pre-line;
        }

      </style>

    </head>

    <body>

      <h2>
        Exportar correos de agosto de 2026
      </h2>

      <p>
        Este proceso buscará los hilos asociados a correos
        enviados durante agosto de 2026 y descargará los
        mensajes encontrados en un único archivo TXT.
      </p>

      <p>
        El archivo se descargará directamente en este
        computador. No se guardará en Google Drive.
      </p>

      <button
        id="boton"
        onclick="generarArchivo()"
      >
        Generar archivo TXT
      </button>

      <div id="estado"></div>

      <div id="detalle"></div>


      <script>

        function generarArchivo() {

          const boton =
            document.getElementById("boton");

          const estado =
            document.getElementById("estado");

          const detalle =
            document.getElementById("detalle");

          boton.disabled = true;

          estado.innerText =
            "Procesando correos. Espera un momento...";

          detalle.innerText = "";

          google.script.run

            .withSuccessHandler(
              function(resultado) {

                estado.innerText =
                  "Proceso completado.";

                detalle.innerText =
                  "Hilos encontrados: " +
                  resultado.hilos +
                  "\\n" +
                  "Mensajes exportados: " +
                  resultado.mensajes +
                  "\\n" +
                  "Con cuerpo recuperado: " +
                  resultado.conCuerpo +
                  "\\n" +
                  "Sin cuerpo recuperado: " +
                  resultado.sinCuerpo +
                  "\\n" +
                  "Errores: " +
                  resultado.errores;

                // ==============================================
                // CREAR TXT LOCALMENTE EN EL NAVEGADOR
                // ==============================================

                const blob =
                  new Blob(
                    [resultado.contenido],
                    {
                      type:
                        "text/plain;charset=utf-8"
                    }
                  );

                const url =
                  URL.createObjectURL(blob);

                const enlace =
                  document.createElement("a");

                enlace.href = url;

                enlace.download =
                  resultado.nombreArchivo;

                document.body.appendChild(
                  enlace
                );

                enlace.click();

                document.body.removeChild(
                  enlace
                );

                URL.revokeObjectURL(url);

                boton.disabled = false;

              }
            )

            .withFailureHandler(
              function(error) {

                estado.innerText =
                  "Se produjo un error.";

                detalle.innerText =
                  error.message;

                boton.disabled = false;

              }
            )

            .generarContenidoCorreos();

        }

      </script>

    </body>

  </html>
  `;

  return HtmlService
    .createHtmlOutput(html)
    .setTitle(
      "Exportar correos agosto 2026"
    );

}


// ============================================================
// GENERAR CONTENIDO
// ============================================================

function generarContenidoCorreos() {

  const consulta =
    "in:sent after:" +
    FECHA_INICIAL +
    " before:" +
    FECHA_FINAL;

  Logger.log(
    "Buscando correos..."
  );

  Logger.log(
    "Consulta: " +
    consulta
  );


  // ============================================================
  // BUSCAR HILOS
  // ============================================================

  const hilos =
    GmailApp.search(
      consulta
    );

  Logger.log(
    "Hilos encontrados: " +
    hilos.length
  );


  // ============================================================
  // FECHAS EXACTAS DEL PERIODO
  // ============================================================

  const fechaInicial =
    new Date(
      ANIO,
      MES - 1,
      1,
      0,
      0,
      0
    );

  const fechaFinal =
    new Date(
      ANIO,
      MES,
      1,
      0,
      0,
      0
    );


  // ============================================================
  // RECUPERAR MENSAJES DE LOS HILOS
  // ============================================================

  let mensajes = [];


  for (
    let i = 0;
    i < hilos.length;
    i++
  ) {

    const mensajesHilo =
      hilos[i].getMessages();


    for (
      let j = 0;
      j < mensajesHilo.length;
      j++
    ) {

      const mensaje =
        mensajesHilo[j];

      const fecha =
        mensaje.getDate();


      // ========================================================
      // SOLO MENSAJES DEL PERIODO
      //
      // NO filtramos por remitente.
      // Pueden ser enviados o recibidos dentro del hilo.
      // ========================================================

      if (
        fecha >= fechaInicial &&
        fecha < fechaFinal
      ) {

        mensajes.push(
          mensaje
        );

      }

    }

  }


  // ============================================================
  // ELIMINAR POSIBLES DUPLICADOS
  // ============================================================

  const idsVistos = {};

  mensajes =
    mensajes.filter(
      function(mensaje) {

        const id =
          mensaje.getId();

        if (
          idsVistos[id]
        ) {

          return false;

        }

        idsVistos[id] = true;

        return true;

      }
    );


  // ============================================================
  // ORDENAR DE MÁS RECIENTE A MÁS ANTIGUO
  // ============================================================

  mensajes.sort(
    function(a, b) {

      return (
        b.getDate().getTime() -
        a.getDate().getTime()
      );

    }
  );


  Logger.log(
    "Mensajes únicos a procesar: " +
    mensajes.length
  );


  // ============================================================
  // CREAR CABECERA DEL TXT
  // ============================================================

  let salida = "";

  salida +=
    "EXPORTACIÓN DE CORREOS - AGOSTO 2026\n";

  salida +=
    "========================================\n\n";

  salida +=
    "Periodo analizado: 01/08/2026 - 31/08/2026\n";

  salida +=
    "Hilos encontrados: " +
    hilos.length +
    "\n";

  salida +=
    "Mensajes incluidos: " +
    mensajes.length +
    "\n";

  salida +=
    "Fecha de generación: " +
    Utilities.formatDate(
      new Date(),
      "America/Bogota",
      "dd/MM/yyyy HH:mm:ss"
    ) +
    "\n";

  salida +=
    "\n";

  salida +=
    "=".repeat(100) +
    "\n\n";


  // ============================================================
  // CONTADORES DE CONTROL
  // ============================================================

  let conCuerpo = 0;
  let sinCuerpo = 0;
  let errores = 0;


  // ============================================================
  // PROCESAR MENSAJES
  // ============================================================

  for (
    let i = 0;
    i < mensajes.length;
    i++
  ) {

    try {

      const mensaje =
        mensajes[i];


      // ========================================================
      // METADATOS
      // ========================================================

      const fecha =
        Utilities.formatDate(
          mensaje.getDate(),
          "America/Bogota",
          "dd/MM/yyyy HH:mm:ss"
        );

      const de =
        mensaje.getFrom() || "";

      const para =
        mensaje.getTo() || "";

      const cc =
        mensaje.getCc() || "";

      const bcc =
        mensaje.getBcc() || "";

      const asunto =
        mensaje.getSubject() || "";


      // ========================================================
      // RECUPERAR CUERPO
      // ========================================================

      let cuerpo = "";


      try {

        cuerpo =
          mensaje.getPlainBody();

      } catch (
        errorPlain
      ) {

        Logger.log(
          "No se pudo recuperar PlainBody: " +
          (i + 1)
        );

      }


      // ========================================================
      // SI NO HAY TEXTO PLANO, INTENTAR HTML
      // ========================================================

      if (
        !cuerpo ||
        cuerpo.trim() === ""
      ) {

        try {

          const html =
            mensaje.getBody();

          if (html) {

            cuerpo =
              convertirHtmlATexto(
                html
              );

          }

        } catch (
          errorHtml
        ) {

          Logger.log(
            "No se pudo recuperar HTML: " +
            (i + 1)
          );

        }

      }


      // ========================================================
      // LIMPIEZA
      // ========================================================

      if (
        cuerpo &&
        cuerpo.trim() !== ""
      ) {

        cuerpo =
          limpiarTextoCorreo(
            cuerpo
          );

        conCuerpo++;

      } else {

        cuerpo =
          "[No fue posible recuperar el cuerpo del correo]";

        sinCuerpo++;

      }


      // ========================================================
      // AGREGAR MENSAJE AL TXT
      // ========================================================

      salida +=
        "=".repeat(100) +
        "\n";

      salida +=
        "CORREO " +
        (i + 1) +
        "\n";

      salida +=
        "=".repeat(100) +
        "\n";

      salida +=
        "FECHA: " +
        fecha +
        "\n";

      salida +=
        "DE: " +
        (
          de ||
          "[Sin remitente]"
        ) +
        "\n";

      salida +=
        "PARA: " +
        (
          para ||
          "[Sin destinatario]"
        ) +
        "\n";


      if (cc) {

        salida +=
          "CC: " +
          cc +
          "\n";

      }


      if (bcc) {

        salida +=
          "CCO: " +
          bcc +
          "\n";

      }


      salida +=
        "ASUNTO: " +
        (
          asunto ||
          "[Sin asunto]"
        ) +
        "\n";

      salida +=
        "-".repeat(100) +
        "\n\n";

      salida +=
        cuerpo +
        "\n\n";

      salida +=
        "=".repeat(100) +
        "\n\n";


      // ========================================================
      // PROGRESO EN REGISTRO
      // ========================================================

      if (
        (i + 1) % 25 === 0
      ) {

        Logger.log(
          "Procesados " +
          (i + 1) +
          " de " +
          mensajes.length
        );

      }

    } catch (
      error
    ) {

      errores++;

      Logger.log(
        "Error en correo " +
        (i + 1) +
        ": " +
        error.toString()
      );


      salida +=
        "=".repeat(100) +
        "\n";

      salida +=
        "CORREO " +
        (i + 1) +
        "\n";

      salida +=
        "=".repeat(100) +
        "\n";

      salida +=
        "[ERROR AL PROCESAR ESTE CORREO]\n";

      salida +=
        error.toString() +
        "\n\n";

    }

  }


  // ============================================================
  // RESUMEN FINAL
  // ============================================================

  salida +=
    "\n";

  salida +=
    "=".repeat(100) +
    "\n";

  salida +=
    "RESUMEN DE CONTROL\n";

  salida +=
    "=".repeat(100) +
    "\n";

  salida +=
    "HILOS ENCONTRADOS: " +
    hilos.length +
    "\n";

  salida +=
    "MENSAJES EXPORTADOS: " +
    mensajes.length +
    "\n";

  salida +=
    "CON CUERPO RECUPERADO: " +
    conCuerpo +
    "\n";

  salida +=
    "SIN CUERPO RECUPERADO: " +
    sinCuerpo +
    "\n";

  salida +=
    "CON ERROR: " +
    errores +
    "\n";

  salida +=
    "=".repeat(100) +
    "\n";


  // ============================================================
  // REGISTRO: SOLO RESUMEN
  // ============================================================

  Logger.log(
    "Proceso terminado."
  );

  Logger.log(
    "Mensajes exportados: " +
    mensajes.length
  );

  Logger.log(
    "Con cuerpo: " +
    conCuerpo
  );

  Logger.log(
    "Sin cuerpo: " +
    sinCuerpo
  );

  Logger.log(
    "Errores: " +
    errores
  );


  // ============================================================
  // DEVOLVER INFORMACIÓN AL NAVEGADOR
  // ============================================================

  return {

    nombreArchivo:
      NOMBRE_ARCHIVO,

    contenido:
      salida,

    hilos:
      hilos.length,

    mensajes:
      mensajes.length,

    conCuerpo:
      conCuerpo,

    sinCuerpo:
      sinCuerpo,

    errores:
      errores

  };

}


// ============================================================
// CONVERTIR HTML A TEXTO
// ============================================================

function convertirHtmlATexto(
  html
) {

  if (!html) {

    return "";

  }

  let texto =
    String(html);


  // ============================================================
  // ELIMINAR SCRIPT Y STYLE
  // ============================================================

  texto =
    texto.replace(
      /<script[\s\S]*?<\/script>/gi,
      ""
    );

  texto =
    texto.replace(
      /<style[\s\S]*?<\/style>/gi,
      ""
    );


  // ============================================================
  // SALTOS DE LÍNEA
  // ============================================================

  texto =
    texto.replace(
      /<br\s*\/?>/gi,
      "\n"
    );

  texto =
    texto.replace(
      /<\/p>/gi,
      "\n\n"
    );

  texto =
    texto.replace(
      /<\/div>/gi,
      "\n"
    );

  texto =
    texto.replace(
      /<\/tr>/gi,
      "\n"
    );

  texto =
    texto.replace(
      /<\/li>/gi,
      "\n"
    );

  texto =
    texto.replace(
      /<\/h[1-6]>/gi,
      "\n\n"
    );


  // ============================================================
  // TABLAS
  // ============================================================

  texto =
    texto.replace(
      /<\/td>/gi,
      " | "
    );

  texto =
    texto.replace(
      /<\/th>/gi,
      " | "
    );


  // ============================================================
  // ELIMINAR ETIQUETAS HTML
  // ============================================================

  texto =
    texto.replace(
      /<[^>]+>/g,
      ""
    );


  // ============================================================
  // ENTIDADES HTML COMUNES
  // ============================================================

  texto =
    texto.replace(
      /&nbsp;/gi,
      " "
    );

  texto =
    texto.replace(
      /&amp;/gi,
      "&"
    );

  texto =
    texto.replace(
      /&lt;/gi,
      "<"
    );

  texto =
    texto.replace(
      /&gt;/gi,
      ">"
    );

  texto =
    texto.replace(
      /&quot;/gi,
      "\""
    );

  texto =
    texto.replace(
      /&#39;/gi,
      "'"
    );

  texto =
    texto.replace(
      /&apos;/gi,
      "'"
    );


  // ============================================================
  // ENTIDADES NUMÉRICAS
  // ============================================================

  texto =
    texto.replace(
      /&#(\d+);/g,
      function(
        match,
        numero
      ) {

        try {

          return String.fromCodePoint(
            parseInt(
              numero,
              10
            )
          );

        } catch (
          error
        ) {

          return match;

        }

      }
    );


  texto =
    texto.replace(
      /&#x([0-9a-f]+);/gi,
      function(
        match,
        numero
      ) {

        try {

          return String.fromCodePoint(
            parseInt(
              numero,
              16
            )
          );

        } catch (
          error
        ) {

          return match;

        }

      }
    );


  return limpiarTextoCorreo(
    texto
  );

}


// ============================================================
// LIMPIAR TEXTO
// ============================================================

function limpiarTextoCorreo(
  texto
) {

  if (!texto) {

    return "";

  }


  texto =
    String(texto);


  // ============================================================
  // NORMALIZAR SALTOS
  // ============================================================

  texto =
    texto.replace(
      /\r\n/g,
      "\n"
    );

  texto =
    texto.replace(
      /\r/g,
      "\n"
    );


  // ============================================================
  // TABS
  // ============================================================

  texto =
    texto.replace(
      /\t+/g,
      " "
    );


  // ============================================================
  // ESPACIOS ANTES DE SALTO
  // ============================================================

  texto =
    texto.replace(
      /[ \t]+\n/g,
      "\n"
    );


  // ============================================================
  // DEMASIADOS SALTOS DE LÍNEA
  // ============================================================

  texto =
    texto.replace(
      /\n{4,}/g,
      "\n\n\n"
    );


  return texto.trim();

}
