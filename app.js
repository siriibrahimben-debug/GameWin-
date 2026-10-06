/* =========================================================
   GAMEWIN — APP.JS
   VERSION PROPRE — RECONSTRUCTION COMPLÈTE
========================================================= */

const defaultGames = [
  {
    name: "Quiz Culture Générale",
    icon: "🧠",
    points: 50,
    type: "quiz"
  },
  {
    name: "Puzzle",
    icon: "🧩",
    points: 40,
    type: "soon"
  },
  {
    name: "Défi Rapide",
    icon: "⚡",
    points: 60,
    type: "soon"
  },
  {
    name: "Tir de précision",
    icon: "🎯",
    points: 50,
    type: "soon"
  },
  {
    name: "Échecs",
    icon: "♟️",
    points: 70,
    type: "soon"
  },
  {
    name: "Tournoi",
    icon: "🏆",
    points: 100,
    type: "soon"
  },
  {
    name: "Devine le nombre",
    icon: "🔢",
    points: 50,
    type: "number"
  },
  {
    name: "Ludo",
    icon: "🎲",
    points: 100,
    type: "ludo"
  }
];

/* =========================================================
   QUESTIONS
========================================================= */

const questions = [
  {
    q: "Quelle est la capitale du Burkina Faso ?",
    a: [
      "Bobo-Dioulasso",
      "Ouagadougou",
      "Koudougou",
      "Banfora"
    ],
    c: 1
  },
  {
    q: "Combien font 7 × 8 ?",
    a: [
      "54",
      "56",
      "64",
      "48"
    ],
    c: 1
  },
  {
    q: "Quelle planète est surnommée la planète rouge ?",
    a: [
      "Mars",
      "Vénus",
      "Jupiter",
      "Mercure"
    ],
    c: 0
  },
  {
    q: "Combien y a-t-il de continents ?",
    a: [
      "5",
      "6",
      "7",
      "8"
    ],
    c: 2
  },
  {
    q: "Quel est le plus grand océan du monde ?",
    a: [
      "Atlantique",
      "Indien",
      "Arctique",
      "Pacifique"
    ],
    c: 3
  }
];

/* =========================================================
   DONNÉES
========================================================= */

const defaultRewards = [
  {
    name: "Badge Champion",
    cost: 500,
    icon: "🏅"
  },
  {
    name: "Carte cadeau",
    cost: 2000,
    icon: "🎁"
  },
  {
    name: "Accessoire gaming",
    cost: 5000,
    icon: "🎧"
  }
];

function loadJSON(key, fallback){

  try{

    const value = JSON.parse(
      localStorage.getItem(key)
    );

    return value;

  }catch(e){

    return fallback;

  }

}

/*
   IMPORTANT :
   Si l'ancien localStorage contient un tableau vide
   pour les jeux, on remet automatiquement les jeux
   par défaut.
*/

let games = loadJSON("games", null);

if(
  !Array.isArray(games) ||
  games.length === 0
){

  games = defaultGames.slice();

  localStorage.setItem(
    "games",
    JSON.stringify(games)
  );

}

let rewards = loadJSON(
  "rewards",
  defaultRewards.slice()
);

if(
  !Array.isArray(rewards) ||
  rewards.length === 0
){

  rewards = defaultRewards.slice();

}

let player = loadJSON(
  "player",
  {
    name: "Visiteur",
    points: 0
  }
);

if(
  !player ||
  typeof player !== "object"
){

  player = {
    name: "Visiteur",
    points: 0
  };

}

let rewardRequests = loadJSON(
  "rewardRequests",
  []
);

if(!Array.isArray(rewardRequests)){

  rewardRequests = [];

}

/* =========================================================
   SAUVEGARDE
========================================================= */

function saveData(){

  localStorage.setItem(
    "games",
    JSON.stringify(games)
  );

  localStorage.setItem(
    "rewards",
    JSON.stringify(rewards)
  );

  localStorage.setItem(
    "player",
    JSON.stringify(player)
  );

  localStorage.setItem(
    "rewardRequests",
    JSON.stringify(rewardRequests)
  );

  render();

}

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });

  const page =
    document.getElementById(id);

  if(page){

    page.classList.add("active");

  }

  if(id === "ranking"){

    renderRanking();

  }

  if(id === "rewards"){

    renderRewards();

  }

  if(id === "admin"){

    renderAdmin();

  }

  if(id === "ludoGame"){

    renderLudo();

  }

}

/* =========================================================
   AFFICHAGE PRINCIPAL
========================================================= */

