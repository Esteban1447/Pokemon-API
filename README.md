# API Pokémon 3.0

Aplicación web simple con Flask y la PokéAPI para buscar, mostrar y comparar Pokémon.

## Funcionalidades

- Buscar un Pokémon por nombre.
- Mostrar información básica del Pokémon:
  - nombre
  - número de la Pokédex
  - tipo
  - altura
  - peso
  - habilidades
  - estadísticas
  - imagen
- Mostrar sugerencias mientras escribes.
- Comparar dos o más Pokémon por su puntaje total.

## Tecnologías

- Python
- Flask
- JavaScript
- PokéAPI
- HTML / CSS

## Requisitos

- Python 3.9 o superior
- pip

## Instalación

1. Clona o descarga este proyecto.
2. Entra en la carpeta del proyecto.
3. Crea y activa un entorno virtual:

   python -m venv env
   .\env\Scripts\Activate.ps1

4. Instala las dependencias:

   pip install flask requests

## Ejecución

Desde la raíz del proyecto, ejecuta:

   python app.py

Luego abre en el navegador:

   http://localhost:5000

## Estructura del proyecto

- app.py: servidor Flask y lógica de la API.
- templates/index.html: interfaz principal.
- static/styles.css: estilos de la aplicación.
- static/script.js: lógica del frontend.

## Nota

Esta aplicación consume la PokéAPI en tiempo real. Si un Pokémon no existe o la petición falla, la respuesta se maneja con un mensaje de error.
