const defaultGames = [
  {name:"Quiz Culture Générale",icon:"🧠",points:50,type:"quiz"},
  {name:"Puzzle",icon:"🧩",points:40,type:"soon"},
  {name:"Défi Rapide",icon:"⚡",points:60,type:"soon"},
  {name:"Tir de précision",icon:"🎯",points:50,type:"soon"},
  {name:"Échecs",icon:"♟️",points:70,type:"soon"},
  {name:"Tournoi",icon:"🏆",points:100,type:"soon"},
  {name:"Devine le nombre",icon:"🔢",points:50,type:"number"},
  {name:"Ludo",icon:"🎲",points:100,type:"ludo"}
];

const questions = [
  {
    q:"Quelle est la capitale du Burkina Faso ?",
    a:["Bobo-Dioulasso","Ouagadougou","Koudougou","Banfora"],
    c:1
  },
  {
    q:"Combien font 7 × 8 ?",
    a:["54","56","64","48"],
    c:1
  },
  {
    q:"Quelle planète est surnommée la planète rouge ?",
    a:["Mars","Vénus","Jupiter","Mercure"],
    c:0
  }
];

let games = JSON.parse(localStorage.games || "null");

if(!Array.isArray(games) || games.length === 0){
  games = defaultGames.slice();
}else{
  if(!games.some(g => g.name === "Ludo")){
    games.push({
      name:"Ludo",
      icon:"🎲",
      points:100,
      type:"ludo"
    });
  }
}

let rewards =
  JSON.parse(localStorage.rewards || "null") || [
    {name:"Badge Champion",cost:500,icon:"🏅"},
    {name:"Carte cadeau",cost:2000,icon:"🎁"},
    {name:"Accessoire gaming",cost:5000,icon:"🎧"}
  ];

let player =
  JSON.parse(localStorage.player || "null") || {
    name:"Visiteur",
    points:0
  };

let rewardRequests =
  JSON.parse(localStorage.rewardRequests || "null") || [];

let qi = 0;
let secretNumber = 0;


/* =========================
   SAUVEGARDE
========================= */

function save(){

  localStorage.games =
    JSON.stringify(games);

  localStorage.rewards =
    JSON.stringify(rewards);

  localStorage.player =
    JSON.stringify(player);

  localStorage.rewardRequests =
    JSON.stringify(rewardRequests);

  render();

}


/* =========================
   NAVIGATION
========================= */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(p =>
      p.classList.remove("active")
    );

  const page =
    document.getElementById(id);

  if(page){
    page.classList.add("active");
  }

  if(id === "ludoGame"){
    renderLudo();
  }

}


document
  .querySelectorAll("nav button")
  .forEach(b => {

    b.onclick = () =>
      showPage(b.dataset.page);

  });


/* =========================
   AFFICHAGE PRINCIPAL
========================= */