function render(){

  const userArea =
    document.getElementById("userArea");

  if(userArea){

    userArea.innerHTML = `
      <button
        class="primary"
        onclick="openLogin()"
      >
        ${
          player.name === "Visiteur"
          ? "S'inscrire"
          : "👤 " + player.name
        }
      </button>
    `;

  }

  const statGames =
    document.getElementById("statGames");

  const statPlayers =
    document.getElementById("statPlayers");

  const statPoints =
    document.getElementById("statPoints");

  if(statGames){

    statGames.textContent =
      games.length;

  }

  if(statPlayers){

    statPlayers.textContent = "1";

  }

  if(statPoints){

    statPoints.textContent =
      player.points;

  }

  const aGames =
    document.getElementById("aGames");

  const aPlayers =
    document.getElementById("aPlayers");

  const aPoints =
    document.getElementById("aPoints");

  if(aGames){

    aGames.textContent =
      games.length;

  }

  if(aPlayers){

    aPlayers.textContent = "1";

  }

  if(aPoints){

    aPoints.textContent =
      player.points;

  }

  renderGames();

  renderRewards();

  renderRanking();

  renderAdmin();

}

/* =========================================================
   JEUX
========================================================= */

function renderGames(){

  const gameGrid =
    document.getElementById("gameGrid");

  if(!gameGrid){

    return;

  }

  gameGrid.innerHTML =
    games.map((game, index) => {

      let button = "";

      if(game.type === "quiz"){

        button = `
          <button
            class="primary"
            onclick="startQuiz()"
          >
            Jouer
          </button>
        `;

      }else if(game.type === "number"){

        button = `
          <button
            class="primary"
            onclick="startNumberGame()"
          >
            Jouer
          </button>
        `;

      }else if(game.type === "ludo"){

        button = `
          <button
            class="primary"
            onclick="startLudo()"
          >
            Jouer
          </button>
        `;

      }else{

        button = `
          <button
            class="primary"
            onclick="comingSoon()"
          >
            Bientôt
          </button>
        `;

      }

      return `
        <div class="game">

          <div class="icon">
            ${game.icon}
          </div>

          <h3>
            ${game.name}
          </h3>

          <p class="muted">
            Joue et gagne jusqu'à
            ${game.points} points.
          </p>

          ${button}

        </div>
      `;

    }).join("");

}

/* =========================================================
   JEUX BIENTÔT DISPONIBLES
========================================================= */

function comingSoon(){

  alert(
    "🎮 Ce jeu sera bientôt disponible !"
  );

}

/* =========================================================
   PROFIL
========================================================= */

function openLogin(){

  const modal =
    document.getElementById("loginModal");

  if(modal){

    modal.classList.remove("hidden");

  }

  const input =
    document.getElementById("username");

  if(input){

    input.value =
      player.name === "Visiteur"
      ? ""
      : player.name;

    setTimeout(
      () => input.focus(),
      100
    );

  }

}

function closeLogin(){

  const modal =
    document.getElementById("loginModal");

  if(modal){

    modal.classList.add("hidden");

  }

}

function login(){

  const input =
    document.getElementById("username");

  if(!input){

    return;

  }

  const name =
    input.value.trim();

  if(name.length < 2){

    alert(
      "Entre un pseudo d'au moins 2 caractères."
    );

    return;

  }

  player.name = name;

  saveData();

  closeLogin();

  alert(
    "Bienvenue " + name + " ! 🎮"
  );

}

/* =========================================================
   QUIZ
========================================================= */

let quizIndex = 0;
let quizScore = 0;

function startQuiz(){

  quizIndex = 0;
  quizScore = 0;

  showPage("quiz");

  renderQuestion();

}

function renderQuestion(){

  const meta =
    document.getElementById("quizMeta");

  const question =
    document.getElementById("question");

  const answers =
    document.getElementById("answers");

  const result =
    document.getElementById("quizResult");

  if(!question || !answers){

    return;

  }

  if(meta){

    meta.textContent =
      "Question " +
      (quizIndex + 1) +
      " / " +
      questions.length;

  }

  if(result){

    result.textContent = "";

  }

  const current =
    questions[quizIndex];

  question.textContent =
    current.q;

  answers.innerHTML =
    current.a.map(
      (answer, index) => `
        <button
          class="primary"
          style="display:block;width:100%;margin:8px 0"
          onclick="answerQuiz(${index})"
        >
          ${answer}
        </button>
      `
    ).join("");

}

function answerQuiz(index){

  const current =
    questions[quizIndex];

  if(index === current.c){

    quizScore += 10;

  }

  quizIndex++;

  if(
    quizIndex >= questions.length
  ){

    player.points += quizScore;

    saveData();

    const result =
      document.getElementById("quizResult");

    if(result){

      result.innerHTML =
        "🎉 Quiz terminé ! +" +
        quizScore +
        " points";

    }

    const answers =
      document.getElementById("answers");

    if(answers){

      answers.innerHTML = `
        <button
          class="primary"
          onclick="showPage('games')"
        >
          Retour aux jeux
        </button>
      `;

    }

    return;

  }

  renderQuestion();

}

