# -*- coding: utf-8 -*-
# ============================================================
# SCRIPT: Creación masiva de carpetas desde Excel
# AUTOR: Juan Diego Segura Zapata
# DESCRIPCIÓN: Lee un archivo Excel con nombres y cédulas de
# participantes de un programa social y crea automáticamente
# una carpeta individual por cada uno.
# ============================================================

import pandas as pd  # Para leer el archivo Excel
import os            # Para crear las carpetas en el sistema

# Ruta del archivo Excel con el listado de participantes
archivo = r"C:\Users\USUARIO\Downloads\Nombre_completo_-_Cedulas_Prueba.xlsx"

# Carpeta principal donde se crearán las subcarpetas
carpeta_destino = r"C:\Users\USUARIO\Downloads\Prueba nombres"

# Leer el Excel y cargar todos los registros
df = pd.read_excel(archivo)

# Crear la carpeta principal si no existe
os.makedirs(carpeta_destino, exist_ok=True)

# Recorrer cada fila del Excel y crear una carpeta por participante
for _, fila in df.iterrows():
    nombre_carpeta = str(fila["Nombre completo - Cédula"]).strip()
    os.makedirs(os.path.join(carpeta_destino, nombre_carpeta), exist_ok=True)
    print(f"Creada: {nombre_carpeta}")