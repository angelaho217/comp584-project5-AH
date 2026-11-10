// ---------- Grab elements from the DOM ----------
const grid = document.querySelector(".pokemon-grid");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const randomButton = document.querySelector("#random-button");
const message = document.querySelector(".message");

const API_URL = "https://pokeapi.co/api/v2/pokemon/";

// Each Pokémon type gets its own color for the top of the card
const typeColors = {
  normal: "#a8a77a", fire: "#ee8130", water: "#6390f0", electric: "#f7d02c",
  grass: "#7ac74c", ice: "#96d9d6", fighting: "#c22e28", poison: "#a33ea1",
  ground: "#e2bf65", flying: "#a98ff3", psychic: "#f95587", bug: "#a6b91a",
  rock: "#b6a136", ghost: "#735797", dragon: "#6f35fc", dark: "#705746",
  steel: "#b7b7ce", fairy: "#d685ad"
};

// Used so old requests don't add cards after a newer search/random click
let currentLoad = 0;

// ---------- Helpers ----------

// Default parameter: with no text, the message is cleared
function showMessage(text = "") {
  message.innerText = text;
}

// ---------- API (fetch + promise chaining) ----------

// Default parameter: if nothing is passed in, ask for Pokémon number 1
function getPokemon(nameOrId = 1) {
  return fetch(API_URL + String(nameOrId).toLowerCase())
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Pokémon not found");
      }
      return response.json(); // also asynchronous, so we return the promise
    });
}

// ---------- Display ----------

// Object destructuring right in the function parameters:
// we only pull out the keys we need from the big Pokémon object
function makeCard({ id, name, height, weight, types, sprites }) {
  const typeNames = types.map((item) => item.type.name);

  // Array destructuring: grab just the first type
  const [mainType] = typeNames;

  const picture = sprites.other["official-artwork"].front_default || sprites.front_default;

  const card = document.createElement("div");
  card.classList.add("card");
  card.style.borderTop = `8px solid ${typeColors[mainType]}`;

  // Template string: variables go straight into the HTML
  card.innerHTML = `
    <img src="${picture}" alt="${name}">
    <h2>${name}</h2>
    <p>#${id}</p>
    <p>Type: ${typeNames.join(", ")}</p>
    <p>Height: ${height / 10} m | Weight: ${weight / 10} kg</p>
  `;
  return card;
}

// Add one card to the page and animate it in with anime.js
function addCard(pokemon) {
  const card = makeCard(pokemon);
  card.style.opacity = 0;
  grid.appendChild(card);

  anime({
    targets: card,
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 700,
    easing: "easeOutBack"
  });
}

// ---------- Actions ----------

// Default parameter: loads 12 Pokémon unless told otherwise
function loadRandom(count = 12) {
  currentLoad++;
  const thisLoad = currentLoad;

  showMessage("Loading...");
  grid.innerHTML = "";

  // Pick random numbers (1-151) with no repeats
  let ids = [];
  while (ids.length < count) {
    const id = Math.floor(Math.random() * 151) + 1;
    if (!ids.includes(id)) {
      ids = [...ids, id]; // spread: copy the old array and add the new id
    }
  }

  // Ask for each Pokémon; cards pop in as the answers arrive
  ids.forEach((id) => {
    getPokemon(id)
      .then((pokemon) => {
        if (thisLoad === currentLoad) {
          showMessage();
          addCard(pokemon);
        }
      })
      .catch(() => {
        if (thisLoad === currentLoad) {
          showMessage("Could not load Pokémon. Try again!");
        }
      });
  });
}

// Search for one Pokémon by name or number
function searchPokemon() {
  let text = searchInput.value.trim();

  // Let people type #25 as well as 25
  if (text.startsWith("#")) {
    text = text.substring(1);
  }

  if (text === "") {
    showMessage("Type a name or number first.");
    return;
  }

  currentLoad++;
  showMessage("Searching...");

  getPokemon(text)
    .then((pokemon) => {
      showMessage();
      grid.innerHTML = "";
      addCard(pokemon);
    })
    .catch(() => {
      showMessage(`No Pokémon found for "${text}".`);
    });
}

// ---------- Events (arrow functions) ----------

searchButton.addEventListener("click", searchPokemon);
randomButton.addEventListener("click", () => loadRandom());

// Pressing Enter in the search box also searches
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    searchPokemon();
  }
});

// Event delegation: one listener on the grid for every card.
// Clicking a card makes its picture spin and bounce (anime.js).
grid.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (card) {
    anime({
      targets: card.querySelector("img"),
      rotate: [0, 360],
      scale: [1, 1.3, 1],
      duration: 900,
      easing: "easeOutElastic(1, .6)"
    });
  }
});

// ---------- Start ----------

// Animate the title when the page loads
anime({
  targets: ".header h1",
  translateY: [-60, 0],
  opacity: [0, 1],
  duration: 1200,
  easing: "easeOutElastic(1, .6)"
});

loadRandom();