/* =========================================================
   DEVINE LE NOMBRE
========================================================= */

let secretNumber = 0;
let numberAttempts = 0;

function startNumberGame(){

  secretNumber =
    Math.floor(
      Math.random() * 100
    ) + 1;

  numberAttempts = 0;

  const input =
    document.getElementById("numberGuess");

  const result =
    document.getElementById("numberResult");

  if(input){

    input.value = "";

  }

  if(result){

    result.textContent =
      "J'ai choisi un nombre entre 1 et 100.";

  }

  showPage("numberGame");

}

function guessNumber(){

  const input =
    document.getElementById("numberGuess");

  const result =
    document.getElementById("numberResult");

  if(!input || !result){

    return;

  }

  const guess =
    Number(input.value);

  if(
    !Number.isInteger(guess) ||
    guess < 1 ||
    guess > 100
  ){

    result.textContent =
      "Entre un nombre entre 1 et 100.";

    return;

  }

  numberAttempts++;

  if(guess === secretNumber){

    const points =
      Math.max(
        10,
        50 - ((numberAttempts - 1) * 5)
      );

    player.points += points;

    saveData();

    result.innerHTML =
      "🎉 Bravo ! Le nombre était " +
      secretNumber +
      ". +" +
      points +
      " points !";

  }else if(guess < secretNumber){

    result.textContent =
      "⬆️ Plus grand !";

  }else{

    result.textContent =
      "⬇️ Plus petit !";

  }

}

/* =========================================================
   FIN BLOC 1
========================================================= *//* =========================================================
   RÉCOMPENSES
========================================================= */

function renderRewards(){

  const grid =
    document.getElementById("rewardGrid");

  if(!grid){

    return;

  }

  grid.innerHTML =
    rewards.map(
      (reward, index) => `

        <div class="game">

          <div class="icon">
            ${reward.icon || "🎁"}
          </div>

          <h3>
            ${reward.name}
          </h3>

          <p class="muted">
            Coût :
            <strong>
              ${reward.cost}
            </strong>
            points
          </p>

          <button
            class="primary"
            onclick="claimReward(${index})"
          >
            Réclamer
          </button>

        </div>

      `
    ).join("");

}

function claimReward(index){

  const reward =
    rewards[index];

  if(!reward){

    return;

  }

  if(player.points < reward.cost){

    alert(
      "❌ Tu n'as pas assez de points."
    );

    return;

  }

  const confirmed =
    confirm(
      "Réclamer " +
      reward.name +
      " pour " +
      reward.cost +
      " points ?"
    );

  if(!confirmed){

    return;

  }

  player.points -= reward.cost;

  rewardRequests.push({

    id: Date.now(),

    player:
      player.name,

    reward:
      reward.name,

    cost:
      reward.cost,

    status:
      "pending"

  });

  saveData();

  alert(
    "✅ Demande envoyée à l'administrateur."
  );

}

/* =========================================================
   CLASSEMENT
========================================================= */

function renderRanking(){

  const body =
    document.getElementById("rankingBody");

  if(!body){

    return;

  }

  body.innerHTML = `
    <tr>

      <td>1</td>

      <td>
        ${player.name}
      </td>

      <td>
        ${player.points}
      </td>

    </tr>
  `;

}

/* =========================================================
   ADMIN
========================================================= */

function renderAdmin(){

  const box =
    document.getElementById(
      "rewardRequests"
    );

  if(!box){

    return;

  }

  if(rewardRequests.length === 0){

    box.innerHTML = `
      <p class="muted">
        Aucune demande de récompense.
      </p>
    `;

    return;

  }

  box.innerHTML =
    rewardRequests.map(
      (request, index) => {

        const status =
          request.status === "approved"
          ? "✅ Validée"
          : request.status === "rejected"
          ? "❌ Refusée"
          : "⏳ En attente";

        let actions = "";

        if(
          request.status === "pending"
        ){

          actions = `
            <div
              style="margin-top:10px"
            >

              <button
                class="primary"
                onclick="approveReward(${index})"
              >
                ✅ Valider
              </button>

              <button
                class="primary"
                onclick="rejectReward(${index})"
              >
                ❌ Refuser
              </button>

            </div>
          `;

        }

        return `
          <div
            class="panel"
            style="margin-bottom:12px"
          >

            <strong>
              ${request.reward}
            </strong>

            <p>
              Joueur :
              ${request.player}
            </p>

            <p>
              Coût :
              ${request.cost} points
            </p>

            <p>
              ${status}
            </p>

            ${actions}

          </div>
        `;

      }
    ).join("");

}

