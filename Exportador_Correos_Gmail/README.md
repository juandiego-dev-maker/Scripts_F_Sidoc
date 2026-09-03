# Exportador de correos de Gmail a TXT

Script desarrollado en **Google Apps Script** para exportar correos de Gmail correspondientes a un período determinado y consolidarlos en un único archivo TXT.

El propósito de esta herramienta es facilitar la recopilación y posterior análisis de correos relacionados con actividades de monitoreo y seguimiento, permitiendo utilizar la información como insumo para la elaboración de reportes y seguimiento de actividades.

## ¿Qué hace el script?

El script:

- Busca los hilos de Gmail asociados a correos enviados durante el período seleccionado.
- Recupera los mensajes correspondientes al período dentro de dichos hilos.
- Incluye tanto mensajes enviados como recibidos dentro de los hilos identificados.
- Recupera el cuerpo de los correos en texto plano.
- Utiliza el contenido HTML como alternativa cuando no encuentra texto plano.
- Elimina posibles mensajes duplicados mediante el ID de Gmail.
- Ordena los mensajes desde el más reciente hasta el más antiguo.
- Exporta la fecha y hora, remitente, destinatarios, CC/CCO, asunto y cuerpo del mensaje.
- Genera un archivo TXT consolidado.
- Permite descargar el TXT directamente desde el navegador.
- No utiliza Google Drive para almacenar el archivo generado.

## Archivos del proyecto

### `Exportador_Correos_Gmail_TXT.gs`

Contiene la lógica principal del programa y la interfaz de la aplicación web utilizada para generar y descargar el archivo TXT.

### `appsscript.json`

Contiene la configuración del proyecto de Google Apps Script, incluyendo zona horaria, servicios habilitados, permisos OAuth y entorno de ejecución.

## Configuración del período

La versión almacenada inicialmente fue utilizada para exportar los correos correspondientes a **agosto de 2026**.

Las siguientes variables permiten modificar el período:

```javascript
const FECHA_INICIAL = "2026/08/01";
const FECHA_FINAL = "2026/09/01";

const ANIO = 2026;
const MES = 8;

const NOMBRE_ARCHIVO = "CORREOS_AGOSTO_2026.txt";
```

Para utilizar el script con otro mes deben actualizarse estas variables.

## Implementación en Google Apps Script

1. Crear un proyecto en Google Apps Script.
2. Incorporar el contenido de `Exportador_Correos_Gmail_TXT.gs`.
3. Configurar el archivo `appsscript.json`.
4. Configurar los servicios y permisos requeridos por Gmail.
5. Implementar el proyecto como una **Aplicación web**.
6. Configurar la aplicación para ejecutarse con la cuenta propietaria.
7. Para uso personal, restringir el acceso a **Solo yo**.
8. Abrir la URL de la aplicación web.
9. Seleccionar **Generar archivo TXT**.
10. Esperar a que finalice el procesamiento y descargar el archivo generado.

> **Nota técnica:** antes de reutilizar el proyecto en otra cuenta o reconstruirlo desde GitHub, conviene revisar que los permisos OAuth declarados en `appsscript.json` sean compatibles con los servicios utilizados por la versión del script.

## Resultado

El archivo generado presenta cada mensaje con una estructura similar a:

```text
CORREO 1
====================================================================================================

FECHA: ...
DE: ...
PARA: ...
CC: ...
ASUNTO: ...
----------------------------------------------------------------------------------------------------

Contenido del correo...
```

Al finalizar, el TXT incluye un resumen de control con:

- Hilos encontrados.
- Mensajes exportados.
- Mensajes con cuerpo recuperado.
- Mensajes sin cuerpo recuperado.
- Errores encontrados.

## Caso de prueba inicial

La primera ejecución completa utilizada para validar el funcionamiento del script correspondió a **agosto de 2026**.

El proceso identificó:

- **93 hilos**
- **194 mensajes**

Los cuerpos de los correos fueron recuperados correctamente y el archivo TXT resultante pudo utilizarse posteriormente como fuente para analizar y resumir las actividades desarrolladas durante el período.

## Privacidad y seguridad

El repositorio debe contener únicamente el código y su documentación.

**No se deben subir a GitHub los archivos TXT generados con correos reales**, ya que pueden contener nombres, direcciones de correo electrónico, información laboral, datos personales y otra información confidencial.

Tampoco deben publicarse:

- Contraseñas.
- Credenciales.
- Tokens de acceso.
- URLs privadas de implementación.
- Archivos TXT generados con correos reales.
- Otra información sensible o confidencial.

## Tecnologías utilizadas

- Google Apps Script
- Gmail
- JavaScript
- HTML
- TXT

## Uso

Herramienta desarrollada para apoyar procesos internos de **monitoreo, seguimiento, sistematización y elaboración de reportes**.
