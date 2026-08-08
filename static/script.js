document.addEventListener("DOMContentLoaded", () => {
  const section1 = document.getElementById("section1");
  const section2 = document.getElementById("section2");
  const pokemon = document.getElementById("pokemon");
  const bton = document.getElementById("bton");
  const radios = document.querySelectorAll('input[name="pokemon-choice"]');
  const suggest = document.getElementById("suggest");
  const btonComparate = document.getElementById("comparate");
  const cache = {};
  const pokemonSave = {};

  const orden = [
    "url_imagen",
    "name",
    "id",
    "types",
    "height",
    "weight",
    "abilities",
    "stats",
  ];

  const traducciones = {
    name: "Nombre",
    id: "Número en la Pokédex",
    height: "Altura",
    weight: "Peso",
    types: "Tipo",
  };

  let pokemonSelect = "pokemon1";
  let selector = "1";

  let pokemonList = [];

  async function loadPokemons() {
    const responce = await fetch(
      "https://pokeapi.co/api/v2/pokemon?limit=2000",
    );

    const data = await responce.json();

    pokemonList = data.results.map((pokemon) => pokemon.name);
    console.log("Pokemones cargados:", pokemonList.length);
  }

  loadPokemons();

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        pokemonSelect = radio.value;
        console.log("Opción seleccionada:", pokemonSelect);
      }

      pokemonSe(pokemonSelect);
    });
  });

  pokemon.addEventListener("input", () => {
    const texto = pokemon.value.toLowerCase().trim();

    suggest.innerHTML = "";

    if (!texto) return;

    const found = pokemonList
      .filter((name) => name.startsWith(texto))
      .slice(0, 5);

    found.forEach((name) => {
      const opcion = document.createElement("div");

      opcion.className = "opcion";
      opcion.textContent = name;

      opcion.addEventListener("click", () => {
        pokemon.value = name;
        suggest.innerHTML = "";

        bton.click();
      });
      suggest.appendChild(opcion);
    });
  });

  function pokemonSe(pokemonSelect) {
    selector = pokemonSelect === "pokemon1" ? "1" : "2";
  }
  function getSection() {
    return selector === "1" ? section1 : section2;
  }

  bton.addEventListener("click", async (e, p) => {
    e.preventDefault();

    let nameP = String(pokemon.value);
    let pokemons = {
      name: nameP,
    };

    if (cache[nameP]) {
      console.log("Datos obtenidos de la caché.");

      showData(cache[nameP]);

      return;
    }

    try {
      const responce = await fetch("/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pokemons,
        }),
      });

      const data = await responce.json();

      const datos = data.pokemon;

      cache[nameP] = datos;

      savePokemons(nameP, datos);

      console.log(cache);

      showData(datos);
    } catch (error) {
      console.error(error);
    }
  });

  function savePokemons(nameP, datos) {
    const section = getSection();
  }

  function showData(datos) {
    const section = getSection();
    let stat = [];

    if (section.children.length > 0) {
      alert("Ya se ha escrito un Pokémon aquí.");
      return;
    }

    section.innerHTML = "";

    orden.forEach((key) => {
      const etiqueta = traducciones[key] || key;
      const value = datos[key];

      //=========================
      // IMAGEN
      //=========================

      if (key === "url_imagen") {
        const image = document.createElement("img");

        image.className = "pokemon-image";

        image.src = value;

        image.alt = `${datos.name} image`;

        section.appendChild(image);

        return;
      }

      const text = document.createElement("span");

      //=========================
      // SI ES UN ARREGLO
      //=========================

      if (Array.isArray(value)) {
        // Habilidades
        if (key === "abilities") {
          const skillsList = document.createElement("ul");

          skillsList.className = "abilities-list";

          datos.abilities.forEach((ability, i) => {
            const item = document.createElement("li");

            item.className = "ability-item";

            item.textContent = `Habilidad ${i + 1}: ${ability.name.charAt(0).toUpperCase() + ability.name.slice(1)} ${ability.is_hidden ? "(hidden)" : ""}`;

            skillsList.appendChild(item);
          });

          section.appendChild(skillsList);

          return;
        }

        // Estadísticas
        if (key === "stats") {
          const statsList = document.createElement("ul");

          statsList.className = "stats-list";

          datos.stats.forEach((stats) => {
            const item = document.createElement("li");

            item.className = "stats-item";

            item.textContent = `${stats.name.charAt(0).toUpperCase() + stats.name.slice(1)}: ${stats.base_stat}`;

            stat.push({
              id: selector,
              name: stats.name,
              stat: stats.base_stat,
            });
            console.log(stat);

            statsList.appendChild(item);
          });

          section.appendChild(statsList);

          return;
        }

        // Tipos
        text.textContent = `${etiqueta}: ${value.join(", ")}`;
      } else {
        // Datos normales
        text.textContent = `${etiqueta}: ${value}`;
      }
      section.appendChild(text);
    });
    pokemonSave[selector] = stat;

    btonComparate.addEventListener("click", comparatePokemons);

    console.log(pokemonSave);
    const deleteBton = document.createElement("button");
    deleteBton.textContent = "Delete";
    const currentSelector = selector;
    deletePokemon(deleteBton, section, currentSelector);
    section.appendChild(deleteBton);
  }

  function deletePokemon(deleteBton, section, currentSelector) {
    deleteBton.addEventListener("click", () => {
      section.innerHTML = "";
      delete pokemonSave[currentSelector];
    });
  }

  function comparatePokemons() {
    let countP1 = 0;
    let countP2 = 0;
    if (!pokemonSave[1] || !pokemonSave[2]) {
      return;
    }
    pokemonSave[1].forEach((pokemon, index) => {
      const stat1 = pokemon.stat;
      const stat2 = pokemonSave[2][index].stat;

      if (stat1 > stat2) {
        console.log(`${pokemon.name}: gana el primero`);
        countP1 += 1;
      } else if (stat2 > stat1) {
        console.log(`${pokemon.name}: gana el segundo`);
        countP2 += 1;
      } else {
        console.log(`${pokemon.name}: empate`);
      }
      console.log(countP1, " ", countP2);
    });
    if (countP1 > countP2) {
      alert(`Gna el primero`);
    } else if (countP2 > countP1) {
      alert(`Gana el segundo`);
    } else {
      alert("Empate");
    }
  }
});