function approveReward(index){

  const request =
    rewardRequests[index];

  if(!request){

    return;

  }

  if(
    request.status !== "pending"
  ){

    return;

  }

  request.status =
    "approved";

  saveData();

  alert(
    "Récompense validée. ✅"
  );

}

function rejectReward(index){

  const request =
    rewardRequests[index];

  if(!request){

    return;

  }

  if(
    request.status !== "pending"
  ){

    return;

  }

  request.status =
    "rejected";

  /*
     On rembourse les points
     puisque la récompense est refusée.
  */

  player.points +=
    Number(request.cost) || 0;

  saveData();

  alert(
    "Récompense refusée. Les points ont été remboursés. ✅"
  );

}

/* =========================================================
   ADMIN — AJOUTER UN JEU
========================================================= */

function addGame(){

  const nameInput =
    document.getElementById(
      "newGameName"
    );

  const pointsInput =
    document.getElementById(
      "newGamePoints"
    );

  if(!nameInput || !pointsInput){

    return;

  }

  const name =
    nameInput.value.trim();

  const points =
    Number(pointsInput.value);

  if(!name){

    alert(
      "Entre le nom du jeu."
    );

    return;

  }

  if(
    !Number.isFinite(points) ||
    points <= 0
  ){

    alert(
      "Entre un nombre de points valide."
    );

    return;

  }

  games.push({

    name:
      name,

    icon:
      "🎮",

    points:
      points,

    type:
      "soon"

  });

  nameInput.value = "";

  pointsInput.value = "";

  saveData();

  alert(
    "🎮 Jeu ajouté avec succès."
  );

}

/* =========================================================
   ADMIN — AJOUTER UNE RÉCOMPENSE
========================================================= */

function addReward(){

  const nameInput =
    document.getElementById(
      "newRewardName"
    );

  const costInput =
    document.getElementById(
      "newRewardCost"
    );

  if(!nameInput || !costInput){

    return;

  }

  const name =
    nameInput.value.trim();

  const cost =
    Number(costInput.value);

  if(!name){

    alert(
      "Entre le nom de la récompense."
    );

    return;

  }

  if(
    !Number.isFinite(cost) ||
    cost <= 0
  ){

    alert(
      "Entre un coût valide."
    );

    return;

  }

  rewards.push({

    name:
      name,

    cost:
      cost,

    icon:
      "🎁"

  });

  nameInput.value = "";

  costInput.value = "";

  saveData();

  alert(
    "🎁 Récompense ajoutée avec succès."
  );

}

/* =========================================================
   LUDO — STYLE
========================================================= */

function installLudoStyle(){

  if(
    document.getElementById(
      "gamewin-ludo-style"
    )
  ){

    return;

  }

  const style =
    document.createElement("style");

  style.id =
    "gamewin-ludo-style";

  style.textContent = `

    .gw-ludo{

      max-width:650px;
      margin:auto;
      padding-bottom:30px;

    }

    .gw-ludo-panel{

      background:#0d1d36;
      border:1px solid #29466e;
      border-radius:18px;
      padding:18px;
      margin-bottom:16px;
      box-shadow:0 12px 30px rgba(0,0,0,.25);

    }

    .gw-ludo-title{

      text-align:center;
      font-size:28px;
      font-weight:800;
      margin-bottom:15px;

    }

    .gw-ludo-status{

      text-align:center;
      font-weight:700;
      margin:8px 0;

    }

    .gw-ludo-board{

      width:min(94vw,600px);
      aspect-ratio:1;
      margin:15px auto;
      display:grid;
      grid-template-columns:repeat(15,1fr);
      grid-template-rows:repeat(15,1fr);
      gap:1px;
      padding:6px;
      border-radius:20px;
      background:#142b4b;
      box-shadow:
        0 18px 40px rgba(0,0,0,.45),
        inset 0 0 0 2px #38577f;

    }

    .gw-cell{

      min-width:0;
      min-height:0;
      display:flex;
      align-items:center;
      justify-content:center;
      position:relative;
      background:#eef2f7;
      border-radius:2px;
      box-shadow:inset 0 0 0 1px rgba(0,0,0,.08);

    }

    .gw-empty{

      background:#dce3ec;

    }

    .gw-path{

      background:#ffffff;

    }

    .gw-red-home{

      background:#e65353;

    }

    .gw-green-home{

      background:#45bd72;

    }

    .gw-yellow-home{

      background:#f1c83b;

    }

    .gw-blue-home{

      background:#4c8eea;

    }

    .gw-center{

      background:
        conic-gradient(
          #e65353 0 25%,
          #f1c83b 25% 50%,
          #4c8eea 50% 75%,
          #45bd72 75% 100%
        );

    }

    .gw-safe::after{

      content:"★";
      color:#26364b;
      font-size:12px;

    }

    .gw-token{

      width:72%;
      height:72%;
      border-radius:50%;
      border:2px solid rgba(255,255,255,.9);
      box-shadow:
        0 3px 6px rgba(0,0,0,.4),
        inset 0 2px 3px rgba(255,255,255,.35);
      cursor:pointer;
      position:relative;
      z-index:5;

    }

    .gw-token:hover{

      transform:scale(1.08);

    }

    .gw-token-red{
      background:#d93445;
    }

    .gw-token-green{
      background:#18a957;
    }

    .gw-token-yellow{
      background:#f0b91b;
    }

    .gw-token-blue{
      background:#2776dc;
    }

    .gw-ludo-actions{

      display:flex;
      gap:10px;
      flex-wrap:wrap;
      justify-content:center;

    }

    .gw-ludo-select{

      width:100%;
      padding:12px;
      margin:6px 0;
      border-radius:10px;
      border:1px solid #38577f;
      background:#102745;
      color:white;
      font-size:16px;

    }

    .gw-player-list{

      display:grid;
      grid-template-columns:1fr 1fr;
      gap:8px;
      margin-top:12px;

    }

    .gw-player{

      padding:10px;
      border-radius:10px;
      background:#132b4b;
      border:1px solid #29466e;

    }

    @media(max-width:500px){

      .gw-ludo-board{

        width:96vw;
        padding:3px;

      }

      .gw-player-list{

        grid-template-columns:1fr;

      }

    }

  `;

  document.head.appendChild(style);

}