function render(){

  const userArea =
    document.getElementById("userArea");

  if(userArea){

    userArea.innerHTML =
      `<button class="primary"
        onclick="openLogin()">
        ${
          player.name === "Visiteur"
          ? "S'inscrire"
          : "👤 " + player.name
        }
      </button>`;

  }


  const statGames =
    document.getElementById("statGames");

  const statPlayers =
    document.getElementById("statPlayers");

  const statPoints =
    document.getElementById("statPoints");


  if(statGames)
    statGames.textContent =
      games.length;

  if(statPlayers)
    statPlayers.textContent =
      "1";

  if(statPoints)
    statPoints.textContent =
      player.points;


  const aGames =
    document.getElementById("aGames");

  const aPlayers =
    document.getElementById("aPlayers");

  const aPoints =
    document.getElementById("aPoints");


  if(aGames)
    aGames.textContent =
      games.length;

  if(aPlayers)
    aPlayers.textContent =
      "1";

  if(aPoints)
    aPoints.textContent =
      player.points;


  const gameGrid =
    document.getElementById("gameGrid");

  if(gameGrid){

    gameGrid.innerHTML =
      games.map(g => `

        <div class="game">

          <div class="icon">
            ${g.icon}
          </div>

          <h3>
            ${g.name}
          </h3>

          <p class="muted">
            Joue et gagne jusqu'à
            ${g.points} points.
          </p>

          ${
            g.type === "quiz"

            ? `
              <button
                class="primary"
                onclick="startQuiz()">
                Jouer
              </button>
            `

            : g.type === "number"

            ? `
              <button
                class="primary"
                onclick="startNumberGame()">
                Jouer
              </button>
            `

            : g.type === "ludo"

            ? `
              <button
                class="primary"
                onclick="startLudo()">
                Jouer
              </button>
            `

            : `
              <button
                class="primary"
                onclick="alert('Ce jeu sera ajouté dans une prochaine version.')">
                Jouer
              </button>
            `
          }

        </div>

      `).join("");

  }


  const rewardGrid =
    document.getElementById("rewardGrid");

  if(rewardGrid){

    rewardGrid.innerHTML =
      rewards.map(r => `

        <div class="reward">

          <div class="icon">
            ${r.icon}
          </div>

          <h3>
            ${r.name}
          </h3>

          <p>
            ${r.cost} points
          </p>

          <button
            class="primary"
            onclick="claim(${r.cost},'${r.name}')">
            Échanger
          </button>

        </div>

      `).join("");

  }


  const rankingBody =
    document.getElementById("rankingBody");

  if(rankingBody){

    rankingBody.innerHTML = `

      <tr>

        <td>1</td>

        <td>
          ${player.name}
        </td>

        <td>
          ${player.points.toLocaleString("fr-FR")}
        </td>

      </tr>

    `;

  }


  const requestsBox =
    document.getElementById("rewardRequests");

  if(requestsBox){

    if(rewardRequests.length === 0){

      requestsBox.innerHTML =
        `<p class="muted">
          Aucune demande de récompense.
        </p>`;

    }else{

      requestsBox.innerHTML =
        rewardRequests.map(r => {

          let action = "";

          if(r.status === "pending"){

            action = `

              <button
                class="primary"
                onclick="approveReward(${r.id})">
                ✅ Valider
              </button>

              <button
                class="primary"
                onclick="rejectReward(${r.id})">
                ❌ Refuser
              </button>

            `;

          }

          return `

            <div class="panel">

              <h3>
                🎁 ${r.reward}
              </h3>

              <p>
                👤 ${r.player}
              </p>

              <p>
                💰 ${r.cost} points
              </p>

              <p>
                Statut :
                <strong>
                  ${
                    r.status === "pending"
                    ? "🟡 En attente"
                    : r.status === "approved"
                    ? "✅ Validée"
                    : "❌ Refusée"
                  }
                </strong>
              </p>

              ${action}

            </div>

          `;

        }).join("");

    }

  }

}


/* =========================
   DEVINE LE NOMBRE
========================= */

function startNumberGame(){

  secretNumber =
    Math.floor(Math.random() * 100) + 1;

  const input =
    document.getElementById("numberGuess");

  const result =
    document.getElementById("numberResult");

  if(input)
    input.value = "";

  if(result)
    result.textContent =
      "Entre un nombre entre 1 et 100.";

  showPage("numberGame");

}


function guessNumber(){

  const input =
    document.getElementById("numberGuess");

  const result =
    document.getElementById("numberResult");

  const n = +input.value;

  if(!n || n < 1 || n > 100){

    alert(
      "Entre un nombre entre 1 et 100."
    );

    return;

  }


  if(n === secretNumber){

    player.points += 50;

    result.textContent =
      "🎉 Bravo ! Tu as trouvé ! +50 points";

    secretNumber = 0;

    save();

  }else if(n < secretNumber){

    result.textContent =
      "⬆️ Plus grand !";

  }else{

    result.textContent =
      "⬇️ Plus petit !";

  }

}


/* =========================
   CONNEXION
========================= */

function openLogin(){

  document
    .getElementById("loginModal")
    .classList.remove("hidden");

}


function closeLogin(){

  document
    .getElementById("loginModal")
    .classList.add("hidden");

}


function login(){

  const n =
    document
      .getElementById("username")
      .value
      .trim();

  if(!n){

    alert("Entre un pseudo.");

    return;

  }

  player.name = n;

  closeLogin();

  save();

}


