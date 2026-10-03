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

let games =
  JSON.parse(localStorage.games || "null");

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

    {
      name:"Badge Champion",
      cost:500,
      icon:"🏅"
    },

    {
      name:"Carte cadeau",
      cost:2000,
      icon:"🎁"
    },

    {
      name:"Accessoire gaming",
      cost:5000,
      icon:"🎧"
    }

  ];


let player =
  JSON.parse(localStorage.player || "null") || {

    name:"Visiteur",
    points:0

  };


let rewardRequests =
  JSON.parse(
    localStorage.rewardRequests || "null"
  ) || [];


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
    .forEach(
      p => p.classList.remove("active")
    );


  const page =
    document.getElementById(id);


  if(page){

    page.classList.add("active");

  }


  if(id === "ludoGame"){

    if(
      typeof ludoState !== "undefined" &&
      ludoState
    ){

      renderLudo();

    }

  }

}


document
  .querySelectorAll("nav button")
  .forEach(button => {

    button.onclick = () =>
      showPage(button.dataset.page);

  });


/* =========================
   AFFICHAGE
========================= */

function render(){

  const userArea =
    document.getElementById(
      "userArea"
    );


  if(userArea){

    userArea.innerHTML = `

      <button
        class="primary"
        onclick="openLogin()">

        ${
          player.name === "Visiteur"
          ? "S'inscrire"
          : "👤 " + player.name
        }

      </button>

    `;

  }


  const statGames =
    document.getElementById(
      "statGames"
    );

  const statPlayers =
    document.getElementById(
      "statPlayers"
    );

  const statPoints =
    document.getElementById(
      "statPoints"
    );


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
    document.getElementById(
      "aGames"
    );

  const aPlayers =
    document.getElementById(
      "aPlayers"
    );

  const aPoints =
    document.getElementById(
      "aPoints"
    );


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
    document.getElementById(
      "gameGrid"
    );


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
    document.getElementById(
      "rewardGrid"
    );


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
    document.getElementById(
      "rankingBody"
    );


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
    document.getElementById(
      "rewardRequests"
    );


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
   NOMBRE
========================= */

function startNumberGame(){

  secretNumber =
    Math.floor(
      Math.random() * 100
    ) + 1;


  document.getElementById(
    "numberGuess"
  ).value = "";


  document.getElementById(
    "numberResult"
  ).textContent =
    "Entre un nombre entre 1 et 100.";


  showPage("numberGame");

}


function guessNumber(){

  const n =
    +document.getElementById(
      "numberGuess"
    ).value;


  if(!n || n < 1 || n > 100){

    alert(
      "Entre un nombre entre 1 et 100."
    );

    return;

  }


  if(n === secretNumber){

    player.points += 50;

    document.getElementById(
      "numberResult"
    ).textContent =
      "🎉 Bravo ! Tu as trouvé ! +50 points";

    secretNumber = 0;

    save();

  }else if(n < secretNumber){

    document.getElementById(
      "numberResult"
    ).textContent =
      "⬆️ Plus grand !";

  }else{

    document.getElementById(
      "numberResult"
    ).textContent =
      "⬇️ Plus petit !";

  }

}


/* =========================
   PROFIL
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

    document.getElementById(
      "question"
    ).textContent =
      "Quiz terminé 🎉";


    document.getElementById(
      "answers"
    ).innerHTML = `

      <button
        class="primary"
        onclick="showPage('games')">

        Retour aux jeux

      </button>

    `;


    document.getElementById(
      "quizResult"
    ).textContent =
      `Tu as maintenant ${player.points} points.`;

    return;

  }


  const x =
    questions[qi];


  document.getElementById(
    "quizMeta"
  ).textContent =
    `Question ${qi + 1}/${questions.length}`;


  document.getElementById(
    "question"
  ).textContent =
    x.q;


  document.getElementById(
    "quizResult"
  ).textContent = "";


  document.getElementById(
    "answers"
  ).innerHTML =
    x.a.map(
      (a,i) => `

        <button
          class="answer"
          onclick="answer(${i})">

          ${String.fromCharCode(65+i)}
          — ${a}

        </button>

      `
    ).join("");

}


function answer(i){

  const x =
    questions[qi];


  if(i === x.c){

    player.points += 50;

    document.getElementById(
      "quizResult"
    ).textContent =
      "Bonne réponse ! +50 points 🎉";

  }else{

    document.getElementById(
      "quizResult"
    ).textContent =
      "Pas cette fois. Continue !";

  }


  qi++;


  setTimeout(
    () => {

      save();

      nextQuestion();

    },
    700
  );

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
   ADMIN
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
   LUDO CLASSIQUE — MOTEUR
================================================== */

let ludoState = null;


const LUDO_COLORS = [

  {
    id:"green",
    name:"Vert",
    icon:"🟢",
    css:"ludo-green"
  },

  {
    id:"red",
    name:"Rouge",
    icon:"🔴",
    css:"ludo-red"
  },

  {
    id:"yellow",
    name:"Jaune",
    icon:"🟡",
    css:"ludo-yellow"
  },

  {
    id:"blue",
    name:"Bleu",
    icon:"🔵",
    css:"ludo-blue"
  }

];


/*
 * Parcours extérieur.
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
 * Départs.
 */

const LUDO_START = [
  0,
  13,
  26,
  39
];


/*
 * Cases protégées.
 */

const LUDO_SAFE = [
  0,
  8,
  13,
  21,
  26,
  34,
  39,
  47
];


/*
 * Couloirs finaux.
 */

const LUDO_LANES = [

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

];/* ==================================================
   LUDO — ÉCRAN DE CONFIGURATION
================================================== */

function startLudo(){

  createLudoScreen();

  showPage("ludoGame");

  ludoShowSetup();

}


/* =========================
   CRÉER L'ÉCRAN
========================= */

function createLudoScreen(){

  let page =
    document.getElementById(
      "ludoGame"
    );


  if(!page){

    page =
      document.createElement(
        "section"
      );

    page.id =
      "ludoGame";

    page.className =
      "page";

    document.querySelector("main")
      .appendChild(page);

  }


  page.innerHTML = `

    <div class="ludo-app">

      <div class="ludo-top">

        <button
          class="ludo-back"
          onclick="showPage('games')">

          ↩

        </button>

        <div class="ludo-title">

          🎲 LUDO CLASSIC

        </div>

        <div class="ludo-points">

          🏆 ${player.points}

        </div>

      </div>


      <div
        id="ludoContent">
      </div>

    </div>

  `;


  ludoInjectStyle();

}


/* =========================
   CONFIGURATION
========================= */

function ludoShowSetup(){

  const box =
    document.getElementById(
      "ludoContent"
    );


  box.innerHTML = `

    <div class="ludo-setup">

      <div class="ludo-setup-title">

        CLASSIC MODE ❓

      </div>


      <div class="ludo-setup-panel">

        <h1>
          CHOOSE COLOR AND NAME
        </h1>


        <div class="ludo-player-preview">

          <div class="ludo-color-choice">

            <span
              class="big-color green">
              🟢
            </span>

            <div>

              <input
                id="ludoName0"
                value="${
                  player.name === "Visiteur"
                  ? "PLAYER1"
                  : player.name
                }"
                maxlength="12">

              <div class="ludo-human">
                👤 TOI
              </div>

            </div>

          </div>


          <div class="ludo-color-choice">

            <span
              class="big-color red">
              🔴
            </span>

            <div>

              <input
                id="ludoName1"
                value="PLAYER2"
                maxlength="12">

              <div class="ludo-cpu">
                🤖 CPU
              </div>

            </div>

          </div>

        </div>


        <div class="ludo-mode-buttons">

          <button
            onclick="ludoSelectPlayers(2)"
            class="ludo-mode">

            2P

          </button>


          <button
            onclick="ludoSelectPlayers(3)"
            class="ludo-mode">

            3P

          </button>


          <button
            onclick="ludoSelectPlayers(4)"
            class="ludo-mode">

            4P

          </button>

        </div>


        <button
          class="ludo-play"
          onclick="ludoStartMatch(4)">

          ▶ PLAY

        </button>


        <button
          class="ludo-load"
          onclick="ludoStartMatch(4)">

          💾 LOAD

        </button>


      </div>

    </div>

  `;

}


function ludoSelectPlayers(count){

  ludoStartMatch(count);

}


/* =========================
   DÉMARRER LA PARTIE
========================= */

function ludoStartMatch(count){

  const name0 =
    document.getElementById(
      "ludoName0"
    )?.value.trim()
    || player.name
    || "PLAYER1";


  const name1 =
    document.getElementById(
      "ludoName1"
    )?.value.trim()
    || "PLAYER2";


  ludoState = {

    players:[],

    turn:0,

    dice:0,

    rolled:false,

    winner:null,

    animating:false

  };


  for(
    let i=0;
    i<count;
    i++
  ){

    ludoState.players.push({

      id:i,

      name:
        i === 0
        ? name0
        : i === 1
        ? name1
        : "PLAYER" + (i+1),

      color:
        LUDO_COLORS[i],

      human:
        i === 0,

      pawns:[
        -1,
        -1,
        -1,
        -1
      ],

      finished:0

    });

  }


  ludoShowBoard();

}


/* =========================
   PLATEAU
========================= */

function ludoShowBoard(){

  const box =
    document.getElementById(
      "ludoContent"
    );


  box.innerHTML = `

    <div class="ludo-game-screen">

      <div
        id="ludoBoardArea"
        class="ludo-board-area">
      </div>


      <div
        id="ludoControls"
        class="ludo-controls">
      </div>


      <button
        class="ludo-new"
        onclick="ludoNewGameFromBoard()">

        🔄 NOUVELLE PARTIE

      </button>

    </div>

  `;


  renderLudo();

}


function ludoNewGameFromBoard(){

  ludoShowSetup();

}


/* =========================
   DESSIN
========================= */

function renderLudo(){

  if(!ludoState)
    return;


  const boardArea =
    document.getElementById(
      "ludoBoardArea"
    );


  if(!boardArea)
    return;


  boardArea.innerHTML = `

    <div class="ludo-board">

      ${ludoBuildCells()}

    </div>

  `;


  ludoPlacePawns();


  const controls =
    document.getElementById(
      "ludoControls"
    );


  if(!controls)
    return;


  const current =
    ludoState.players[
      ludoState.turn
    ];


  controls.innerHTML = `

    <div class="ludo-current">

      <div class="ludo-current-player">

        ${current.color.icon}

        ${current.name}

      </div>


      <div
        id="ludoDiceVisual"
        class="ludo-dice">

        ${
          ludoState.dice
          ? ludoDiceFace(
              ludoState.dice
            )
          : "⚄"
        }

      </div>


      <button
        class="ludo-roll"
        onclick="ludoRoll()"
        ${
          !current.human ||
          ludoState.rolled ||
          ludoState.winner ||
          ludoState.animating
          ? "disabled"
          : ""
        }>

        🎲 LANCER LE DÉ

      </button>


      <div class="ludo-message">

        ${
          ludoState.winner
          ? "🏆 " +
            ludoState.winner.name +
            " GAGNE !"
          : ludoState.rolled
          ? current.human
            ? "👉 Choisis un pion."
            : "🤖 Le CPU joue..."
          : current.human
          ? "À toi de jouer !"
          : "🤖 Tour de " + current.name
        }

      </div>

    </div>

  `;

}


/* =========================
   CASES
========================= */

function ludoBuildCells(){

  let html = "";


  for(
    let r=0;
    r<15;
    r++
  ){

    for(
      let c=0;
      c<15;
      c++
    ){

      let classes =
        "ludo-cell";


      /*
       * Maisons.
       */

      if(
        r<6 &&
        c<6
      ){

        classes +=
          " ludo-home-red";

      }


      if(
        r<6 &&
        c>8
      ){

        classes +=
          " ludo-home-green";

      }


      if(
        r>8 &&
        c>8
      ){

        classes +=
          " ludo-home-yellow";

      }


      if(
        r>8 &&
        c<6
      ){

        classes +=
          " ludo-home-blue";

      }


      /*
       * Parcours.
       */

      const path =
        LUDO_PATH.findIndex(
          p =>
            p[0] === r &&
            p[1] === c
        );


      if(path >= 0){

        classes +=
          " ludo-track";

        if(
          LUDO_SAFE.includes(path)
        ){

          classes +=
            " ludo-safe";

        }

      }


      /*
       * Couloirs.
       */

      LUDO_LANES.forEach(
        (lane,i)=>{

          if(
            lane.some(
              p =>
                p[0] === r &&
                p[1] === c
            )
          ){

            classes +=
              " ludo-lane-" + i;

          }

        }
      );


      /*
       * Centre.
       */

      if(
        r>=6 &&
        r<=8 &&
        c>=6 &&
        c<=8
      ){

        classes +=
          " ludo-center";

      }


      html += `

        <div
          class="${classes}"
          data-r="${r}"
          data-c="${c}">

          ${
            LUDO_SAFE.includes(path)
            ? "⭐"
            : ""
          }

        </div>

      `;

    }

  }


  return html;

}


/* =========================
   PLACER LES PIONS
========================= */

function ludoPlacePawns(){

  const board =
    document.querySelector(
      ".ludo-board"
    );


  if(!board)
    return;


  const homes = [

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
    (p,pi)=>{

      p.pawns.forEach(
        (pos,si)=>{

          if(pos === -1){

            const [r,c] =
              homes[pi][si];


            ludoAddPawn(
              board,
              r,
              c,
              p,
              si,
              pi
            );

            return;

          }


          if(pos >= 0 && pos < 52){

            const abs =
              (
                LUDO_START[pi] +
                pos
              ) % 52;


            const [r,c] =
              LUDO_PATH[abs];


            ludoAddPawn(
              board,
              r,
              c,
              p,
              si,
              pi
            );

            return;

          }


          if(
            pos >= 52 &&
            pos <= 56
          ){

            const lane =
              LUDO_LANES[pi];


            const point =
              lane[
                pos - 52
              ];


            if(point){

              ludoAddPawn(
                board,
                point[0],
                point[1],
                p,
                si,
                pi
              );

            }

          }

        }
      );

    }
  );

}


/* =========================
   CRÉER UN PION
========================= */

function ludoAddPawn(
  board,
  r,
  c,
  playerData,
  pawnIndex,
  playerIndex
){

  const cell =
    board.querySelector(
      `[data-r="${r}"][data-c="${c}"]`
    );


  if(!cell)
    return;


  const token =
    document.createElement(
      "button"
    );


  token.className =
    "ludo-piece " +
    playerData.color.css;


  token.textContent =
    "●";


  token.title =
    playerData.name +
    " - Pion " +
    (pawnIndex + 1);


  if(
    playerIndex ===
    ludoState.turn &&
    playerData.human &&
    ludoState.rolled &&
    ludoCanMove(
      playerIndex,
      pawnIndex,
      ludoState.dice
    )
  ){

    token.classList.add(
      "ludo-selectable"
    );


    token.onclick = () =>
      ludoMove(
        playerIndex,
        pawnIndex
      );

  }


  cell.appendChild(
    token
  );

}


/* =========================
   DÉ
========================= */

function ludoDiceFace(n){

  return [

    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"

  ][n-1] || "⚄";

}


/* =========================
   LANCER
========================= */

function ludoRoll(){

  if(!ludoState)
    return;


  if(
    ludoState.winner ||
    ludoState.rolled ||
    ludoState.animating
  )
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


  if(
    !ludoHasMove(
      ludoState.turn,
      dice
    )
  ){

    setTimeout(
      () => {

        ludoNextTurn(
          dice === 6
        );

      },
      900
    );

    return;

  }


  /*
   * S'il n'y a qu'un seul
   * pion possible, on ne force
   * pas le joueur à chercher.
   */

  const choices =
    ludoState.players[
      ludoState.turn
    ].pawns
    .map(
      (_,i) => i
    )
    .filter(
      i =>
        ludoCanMove(
          ludoState.turn,
          i,
          dice
        )
    );


  if(choices.length === 1){

    setTimeout(
      () => {

        ludoMove(
          ludoState.turn,
          choices[0]
        );

      },
      350
    );

  }

  }/* =========================
   RÈGLES DE DÉPLACEMENT
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
   * Pion dans la maison.
   * Il faut obligatoirement 6.
   */

  if(pos === -1){

    return dice === 6;

  }


  /*
   * Pion déjà terminé.
   */

  if(pos === 56)
    return false;


  /*
   * Arrivée exacte.
   */

  return (
    pos + dice <= 56
  );

}