/* =========================================================
   LUDO — DONNÉES
========================================================= */

const LUDO_COLORS = [
  "red",
  "green",
  "yellow",
  "blue"
];

const LUDO_NAMES = {
  red: "Rouge",
  green: "Vert",
  yellow: "Jaune",
  blue: "Bleu"
};

const LUDO_START = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39
};

/*
   52 cases autour du plateau.
*/

const LUDO_PATH = [

  [6,0],[6,1],[6,2],[6,3],[6,4],[6,5],
  [5,6],[4,6],[3,6],[2,6],[1,6],[0,6],
  [0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],
  [6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],
  [8,14],[8,13],[8,12],[8,11],[8,10],[8,9],
  [9,8],[10,8],[11,8],[12,8],[13,8],[14,8],
  [14,7],
  [14,6],[13,6],[12,6],[11,6],[10,6],[9,6],
  [8,5],[8,4],[8,3],[8,2],[8,1],[8,0],
  [7,0]

];

const LUDO_HOME_SPOTS = {

  red: [
    [1,1],
    [1,4],
    [4,1],
    [4,4]
  ],

  green: [
    [1,10],
    [1,13],
    [4,10],
    [4,13]
  ],

  yellow: [
    [10,10],
    [10,13],
    [13,10],
    [13,13]
  ],

  blue: [
    [10,1],
    [10,4],
    [13,1],
    [13,4]
  ]

};

let ludoState = null;

/* =========================================================
   FIN BLOC 2
========================================================= *//* =========================================================
   LUDO — CRÉATION
========================================================= */



/* =========================================================
   LUDO — DÉMARRAGE
========================================================= */
function ludoChooseMode(count){

  const colors = ["red","green","yellow","blue"];
  const names = ["Toi","Joueur 2","Joueur 3","Joueur 4"];

  ludoState.started = true;
  ludoState.playerCount = count;
  ludoState.players = [];

  for(let i = 0; i < count; i++){

    ludoState.players.push({
      color: colors[i],
      name: names[i],
      human: true
    });

  }

  if(count === 1){

    ludoState.players.push({
      color:"green",
      name:"CPU Vert",
      human:false
    });

  }

  ludoState.turn = 0;
  ludoState.dice = 0;

  ludoState.message =
    count === 1
    ? "À toi ! Lance le dé."
    : "Joueur 1, lance le dé.";

  renderLudo();

}
function startLudo(){

  installLudoStyle();

  ludoState =
    createLudoState();

  showPage("ludoGame");

  renderLudo();

}

/* =========================================================
   LUDO — RENDU
========================================================= */