/* =========================
   QUIZ
========================= */

function startQuiz(){

  qi = 0;

  showPage("quiz");

  nextQuestion();

}


function nextQuestion(){

  if(qi >= questions.length){

    document.getElementById("question")
      .textContent =
      "Quiz terminé 🎉";

    document.getElementById("answers")
      .innerHTML = `

        <button
          class="primary"
          onclick="showPage('games')">
          Retour aux jeux
        </button>

      `;

    document.getElementById("quizResult")
      .textContent =
      `Tu as maintenant ${player.points} points.`;

    return;

  }


  const x =
    questions[qi];

  document.getElementById("quizMeta")
    .textContent =
    `Question ${qi + 1}/${questions.length}`;

  document.getElementById("question")
    .textContent =
    x.q;

  document.getElementById("quizResult")
    .textContent = "";

  document.getElementById("answers")
    .innerHTML =
      x.a.map((a,i) => `

        <button
          class="answer"
          onclick="answer(${i})">

          ${String.fromCharCode(65+i)}
          — ${a}

        </button>

      `).join("");

}


function answer(i){

  const x =
    questions[qi];

  if(i === x.c){

    player.points += 50;

    document.getElementById("quizResult")
      .textContent =
      "Bonne réponse ! +50 points 🎉";

  }else{

    document.getElementById("quizResult")
      .textContent =
      "Pas cette fois. Continue !";

  }

  qi++;

  setTimeout(() => {

    save();

    nextQuestion();

  },700);

}


/* =========================
   RÉCOMPENSES
========================= */

function claim(cost,name){

  if(player.points < cost){

    alert("Pas assez de points.");

    return;

  }


  if(confirm(
    "Confirmer l'échange de " +
    cost +
    " points contre " +
    name +
    " ?"
  )){

    player.points -= cost;

    rewardRequests.push({

      id:Date.now(),

      player:player.name,

      reward:name,

      cost:cost,

      status:"pending"

    });

    save();

    alert(
      "Demande enregistrée. L'administrateur doit valider la récompense."
    );

  }

}


function approveReward(id){

  const request =
    rewardRequests.find(
      r => r.id === id
    );

  if(!request)
    return;

  request.status =
    "approved";

  save();

  alert(
    "Récompense validée."
  );

}


function rejectReward(id){

  const request =
    rewardRequests.find(
      r => r.id === id
    );

  if(!request)
    return;


  if(request.status === "pending"){

    player.points +=
      request.cost;

  }


  request.status =
    "rejected";

  save();

  alert(
    "La demande a été refusée et les points ont été rendus au joueur."
  );

}


/* =========================
   ADMIN — JEUX
========================= */

function addGame(){

  const n =
    document
      .getElementById("newGameName")
      .value
      .trim();

  const p =
    +document
      .getElementById("newGamePoints")
      .value;

  if(!n || !p){

    alert("Complète les champs.");

    return;

  }


  games.push({

    name:n,

    icon:"🎮",

    points:p,

    type:"soon"

  });


  document.getElementById(
    "newGameName"
  ).value = "";

  document.getElementById(
    "newGamePoints"
  ).value = "";

  save();

}


/* =========================
   ADMIN — RÉCOMPENSES
========================= */

function addReward(){

  const n =
    document
      .getElementById("newRewardName")
      .value
      .trim();

  const c =
    +document
      .getElementById("newRewardCost")
      .value;

  if(!n || !c){

    alert("Complète les champs.");

    return;

  }


  rewards.push({

    name:n,

    cost:c,

    icon:"🎁"

  });


  document.getElementById(
    "newRewardName"
  ).value = "";

  document.getElementById(
    "newRewardCost"
  ).value = "";

  save();

}


/* ==================================================
   LUDO CLASSIQUE
================================================== */

let ludoState = null;


const LUDO_PLAYERS = [

  {
    name:"Toi",
    color:"🟢",
    css:"ludo-green",
    start:0,
    human:true
  },

  {
    name:"CPU Rouge",
    color:"🔴",
    css:"ludo-red",
    start:13,
    human:false
  },

  {
    name:"CPU Jaune",
    color:"🟡",
    css:"ludo-yellow",
    start:26,
    human:false
  },

  {
    name:"CPU Bleu",
    color:"🔵",
    css:"ludo-blue",
    start:39,
    human:false
  }

];