function ludoHasMove(
  playerIndex,
  dice
){

  return ludoState
    .players[playerIndex]
    .pawns
    .some(
      (_,i) =>
        ludoCanMove(
          playerIndex,
          i,
          dice
        )
    );

}


/* =========================
   DÉPLACER UN PION
========================= */

function ludoMove(
  playerIndex,
  pawnIndex
){

  if(!ludoState)
    return;


  if(ludoState.winner)
    return;


  const p =
    ludoState.players[
      playerIndex
    ];


  const dice =
    ludoState.dice;


  if(
    !ludoCanMove(
      playerIndex,
      pawnIndex,
      dice
    )
  )
    return;


  ludoState.animating =
    true;


  let start =
    p.pawns[pawnIndex];


  /*
   * Sortie de maison.
   */

  if(start === -1){

    p.pawns[pawnIndex] =
      0;


    ludoRenderAfterMove(
      playerIndex,
      pawnIndex,
      dice
    );


    return;

  }


  /*
   * Déplacement animé
   * case par case.
   */

  let step = 0;


  const total =
    dice;


  const moveStep =
    () => {

      if(step >= total){

        ludoFinishMove(
          playerIndex,
          pawnIndex,
          dice
        );

        return;

      }


      p.pawns[pawnIndex]++;


      step++;


      renderLudo();


      setTimeout(
        moveStep,
        160
      );

    };


  moveStep();

}