function renderLudo(){

  installLudoStyle();

  const section =
    document.getElementById(
      "ludoGame"
    );

  if(!section){

    return;

  }

  if(!ludoState){

    ludoState =
      createLudoState();

  }
if(!ludoState.started){

  section.innerHTML = `
    <div class="gw-ludo">
      <div class="gw-ludo-panel" style="text-align:center">

        <div class="gw-ludo-title">
          🎲 LUDO CLASSIC
        </div>

        <h2>Choisis le nombre de joueurs</h2>

        <p class="muted">
          👤 1 joueur + 🤖 ordinateur<br>
          👥 2, 3 ou 4 joueurs
        </p>

        <div class="gw-ludo-actions">

          <button
            class="primary"
            onclick="ludoChooseMode(1)"
          >
            👤 1 + 🤖 Ordinateur
          </button>

          <button
            class="primary"
            onclick="ludoChooseMode(2)"
          >
            👥 2 joueurs
          </button>

          <button
            class="primary"
            onclick="ludoChooseMode(3)"
          >
            👥 3 joueurs
          </button>

          <button
            class="primary"
            onclick="ludoChooseMode(4)"
          >
            👥 4 joueurs
          </button>

          <button
            class="primary"
            onclick="showPage('games')"
          >
            ← Jeux
          </button>

        </div>

      </div>
    </div>
  `;

  return;
     }
  section.innerHTML = `

    <div class="gw-ludo">

      <div class="gw-ludo-panel">

        <div class="gw-ludo-title">
          🎲 LUDO CLASSIC
        </div>

        <div class="gw-ludo-status">
          ${
            ludoState.players[
              ludoState.turn
            ].name
          }
          —
          ${LUDO_NAMES[
            ludoState.players[
              ludoState.turn
            ].color
          ]}
        </div>

        <div
          style="
            text-align:center;
            font-size:52px;
          "
        >
          ${
            ludoState.dice
            ? diceFace(ludoState.dice)
            : "🎲"
          }
        </div>

        <p
          style="text-align:center"
        >
          ${ludoState.message}
        </p>

        <div class="gw-ludo-actions">

          <button
            class="primary"
            onclick="ludoRoll()"
            ${
              !ludoState.players[
                ludoState.turn
              ].human
              ? "disabled"
              : ""
            }
          >
            🎲 Lancer le dé
          </button>

          <button
            class="primary"
            onclick="ludoNewGame()"
          >
            🔄 Nouvelle partie
          </button>

          <button
            class="primary"
            onclick="showPage('games')"
          >
            ← Jeux
          </button>

        </div>

      </div>

      <div
        id="gwLudoBoard"
        class="gw-ludo-board"
      ></div>

      <div class="gw-ludo-panel">

        <strong>
          Joueurs
        </strong>

        <div class="gw-player-list">

          ${
            ludoState.players.map(
              (p, i) => `
                <div class="gw-player">

                  ${colorDot(p.color)}

                  <strong>
                    ${p.name}
                  </strong>

                  ${
                    i === ludoState.turn
                    ? " 👈"
                    : ""
                  }

                  <br>

                  <small>
                    Pions :
                    ${
                      ludoState.tokens[
                        p.color
                      ].filter(
                        x => x >= 0
                      ).length
                    } / 4
                  </small>

                </div>
              `
            ).join("")
          }

        </div>

      </div>

    </div>

  `;

  drawLudoBoard();

}

/* =========================================================
   LUDO — COULEUR
========================================================= */

function colorDot(color){

  return `
    <span
      style="
        display:inline-block;
        width:13px;
        height:13px;
        border-radius:50%;
        margin-right:6px;
        background:${tokenColor(color)};
      "
    ></span>
  `;

}

function tokenColor(color){

  const colors = {

    red:"#d93445",
    green:"#18a957",
    yellow:"#f0b91b",
    blue:"#2776dc"

  };

  return colors[color] || "#fff";

}

/* =========================================================
   LUDO — DÉ
========================================================= */

function diceFace(number){

  const faces = [
    "",
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
  ];

  return faces[number] || "🎲";

}

function ludoRoll(){

  if(!ludoState){

    return;

  }

  const current =
    ludoState.players[
      ludoState.turn
    ];

  if(!current.human){

    return;

  }

  const dice =
    Math.floor(
      Math.random() * 6
    ) + 1;

  ludoState.dice =
    dice;

  const color =
    current.color;

  const tokens =
    ludoState.tokens[color];

  const movable =
    tokens.some(
      position =>
        position === -1
        ? dice === 6
        : position + dice <= 57
    );

  if(!movable){

    ludoState.message =
      "Aucun pion ne peut avancer.";

    renderLudo();

    setTimeout(
      ludoNextTurn,
      700
    );

    return;

  }

  ludoState.message =
    "Choisis un pion à déplacer.";

  renderLudo();

}

/* =========================================================
   LUDO — DÉPLACEMENT
========================================================= */

