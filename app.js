/* =========================================================
   GAMEWIN — APP.JS
   VERSION CORRIGÉE
========================================================= */

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
  JSON.parse(localStorage.games || "null") ||
  defaultGames.slice();

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

/* =========================================================
   SAUVEGARDE
========================================================= */

function save(){

  localStorage.games = JSON.stringify(games);
  localStorage.rewards = JSON.stringify(rewards);
  localStorage.player = JSON.stringify(player);
  localStorage.rewardRequests = JSON.stringify(rewardRequests);

  render();
}

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(id){

  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  const page = document.getElementById(id);

  if(page){
    page.classList.add("active");
  }

  if(id === "ludoGame"){
    renderLudo();
  }
}

/* =========================================================
   AFFICHAGE
========================================================= */

function render(){

  const userArea = document.getElementById("userArea");

  if(userArea){

    userArea.innerHTML = `
      <button class="primary" onclick="openLogin()">
        ${
          player.name === "Visiteur"
          ? "S'inscrire"
          : "👤 " + player.name
        }
      </button>
    `;
  }

  const statGames = document.getElementById("statGames");
  const statPlayers = document.getElementById("statPlayers");
  const statPoints = document.getElementById("statPoints");

  if(statGames)
    statGames.textContent = games.length;

  if(statPlayers)
    statPlayers.textContent = "1";

  if(statPoints)
    statPoints.textContent = player.points;

  const aGames = document.getElementById("aGames");
  const aPlayers = document.getElementById("aPlayers");
  const aPoints = document.getElementById("aPoints");

  if(aGames)
    aGames.textContent = games.length;

  if(aPlayers)
    aPlayers.textContent = "1";

  if(aPoints)
    aPoints.textContent = player.points;

  const gameGrid = document.getElementById("gameGrid");

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
              <button class="primary"
                onclick="startQuiz()">
                Jouer
              </button>
            `
            :
            g.type === "number"
            ? `
              <button class="primary"
                onclick="startNumberGame()">
                Jouer
              </button>
            `
            :
            g.type === "ludo"
            ? `
              <button class="primary"
                onclick="startLudo()">
                Jouer
              </button>
            `
            :
            `
              <button class="primary"
                onclick="alert('Ce jeu sera bientôt disponible.')">
                Jouer
              </button>
            `
          }

        </div>

      `).join("");
  }

  const rewardGrid = document.getElementById("rewardGrid");

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

          <button class="primary"
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
        <td>${player.name}</td>
        <td>${player.points}</td>
      </tr>
    `;
  }

  const requestsBox =
    document.getElementById("rewardRequests");

  if(requestsBox){

    if(!rewardRequests.length){

      requestsBox.innerHTML =
        `<p class="muted">
          Aucune demande de récompense.
        </p>`;

    }else{

      requestsBox.innerHTML =
        rewardRequests.map(r => `

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

            ${
              r.status === "pending"
              ? `
                <button class="primary"
                  onclick="approveReward(${r.id})">
                  ✅ Valider
                </button>

                <button class="primary"
                  onclick="rejectReward(${r.id})">
                  ❌ Refuser
                </button>
              `
              : ""
            }

          </div>

        `).join("");
    }
  }
}

/* =========================================================
   LOGIN
========================================================= */

function openLogin(){

  const modal = document.getElementById("loginModal");

  if(modal)
    modal.classList.remove("hidden");
}

function closeLogin(){

  const modal = document.getElementById("loginModal");

  if(modal)
    modal.classList.add("hidden");
}

function login(){

  const input = document.getElementById("username");

  if(!input) return;

  const name = input.value.trim();

  if(!name){

    alert("Entre un pseudo.");

    return;
  }

  player.name = name;

  closeLogin();

  save();
}

/* =========================================================
   QUIZ
========================================================= */

function startQuiz(){

  qi = 0;

  showPage("quiz");

  nextQuestion();
}

function nextQuestion(){

  if(qi >= questions.length){

    const q = document.getElementById("question");
    const a = document.getElementById("answers");
    const r = document.getElementById("quizResult");

    if(q)
      q.textContent = "Quiz terminé 🎉";

    if(a)
      a.innerHTML = `
        <button class="primary"
          onclick="showPage('games')">
          Retour aux jeux
        </button>
      `;

    if(r)
      r.textContent =
        `Tu as ${player.points} points.`;

    return;
  }

  const x = questions[qi];

  const meta = document.getElementById("quizMeta");
  const q = document.getElementById("question");
  const r = document.getElementById("quizResult");
  const a = document.getElementById("answers");

  if(meta)
    meta.textContent =
      `Question ${qi+1}/${questions.length}`;

  if(q)
    q.textContent = x.q;

  if(r)
    r.textContent = "";

  if(a){

    a.innerHTML =
      x.a.map((answer,i) => `

        <button class="answer"
          onclick="answer(${i})">

          ${String.fromCharCode(65+i)}
          — ${answer}

        </button>

      `).join("");
  }
}

function answer(i){

  const x = questions[qi];

  const result =
    document.getElementById("quizResult");

  if(i === x.c){

    player.points += 50;

    if(result)
      result.textContent =
        "Bonne réponse ! +50 points 🎉";

  }else{

    if(result)
      result.textContent =
        "Pas cette fois. Continue !";
  }

  qi++;

  setTimeout(() => {

    save();

    nextQuestion();

  },700);
}

/* =========================================================
   DEVINE LE NOMBRE
========================================================= */

function startNumberGame(){

  secretNumber =
    Math.floor(Math.random()*100)+1;

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

  if(!input || !result)
    return;

  const n = +input.value;

  if(!n || n<1 || n>100){

    alert("Entre un nombre entre 1 et 100.");

    return;
  }

  if(n === secretNumber){

    player.points += 50;

    result.textContent =
      "🎉 Bravo ! +50 points";

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

/* =========================================================
   RÉCOMPENSES
========================================================= */

function claim(cost,name){

  if(player.points < cost){

    alert("Pas assez de points.");

    return;
  }

  if(!confirm(
    "Confirmer l'échange de " +
    cost +
    " points contre " +
    name +
    " ?"
  )){
    return;
  }

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
    "Demande enregistrée. " +
    "L'administrateur doit valider."
  );
}

function approveReward(id){

  const r =
    rewardRequests.find(x => x.id === id);

  if(!r) return;

  r.status = "approved";

  save();

  alert("Récompense validée.");
}

function rejectReward(id){

  const r =
    rewardRequests.find(x => x.id === id);

  if(!r) return;

  if(r.status === "pending"){
    player.points += r.cost;
  }

  r.status = "rejected";

  save();

  alert(
    "Demande refusée. " +
    "Les points ont été rendus."
  );
}

/* =========================================================
   ADMIN
========================================================= */

function addGame(){

  const nameInput =
    document.getElementById("newGameName");

  const pointsInput =
    document.getElementById("newGamePoints");

  if(!nameInput || !pointsInput)
    return;

  const name =
    nameInput.value.trim();

  const points =
    +pointsInput.value;

  if(!name || !points){

    alert("Complète les champs.");

    return;
  }

  games.push({
    name:name,
    icon:"🎮",
    points:points,
    type:"soon"
  });

  nameInput.value = "";
  pointsInput.value = "";

  save();
}

function addReward(){

  const nameInput =
    document.getElementById("newRewardName");

  const costInput =
    document.getElementById("newRewardCost");

  if(!nameInput || !costInput)
    return;

  const name =
    nameInput.value.trim();

  const cost =
    +costInput.value;

  if(!name || !cost){

    alert("Complète les champs.");

    return;
  }

  rewards.push({
    name:name,
    cost:cost,
    icon:"🎁"
  });

  nameInput.value = "";
  costInput.value = "";

  save();
}

/* =========================================================
   FIN BLOC 1
========================================================= *//* =========================================================
   LUDO 3D CLASSIC
========================================================= */

let ludoState = null;
let ludoPlayersCount = 4;
let ludoHumanColor = "green";

const LUDO_COLORS = {

  red:{
    name:"Rouge",
    icon:"🔴",
    start:0
  },

  green:{
    name:"Vert",
    icon:"🟢",
    start:13
  },

  yellow:{
    name:"Jaune",
    icon:"🟡",
    start:26
  },

  blue:{
    name:"Bleu",
    icon:"🔵",
    start:39
  }

};

/*
  Parcours circulaire de 52 cases.
*/

const LUDO_PATH = [

  [0,0],[0,1],[0,2],[0,3],[0,4],
  [0,5],[0,6],[0,7],[0,8],[0,9],
  [0,10],[0,11],[0,12],[0,13],

  [1,13],[2,13],[3,13],[4,13],
  [5,13],[6,13],[7,13],[8,13],
  [9,13],[10,13],[11,13],[12,13],
  [13,13],

  [13,12],[13,11],[13,10],[13,9],
  [13,8],[13,7],[13,6],[13,5],
  [13,4],[13,3],[13,2],[13,1],
  [13,0],

  [12,0],[11,0],[10,0],[9,0],
  [8,0],[7,0],[6,0],[5,0],
  [4,0],[3,0],[2,0],[1,0]
];

const LUDO_SAFE = [
  0,8,13,21,26,34,39,47
];

const LUDO_HOME_SPOTS = {

  red:[
    [2,2],
    [2,4],
    [4,2],
    [4,4]
  ],

  green:[
    [2,9],
    [2,11],
    [4,9],
    [4,11]
  ],

  yellow:[
    [9,9],
    [9,11],
    [11,9],
    [11,11]
  ],

  blue:[
    [9,2],
    [9,4],
    [11,2],
    [11,4]
  ]

};

/* =========================================================
   STYLE 3D
========================================================= */

function installLudo3DStyle(){

  if(document.getElementById("ludo3DStyle"))
    return;

  const style =
    document.createElement("style");

  style.id = "ludo3DStyle";

  style.textContent = `

    #ludoGame{
      min-height:100vh;
      padding:12px 8px 40px;
      box-sizing:border-box;
      background:
        radial-gradient(
          circle at 50% 10%,
          #294f7b,
          #0a1d35 50%,
          #020812
        );
      color:white;
      overflow-x:hidden;
    }

    .l3d{
      width:100%;
      max-width:720px;
      margin:auto;
    }

    .l3d-title{
      text-align:center;
      font-size:30px;
      font-weight:900;
      margin:8px 0 4px;
      text-shadow:
        0 3px 0 #000,
        0 7px 14px #0009;
    }

    .l3d-sub{
      text-align:center;
      color:#c8d9ef;
      margin-bottom:14px;
    }

    .l3d-panel{
      background:
        linear-gradient(
          145deg,
          #183b62,
          #07162a
        );
      border:2px solid #315b88;
      border-radius:22px;
      padding:12px;
      box-shadow:
        0 18px 35px #0009,
        inset 0 1px #ffffff22;
    }

    .l3d-top{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-bottom:10px;
    }

    .l3d-turn{
      font-weight:900;
      font-size:17px;
    }

    .l3d-dice{
      width:62px;
      height:62px;
      flex-shrink:0;
      border-radius:17px;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:40px;
      background:
        linear-gradient(
          145deg,
          #ffffff,
          #c5ced9
        );
      color:#111;
      box-shadow:
        0 6px 0 #687585,
        0 12px 20px #0009;
      cursor:pointer;
      transition:.15s;
    }

    .l3d-dice:active{
      transform:translateY(5px);
      box-shadow:
        0 2px 0 #687585,
        0 6px 12px #0009;
    }

    .l3d-dice.rolling{
      animation:ludoDiceRoll .35s infinite;
    }

    @keyframes ludoDiceRoll{
      0%{transform:rotate(0) scale(1)}
      25%{transform:rotate(-12deg) scale(1.08)}
      50%{transform:rotate(12deg) scale(.96)}
      75%{transform:rotate(-8deg) scale(1.05)}
      100%{transform:rotate(0) scale(1)}
    }

    .l3d-board-wrap{
      width:100%;
      padding:7px;
      box-sizing:border-box;
      border-radius:22px;
      background:
        linear-gradient(
          145deg,
          #42688f,
          #07182d
        );
      box-shadow:
        0 18px 28px #000b,
        inset 0 2px 4px #ffffff35;
    }

    #ludoBoard3D{
      position:relative;
      width:100%;
      aspect-ratio:1;
      display:grid;
      grid-template-columns:repeat(14,1fr);
      grid-template-rows:repeat(14,1fr);
      gap:2px;
      padding:4px;
      box-sizing:border-box;
      border-radius:16px;
      overflow:hidden;
      background:#091a2d;
      box-shadow:
        inset 0 0 18px #000b;
    }

    .l3d-cell{
      position:relative;
      min-width:0;
      min-height:0;
      border-radius:3px;
      box-shadow:
        inset 1px 1px 0 #ffffff70,
        inset -2px -2px 3px #0004;
    }

    .l3d-empty{
      background:#112944;
    }

    .l3d-track{
      background:
        linear-gradient(
          145deg,
          #ffffff,
          #ccd5df
        );
    }

    .l3d-safe{
      background:
        linear-gradient(
          145deg,
          #ffffff,
          #d4dce5
        );
    }

    .l3d-safe::after{
      content:"★";
      position:absolute;
      inset:0;
      display:grid;
      place-items:center;
      color:#687687;
      font-size:clamp(9px,2.5vw,19px);
    }

    .l3d-red-home{
      background:
        linear-gradient(
          145deg,
          #ff625b,
          #b9130e
        );
    }

    .l3d-green-home{
      background:
        linear-gradient(
          145deg,
          #58ef9a,
          #07914b
        );
    }

    .l3d-yellow-home{
      background:
        linear-gradient(
          145deg,
          #fff16a,
          #d3a300
        );
    }

    .l3d-blue-home{
      background:
        linear-gradient(
          145deg,
          #66aeff,
          #1762bd
        );
    }

    .l3d-lane-red{
      background:#ef7770;
    }

    .l3d-lane-green{
      background:#62d99b;
    }

    .l3d-lane-yellow{
      background:#ffe57a;
    }

    .l3d-lane-blue{
      background:#76b6ee;
    }

    .l3d-center{
      background:
        conic-gradient(
          #e53935 0 25%,
          #ffd21f 25% 50%,
          #2f80ed 50% 75%,
          #20c96b 75% 100%
        );
    }

    .l3d-pawn{
      position:absolute;
      z-index:20;
      width:76%;
      height:76%;
      left:12%;
      top:12%;
      border-radius:50%;
      border:2px solid #fff;
      box-sizing:border-box;
      box-shadow:
        inset 4px 4px 5px #ffffff66,
        inset -5px -6px 7px #0008,
        0 5px 7px #000b;
      cursor:pointer;
      transition:.15s;
    }

    .l3d-pawn::before{
      content:"";
      position:absolute;
      width:38%;
      height:22%;
      left:16%;
      top:12%;
      border-radius:50%;
      background:#ffffff88;
    }

    .l3d-pawn.red{
      background:
        radial-gradient(
          circle at 35% 25%,
          #ffaaa5,
          #ed3028 45%,
          #920b07
        );
    }

    .l3d-pawn.green{
      background:
        radial-gradient(
          circle at 35% 25%,
          #b9ffda,
          #16d875 45%,
          #06783d
        );
    }

    .l3d-pawn.yellow{
      background:
        radial-gradient(
          circle at 35% 25%,
          #fffbc2,
          #ffd322 45%,
          #a87800
        );
    }

    .l3d-pawn.blue{
      background:
        radial-gradient(
          circle at 35% 25%,
          #c8e5ff,
          #2188eb 45%,
          #074d99
        );
    }

    .l3d-pawn.movable{
      animation:ludoPawnPulse .7s infinite;
    }

    @keyframes ludoPawnPulse{
      50%{
        transform:scale(1.22);
        filter:brightness(1.35);
      }
    }

    .l3d-info{
      text-align:center;
      min-height:24px;
      padding:9px 4px;
      color:#e7f0ff;
      font-weight:800;
    }

    .l3d-actions{
      display:flex;
      justify-content:center;
      gap:9px;
      flex-wrap:wrap;
    }

    .l3d-btn{
      border:0;
      border-radius:13px;
      padding:12px 17px;
      font-weight:900;
      cursor:pointer;
      background:
        linear-gradient(
          #ffe15a,
          #eab600
        );
      color:#101b2d;
      box-shadow:
        0 5px 0 #967200,
        0 9px 15px #0007;
    }

    .l3d-btn.secondary{
      background:#f2f5f8;
      color:#122039;
      box-shadow:
        0 5px 0 #8c99a8,
        0 9px 15px #0007;
    }

    .l3d-btn:active{
      transform:translateY(4px);
      box-shadow:0 1px 0 #777;
    }

    .l3d-setup{
      background:
        linear-gradient(
          145deg,
          #183b62,
          #07172c
        );
      border:2px solid #315b88;
      border-radius:22px;
      padding:22px;
      text-align:center;
      box-shadow:0 18px 35px #0009;
    }

    .l3d-choice{
      display:flex;
      justify-content:center;
      flex-wrap:wrap;
      gap:8px;
      margin:12px 0 18px;
    }

    .l3d-choice button{
      border:2px solid #4b6b91;
      border-radius:12px;
      padding:11px 15px;
      background:#102a49;
      color:#fff;
      font-weight:900;
      cursor:pointer;
    }

    .l3d-choice button.active{
      background:#ffd21f;
      color:#111d2d;
      border-color:#ffd21f;
      box-shadow:0 5px 10px #0007;
    }

    .l3d-name{
      width:100%;
      box-sizing:border-box;
      border:2px solid #496b93;
      border-radius:12px;
      padding:13px;
      margin:8px 0 12px;
      background:#071a30;
      color:white;
      font-size:16px;
    }

    .l3d-winner{
      text-align:center;
      padding:15px;
      margin-top:10px;
      border-radius:15px;
      background:#f4c842;
      color:#111b2c;
      font-size:20px;
      font-weight:1000;
    }

    @media(max-width:420px){

      .l3d-panel{
        padding:8px;
      }

      .l3d-title{
        font-size:25px;
      }

      .l3d-turn{
        font-size:14px;
      }

      .l3d-dice{
        width:54px;
        height:54px;
        font-size:34px;
      }

    }

  `;

  document.head.appendChild(style);
}

/* =========================================================
   CRÉATION DE LA PARTIE
========================================================= */

function ludoCreateState(){

  const allColors =
    ["red","green","yellow","blue"];

  let colors =
    allColors.slice(0,ludoPlayersCount);

  /*
    La couleur choisie par le joueur
    est toujours présente.
  */

  if(!colors.includes(ludoHumanColor)){

    colors[0] = ludoHumanColor;
  }

  ludoState = {

    players:colors.map(
      (color,index) => ({

        color:color,

        name:
          color === ludoHumanColor
          ? (
              player.name === "Visiteur"
              ? "Joueur"
              : player.name
            )
          : "CPU " + (index+1),

        human:
          color === ludoHumanColor,

        tokens:[
          -1,
          -1,
          -1,
          -1
        ]

      })
    ),

    turn:0,

    dice:0,

    rolling:false,

    winner:null,

    message:"Lance le dé pour commencer !"

  };
}

/* =========================================================
   ÉCRAN DE CONFIGURATION
========================================================= */

function ludoSetupHTML(){

  let html = `

    <div class="l3d-setup">

      <div class="l3d-title">
        🎲 LUDO 3D
      </div>

      <p class="l3d-sub">
        Mode classique
      </p>

      <strong>
        Nombre de joueurs
      </strong>

      <div class="l3d-choice">
  `;

  [2,3,4].forEach(n => {

    html += `

      <button
        class="${ludoPlayersCount === n ? "active" : ""}"
        onclick="ludoPlayersCount=${n};renderLudo()">

        ${n} joueurs

      </button>

    `;

  });

  html += `

      </div>

      <strong>
        Choisis ta couleur
      </strong>

      <div class="l3d-choice">
  `;

  Object.keys(LUDO_COLORS)
    .forEach(color => {

      html += `

        <button
          class="${ludoHumanColor === color ? "active" : ""}"
          onclick="ludoHumanColor='${color}';renderLudo()">

          ${LUDO_COLORS[color].icon}
          ${LUDO_COLORS[color].name}

        </button>

      `;

    });

  html += `

      </div>

      <input
        id="ludoPlayerName"
        class="l3d-name"
        placeholder="Ton nom (optionnel)"
        value="${
          player.name === "Visiteur"
          ? ""
          : player.name
        }"
      >

      <button
        class="l3d-btn"
        onclick="startLudoGame()">

        ▶ Commencer la partie

      </button>

    </div>

  `;

  return html;
}

/* =========================================================
   START LUDO
========================================================= */

function startLudo(){

  installLudo3DStyle();

  ludoState = null;

  showPage("ludoGame");

  renderLudo();
}

function startLudoGame(){

  const input =
    document.getElementById("ludoPlayerName");

  if(input){

    const name =
      input.value.trim();

    if(name){

      player.name = name;

      localStorage.player =
        JSON.stringify(player);
    }
  }

  ludoCreateState();

  renderLudo();
}

/* =========================================================
   FIN BLOC 2
========================================================= *//* =========================================================
   LUDO — FONCTIONS DE JEU
========================================================= */

function ludoCurrentPlayer(){

  if(!ludoState)
    return null;

  return ludoState.players[
    ludoState.turn
  ];
}

function ludoAbsolutePosition(
  playerData,
  position
){

  return (
    LUDO_COLORS[playerData.color].start +
    position
  ) % 52;
}

/* =========================================================
   PIONS JOUABLES
========================================================= */

function ludoMovableTokens(
  playerData,
  dice
){

  const result = [];

  if(!playerData || !dice)
    return result;

  playerData.tokens.forEach(
    (position,index) => {

      /*
        Maison → sortie avec 6.
      */

      if(position === -1){

        if(dice === 6)
          result.push(index);

        return;
      }

      /*
        Arrivée exacte.
      */

      if(position + dice <= 52){

        result.push(index);
      }

    }
  );

  return result;
}

/* =========================================================
   LANCER DU DÉ
========================================================= */

function ludoRoll(){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;

  if(ludoState.rolling)
    return;

  const current =
    ludoCurrentPlayer();

  if(!current)
    return;

  /*
    Le joueur humain lance
    uniquement pendant son tour.
  */

  if(!current.human)
    return;

  ludoState.rolling = true;

  let count = 0;

  const faces = [
    "",
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
  ];

  const animation =
    setInterval(() => {

      ludoState.dice =
        1 +
        Math.floor(
          Math.random()*6
        );

      renderLudo();

      const die =
        document.getElementById("ludoDie");

      if(die)
        die.classList.add("rolling");

      count++;

      if(count >= 9){

        clearInterval(animation);

        ludoState.rolling = false;

        const playerData =
          ludoCurrentPlayer();

        const possible =
          ludoMovableTokens(
            playerData,
            ludoState.dice
          );

        if(!possible.length){

          const rolled =
            ludoState.dice;

          ludoState.message =
            "Aucun pion ne peut avancer.";

          renderLudo();

          setTimeout(() => {

            ludoState.dice = 0;

            if(rolled === 6){

              ludoState.message =
                "🎲 Tu rejoues !";

              renderLudo();

            }else{

              ludoNextTurn();

            }

          },800);

        }else{

          ludoState.message =
            possible.length === 1
            ? "Clique sur ton pion possible."
            : "Choisis le pion à déplacer.";

          renderLudo();

        }

      }

    },90);
}

/* =========================================================
   DÉPLACEMENT D'UN PION
========================================================= */

function ludoMoveToken(index){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;

  if(ludoState.rolling)
    return;

  const current =
    ludoCurrentPlayer();

  if(!current)
    return;

  if(!current.human)
    return;

  const dice =
    ludoState.dice;

  const possible =
    ludoMovableTokens(
      current,
      dice
    );

  if(!possible.includes(index))
    return;

  const oldPosition =
    current.tokens[index];

  /*
    Sortie de maison.
  */

  if(oldPosition === -1){

    current.tokens[index] = 0;

  }else{

    current.tokens[index] += dice;

  }

  /*
    Capture.
  */

  ludoCapture(
    current,
    index
  );

  /*
    Vérification victoire.
  */

  if(
    current.tokens.every(
      position => position === 52
    )
  ){

    ludoState.winner =
      current;

    ludoState.message =
      "🏆 Tu as gagné !";

    player.points += 100;

    save();

    renderLudo();

    return;
  }

  /*
    Un 6 = tour supplémentaire.
  */

  if(dice === 6){

    ludoState.dice = 0;

    ludoState.message =
      "🎲 6 ! Tu rejoues.";

    renderLudo();

  }else{

    ludoNextTurn();

  }
}

/* =========================================================
   CAPTURE
========================================================= */

function ludoCapture(
  movingPlayer,
  tokenIndex
){

  const position =
    movingPlayer.tokens[tokenIndex];

  /*
    Maison ou arrivée :
    pas de capture.
  */

  if(
    position < 0 ||
    position >= 52
  ){

    return;
  }

  const absolute =
    ludoAbsolutePosition(
      movingPlayer,
      position
    );

  /*
    Cases étoiles protégées.
  */

  if(
    LUDO_SAFE.includes(absolute)
  ){

    return;
  }

  ludoState.players.forEach(
    otherPlayer => {

      if(
        otherPlayer === movingPlayer
      ){

        return;
      }

      otherPlayer.tokens =
        otherPlayer.tokens.map(
          otherPosition => {

            if(
              otherPosition >= 0 &&
              otherPosition < 52
            ){

              const otherAbsolute =
                ludoAbsolutePosition(
                  otherPlayer,
                  otherPosition
                );

              if(
                otherAbsolute === absolute
              ){

                return -1;
              }
            }

            return otherPosition;
          }
        );

    }
  );
}

/* =========================================================
   TOUR SUIVANT
========================================================= */

function ludoNextTurn(){

  if(!ludoState)
    return;

  ludoState.turn =
    (
      ludoState.turn + 1
    ) %
    ludoState.players.length;

  ludoState.dice = 0;

  ludoState.rolling = false;

  const current =
    ludoCurrentPlayer();

  ludoState.message =
    current.human
    ? "À toi de jouer !"
    : "🤖 Le CPU joue...";

  renderLudo();

  if(!current.human){

    setTimeout(
      ludoCpuTurn,
      700
    );
  }
}

/* =========================================================
   CPU
========================================================= */

function ludoCpuTurn(){

  if(!ludoState)
    return;

  if(ludoState.winner)
    return;

  const cpu =
    ludoCurrentPlayer();

  if(!cpu || cpu.human)
    return;

  ludoState.rolling = true;

  renderLudo();

  setTimeout(() => {

    const dice =
      1 +
      Math.floor(
        Math.random()*6
      );

    ludoState.dice = dice;

    ludoState.rolling = false;

    const possible =
      ludoMovableTokens(
        cpu,
        dice
      );

    /*
      Aucun mouvement.
    */

    if(!possible.length){

      ludoState.message =
        "🤖 Aucun mouvement possible.";

      renderLudo();

      setTimeout(() => {

        ludoState.dice = 0;

        if(dice === 6){

          ludoState.message =
            "🤖 Le CPU rejoue.";

          renderLudo();

          setTimeout(
            ludoCpuTurn,
            600
          );

        }else{

          ludoNextTurn();

        }

      },700);

      return;
    }

    /*
      Intelligence simple du CPU :
      1. terminer un pion
      2. sortir un pion avec 6
      3. avancer le pion le plus loin
    */

    let chosen =
      possible.find(
        index =>
          cpu.tokens[index] >= 0 &&
          cpu.tokens[index] + dice === 52
      );

    if(chosen === undefined){

      chosen =
        possible.find(
          index =>
            cpu.tokens[index] === -1 &&
            dice === 6
        );

    }

    if(chosen === undefined){

      chosen =
        possible.reduce(
          (best,index) => {

            const current =
              cpu.tokens[index];

            const bestValue =
              cpu.tokens[best];

            if(current > bestValue)
              return index;

            return best;

          },
          possible[0]
        );

    }

    /*
      Déplacement CPU.
    */

    if(cpu.tokens[chosen] === -1){

      cpu.tokens[chosen] = 0;

    }else{

      cpu.tokens[chosen] += dice;

    }

    /*
      Capture.
    */

    ludoCapture(
      cpu,
      chosen
    );

    /*
      Victoire CPU.
    */

    if(
      cpu.tokens.every(
        position => position === 52
      )
    ){

      ludoState.winner =
        cpu;

      ludoState.message =
        "🤖 " +
        cpu.name +
        " a gagné !";

      renderLudo();

      return;
    }

    /*
      6 = rejouer.
    */

    if(dice === 6){

      ludoState.dice = 0;

      ludoState.message =
        "🤖 6 ! Le CPU rejoue.";

      renderLudo();

      setTimeout(
        ludoCpuTurn,
        700
      );

    }else{

      ludoNextTurn();

    }

  },800);
}

/* =========================================================
   NOUVELLE PARTIE
========================================================= */

function ludoNewGame(){

  ludoState = null;

  renderLudo();
}

/* =========================================================
   CRÉATION DU PLATEAU
========================================================= */

function ludoBuildBoard(){

  let html =
    '<div class="l3d-board-wrap">' +
    '<div id="ludoBoard3D">';

  for(let row=0;row<14;row++){

    for(let col=0;col<14;col++){

      let className =
        "l3d-cell l3d-empty";

      /*
        Parcours
      */

      const pathIndex =
        LUDO_PATH.findIndex(
          position =>
            position[0] === row &&
            position[1] === col
        );

      if(pathIndex >= 0){

        className =
          "l3d-cell l3d-track";

        if(
          LUDO_SAFE.includes(pathIndex)
        ){

          className +=
            " l3d-safe";
        }

      }

      /*
        Maisons colorées.
      */

      if(
        row <= 5 &&
        col <= 5 &&
        pathIndex < 0
      ){

        className =
          "l3d-cell l3d-red-home";
      }

      if(
        row <= 5 &&
        col >= 8 &&
        pathIndex < 0
      ){

        className =
          "l3d-cell l3d-green-home";
      }

      if(
        row >= 8 &&
        col <= 5 &&
        pathIndex < 0
      ){

        className =
          "l3d-cell l3d-blue-home";
      }

      if(
        row >= 8 &&
        col >= 8 &&
        pathIndex < 0
      ){

        className =
          "l3d-cell l3d-yellow-home";
      }

      /*
        Centre.
      */

      if(
        row >= 6 &&
        row <= 7 &&
        col >= 6 &&
        col <= 7
      ){

        className =
          "l3d-cell l3d-center";
      }

      html +=
        `<div
          class="${className}"
          data-row="${row}"
          data-col="${col}"
          data-path="${pathIndex}">
        </div>`;

    }

  }

  html +=
    "</div></div>";

  return html;
}

/* =========================================================
   POSITION D'UN PION
========================================================= */

function ludoPlacePawn(
  playerData,
  tokenIndex,
  html
){

  const position =
    playerData.tokens[tokenIndex];

  /*
    Pion dans la maison.
  */

  if(position === -1){

    const spot =
      LUDO_HOME_SPOTS[
        playerData.color
      ][tokenIndex];

    return html.replace(
      `data-row="${spot[0]}" data-col="${spot[1]}"`,
      `data-row="${spot[0]}" data-col="${spot[1]}"`
    );
  }

  /*
    Pion arrivé.
  */

  if(position === 52){

    return html;
  }

  /*
    Pion sur le parcours.
  */

  const absolute =
    ludoAbsolutePosition(
      playerData,
      position
    );

  const spot =
    LUDO_PATH[absolute];

  return html;
}

/* =========================================================
   DESSIN DES PIONS
========================================================= */

function ludoDrawPawns(){

  const board =
    document.getElementById("ludoBoard3D");

  if(!board || !ludoState)
    return;

  /*
    Supprime les anciens pions.
  */

  board
    .querySelectorAll(".l3d-pawn")
    .forEach(
      pawn => pawn.remove()
    );

  ludoState.players.forEach(
    (playerData,playerIndex) => {

      playerData.tokens.forEach(
        (position,tokenIndex) => {

          let row;
          let col;

          if(position === -1){

            const spot =
              LUDO_HOME_SPOTS[
                playerData.color
              ][tokenIndex];

            row = spot[0];
            col = spot[1];

          }else if(position === 52){

            /*
              Les pions arrivés vont
              visuellement au centre.
            */

            row = 6;
            col = 6;

          }else{

            const absolute =
              ludoAbsolutePosition(
                playerData,
                position
              );

            const spot =
              LUDO_PATH[absolute];

            row = spot[0];
            col = spot[1];
          }

          const cell =
            board.querySelector(
              `[data-row="${row}"][data-col="${col}"]`
            );

          if(!cell)
            return;

          const pawn =
            document.createElement("div");

          pawn.className =
            "l3d-pawn " +
            playerData.color;

          /*
            Plusieurs pions sur une même case :
            léger décalage.
          */

          const offset =
            tokenIndex * 5;

          pawn.style.transform =
            `translate(${offset/2}px,${offset/2}px)`;

          /*
            Pion jouable.
          */

          if(
            playerData.human &&
            playerIndex === ludoState.turn &&
            !ludoState.winner &&
            !ludoState.rolling &&
            ludoState.dice > 0 &&
            ludoMovableTokens(
              playerData,
              ludoState.dice
            ).includes(tokenIndex)
          ){

            pawn.classList.add(
              "movable"
            );

            pawn.onclick = () => {

              ludoMoveToken(
                tokenIndex
              );

            };
          }

          cell.appendChild(pawn);

        }
      );

    }
  );
}

/* =========================================================
   AFFICHAGE FINAL DU LUDO
========================================================= */

function renderLudo(){

  installLudo3DStyle();

  const box =
    document.getElementById("ludoGame");

  if(!box)
    return;

  /*
    Configuration avant partie.
  */

  if(!ludoState){

    box.innerHTML =
      ludoSetupHTML();

    return;
  }

  const current =
    ludoCurrentPlayer();

  const faces = [
    "",
    "⚀",
    "⚁",
    "⚂",
    "⚃",
    "⚄",
    "⚅"
  ];

  let html = `

    <div class="l3d">

      <div class="l3d-title">
        🎲 LUDO 3D
      </div>

      <div class="l3d-sub">
        Mode classique •
        ${ludoState.players.length} joueurs
      </div>

      <div class="l3d-panel">

        <div class="l3d-top">

          <div class="l3d-turn">

            ${
              current.human
              ? "🧑 Ton tour"
              : "🤖 " + current.name
            }

            ${LUDO_COLORS[current.color].icon}

          </div>

          <div
            id="ludoDie"
            class="l3d-dice ${
              ludoState.rolling
              ? "rolling"
              : ""
            }"
            onclick="ludoRoll()">

            ${
              ludoState.dice
              ? faces[ludoState.dice]
              : "🎲"
            }

          </div>

        </div>

        ${ludoBuildBoard()}

        <div class="l3d-info">

          ${ludoState.message}

        </div>

        <div class="l3d-actions">

          <button
            class="l3d-btn"
            onclick="ludoRoll()">

            🎲 Lancer le dé

          </button>

          <button
            class="l3d-btn secondary"
            onclick="ludoNewGame()">

            ↻ Nouvelle partie

          </button>

        </div>

        ${
          ludoState.winner
          ? `
            <div class="l3d-winner">

              🏆
              ${ludoState.winner.name}
              gagne !

              ${
                ludoState.winner.human
                ? "<br>+100 points 🎉"
                : ""
              }

            </div>
          `
          : ""
        }

      </div>

    </div>

  `;

  box.innerHTML = html;

  /*
    Les pions sont dessinés après
    la création du plateau.
  */

  ludoDrawPawns();
}

/* =========================================================
   INITIALISATION
========================================================= *

}

function initGameWin(){

  document
    .querySelectorAll("nav button[data-page]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => showPage(button.dataset.page)
      );

    });

  render();

}

if(
  document.readyState !== "loading"
){

  initGameWin();

}else{

  document.addEventListener(
    "DOMContentLoaded",
    initGameWin
  );

}

}

}

/* =========================================================
   FIN APP.JS
========================================================= */