/*
 * Parcours de 52 cases.
 */

const LUDO_PATH = [

  [6,0],[6,1],[6,2],[6,3],[6,4],
  [5,4],[4,4],[3,4],[2,4],[1,4],
  [0,4],[0,5],[0,6],[0,7],[0,8],
  [1,8],[2,8],[3,8],[4,8],[5,8],
  [6,8],[6,9],[6,10],[6,11],[6,12],
  [6,13],[6,14],[7,14],[8,14],
  [8,13],[8,12],[8,11],[8,10],[8,9],
  [8,8],[9,8],[10,8],[11,8],[12,8],
  [13,8],[14,8],[14,7],[14,6],[14,5],
  [14,4],[13,4],[12,4],[11,4],[10,4],
  [9,4],[8,4],[8,3],[8,2],[8,1],
  [8,0],[7,0]

];


/*
 * Cases protégées.
 */

const LUDO_SAFE = [
  0,8,13,21,26,34,39,47
];


/*
 * Couloirs finaux.
 */

const LUDO_HOME_LANES = [

  [
    [7,1],
    [7,2],
    [7,3],
    [7,4],
    [7,5]
  ],

  [
    [1,7],
    [2,7],
    [3,7],
    [4,7],
    [5,7]
  ],

  [
    [7,13],
    [7,12],
    [7,11],
    [7,10],
    [7,9]
  ],

  [
    [13,7],
    [12,7],
    [11,7],
    [10,7],
    [9,7]
  ]

];


/* =========================
   DÉMARRER LE LUDO
========================= */

function startLudo(){

  ludoNewGame();

  showPage("ludoGame");

  renderLudo();

}


function ludoNewGame(){

  ludoState = {

    turn:0,

    dice:0,

    rolled:false,

    winner:null,

    players:
      LUDO_PLAYERS.map(p => ({

        name:p.name,

        color:p.color,

        css:p.css,

        start:p.start,

        human:p.human,

        pawns:[-1,-1,-1,-1],

        finished:0

      }))

  };

  renderLudo();

}


/* =========================
   STYLE LUDO
========================= */

function ludoPrepareStyle(){

  if(document.getElementById(
    "ludoDynamicStyle"
  ))
    return;


  const style =
    document.createElement("style");

  style.id =
    "ludoDynamicStyle";

  style.textContent = `

    #ludoBoard{
      display:grid !important;
      grid-template-columns:repeat(15,1fr) !important;
      grid-template-rows:repeat(15,1fr) !important;
      gap:2px !important;
      aspect-ratio:1/1 !important;
      max-width:620px !important;
      margin:18px auto !important;
      padding:4px !important;
      background:#20395d !important;
      border-radius:18px !important;
    }

    .ludo-board-cell{
      min-width:0;
      min-height:0;
      border:1px solid #526b8f;
      border-radius:3px;
      background:#102745;
      display:flex;
      align-items:center;
      justify-content:center;
      position:relative;
      overflow:hidden;
    }

    .ludo-track{
      background:#f4f4f4 !important;
    }

    .ludo-green-lane{
      background:#39d98a !important;
    }

    .ludo-red-lane{
      background:#ed5b67 !important;
    }

    .ludo-yellow-lane{
      background:#f1d43b !important;
    }

    .ludo-blue-lane{
      background:#55a8ed !important;
    }

    .ludo-star{
      font-size:22px;
    }

    .ludo-house{
      position:absolute;
      inset:3px;
      border-radius:8px;
      display:flex;
      align-items:center;
      justify-content:center;
      flex-wrap:wrap;
      gap:3px;
    }

    .ludo-house-green{
      background:#18a558;
    }

    .ludo-house-red{
      background:#d83a4b;
    }

    .ludo-house-yellow{
      background:#e0a800;
    }

    .ludo-house-blue{
      background:#2474d6;
    }

    .ludo-token{
      width:28px;
      height:28px;
      min-width:28px;
      border-radius:50%;
      border:2px solid white;
      display:flex;
      align-items:center;
      justify-content:center;
      font-weight:bold;
      cursor:pointer;
      box-shadow:0 2px 4px rgba(0,0,0,.35);
      z-index:5;
    }

    .ludo-green{
      background:#18a558;
      color:white;
    }

    .ludo-red{
      background:#d83a4b;
      color:white;
    }

    .ludo-yellow{
      background:#e0a800;
      color:#111;
    }

    .ludo-blue{
      background:#2474d6;
      color:white;
    }

    .ludo-center{
      background:linear-gradient(
        135deg,
        #18a558 0 25%,
        #d83a4b 25% 50%,
        #2474d6 50% 75%,
        #e0a800 75%
      ) !important;
    }

    .ludo-center::after{
      content:"🏆";
      font-size:22px;
    }

    @media(max-width:600px){

      .ludo-token{
        width:22px;
        height:22px;
        min-width:22px;
        font-size:10px;
      }

      .ludo-star{
        font-size:14px;
      }

    }

  `;

  document.head.appendChild(style);

      }/* =========================
   CALCUL POSITION
========================= */

