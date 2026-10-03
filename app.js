/* =========================================================
   GAMEWIN — APP.JS COMPLET
   LUDO CLASSIQUE
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

let games = JSON.parse(localStorage.games || "null");
if(!Array.isArray(games) || !games.length){
  games = defaultGames.slice();
}

if(!games.some(g => g.type === "ludo")){
  games.push({
    name:"Ludo",
    icon:"🎲",
    points:100,
    type:"ludo"
  });
}

let rewards = JSON.parse(localStorage.rewards || "null") || [
  {name:"Badge Champion",cost:500,icon:"🏅"},
  {name:"Carte cadeau",cost:2000,icon:"🎁"},
  {name:"Accessoire gaming",cost:5000,icon:"🎧"}
];

let player = JSON.parse(localStorage.player || "null") || {
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
  localStorage.rewardRequests =
    JSON.stringify(rewardRequests);

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

document.querySelectorAll("nav button")
  .forEach(b => {
    b.onclick = () => showPage(b.dataset.page);
  });

/* =========================================================
   AFFICHAGE PRINCIPAL
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

  const statGames =
    document.getElementById("statGames");

  const statPlayers =
    document.getElementById("statPlayers");

  const statPoints =
    document.getElementById("statPoints");

  if(statGames)
    statGames.textContent = games.length;

  if(statPlayers)
    statPlayers.textContent = "1";

  if(statPoints)
    statPoints.textContent = player.points;

  const aGames =
    document.getElementById("aGames");

  const aPlayers =
    document.getElementById("aPlayers");

  const aPoints =
    document.getElementById("aPoints");

  if(aGames)
    aGames.textContent = games.length;

  if(aPlayers)
    aPlayers.textContent = "1";

  if(aPoints)
    aPoints.textContent = player.points;

  const gameGrid =
    document.getElementById("gameGrid");

  if(gameGrid){

    gameGrid.innerHTML = games.map(g => `

      <div class="game">

        <div class="icon">${g.icon}</div>

        <h3>${g.name}</h3>

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

          <div class="icon">${r.icon}</div>

          <h3>${r.name}</h3>

          <p>${r.cost} points</p>

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
        <td>
          ${player.points.toLocaleString("fr-FR")}
        </td>
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
        rewardRequests.map(r => {

          let action = "";

          if(r.status === "pending"){
            action = `
              <button class="primary"
                onclick="approveReward(${r.id})">
                ✅ Valider
              </button>

              <button class="primary"
                onclick="rejectReward(${r.id})">
                ❌ Refuser
              </button>
            `;
          }

          return `
            <div class="panel">

              <h3>🎁 ${r.reward}</h3>

              <p>👤 ${r.player}</p>

              <p>💰 ${r.cost} points</p>

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

/* =========================================================
   DEVINE LE NOMBRE
========================================================= */

function startNumberGame(){

  secretNumber =
    Math.floor(Math.random() * 100) + 1;

  const input =
    document.getElementById("numberGuess");

  const result =
    document.getElementById("numberResult");

  if(input) input.value = "";

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
    alert("Entre un nombre entre 1 et 100.");
    return;
  }

  if(n === secretNumber){

    player.points += 50;

    result.textContent =
      "🎉 Bravo ! Tu as trouvé ! +50 points";

    secretNumber = 0;

    save();

  }else if(n < secretNumber){

    result.textContent = "⬆️ Plus grand !";

  }else{

    result.textContent = "⬇️ Plus petit !";

  }
}

/* =========================================================
   CONNEXION
========================================================= */

function openLogin(){
  const modal =
    document.getElementById("loginModal");

  if(modal)
    modal.classList.remove("hidden");
}

function closeLogin(){
  const modal =
    document.getElementById("loginModal");

  if(modal)
    modal.classList.add("hidden");
}