function ludoMoveToken(
  color,
  tokenIndex
){

  if(!ludoState){

    return;

  }

  const current =
    ludoState.players[
      ludoState.turn
    ];

  if(!current.human){

    return;

  }

  if(current.color !== color){

    return;

  }

  const dice =
    ludoState.dice;

  if(!dice){

    return;

  }

  const tokens =
    ludoState.tokens[color];

  let position =
    tokens[tokenIndex];

  if(position === -1){

    if(dice !== 6){

      ludoState.message =
        "Il faut faire 6 pour sortir un pion.";

      renderLudo();

      return;

    }

    position = 0;

  }else{

    if(
      position + dice > 57
    ){

      ludoState.message =
        "Ce pion ne peut pas avancer.";

      renderLudo();

      return;

    }

    position += dice;

  }

  tokens[tokenIndex] =
    position;

  captureOpponents(
    color,
    position
  );

  ludoState.dice = 0;

  if(
    tokens.every(
      p => p === 57
    )
  ){

    player.points += 100;

    saveData();

    ludoState.message =
      "🏆 VICTOIRE ! +100 points !";

    renderLudo();

    return;

  }

  if(dice === 6){

    ludoState.message =
      "🎲 6 ! Tu rejoues.";

    renderLudo();

    return;

  }

  ludoNextTurn();

}

/* =========================================================
   LUDO — CAPTURE
========================================================= */

function captureOpponents(
  color,
  position
){

  if(
    position < 0 ||
    position >= 52
  ){

    return;

  }

  const globalPosition =
    (
      LUDO_START[color] +
      position
    ) % 52;

  const safe = [
    0,
    8,
    13,
    21,
    26,
    34,
    39,
    47
  ];

  if(
    safe.includes(
      globalPosition
    )
  ){

    return;

  }

  LUDO_COLORS.forEach(
    otherColor => {

      if(otherColor === color){

        return;

      }

      ludoState.tokens[
        otherColor
      ].forEach(
        (otherPosition, index) => {

          if(
            otherPosition >= 0 &&
            otherPosition < 52
          ){

            const otherGlobal =
              (
                LUDO_START[
                  otherColor
                ] +
                otherPosition
              ) % 52;

            if(
              otherGlobal ===
              globalPosition
            ){

              ludoState.tokens[
                otherColor
              ][index] = -1;

            }

          }

        }
      );

    }
  );

}

/* =========================================================
   LUDO — TOUR SUIVANT
========================================================= */

function ludoNextTurn(){

  ludoState.turn =
    (
      ludoState.turn + 1
    ) %
    ludoState.players.length;

  ludoState.dice = 0;

  const current =
    ludoState.players[
      ludoState.turn
    ];

  ludoState.message =
    current.name +
    " joue.";

  renderLudo();

  if(!current.human){

    setTimeout(
      ludoCpuTurn,
      800
    );

  }

}

/* =========================================================
   LUDO — CPU
========================================================= */

function ludoCpuTurn(){

  if(!ludoState){

    return;

  }

  const current =
    ludoState.players[
      ludoState.turn
    ];

  if(current.human){

    return;

  }

  const dice =
    Math.floor(
      Math.random() * 6
    ) + 1;

  ludoState.dice =
    dice;

  const tokens =
    ludoState.tokens[
      current.color
    ];

  let choices = [];

  tokens.forEach(
    (position, index) => {

      if(position === -1){

        if(dice === 6){

          choices.push(index);

        }

      }else if(
        position + dice <= 57
      ){

        choices.push(index);

      }

    }
  );

  if(
    choices.length === 0
  ){

    ludoState.message =
      current.name +
      " ne peut pas jouer.";

    renderLudo();

    setTimeout(
      ludoNextTurn,
      700
    );

    return;

  }

  const choice =
    choices[
      Math.floor(
        Math.random() *
        choices.length
      )
    ];

  let position =
    tokens[choice];

  if(position === -1){

    position = 0;

  }else{

    position += dice;

  }

  tokens[choice] =
    position;

  captureOpponents(
    current.color,
    position
  );

  if(
    tokens.every(
      p => p === 57
    )
  ){

    ludoState.message =
      "🏆 " +
      current.name +
      " a gagné !";

    renderLudo();

    return;

  }

  if(dice === 6){

    ludoState.message =
      current.name +
      " a fait 6 et rejoue.";

    renderLudo();

    setTimeout(
      ludoCpuTurn,
      900
    );

    return;

  }

  ludoNextTurn();

}

/* =========================================================
   LUDO — NOUVELLE PARTIE
========================================================= */

function ludoNewGame(){

  ludoState =
    createLudoState();

  showPage("ludoGame");

  renderLudo();

}

/* =========================================================
   LUDO — PLATEAU
========================================================= */