function ludoAbsolutePosition(
  playerIndex,
  relative
){

  const p =
    ludoState.players[playerIndex];

  if(relative < 0)
    return null;

  if(relative >= 52)
    return null;

  return (
    p.start + relative
  ) % 52;

}


/* =========================
   CELLULE DU PLATEAU
========================= */

function ludoCell(
  board,
  r,
  c
){

  return board.children[
    r * 15 + c
  ];

}


/* =========================
   DESSIN DU PLATEAU
========================= */

function renderLudo(){

  ludoPrepareStyle();


  if(!ludoState)
    return;


  const board =
    document.getElementById(
      "ludoBoard"
    );

  if(!board)
    return;


  board.innerHTML = "";


  /*
   * Création des 225 cases.
   */

  for(let r=0;r<15;r++){

    for(let c=0;c<15;c++){

      const cell =
        document.createElement("div");

      cell.className =
        "ludo-board-cell";


      /*
       * Maisons.
       */

      if(r < 6 && c < 6){

        cell.style.background =
          "#d83a4b";

      }

      if(r < 6 && c > 8){

        cell.style.background =
          "#18a558";

      }

      if(r > 8 && c < 6){

        cell.style.background =
          "#2474d6";

      }

      if(r > 8 && c > 8){

        cell.style.background =
          "#e0a800";

      }


      /*
       * Parcours.
       */

      const pathIndex =
        LUDO_PATH.findIndex(
          p =>
            p[0] === r &&
            p[1] === c
        );


      if(pathIndex >= 0){

        cell.classList.add(
          "ludo-track"
        );

        cell.dataset.path =
          pathIndex;


        if(
          LUDO_SAFE.includes(
            pathIndex
          )
        ){

          cell.innerHTML =
            `<span class="ludo-star">⭐</span>`;

        }

      }


      /*
       * Couloirs finaux.
       */

      LUDO_HOME_LANES.forEach(
        (lane,laneIndex)=>{

          const found =
            lane.some(
              p =>
                p[0] === r &&
                p[1] === c
            );

          if(found){

            cell.classList.add(
              [
                "ludo-green-lane",
                "ludo-red-lane",
                "ludo-yellow-lane",
                "ludo-blue-lane"
              ][laneIndex]
            );

          }

        }
      );


      /*
       * Centre.
       */

      if(
        r >= 6 &&
        r <= 8 &&
        c >= 6 &&
        c <= 8
      ){

        cell.classList.add(
          "ludo-center"
        );

      }


      board.appendChild(cell);

    }

  }


  /*
   * Maisons des joueurs.
   */

  const housePositions = [

    [
      [2,2],
      [2,4],
      [4,2],
      [4,4]
    ],

    [
      [2,10],
      [2,12],
      [4,10],
      [4,12]
    ],

    [
      [10,10],
      [10,12],
      [12,10],
      [12,12]
    ],

    [
      [10,2],
      [10,4],
      [12,2],
      [12,4]
    ]

  ];


  ludoState.players.forEach(
    (p,playerIndex)=>{

      p.pawns.forEach(
        (pos,pawnIndex)=>{

          if(pos !== -1)
            return;


          const [
            r,c
          ] =
            housePositions[
              playerIndex
            ][pawnIndex];


          const cell =
            ludoCell(
              board,
              r,
              c
            );


          if(!cell)
            return;


          const token =
            document.createElement(
              "button"
            );

          token.className =
            "ludo-token " +
            p.css;

          token.textContent =
            pawnIndex + 1;

          token.title =
            `${p.name} - pion ${pawnIndex+1}`;


          token.onclick = () =>
            ludoSelectPawn(
              playerIndex,
              pawnIndex
            );


          cell.appendChild(
            token
          );

        }
      );

    }
  );


  /*
   * Pions sur le parcours.
   */

  ludoState.players.forEach(
    (p,playerIndex)=>{

      p.pawns.forEach(
        (relative,pawnIndex)=>{

          if(
            relative < 0 ||
            relative >= 52
          )
            return;


          const absolute =
            ludoAbsolutePosition(
              playerIndex,
              relative
            );


          const point =
            LUDO_PATH[
              absolute
            ];


          if(!point)
            return;


          const cell =
            ludoCell(
              board,
              point[0],
              point[1]
            );


          if(!cell)
            return;


          const token =
            document.createElement(
              "button"
            );

          token.className =
            "ludo-token " +
            p.css;

          token.textContent =
            pawnIndex + 1;

          token.title =
            `${p.name} - pion ${pawnIndex+1}`;


          token.onclick = () =>
            ludoSelectPawn(
              playerIndex,
              pawnIndex
            );


          cell.appendChild(
            token
          );

        }
      );

    }
  );


  /*
   * Pions dans les couloirs finaux.
   */

  ludoState.players.forEach(
    (p,playerIndex)=>{

      p.pawns.forEach(
        (relative,pawnIndex)=>{

          if(
            relative < 52 ||
            relative > 56
          )
            return;


          const lane =
            LUDO_HOME_LANES[
              playerIndex
            ];

          const point =
            lane[
              relative - 52
            ];


          if(!point)
            return;


          const cell =
            ludoCell(
              board,
              point[0],
              point[1]
            );


          if(!cell)
            return;


          const token =
            document.createElement(
              "button"
            );

          token.className =
            "ludo-token " +
            p.css;

          token.textContent =
            pawnIndex + 1;


          token.onclick = () =>
            ludoSelectPawn(
              playerIndex,
              pawnIndex
            );


          cell.appendChild(
            token
          );

        }
      );

    }
  );


  /*
   * Informations du joueur.
   */

  const current =
    ludoState.players[
      ludoState.turn
    ];


  const turnBox =
    document.getElementById(
      "ludoTurn"
    );


  if(turnBox){

    turnBox.textContent =
      current.color +
      " " +
      current.name;

  }


  const diceBox =
    document.getElementById(
      "ludoDice"
    );


  if(diceBox){

    diceBox.textContent =
      ludoState.dice
      ? "🎲 " + ludoState.dice
      : "🎲";

  }


  const message =
    document.getElementById(
      "ludoMessage"
    );


  if(message){

    if(ludoState.winner){

      message.textContent =
        "🏆 " +
        ludoState.winner.name +
        " a gagné !";

    }else if(ludoState.rolled){

      if(current.human){

        message.textContent =
          "👉 Choisis un pion à déplacer.";

      }else{

        message.textContent =
          "🤖 " +
          current.name +
          " réfléchit...";

      }

    }else{

      if(current.human){

        message.textContent =
          "🎲 Lance le dé pour commencer.";

      }else{

        message.textContent =
          "🤖 Tour de " +
          current.name;

      }

    }

  }


  /*
   * Bouton lancer.
   */

  const roll =
    document.getElementById(
      "ludoRoll"
    );


  if(roll){

    roll.disabled =
      !current.human ||
      ludoState.rolled ||
      !!ludoState.winner;

  }


  /*
   * Résumé des joueurs.
   */

  const homes =
    document.getElementById(
      "ludoHomes"
    );


  if(homes){

    homes.innerHTML =
      ludoState.players.map(
        (p,i)=>`

          <div class="ludo-home">

            <h3>
              ${p.color}
              ${p.name}
            </h3>

            <div
              class="ludo-pawns">

              ${p.pawns.map(
                (pos,n)=>`

                  <button
                    class="ludo-token ${p.css}"
                    onclick="ludoSelectPawn(${i},${n})">

                    ${n+1}

                  </button>

                `
              ).join("")}

            </div>

            <p>
              🏆 ${p.finished}/4
              pions arrivés
            </p>

          </div>

        `
      ).join("");

  }

}