function login(){

  const input =
    document.getElementById("username");

  const n =
    input.value.trim();

  if(!n){
    alert("Entre un pseudo.");
    return;
  }

  player.name = n;

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

    document.getElementById("question")
      .textContent = "Quiz terminé 🎉";

    document.getElementById("answers")
      .innerHTML = `
        <button class="primary"
          onclick="showPage('games')">
          Retour aux jeux
        </button>
      `;

    document.getElementById("quizResult")
      .textContent =
      `Tu as maintenant ${player.points} points.`;

    return;
  }

  const x = questions[qi];

  document.getElementById("quizMeta")
    .textContent =
    `Question ${qi + 1}/${questions.length}`;

  document.getElementById("question")
    .textContent = x.q;

  document.getElementById("quizResult")
    .textContent = "";

  document.getElementById("answers")
    .innerHTML =
      x.a.map((a,i) => `
        <button class="answer"
          onclick="answer(${i})">
          ${String.fromCharCode(65+i)}
          — ${a}
        </button>
      `).join("");
}

function answer(i){

  const x = questions[qi];

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

/* =========================================================
   RÉCOMPENSES
========================================================= */

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
    rewardRequests.find(r => r.id === id);

  if(!request) return;

  request.status = "approved";

  save();

  alert("Récompense validée.");
}

function rejectReward(id){

  const request =
    rewardRequests.find(r => r.id === id);

  if(!request) return;

  if(request.status === "pending"){
    player.points += request.cost;
  }

  request.status = "rejected";

  save();

  alert(
    "La demande a été refusée et les points ont été rendus au joueur."
  );
}

/* =========================================================
   ADMIN
========================================================= */

function addGame(){

  const input =
    document.getElementById("newGameName");

  const points =
    +document.getElementById("newGamePoints").value;

  const n = input.value.trim();

  if(!n || !points){
    alert("Complète les champs.");
    return;
  }

  games.push({
    name:n,
    icon:"🎮",
    points:points,
    type:"soon"
  });

  input.value = "";

  document.getElementById("newGamePoints").value = "";

  save();
}

function addReward(){

  const input =
    document.getElementById("newRewardName");

  const cost =
    +document.getElementById("newRewardCost").value;

  const n = input.value.trim();

  if(!n || !cost){
    alert("Complète les champs.");
    return;
  }

  rewards.push({
    name:n,
    cost:cost,
    icon:"🎁"
  });

  input.value = "";

  document.getElementById("newRewardCost").value = "";

  save();
}/* =========================================================
   LUDO CLASSIQUE — DONNÉES
========================================================= */

let ludoState = null;

const LUDO_COLORS = [
  {
    name:"Rouge",
    key:"red",
    icon:"🔴",
    start:0,
    human:false
  },
  {
    name:"Vert",
    key:"green",
    icon:"🟢",
    start:13,
    human:true
  },
  {
    name:"Jaune",
    key:"yellow",
    icon:"🟡",
    start:26,
    human:false
  },
  {
    name:"Bleu",
    key:"blue",
    icon:"🔵",
    start:39,
    human:false
  }
];

/*
  Parcours extérieur du plateau.
  52 cases.
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
  Cases sûres.
*/

const LUDO_SAFE = [
  0,8,13,21,26,34,39,47
];

/*
  Couloirs de couleur.
*/

const LUDO_LANES = {
  red:[
    [1,7],[2,7],[3,7],[4,7],[5,7]
  ],

  green:[
    [7,1],[7,2],[7,3],[7,4],[7,5]
  ],

  yellow:[
    [7,13],[7,12],[7,11],[7,10],[7,9]
  ],

  blue:[
    [13,7],[12,7],[11,7],[10,7],[9,7]
  ]
};

/*
  Positions des 4 pions dans chaque maison.
*/

const LUDO_HOMES = {

  red:[
    [1,1],[1,4],[4,1],[4,4]
  ],

  green:[
    [1,10],[1,13],[4,10],[4,13]
  ],

  blue:[
    [10,1],[10,4],[13,1],[13,4]
  ],

  yellow:[
    [10,10],[10,13],[13,10],[13,13]
  ]

};