/* =========================
   SORTIE AVEC 6
========================= */

function ludoRenderAfterMove(
  playerIndex,
  pawnIndex,
  dice
){

  renderLudo();


  setTimeout(
    () => {

      ludoFinishMove(
        playerIndex,
        pawnIndex,
        dice
      );

    },
    300
  );

}


/* =========================
   FIN DU DÉPLACEMENT
========================= */

function ludoFinishMove(
  playerIndex,
  pawnIndex,
  dice
){

  const p =
    ludoState.players[
      playerIndex
    ];


  /*
   * Capture.
   */

  ludoCapture(
    playerIndex,
    pawnIndex
  );


  /*
   * Pion arrivé au bout.
   */

  if(
    p.pawns[pawnIndex] === 56
  ){

    /*
     * On ne compte qu'une fois.
     */

    if(
      !p._finishedPawns
    ){

      p._finishedPawns = {};

    }


    if(
      !p._finishedPawns[pawnIndex]
    ){

      p._finishedPawns[pawnIndex] =
        true;

      p.finished++;

    }

  }


  /*
   * Victoire.
   */

  if(p.finished >= 4){

    ludoState.winner =
      p;


    ludoState.animating =
      false;


    renderLudo();


    if(p.human){

      player.points +=
        100;


      save();


      setTimeout(
        () => {

          alert(
            "🏆 VICTOIRE !\n\n" +
            "+100 points GameWin"
          );

        },
        200
      );

    }


    return;

  }


  /*
   * 6 = rejouer.
   */

  const extra =
    dice === 6;


  ludoNextTurn(
    extra
  );

}