/* =========================
   PEUT DÉPLACER
========================= */

function ludoCanMove(
  playerIndex,
  pawnIndex,
  dice
){

  const p =
    ludoState.players[
      playerIndex
    ];


  const pos =
    p.pawns[pawnIndex];


  /*
   * Dans la maison :
   * il faut faire 6.
   */

  if(pos === -1){

    return dice === 6;

  }


  /*
   * Pion terminé.
   */

  if(pos === 57)
    return false;


  /*
   * Arrivée exacte.
   */

  return (
    pos + dice <= 57
  );

}


/* =========================
   Y A-T-IL UN MOUVEMENT ?
========================= */

function ludoHasMove(
  playerIndex,
  dice
){

  return ludoState
    .players[playerIndex]
    .pawns
    .some(
      (_,i)=>
        ludoCanMove(
          playerIndex,
          i,
          dice
        )
    );

}


/* =========================
   LANCER LE DÉ
========================= */

function ludoRoll(){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;

  if(ludoState.rolled)
    return;


  const p =
    ludoState.players[
      ludoState.turn
    ];


  if(!p.human)
    return;


  const dice =
    Math.floor(
      Math.random() * 6
    ) + 1;


  ludoState.dice =
    dice;

  ludoState.rolled =
    true;


  renderLudo();


  /*
   * Aucun mouvement.
   */

  if(!ludoHasMove(
    ludoState.turn,
    dice
  )){

    const message =
      document.getElementById(
        "ludoMessage"
      );


    if(message){

      message.textContent =
        "❌ Aucun mouvement possible.";

    }


    setTimeout(
      () =>
        ludoNextTurn(
          dice === 6
        ),
      1000
    );

  }

}