/* =========================================================
   STYLE LUDO
========================================================= */

function ludoStyle(){

  if(document.getElementById("ludoClassicStyle"))
    return;

  const s = document.createElement("style");

  s.id = "ludoClassicStyle";

  s.textContent = `

  #ludoGame{
    width:100%;
  }

  .ludo-wrap{
    width:100%;
    max-width:680px;
    margin:auto;
  }

  .ludo-title{
    text-align:center;
    font-size:30px;
    font-weight:900;
    margin:10px 0 18px;
    color:#fff;
  }

  .ludo-subtitle{
    text-align:center;
    color:#dbe7ff;
    margin-bottom:18px;
  }

  .ludo-setup{
    background:#0e203d;
    border:3px solid #25466f;
    border-radius:24px;
    padding:24px 18px;
    box-shadow:0 10px 30px #0005;
  }

  .ludo-mode{
    text-align:center;
    font-size:25px;
    font-weight:900;
    color:#ffd21c;
    margin-bottom:18px;
  }

  .ludo-choice-title{
    text-align:center;
    font-size:18px;
    font-weight:700;
    margin:14px 0;
    color:#fff;
  }

  .ludo-player-buttons{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:9px;
    margin-bottom:20px;
  }

  .ludo-player-btn{
    border:2px solid #54739e;
    background:#132b4e;
    color:white;
    border-radius:12px;
    padding:13px 5px;
    font-size:16px;
    font-weight:800;
  }

  .ludo-player-btn.selected{
    background:#ffd21c;
    color:#07162c;
    border-color:#ffd21c;
  }

  .ludo-player-btn.disabled{
    opacity:.35;
  }

  .ludo-name{
    width:100%;
    box-sizing:border-box;
    padding:14px;
    border-radius:12px;
    border:2px solid #4d6d98;
    background:#091b34;
    color:#fff;
    font-size:16px;
    margin-bottom:15px;
  }

  .ludo-color-list{
    display:flex;
    justify-content:center;
    gap:10px;
    flex-wrap:wrap;
    margin-bottom:20px;
  }

  .ludo-color-btn{
    border:3px solid transparent;
    background:#152f52;
    border-radius:50%;
    width:50px;
    height:50px;
    font-size:25px;
  }

  .ludo-color-btn.selected{
    border-color:#fff;
    transform:scale(1.08);
  }

  .ludo-play{
    width:100%;
    border:0;
    border-radius:15px;
    padding:17px;
    background:#ffd21c;
    color:#101c2d;
    font-size:21px;
    font-weight:900;
  }

  .ludo-board-box{
    background:#0b1c35;
    border:3px solid #294a76;
    border-radius:22px;
    padding:8px;
    box-shadow:0 12px 35px #0006;
  }

  #ludoBoard{
    width:100%;
    aspect-ratio:1;
    display:grid;
    grid-template-columns:repeat(15,1fr);
    grid-template-rows:repeat(15,1fr);
    gap:2px;
    background:#162e4d;
    border-radius:16px;
    overflow:hidden;
  }

  .ludo-cell{
    position:relative;
    min-width:0;
    min-height:0;
    display:flex;
    justify-content:center;
    align-items:center;
    border:1px solid #72809a;
    background:#f7f7f7;
    overflow:hidden;
  }

  .ludo-empty{
    background:#102744;
    border-color:#17385e;
  }

  .ludo-home-red{
    background:#ef241b;
  }

  .ludo-home-green{
    background:#22c879;
  }

  .ludo-home-yellow{
    background:#ffd529;
  }

  .ludo-home-blue{
    background:#2e83df;
  }

  .ludo-lane-red{
    background:#f36b6b;
  }

  .ludo-lane-green{
    background:#55d99b;
  }

  .ludo-lane-yellow{
    background:#ffe477;
  }

  .ludo-lane-blue{
    background:#70b5f2;
  }

  .ludo-track{
    background:#f7f7f7;
  }

  .ludo-start-red{
    background:#ef241b;
  }

  .ludo-start-green{
    background:#22c879;
  }

  .ludo-start-yellow{
    background:#ffd529;
  }

  .ludo-start-blue{
    background:#2e83df;
  }

  .ludo-star{
    font-size:clamp(10px,3.5vw,23px);
    line-height:1;
    color:#ffd21c;
    text-shadow:0 1px 2px #333;
  }

  .ludo-token{
    width:72%;
    height:72%;
    max-width:34px;
    max-height:34px;
    border-radius:50%;
    border:2px solid #fff;
    box-shadow:0 3px 7px #0008;
    position:relative;
    z-index:5;
  }

  .ludo-token.red{
    background:#ed2922;
  }

  .ludo-token.green{
    background:#12c96c;
  }

  .ludo-token.yellow{
    background:#ffd321;
  }

  .ludo-token.blue{
    background:#1684e8;
  }

  .ludo-token.movable{
    animation:ludoPulse .75s infinite;
    cursor:pointer;
    box-shadow:
      0 0 0 3px #fff,
      0 0 12px #ffd21c;
  }

  @keyframes ludoPulse{
    50%{transform:scale(1.15)}
  }

  .ludo-center{
    background:
      conic-gradient(
        #ef241b 0 25%,
        #ffd529 25% 50%,
        #2e83df 50% 75%,
        #22c879 75% 100%
      ) !important;
  }

  .ludo-info{
    margin-top:12px;
    background:#102744;
    border:3px solid #294a76;
    border-radius:22px;
    padding:17px;
    text-align:center;
  }

  .ludo-turn{
    font-size:24px;
    font-weight:900;
    color:#fff;
    margin-bottom:8px;
  }

  .ludo-dice{
    width:80px;
    height:80px;
    margin:10px auto;
    background:#0a1a32;
    border:4px solid #fff;
    border-radius:10px;
    display:flex;
    justify-content:center;
    align-items:center;
    color:#fff;
    font-size:48px;
    font-weight:900;
  }

  .ludo-roll{
    width:90%;
    max-width:370px;
    border:0;
    border-radius:16px;
    background:#ffd21c;
    color:#10203a;
    padding:16px;
    font-size:20px;
    font-weight:900;
  }

  .ludo-roll:disabled{
    opacity:.4;
  }

  .ludo-status{
    color:#ffd21c;
    font-size:17px;
    font-weight:800;
    min-height:26px;
    margin-top:10px;
  }

  .ludo-players{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:8px;
    margin-top:13px;
  }

  .ludo-player-card{
    padding:9px;
    border-radius:10px;
    background:#173253;
    color:#fff;
    font-size:13px;
    font-weight:700;
  }

  .ludo-player-card.active{
    outline:3px solid #ffd21c;
  }

  .ludo-actions{
    display:flex;
    gap:10px;
    margin-top:14px;
  }

  .ludo-actions button{
    flex:1;
  }

  .ludo-back{
    border:0;
    border-radius:13px;
    padding:13px;
    background:#29486e;
    color:#fff;
    font-weight:800;
  }

  .ludo-new{
    border:0;
    border-radius:13px;
    padding:13px;
    background:#ffd21c;
    color:#101c2d;
    font-weight:900;
  }

  .ludo-win{
    background:#102f50;
    border:3px solid #ffd21c;
    border-radius:20px;
    padding:20px;
    text-align:center;
    color:#fff;
  }

  .ludo-win h2{
    color:#ffd21c;
    margin-top:0;
  }

  @media(max-width:420px){
    .ludo-title{
      font-size:25px;
    }

    .ludo-setup{
      padding:17px 12px;
    }

    .ludo-info{
      padding:12px;
    }

    .ludo-dice{
      width:65px;
      height:65px;
      font-size:38px;
    }
  }

  `;

  document.head.appendChild(s);
}

