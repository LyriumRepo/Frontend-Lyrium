import os

# 👉 CAMBIA ESTA RUTA
ruta_proyecto = r"C:\xampp\htdocs\fe-001-marketplace-admin-dev-jean2"

# Archivo de salida
archivo_salida = "documento_final.txt"

with open(archivo_salida, "w", encoding="utf-8") as salida:

    for carpeta, subcarpetas, archivos in os.walk(ruta_proyecto):
        for archivo in archivos:

            # 👉 Filtra tipos de archivo (puedes agregar más)
            if archivo.endswith((".js", ".ts", ".tsx", ".html", ".css", ".py")):

                ruta_completa = os.path.join(carpeta, archivo)

                salida.write("\n" + "="*80 + "\n")
                salida.write(f"ARCHIVO: {archivo}\n")
                salida.write(f"RUTA: {ruta_completa}\n")
                salida.write("="*80 + "\n\n")

                try:
                    with open(ruta_completa, "r", encoding="utf-8") as f:
                        contenido = f.read()
                        salida.write(contenido)
                        salida.write("\n\n")
                except Exception as e:
                    salida.write(f"ERROR al leer archivo: {e}\n")

print("✅ Documento generado correctamente.")