/* =========================
   CHOISIR UN PION
========================= */

function ludoSelectPawn(
  playerIndex,
  pawnIndex
){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;

  if(
    playerIndex !==
    ludoState.turn
  )
    return;

  if(!ludoState.rolled)
    return;


  const dice =
    ludoState.dice;


  if(!ludoCanMove(
    playerIndex,
    pawnIndex,
    dice
  )){

    return;

  }


  ludoMovePawn(
    playerIndex,
    pawnIndex,
    dice
  );

}


/* =========================
   DÉPLACER UN PION
========================= */

function ludoMovePawn(
  playerIndex,
  pawnIndex,
  dice
){

  const p =
    ludoState.players[
      playerIndex
    ];


  let pos =
    p.pawns[pawnIndex];


  /*
   * Sortie avec 6.
   */

  if(pos === -1){

    pos = 0;

  }else{

    pos += dice;

  }


  /*
   * Exactement 57 pour gagner.
   */

  if(pos > 57){

    return;

  }


  p.pawns[pawnIndex] =
    pos;


  /*
   * Arrivée.
   */

  if(pos === 57){

    p.finished++;

  }


  /*
   * Capture uniquement
   * sur le parcours commun.
   */

  ludoCapture(
    playerIndex,
    pawnIndex
  );


  /*
   * Victoire.
   */

  if(p.finished >= 4){

    ludoState.winner =
      p;


    if(p.human){

      player.points +=
        100;

      save();


      alert(
        "🏆 Félicitations ! " +
        "+100 points !"
      );

    }


    renderLudo();

    return;

  }


  /*
   * Un 6 donne un tour
   * supplémentaire.
   */

  ludoNextTurn(
    dice === 6
  );

}


/* =========================
   CAPTURE
========================= */