/* =========================================================
   PAGE LUDO
========================================================= */

function ensureLudoPage(){

  let page = document.getElementById("ludoGame");

  if(!page){

    page = document.createElement("section");

    page.id = "ludoGame";
    page.className = "page";

    document.body.appendChild(page);
  }

  return page;
}

/* =========================================================
   ÉCRAN CLASSIC MODE
========================================================= */

let ludoSetupPlayers = 4;
let ludoSetupColor = "green";

function startLudo(){

  ludoStyle();

  const page = ensureLudoPage();

  document.querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  page.classList.add("active");

  renderLudoSetup();
}

function renderLudoSetup(){

  const page = ensureLudoPage();

  page.innerHTML = `

    <div class="ludo-wrap">

      <div class="ludo-title">
        🎲 LUDO CLASSIC
      </div>

      <div class="ludo-setup">

        <div class="ludo-mode">
          CLASSIC MODE
        </div>

        <div class="ludo-subtitle">
          Choisis le nombre de joueurs
        </div>

        <div class="ludo-player-buttons">

          ${[2,3,4].map(n => `
            <button
              class="ludo-player-btn
              ${ludoSetupPlayers === n ? "selected" : ""}"
              onclick="ludoChoosePlayers(${n})">
              ${n}P
            </button>
          `).join("")}

          <button class="ludo-player-btn disabled">
            5P
          </button>

          <button class="ludo-player-btn disabled">
            6P
          </button>

        </div>

        <div class="ludo-choice-title">
          Ton nom
        </div>

        <input
          id="ludoPlayerName"
          class="ludo-name"
          value="${player.name === "Visiteur" ? "" : player.name}"
          placeholder="Entre ton nom">

        <div class="ludo-choice-title">
          Choisis ta couleur
        </div>

        <div class="ludo-color-list">

          <button
            class="ludo-color-btn
            ${ludoSetupColor === "red" ? "selected" : ""}"
            onclick="ludoChooseColor('red')">
            🔴
          </button>

          <button
            class="ludo-color-btn
            ${ludoSetupColor === "green" ? "selected" : ""}"
            onclick="ludoChooseColor('green')">
            🟢
          </button>

          <button
            class="ludo-color-btn
            ${ludoSetupColor === "yellow" ? "selected" : ""}"
            onclick="ludoChooseColor('yellow')">
            🟡
          </button>

          <button
            class="ludo-color-btn
            ${ludoSetupColor === "blue" ? "selected" : ""}"
            onclick="ludoChooseColor('blue')">
            🔵
          </button>

        </div>

        <button
          class="ludo-play"
          onclick="ludoPlayGame()">
          ▶ PLAY
        </button>

      </div>

    </div>
  `;
}