function drawLudoBoard(){

  const board =
    document.getElementById(
      "gwLudoBoard"
    );

  if(!board){

    return;

  }

  board.innerHTML = "";

  for(
    let row = 0;
    row < 15;
    row++
  ){

    for(
      let col = 0;
      col < 15;
      col++
    ){

      const cell =
        document.createElement(
          "div"
        );

      cell.className =
        "gw-cell " +
        getCellClass(row,col);

      const pathIndex =
        LUDO_PATH.findIndex(
          p =>
            p[0] === row &&
            p[1] === col
        );

      if(pathIndex >= 0){

        cell.dataset.path =
          pathIndex;

      }

      /*
         Pions placés dans leur maison
         ou sur le parcours.
      */

      placeTokenInCell(
        cell,
        row,
        col
      );

      board.appendChild(cell);

    }

  }

}

/* =========================================================
   LUDO — COULEUR DES CASES
========================================================= */

function getCellClass(
  row,
  col
){

  /*
     Maisons 6x6
  */

  if(
    row <= 5 &&
    col <= 5
  ){

    return "gw-red-home";

  }

  if(
    row <= 5 &&
    col >= 9
  ){

    return "gw-green-home";

  }

  if(
    row >= 9 &&
    col >= 9
  ){

    return "gw-yellow-home";

  }

  if(
    row >= 9 &&
    col <= 5
  ){

    return "gw-blue-home";

  }

  /*
     Centre
  */

  if(
    row >= 6 &&
    row <= 8 &&
    col >= 6 &&
    col <= 8
  ){

    return "gw-center";

  }

  const path =
    LUDO_PATH.findIndex(
      p =>
        p[0] === row &&
        p[1] === col
    );

  if(path >= 0){

    const safe =
      [
        0,
        8,
        13,
        21,
        26,
        34,
        39,
        47
      ];

    if(
      safe.includes(path)
    ){

      return "gw-path gw-safe";

    }

    return "gw-path";

  }

  return "gw-empty";

}

/* =========================================================
   LUDO — PIONS
========================================================= */

function placeTokenInCell(
  cell,
  row,
  col
){

  /*
     Pions encore dans leur maison.
  */

  for(
    const color of LUDO_COLORS
  ){

    const spots =
      LUDO_HOME_SPOTS[color];

    spots.forEach(
      (spot, index) => {

        if(
          spot[0] === row &&
          spot[1] === col
        ){

          const position =
            ludoState.tokens[
              color
            ][index];

          if(position === -1){

            addToken(
              cell,
              color,
              index
            );

          }

        }

      }
    );

  }

  /*
     Pions sur le parcours.
  */

  for(
    const color of LUDO_COLORS
  ){

    ludoState.tokens[
      color
    ].forEach(
      (position, index) => {

        if(
          position < 0 ||
          position >= 52
        ){

          return;

        }

        const pathIndex =
          (
            LUDO_START[color] +
            position
          ) % 52;

        const path =
          LUDO_PATH[
            pathIndex
          ];

        if(
          path &&
          path[0] === row &&
          path[1] === col
        ){

          addToken(
            cell,
            color,
            index
          );

        }

      }
    );

  }

}

function addToken(
  cell,
  color,
  index
){

  const token =
    document.createElement(
      "div"
    );

  token.className =
    "gw-token gw-token-" +
    color;

  token.title =
    LUDO_NAMES[color] +
    " — pion " +
    (index + 1);

  token.onclick =
    function(){

      ludoMoveToken(
        color,
        index
      );

    };

  cell.appendChild(
    token
  );

}

/* =========================================================
   INITIALISATION
========================================================= */

function initGameWin(){

  /*
     On branche les boutons
     du menu.
  */

  document
    .querySelectorAll(
      "nav button[data-page]"
    )
    .forEach(
      button => {

        button.addEventListener(
          "click",
          function(){

            showPage(
              this.dataset.page
            );

          }
        );

      }
    );

  /*
     On force la liste des jeux
     si une ancienne version
     l'avait supprimée.
  */

  /* Restaurer automatiquement les jeux manquants */
if(!Array.isArray(games)){
  games = [];
}

defaultGames.forEach(defaultGame => {
  const exists = games.some(
    game => game.name === defaultGame.name
  );

  if(!exists){
    games.push(defaultGame);
  }
});

localStorage.setItem(
  "games",
  JSON.stringify(games)
);

  render();

}

/* =========================================================
   LANCEMENT
========================================================= */

if(
  document.readyState ===
  "loading"
){

  document.addEventListener(
    "DOMContentLoaded",
    initGameWin
  );

}else{

  initGameWin();

}

/* =========================================================
   FIN APP.JS
========================================================= */