/* =========================
   CAPTURE
========================= */

function ludoCapture(
  playerIndex,
  pawnIndex
){

  const p =
    ludoState.players[
      playerIndex
    ];


  const relative =
    p.pawns[pawnIndex];


  /*
   * Les couloirs finaux
   * ne peuvent pas être capturés.
   */

  if(
    relative < 0 ||
    relative >= 52
  ){

    return;

  }


  const absolute =
    (
      LUDO_START[playerIndex] +
      relative
    ) % 52;


  /*
   * Case protégée.
   */

  if(
    LUDO_SAFE.includes(
      absolute
    )
  ){

    return;

  }


  ludoState.players.forEach(
    (enemy,enemyIndex)=>{

      if(
        enemyIndex ===
        playerIndex
      )
        return;


      enemy.pawns =
        enemy.pawns.map(
          enemyPos => {

            if(
              enemyPos < 0 ||
              enemyPos >= 52
            ){

              return enemyPos;

            }


            const enemyAbsolute =
              (
                LUDO_START[
                  enemyIndex
                ] +
                enemyPos
              ) % 52;


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

}


/* =========================
   TOUR SUIVANT
========================= */

function ludoNextTurn(
  extra
){

  if(
    !ludoState ||
    ludoState.winner
  )
    return;


  ludoState.rolled =
    false;


  ludoState.dice =
    0;


  ludoState.animating =
    false;


  if(!extra){

    ludoState.turn =
      (
        ludoState.turn + 1
      ) %
      ludoState.players.length;

  }


  renderLudo();


  const current =
    ludoState.players[
      ludoState.turn
    ];


  if(!current.human){

    setTimeout(
      ludoCpuTurn,
      800
    );

  }

}


/* =========================
   CPU
========================= */

function ludoCpuTurn(){

  if(
    !ludoState ||
    ludoState.winner
  )
    return;


  const index =
    ludoState.turn;


  const p =
    ludoState.players[index];


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

      ludoCpuChoose(
        index,
        dice
      );

    },
    800
  );

}


/* =========================
   CHOIX CPU
========================= */

function ludoCpuChoose(
  playerIndex,
  dice
){

  const p =
    ludoState.players[
      playerIndex
    ];


  const choices =
    p.pawns
      .map(
        (_,i) => i
      )
      .filter(
        i =>
          ludoCanMove(
            playerIndex,
            i,
            dice
          )
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


  let selected =
    choices[0];


  /*
   * Priorité 1 :
   * terminer un pion.
   */

  const finish =
    choices.find(
      i =>
        p.pawns[i] >= 0 &&
        p.pawns[i] + dice === 56
    );


  if(
    finish !== undefined
  ){

    selected =
      finish;

  }else{

    /*
     * Priorité 2 :
     * sortir un pion avec 6.
     */

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

      /*
       * Priorité 3 :
       * pion le plus avancé.
       */

      selected =
        choices.reduce(
          (best,i) => {

            const a =
              p.pawns[best] < 0
              ? 0
              : p.pawns[best];


            const b =
              p.pawns[i] < 0
              ? 0
              : p.pawns[i];


            return b > a
              ? i
              : best;

          },
          choices[0]
        );

    }

  }


  setTimeout(
    () => {

      ludoMove(
        playerIndex,
        selected
      );

    },
    500
  );

}


/* =========================
   STYLE LUDO
========================= */

function ludoInjectStyle(){

  if(
    document.getElementById(
      "ludoClassicStyle"
    )
  )
    return;


  const style =
    document.createElement(
      "style"
    );


  style.id =
    "ludoClassicStyle";


  style.textContent = `

    .ludo-app{
      max-width:700px;
      margin:0 auto;
      padding:8px;
    }

    .ludo-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      margin-bottom:12px;
    }

    .ludo-title{
      font-weight:900;
      font-size:24px;
      color:#ffd21c;
    }

    .ludo-points{
      background:#152b4c;
      border:2px solid #29466e;
      border-radius:12px;
      padding:8px 12px;
      font-weight:bold;
    }

    .ludo-back{
      border:0;
      border-radius:12px;
      background:#173254;
      color:white;
      font-size:26px;
      padding:7px 12px;
    }

    .ludo-setup{
      background:#0b1830;
      border-radius:22px;
      padding:14px;
      text-align:center;
    }

    .ludo-setup-title{
      font-size:28px;
      font-weight:900;
      color:#ffd21c;
      margin:12px;
    }

    .ludo-setup-panel{
      background:#5d4775;
      border:4px solid #d7a632;
      border-radius:24px;
      padding:20px;
      box-shadow:0 6px 0 #30203f;
    }

    .ludo-setup-panel h1{
      color:white;
      font-size:23px;
      margin:4px 0 20px;
    }

    .ludo-player-preview{
      background:#6f5689;
      border:3px solid #e4b33e;
      border-radius:18px;
      padding:12px;
      margin-bottom:18px;
    }

    .ludo-color-choice{
      display:flex;
      align-items:center;
      gap:14px;
      margin:9px 0;
    }

    .big-color{
      font-size:45px;
    }

    .ludo-color-choice input{
      width:100%;
      box-sizing:border-box;
      background:#3c2850;
      border:2px solid #a68ac2;
      border-radius:10px;
      color:white;
      padding:12px;
      font-size:17px;
      font-weight:bold;
    }

    .ludo-human,
    .ludo-cpu{
      color:white;
      font-size:12px;
      margin-top:3px;
      text-align:left;
    }

    .ludo-mode-buttons{
      display:flex;
      justify-content:center;
      gap:8px;
      flex-wrap:wrap;
      margin:15px 0;
    }

    .ludo-mode{
      min-width:90px;
      border:3px solid #e0aa31;
      border-radius:14px;
      padding:13px 22px;
      background:#4c9be9;
      color:white;
      font-size:25px;
      font-weight:900;
    }

    .ludo-play{
      border:3px solid #159044;
      border-radius:15px;
      padding:14px 30px;
      background:#39db78;
      color:white;
      font-size:25px;
      font-weight:900;
      margin:8px;
    }

    .ludo-load{
      border:3px solid #d8a52d;
      border-radius:15px;
      padding:14px 25px;
      background:#378ddd;
      color:white;
      font-size:20px;
      font-weight:900;
      margin:8px;
    }

    .ludo-board{
      width:100%;
      max-width:600px;
      aspect-ratio:1;
      margin:10px auto;
      display:grid;
      grid-template-columns:repeat(15,1fr);
      grid-template-rows:repeat(15,1fr);
      gap:1px;
      padding:3px;
      box-sizing:border-box;
      background:#102642;
      border-radius:12px;
      overflow:hidden;
      box-shadow:0 5px 20px rgba(0,0,0,.35);
    }

    .ludo-cell{
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      border:1px solid #718097;
      font-size:11px;
      overflow:visible;
    }

    .ludo-home-red{
      background:#ed2818;
    }

    .ludo-home-green{
      background:#19d96b;
    }

    .ludo-home-yellow{
      background:#f5dc00;
    }

    .ludo-home-blue{
      background:#1b8fca;
    }

    .ludo-track{
      background:#f7f7f7;
    }

    .ludo-lane-0{
      background:#50db91;
    }

    .ludo-lane-1{
      background:#f46a6a;
    }

    .ludo-lane-2{
      background:#f3dd40;
    }

    .ludo-lane-3{
      background:#58a8e9;
    }

    .ludo-center{
      background:
        linear-gradient(
          45deg,
          #19d96b 0 25%,
          #ed2818 25% 50%,
          #58a8e9 50% 75%,
          #f3dd40 75%
        );
    }

    .ludo-safe{
      color:#666;
      font-size:16px;
      font-weight:bold;
    }

    .ludo-piece{
      width:27px;
      height:27px;
      min-width:27px;
      border-radius:50%;
      border:2px solid white;
      z-index:20;
      position:relative;
      box-shadow:
        0 3px 5px rgba(0,0,0,.45),
        inset 0 2px 2px rgba(255,255,255,.45);
      color:transparent;
      padding:0;
    }

    .ludo-green{
      background:#12c85c;
    }

    .ludo-red{
      background:#e93228;
    }

    .ludo-yellow{
      background:#f1d20a;
    }

    .ludo-blue{
      background:#159bd5;
    }

    .ludo-selectable{
      outline:4px solid #ffd21c;
      animation:ludoPulse .7s infinite alternate;
      cursor:pointer;
    }

    @keyframes ludoPulse{
      from{
        transform:scale(1);
      }
      to{
        transform:scale(1.18);
      }
    }

    .ludo-controls{
      background:#0d1d36;
      border:2px solid #27476f;
      border-radius:18px;
      padding:12px;
      text-align:center;
    }

    .ludo-current-player{
      color:white;
      font-size:21px;
      font-weight:900;
      margin-bottom:5px;
    }

    .ludo-dice{
      font-size:65px;
      line-height:1;
      margin:4px;
      text-shadow:0 4px 7px rgba(0,0,0,.5);
    }

    .ludo-roll{
      border:0;
      border-radius:13px;
      padding:13px 22px;
      background:#ffd21c;
      color:#111;
      font-weight:900;
      font-size:18px;
    }

    .ludo-roll:disabled{
      opacity:.45;
    }

    .ludo-message{
      color:#ffd21c;
      font-weight:bold;
      margin-top:8px;
      min-height:24px;
    }

    .ludo-new{
      width:100%;
      margin-top:10px;
      border:0;
      border-radius:12px;
      padding:12px;
      background:#ffd21c;
      color:#111;
      font-weight:900;
      font-size:16px;
    }

    @media(max-width:500px){

      .ludo-title{
        font-size:19px;
      }

      .ludo-piece{
        width:19px;
        height:19px;
        min-width:19px;
        border-width:1px;
      }

      .ludo-safe{
        font-size:10px;
      }

      .ludo-dice{
        font-size:52px;
      }

      .ludo-mode{
        min-width:75px;
        padding:10px 15px;
      }

    }

  `;


  document.head.appendChild(
    style
  );

}


/* =========================
   INITIALISATION
========================= */

render();