function ludoChoosePlayers(n){

  ludoSetupPlayers = n;

  renderLudoSetup();
}

function ludoChooseColor(color){

  ludoSetupColor = color;

  renderLudoSetup();
}

/* =========================================================
   DÉMARRAGE PARTIE
========================================================= */

function ludoPlayGame(){

  const input =
    document.getElementById("ludoPlayerName");

  let humanName =
    input ? input.value.trim() : "";

  if(!humanName){
    humanName = "Toi";
  }

  player.name = humanName;

  const colors = [
    "red",
    "green",
    "yellow",
    "blue"
  ];

  const selected = ludoSetupColor;

  const orderedColors = [
    selected,
    ...colors.filter(c => c !== selected)
  ];

  const count = ludoSetupPlayers;

  const players = orderedColors
    .slice(0,count)
    .map((color,index) => {

      const base =
        LUDO_COLORS.find(x => x.key === color);

      return {
        name:index === 0
          ? humanName
          : "CPU " + base.name,

        key:color,
        icon:base.icon,
        start:base.start,
        human:index === 0,
        pawns:[-1,-1,-1,-1],
        finished:0
      };
    });

  ludoState = {
    players:players,
    turn:0,
    dice:0,
    rolled:false,
    winner:null,
    message:"À toi de jouer !"
  };

  renderLudo();
}

