document.addEventListener("DOMContentLoaded", () => {
  const pokemon = document.getElementById("pokemon");
  const bton = document.getElementById("bton");
  const createPokemon = document.getElementById("createSection");
  const radios = document.querySelectorAll('input[name="pokemon-choice"]');
  const suggest = document.getElementById("suggest");
  const btonComparate = document.getElementById("comparate");
  const cache = {};
  const pokemonSave = [];
  const container = document.getElementById("container");

  let c = 0;

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
    const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=2000");
    const data = await response.json();

    pokemonList = data.results.map((pokemon) => pokemon.name);
  }

  loadPokemons();

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        pokemonSelect = radio.value;
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

  function createPokememonSection() {
    const section = document.createElement("div");
    section.id = `section${c}`;
    section.classList.add("pokemon-card", selector === "2" ? "red-card" : "blue-card");
    container.appendChild(section);

    return section;
  }

  function getFreeSection() {
    const freeSection = [...container.children].find(
      (section) => section.children.length === 0 && section.id.startsWith("section")
    );

    return freeSection || createPokememonSection();
  }

  // createPokemon.addEventListener("click", () => {
  //   c += 1;
  //   createPokememonSection();
  // });

  function pokemonSe(pokemonSelect) {
    selector = pokemonSelect === "pokemon1" ? "1" : "2";
  }

  bton.addEventListener("click", async (e) => {
    e.preventDefault();

    const nameP = String(pokemon.value);
    const pokemons = { name: nameP };

    if (nameP === "") {
      return;
    }

    const section = getFreeSection();

    if (cache[nameP]) {
      showData(cache[nameP], section);
      return;
    }

    try {
      const response = await fetch("/procesar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pokemons }),
      });

      const data = await response.json();
      const datos = data.pokemon;

      cache[nameP] = datos;
      showData(datos, section);
    } catch (error) {
      return;
    }
  });

  function showData(datos, section) {
    let stat = [];

    if (section.children.length > 0) {
      alert("Ya se ha escrito un Pokémon aquí.");
      return;
    }

    section.innerHTML = "";

    orden.forEach((key) => {
      const etiqueta = traducciones[key] || key;
      const value = datos[key];

      if (key === "url_imagen") {
        const image = document.createElement("img");
        image.className = "pokemon-image";
        image.src = value;
        image.alt = `${datos.name} image`;
        section.appendChild(image);
        return;
      }

      const text = document.createElement("span");

      if (Array.isArray(value)) {
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

        if (key === "stats") {
          const statsList = document.createElement("ul");
          statsList.className = "stats-list";

          datos.stats.forEach((stats) => {
            const item = document.createElement("li");
            item.className = "stats-item";
            item.textContent = `${stats.name.charAt(0).toUpperCase() + stats.name.slice(1)}: ${stats.base_stat}`;

            stat.push({
              name: stats.name,
              stat: stats.base_stat,
            });

            statsList.appendChild(item);
          });

          section.appendChild(statsList);
          return;
        }

        text.textContent = `${etiqueta}: ${value.join(", ")}`;
      } else {
        text.textContent = `${etiqueta}: ${value}`;
      }

      section.appendChild(text);
    });

    const idb = Date.now();

    pokemonSave[idb] = {
      idb: idb,
      name: datos.name,
      id: datos.id,
      stat: stat,
    };

    btonComparate.addEventListener("click", comparatePokemons);

    const deleteBton = document.createElement("button");
    deleteBton.textContent = "Delete";

    deletePokemon(deleteBton, section, idb);
    section.appendChild(deleteBton);
    c += 1;
  }

  function deletePokemon(deleteBton, section, idb) {
    deleteBton.addEventListener("click", () => {
      section.innerHTML = "";
      delete pokemonSave[idb];
      pokemonSave.splice[(idb, 1)];
    });
  }

  function comparatePokemons() {
    const pokemons = Object.values(pokemonSave);

    if (pokemons.length < 2) {
      alert("Necesitas al menos 2 Pokémon para comparar.");
      return;
    }

    const resultados = pokemons.map((pokemon) => {
      const total = pokemon.stat.reduce((suma, stat) => {
        return suma + stat.stat;
      }, 0);

      return {
        ...pokemon,
        total,
      };
    });

    const ganador = resultados.reduce((mejor, pokemon) => {
      return pokemon.total > mejor.total ? pokemon : mejor;
    });

    alert(
      `🏆 Ganador: ${ganador.name}\n` +
      `Puntaje total: ${ganador.total}`
    );
  }
});
