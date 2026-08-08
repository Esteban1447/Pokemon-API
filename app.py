import requests
import json
from flask import Flask, render_template, request, jsonify

url_base = "https://pokeapi.co/api/v2/pokemon/"


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/procesar", methods=["POST"])
def procesar():

    data = request.get_json(silent=True) or {}

    pokemon = data.get("pokemons", "")

    nameP = pokemon.get("name", "").lower().strip()

    name = ""

    # pokemon = input("Elige tu Pokémon (o 'salir' para terminar): ").lower().strip()

    try:
        respuesta = requests.get(url_base + nameP)

        # Si la respuesta no es 200, lanzamos excepción
        respuesta.raise_for_status()

        datos = respuesta.json()

        name = datos["name"]
        id = datos["id"]
        weight = datos["weight"]
        height = datos["height"]

        abilities = []

        for habilidad in datos["abilities"]:
            abilities.append(
                {
                    "name": habilidad["ability"]["name"],
                    "is_hidden": habilidad["is_hidden"],
                }
            )

        tiposs = []

        for tipos in datos["types"]:
            tiposs.append(tipos["type"]["name"])

        stats = []

        for estadistica in datos["stats"]:
            stats.append(
                {
                    "name": estadistica["stat"]["name"],
                    "base_stat": estadistica["base_stat"],
                }
            )

        url_imagen = None

        url_imagen = datos["sprites"]["front_default"]
        respuesta_imagen = requests.get(url_imagen)
        with open(f"{pokemon}.png", "wb") as archivo:
            archivo.write(respuesta_imagen.content)

            print(
                {
                    "name": name,
                    "id": id,
                    "types": tiposs,
                    "height": height,
                    "weight": weight,
                    "abilities": abilities,
                    "stats": stats,
                }
            )

    except requests.exceptions.HTTPError as e:
        print("⚠️ Error en la petición:", e)
        print("Intenta con otro Pokémon...")
        return jsonify({"pokemon": {"name": "Pokemon no encontrado"}})

    except Exception as e:
        print("⚠️ Ocurrió un error inesperado:", e)
        print("El menú sigue activo.")

    return jsonify(
        {
            "pokemon": {
                "url_imagen": url_imagen,
                "name": name,
                "id": id,
                "types": tiposs,
                "height": height,
                "weight": weight,
                "abilities": abilities,
                "stats": stats,
            }
        }
    )


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