/* =========================================================
   NOUVELLE PARTIE
========================================================= */

function ludoNewGame(){

  renderLudoSetup();
}

/* =========================================================
   RENDU LUDO
========================================================= */

function renderLudo(){

  ludoStyle();

  const page = ensureLudoPage();

  if(!ludoState){

    renderLudoSetup();

    return;
  }

  if(ludoState.winner !== null){

    renderLudoWinner();

    return;
  }

  page.innerHTML = `

    <div class="ludo-wrap">

      <div class="ludo-title">
        🎲 LUDO CLASSIC
      </div>

      <div class="ludo-board-box">

        <div id="ludoBoard"></div>

      </div>

      <div class="ludo-info">

        <div class="ludo-turn">
          ${ludoState.players[ludoState.turn].icon}
          ${ludoState.players[ludoState.turn].name}
        </div>

        <div class="ludo-dice">
          ${ludoState.dice || "⚄"}
        </div>

        <button
          class="ludo-roll"
          onclick="ludoRoll()"
          ${ludoState.rolled ? "disabled" : ""}>
          🎲 LANCER LE DÉ
        </button>

        <div class="ludo-status">
          ${ludoState.message}
        </div>

        <div class="ludo-players">

          ${ludoState.players.map((p,i) => `

            <div class="
              ludo-player-card
              ${i === ludoState.turn ? "active" : ""}
            ">

              ${p.icon}
              ${p.name}

              <br>

              🏁 ${p.finished}/4

            </div>

          `).join("")}

        </div>

        <div class="ludo-actions">

          <button
            class="ludo-new"
            onclick="ludoNewGame()">
            🔄 NOUVELLE PARTIE
          </button>

          <button
            class="ludo-back"
            onclick="showPage('games')">
            ← JEUX
          </button>

        </div>

      </div>

    </div>
  `;

  drawLudoBoard();
}

/* =========================================================
   PLATEAU 15 × 15
========================================================= */

