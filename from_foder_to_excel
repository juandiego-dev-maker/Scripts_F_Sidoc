import os
import pandas as pd

carpeta = r"C:\Users\USUARIO\Downloads\TESIS MAESTRÍA\CIP INVERSIONES SAS\INFORMACIÓN CONTABLE Y FINANCIERA"

archivos = [
    archivo for archivo in os.listdir(carpeta)
    if os.path.isfile(os.path.join(carpeta, archivo))
]

print(f"Archivos encontrados: {archivos}")

df = pd.DataFrame({
    "Nombre del archivo": archivos
})

ruta_salida = os.path.join(carpeta, "listado_archivos_pdf.xlsx")
df.to_excel(ruta_salida, index=False, engine='openpyxl')

print(f"Excel creado con {len(archivos)} archivos.")
print(f"Ubicación: {ruta_salida}")
