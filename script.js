// Get the elements from the page
const grid = document.querySelector(".pokemon-grid");
const searchInput = document.querySelector("#search-input");
const searchButton = document.querySelector("#search-button");
const showAllButton = document.querySelector("#random-button");
const message = document.querySelector(".message");

const API_URL = "https://pokeapi.co/api/v2/pokemon/";

// Add one Pokémon card to the page
function showPokemon(pokemon) {
  const card = document.createElement("div");
  card.classList.add("card");

  card.innerHTML = `
    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
    <h2>${pokemon.name}</h2>
    <p>#${pokemon.id}</p>
    <p>Type: ${pokemon.types[0].type.name}</p>
    <p>Height: ${pokemon.height / 10} m</p>
    <p>Weight: ${pokemon.weight / 10} kg</p>
  `;

  grid.appendChild(card);

  // Animation: the card fades in and slides up
  anime({
    targets: card,
    opacity: [0, 1],
    translateY: [50, 0],
    duration: 700
  });
}

// Get one Pokémon from the API (by name or number)
function getPokemon(nameOrNumber) {
  fetch(API_URL + nameOrNumber)
    .then(function (response) {
      return response.json();
    })
    .then(function (pokemon) {
      message.innerText = "";
      showPokemon(pokemon);
    })
    .catch(function () {
      message.innerText = "Pokémon not found. Try again!";
    });
}

// Show 12 random Pokémon (numbers 1-151, no repeats)
function showRandomTwelve() {
  grid.innerHTML = "";
  message.innerText = "";

  const numbers = [];
  while (numbers.length < 12) {
    const number = Math.floor(Math.random() * 151) + 1;
    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  numbers.forEach(function (number) {
    getPokemon(number);
  });
}

// Search for one Pokémon
function search() {
  const text = searchInput.value.toLowerCase().trim();
  if (text === "") {
    message.innerText = "Type a name or number first.";
  } else {
    grid.innerHTML = "";
    getPokemon(text);
  }
}

// Click events
searchButton.addEventListener("click", search);
randomButton.addEventListener("click", showRandomTwelve);

// Pressing Enter also searches
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    search();
  }
});

// Click a card: its picture spins (event delegation)
grid.addEventListener("click", function (event) {
  const card = event.target.closest(".card");
  if (card) {
    anime({
      targets: card.querySelector("img"),
      rotate: [0, 360],
      duration: 800
    });
  }
});

// Animation: the title drops in when the page loads
anime({
  targets: ".header h1",
  translateY: [-60, 0],
  opacity: [0, 1],
  duration: 1000
});

showRandomTwelve();