function drawLudoBoard(){

  const board =
    document.getElementById("ludoBoard");

  if(!board) return;

  board.innerHTML = "";

  const cells = [];

  for(let r=0;r<15;r++){

    for(let c=0;c<15;c++){

      const cell =
        document.createElement("div");

      cell.className = "ludo-cell ludo-empty";

      cell.dataset.row = r;
      cell.dataset.col = c;

      cells.push(cell);

      board.appendChild(cell);
    }
  }

  /*
    Maisons colorées.
  */

  cells.forEach(cell => {

    const r = +cell.dataset.row;
    const c = +cell.dataset.col;

    if(r <= 5 && c <= 5)
      cell.className =
        "ludo-cell ludo-home-red";

    else if(r <= 5 && c >= 9)
      cell.className =
        "ludo-cell ludo-home-green";

    else if(r >= 9 && c <= 5)
      cell.className =
        "ludo-cell ludo-home-blue";

    else if(r >= 9 && c >= 9)
      cell.className =
        "ludo-cell ludo-home-yellow";
  });

  /*
    Parcours extérieur.
  */

  LUDO_PATH.forEach((pos,index) => {

    const [r,c] = pos;

    const cell =
      cells[r*15+c];

    cell.className =
      "ludo-cell ludo-track";

    if(index === 0)
      cell.classList.add("ludo-start-red");

    if(index === 13)
      cell.classList.add("ludo-start-green");

    if(index === 26)
      cell.classList.add("ludo-start-yellow");

    if(index === 39)
      cell.classList.add("ludo-start-blue");

    if(LUDO_SAFE.includes(index)){

      const star =
        document.createElement("span");

      star.className = "ludo-star";
      star.textContent = "★";

      cell.appendChild(star);
    }
  });

  /*
    Couloirs finaux.
  */

  Object.entries(LUDO_LANES)
    .forEach(([color,positions]) => {

      positions.forEach(([r,c]) => {

        const cell =
          cells[r*15+c];

        cell.className =
          "ludo-cell ludo-lane-" + color;
      });
    });

  /*
    Centre.
  */

  for(let r=6;r<=8;r++){

    for(let c=6;c<=8;c++){

      const cell =
        cells[r*15+c];

      cell.className =
        "ludo-cell ludo-center";
    }
  }

  /*
    Pions dans les maisons.
  */

  ludoState.players.forEach((p,pi) => {

    p.pawns.forEach((progress,pawnIndex) => {

      if(progress === -1){

        const [r,c] =
          LUDO_HOMES[p.key][pawnIndex];

        const cell =
          cells[r*15+c];

        addToken(
          cell,
          p,
          pi,
          pawnIndex,
          true
        );
      }
    });
  });

  /*
    Pions sur le parcours.
  */

  ludoState.players.forEach((p,pi) => {

    p.pawns.forEach((progress,pawnIndex) => {

      if(progress >= 0 && progress < 52){

        const global =
          (p.start + progress) % 52;

        const [r,c] =
          LUDO_PATH[global];

        const cell =
          cells[r*15+c];

        addToken(
          cell,
          p,
          pi,
          pawnIndex,
          false
        );
      }

      /*
        Couloir final.
      */

      if(progress >= 52 && progress <= 55){

        const laneIndex =
          progress - 52;

        const [r,c] =
          LUDO_LANES[p.key][laneIndex];

        const cell =
          cells[r*15+c];

        addToken(
          cell,
          p,
          pi,
          pawnIndex,
          false
        );
      }

    });

  });
}

/* =========================================================
   AJOUT D'UN PION
========================================================= */

function addToken(
  cell,
  playerData,
  playerIndex,
  pawnIndex,
  home
){

  const token =
    document.createElement("div");

  token.className =
    "ludo-token " + playerData.key;

  /*
    Si c'est le tour humain,
    après le dé, les pions possibles
    brillent et deviennent cliquables.
  */

  if(
    ludoState.rolled &&
    ludoState.turn === playerIndex &&
    playerData.human &&
    canMovePawn(playerIndex,pawnIndex)
  ){

    token.classList.add("movable");

    token.onclick = () =>
      ludoMovePawn(pawnIndex);
  }

  cell.appendChild(token);
}

/* =========================================================
   DÉ
========================================================= */

const DICE_SYMBOLS = [
  "",
  "⚀",
  "⚁",
  "⚂",
  "⚃",
  "⚄",
  "⚅"
];

function ludoRoll(){

  if(!ludoState) return;

  if(ludoState.rolled) return;

  const current =
    ludoState.players[ludoState.turn];

  if(!current.human){

    return;
  }

  const dice =
    Math.floor(Math.random()*6)+1;

  ludoState.dice = DICE_SYMBOLS[dice];
  ludoState.rolled = true;

  ludoState.message =
    "Choisis un pion possible.";

  renderLudo();

  const movable =
    current.pawns.some(
      (_,i) => canMovePawn(ludoState.turn,i)
    );

  if(!movable){

    ludoState.message =
      dice === 6
      ? "Aucun mouvement. Tu rejoues."
      : "Aucun mouvement possible.";

    renderLudo();

    setTimeout(() => {

      if(dice === 6){
        ludoState.rolled = false;
        ludoState.message =
          "🎲 Tu rejoues !";
        renderLudo();
      }else{
        ludoNextTurn();
      }

    },900);
  }
}

/* =========================================================
   POSSIBILITÉ DE DÉPLACEMENT
========================================================= */