function ludoCapture(
  playerIndex,
  pawnIndex
){

  const player =
    ludoState.players[
      playerIndex
    ];


  const pos =
    player.pawns[
      pawnIndex
    ];


  /*
   * Les zones finales
   * ne capturent pas.
   */

  if(
    pos < 0 ||
    pos >= 52
  ){

    return;

  }


  const absolute =
    ludoAbsolutePosition(
      playerIndex,
      pos
    );


  /*
   * Cases protégées.
   */

  if(
    LUDO_SAFE.includes(
      absolute
    )
  ){

    return;

  }


  /*
   * Capture des adversaires
   * présents sur la même case.
   */

  ludoState.players.forEach(
    (p,i)=>{

      if(i === playerIndex)
        return;


      p.pawns =
        p.pawns.map(
          (enemyPos,enemyPawn)=>{

            if(enemyPos < 0)
              return enemyPos;

            if(enemyPos >= 52)
              return enemyPos;


            const enemyAbsolute =
              ludoAbsolutePosition(
                i,
                enemyPos
              );


            if(
              enemyAbsolute ===
              absolute
            ){

              return -1;

            }


            return enemyPos;

          }
        );

    }
  );

    }/* =========================
   TOUR SUIVANT
========================= */

function ludoNextTurn(
  extra
){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;


  ludoState.rolled =
    false;

  ludoState.dice =
    0;


  /*
   * Si 6 : même joueur.
   */

  if(!extra){

    ludoState.turn =
      (
        ludoState.turn + 1
      ) % 4;

  }


  renderLudo();


  const current =
    ludoState.players[
      ludoState.turn
    ];


  /*
   * CPU.
   */

  if(
    !current.human &&
    !ludoState.winner
  ){

    setTimeout(
      ludoCpuTurn,
      900
    );

  }

}


/* =========================
   TOUR CPU
========================= */

function ludoCpuTurn(){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;


  const playerIndex =
    ludoState.turn;


  const p =
    ludoState.players[
      playerIndex
    ];


  if(p.human)
    return;


  const dice =
    Math.floor(
      Math.random() * 6
    ) + 1;


  ludoState.dice =
    dice;

  ludoState.rolled =
    true;


  renderLudo();


  setTimeout(
    () => {

      ludoCpuMove(
        playerIndex,
        dice
      );

    },
    800
  );

}


/* =========================
   CHOIX CPU
========================= */

function ludoCpuMove(
  playerIndex,
  dice
){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;


  const p =
    ludoState.players[
      playerIndex
    ];


  const choices = [];


  p.pawns.forEach(
    (pos,i)=>{

      if(
        ludoCanMove(
          playerIndex,
          i,
          dice
        )
      ){

        choices.push(i);

      }

    }
  );


  /*
   * Aucun mouvement.
   */

  if(choices.length === 0){

    ludoNextTurn(
      dice === 6
    );

    return;

  }


  /*
   * Priorité CPU :
   *
   * 1. Finir un pion
   * 2. Sortir avec un 6
   * 3. Avancer le plus loin
   */

  let selected =
    choices[0];


  const finish =
    choices.find(
      i =>
        p.pawns[i] >= 0 &&
        p.pawns[i] + dice === 57
    );


  if(
    finish !== undefined
  ){

    selected =
      finish;

  }else{

    const home =
      choices.find(
        i =>
          p.pawns[i] === -1
      );


    if(
      dice === 6 &&
      home !== undefined
    ){

      selected =
        home;

    }else{

      selected =
        choices.reduce(
          (best,current)=>{

            const a =
              p.pawns[best] < 0
              ? 0
              : p.pawns[best];

            const b =
              p.pawns[current] < 0
              ? 0
              : p.pawns[current];

            return b > a
              ? current
              : best;

          },
          choices[0]
        );

    }

  }


  setTimeout(
    () => {

      ludoMovePawn(
        playerIndex,
        selected,
        dice
      );

    },
    500
  );

}


/* =========================
   RENDU APRÈS CHANGEMENT
========================= */

function ludoRefresh(){

  renderLudo();

}


/* =========================
   NOUVELLE PARTIE
========================= */

function resetLudo(){

  ludoNewGame();

}


/* =========================
   RETOUR AUX JEUX
========================= */

function ludoBack(){

  showPage("games");

}


/* =========================
   INITIALISATION
========================= */

render();