function canMovePawn(playerIndex,pawnIndex){

  if(!ludoState) return false;

  const p =
    ludoS/* =========================================================
   CPU LUDO
========================================================= */

function ludoCpuTurn(){

  if(!ludoState) return;

  if(ludoState.winner !== null)
    return;

  const p =
    ludoState.players[ludoState.turn];

  if(p.human)
    return;

  const dice =
    Math.floor(Math.random()*6)+1;

  ludoState.dice =
    DICE_SYMBOLS[dice];

  ludoState.rolled = true;

  ludoState.message =
    "🤖 " + p.name + " a fait " + dice;

  renderLudo();

  setTimeout(() => {

    const possible = [];

    p.pawns.forEach((_,i) => {

      if(canMovePawn(
        ludoState.turn,
        i
      )){
        possible.push(i);
      }

    });

    /*
      Si aucun pion ne peut bouger.
    */

    if(!possible.length){

      ludoState.rolled = false;

      if(dice === 6){

        ludoState.message =
          "🤖 Le CPU rejoue.";

        renderLudo();

        setTimeout(
          ludoCpuTurn,
          700
        );

      }else{

        ludoNextTurn();
      }

      return;
    }

    /*
      Le CPU privilégie :
      1. pion qui termine
      2. pion qui peut sortir
      3. pion le plus avancé
    */

    possible.sort((a,b) => {

      const pa = p.pawns[a];
      const pb = p.pawns[b];

      const va =
        pa === -1
        ? 100
        : pa;

      const vb =
        pb === -1
        ? 100
        : pb;

      return vb - va;
    });

    const chosen =
      possible[0];

    let old =
      p.pawns[chosen];

    if(old === -1){

      p.pawns[chosen] = 0;

    }else{

      p.pawns[chosen] += dice;
    }

    ludoCapture(
      ludoState.turn,
      chosen
    );

    if(p.pawns[chosen] === 56){

      p.finished++;

      if(p.finished >= 4){

        ludoState.winner =
          ludoState.turn;

        if(p.human){
          player.points += 100;
          save();
        }

        renderLudo();

        return;
      }
    }

    ludoState.rolled = false;

    renderLudo();

    if(dice === 6){

      ludoState.message =
        "🎲 Le CPU a fait 6 et rejoue.";

      renderLudo();

      setTimeout(
        ludoCpuTurn,
        800
      );

    }else{

      setTimeout(
        ludoNextTurn,
        700
      );
    }

  },900);
}

/* =========================================================
   ÉCRAN VICTOIRE
========================================================= */

function renderLudoWinner(){

  const page =
    ensureLudoPage();

  const winner =
    ludoState.players[
      ludoState.winner
    ];

  const humanWon =
    winner.human;

  page.innerHTML = `

    <div class="ludo-wrap">

      <div class="ludo-title">
        🎲 LUDO CLASSIC
      </div>

      <div class="ludo-win">

        <h2>
          ${humanWon
            ? "🏆 VICTOIRE !"
            : "🤖 PARTIE TERMINÉE"}
        </h2>

        <div style="
          font-size:55px;
          margin:15px;
        ">
          ${winner.icon}
        </div>

        <h3>
          ${winner.name}
        </h3>

        ${
          humanWon
          ? `
            <p>
              🎉 Félicitations !
            </p>

            <p>
              <strong>
                +100 points
              </strong>
            </p>

            <p>
              Total :
              ${player.points} points
            </p>
          `
          : `
            <p>
              Le CPU a gagné cette partie.
            </p>
          `
        }

        <div class="ludo-actions">

          <button
            class="ludo-new"
            onclick="ludoNewGame()">
            🔄 NOUVELLE PARTIE
          </button>

          <button
            class="ludo-back"
            onclick="showPage('games')">
            ← JEUX
          </button>

        </div>

      </div>

    </div>
  `;
}

/* =========================================================
   INITIALISATION
========================================================= */

render();

/*
  On prépare le style Ludo sans afficher
  automatiquement la partie.
*/

ludoStyle();
