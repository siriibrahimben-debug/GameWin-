/* =========================================================
   GAMEWIN — APP.JS
   LUDO 3D CLASSIC
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

/* =========================================================
   NAVIGATION
========================================================= */

function showPage(id){

  document.querySelectorAll(".page")
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

/* =========================================================
   AFFICHAGE
========================================================= */

function render(){

  const userArea =
    document.getElementById("userArea");

  if(userArea){

    userArea.innerHTML = `
      <button class="primary"
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

  if(!input) return;

  const name =
    input.value.trim();

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

    const q =
      document.getElementById("question");

    const a =
      document.getElementById("answers");

    const r =
      document.getElementById("quizResult");

    if(q)
      q.textContent =
        "Quiz terminé 🎉";

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

  const meta =
    document.getElementById("quizMeta");

  const q =
    document.getElementById("question");

  const r =
    document.getElementById("quizResult");

  const a =
    document.getElementById("answers");

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
   LUDO 3D — ÉTAT
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

const LUDO_SAFE = [
  0,8,13,21,26,34,39,47
];

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

const LUDO_LANES = {

/* =========================================================
   LUDO 3D STYLE
========================================================= */

function installLudo3DStyle(){

  if(document.getElementById("ludo3DStyle"))
    return;

  const style =
    document.createElement("style");

  style.id = "ludo3DStyle";

  style.textContent = `

  #ludoGame{
    width:100%;
    min-height:100vh;
    background:
      radial-gradient(
        circle at 50% 20%,
        #183963 0%,
        #07172d 55%,
        #030b18 100%
      );
    perspective:1200px;
  }

  .l3d{
    max-width:700px;
    margin:auto;
    padding:15px 10px 35px;
    color:#fff;
  }

  .l3d-title{
    text-align:center;
    font-size:30px;
    font-weight:1000;
    margin:8px 0 5px;
    text-shadow:
      0 3px 0 #000,
      0 6px 15px #0009;
  }

  .l3d-sub{
    text-align:center;
    color:#cbdcff;
    margin-bottom:18px;
  }

  .l3d-panel{
    background:
      linear-gradient(
        145deg,
        #19395e,
        #081a32
      );
    border:2px solid #345c8b;
    border-radius:25px;
    padding:20px;
    box-shadow:
      0 18px 35px #0009,
      inset 0 1px 0 #ffffff18;
  }

  .l3d-mode{
    text-align:center;
    color:#ffd21c;
    font-size:25px;
    font-weight:1000;
    text-shadow:0 3px 5px #000;
  }

  .l3d-choice{
    text-align:center;
    margin:15px 0 9px;
    font-weight:800;
  }

  .l3d-buttons{
    display:grid;
    grid-template-columns:repeat(3,1fr);
    gap:8px;
  }

  .l3d-buttons button{
    border:2px solid #52739b;
    border-radius:12px;
    padding:13px 5px;
    background:#102b4d;
    color:#fff;
    font-weight:900;
  }

  .l3d-buttons button.active{
    background:#ffd21c;
    color:#07162c;
    border-color:#ffd21c;
    box-shadow:0 5px 12px #0008;
  }

  .l3d-input{
    width:100%;
    box-sizing:border-box;
    padding:14px;
    margin-top:10px;
    border-radius:12px;
    border:2px solid #4a6d97;
    background:#071a31;
    color:#fff;
    font-size:16px;
  }

  .l3d-colors{
    display:flex;
    justify-content:center;
    gap:13px;
    margin:15px 0;
  }

  .l3d-color{
    width:54px;
    height:54px;
    border-radius:50%;
    border:3px solid transparent;
    font-size:27px;
    background:#142e50;
    box-shadow:0 6px 10px #0008;
  }

  .l3d-color.active{
    border-color:#fff;
    transform:translateY(-4px) scale(1.1);
  }

  .l3d-play{
    width:100%;
    padding:17px;
    border:0;
    border-radius:16px;
    background:linear-gradient(
      #ffe15a,
      #f4bc00
    );
    color:#101c2d;
    font-size:21px;
    font-weight:1000;
    box-shadow:
      0 7px 0 #9b7200,
      0 12px 20px #0008;
  }

  .l3d-board-wrap{
    padding:9px;
    border-radius:24px;
    background:
      linear-gradient(
        145deg,
        #426991,
        #081a30
      );
    box-shadow:
      0 22px 30px #000b,
      inset 0 2px 3px #ffffff30;
    transform:
      rotateX(3deg);
    transform-style:preserve-3d;
  }

  #ludoBoard3D{
    position:relative;
    width:100%;
    aspect-ratio:1;
    display:grid;
    grid-template-columns:repeat(15,1fr);
    grid-template-rows:repeat(15,1fr);
    gap:2px;
    padding:3px;
    box-sizing:border-box;
    border-radius:17px;
    overflow:hidden;
    background:#122b49;
    box-shadow:
      inset 0 0 15px #0009;
  }

  .l3d-cell{
    position:relative;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:3px;
    box-shadow:
      inset 1px 1px 0 #ffffff70,
      inset -2px -2px 3px #0004;
  }

  .l3d-empty{
    background:#102743;
  }

  .l3d-track{
    background:
      linear-gradient(
        145deg,
        #ffffff,
        #cdd4dc
      );
  }

  .l3d-red{
    background:
      linear-gradient(
        145deg,
        #ff4a42,
        #c9140f
      );
  }

  .l3d-green{
    background:
      linear-gradient(
        145deg,
        #45ec98,
        #07924d
      );
  }

  .l3d-yellow{
    background:
      linear-gradient(
        145deg,
        #ffe96a,
        #e2a900
      );
  }

  .l3d-blue{
    background:
      linear-gradient(
        145deg,
        #58aaff,
        #1262b5
      );
  }

  .l3d-lane-red{
    background:#f56d69;
  }

  .l3d-lane-green{
    background:#52d99a;
  }

  .l3d-lane-yellow{
    background:#ffe374;
  }

  .l3d-lane-blue{
    background:#71b8f2;
  }

  .l3d-center{
    background:
      conic-gradient(
        #ef2b24 0 25%,
        #ffd72d 25% 50%,
        #2985df 50% 75%,
        #20c978 75% 100%
      );
  }

  .l3d-star{
    color:#ffd21c;
    font-size:clamp(10px,3.5vw,23px);
    text-shadow:
      0 2px 2px #0009;
  }

  .l3d-pawn{
    width:70%;
    height:70%;
    max-width:34px;
    max-height:34px;
    border-radius:50%;
    position:relative;
    z-index:10;
    border:2px solid #fff;
    box-shadow:
      inset 4px 4px 5px #ffffff66,
      inset -5px -6px 7px #0007,
      0 5px 6px #0009;
    transform:
      translateZ(15px);
  }

  .l3d-pawn:before{
    content:"";
    position:absolute;
    width:42%;
    height:24%;
    left:15%;
    top:12%;
    border-radius:50%;
    background:#ffffff80;
    filter:blur(1px);
  }

  .l3d-pawn.red{
    background:
      radial-gradient(
        circle at 35% 25%,
        #ff9b96,
        #ee2821 45%,
        #970b08
      );
  }

  .l3d-pawn.green{
    background:
      radial-gradient(
        circle at 35% 25%,
        #baffd8,
        #16d875 45%,
        #06783d
      );
  }

  .l3d-pawn.yellow{
    background:
      radial-gradient(
        circle at 35% 25%,
        #fff9bd,
        #ffd322 45%,
        #a87800
      );
  }

  .l3d-pawn.blue{
    background:
      radial-gradient(
        circle at 35% 25%,
        #c7e4ff,
        #2188eb 45%,
        #074d99
      );
  }

  .l3d-pawn.movable{
    animation:
      pawn3dPulse .7s infinite;
    cursor:pointer;
  }

  @keyframes pawn3dPulse{
    50%{
      transform:
        translateZ(25px)
        scale(1.22);
      filter:brightness(1.3);
    }
  }

  .l3d-info{
    margin-top:15px;
    padding:18px;
    border-radius:24px;
    b/* =========================================================
   PLATEAU LUDO 3D
========================================================= */

function drawLudo3DBoard(){

  const board =
    document.getElementById("ludoBoard3D");

  if(!board) return;

  board.innerHTML = "";

  const cells = [];

  /* Création des 225 cases */

  for(let r=0;r<15;r++){

    for(let c=0;c<15;c++){

      const cell =
        document.createElement("div");

      cell.className =
        "l3d-cell l3d-empty";

      cell.dataset.row = r;
      cell.dataset.col = c;

      cells.push(cell);

      board.appendChild(cell);
    }
  }

  /* =====================================================
     MAISONS
  ===================================================== */

  cells.forEach(cell => {

    const r =
      Number(cell.dataset.row);

    const c =
      Number(cell.dataset.col);

    if(r <= 5 && c <= 5){

      cell.className =
        "l3d-cell l3d-red";

    }else if(r <= 5 && c >= 9){

      cell.className =
        "l3d-cell l3d-green";

    }else if(r >= 9 && c <= 5){

      cell.className =
        "l3d-cell l3d-blue";

    }else if(r >= 9 && c >= 9){

      cell.className =
        "l3d-cell l3d-yellow";
    }
  });

  /* =====================================================
     PARCOURS
  ===================================================== */

  LUDO_PATH.forEach((pos,index) => {

    const r = pos[0];
    const c = pos[1];

    const cell =
      cells[r*15+c];

    cell.className =
      "l3d-cell l3d-track";

    /*
      Cases de départ colorées
    */

    if(index === 0)
      cell.classList.add("l3d-red");

    if(index === 13)
      cell.classList.add("l3d-green");

    if(index === 26)
      cell.classList.add("l3d-yellow");

    if(index === 39)
      cell.classList.add("l3d-blue");

    /*
      Étoiles
    */

    if(LUDO_SAFE.includes(index)){

      const star =
        document.createElement("span");

      star.className =
        "l3d-star";

      star.textContent = "★";

      cell.appendChild(star);
    }
  });

  /* =====================================================
     COULOIRS FINAUX
  ===================================================== */

  Object.entries(LUDO_LANES())
    .forEach(([color,positions]) => {

      positions.forEach(pos => {

        const r = pos[0];
        const c = pos[1];

        const cell =
          cells[r*15+c];

        cell.className =
          "l3d-cell l3d-lane-" + color;
      });
    });

  /* =====================================================
     CENTRE 3D
  ===================================================== */

  for(let r=6;r<=8;r++){

    for(let c=6;c<=8;c++){

      const cell =
        cells[r*15+c];

      cell.className =
        "l3d-cell l3d-center";
    }
  }

  /*
    On ajoute les pions.
  */

  ludoState.players.forEach(
    (p,playerIndex) => {

      p.pawns.forEach(
        (position,pawnIndex) => {

          if(position === -1){

            const home =
              LUDO_HOMES[p.key][pawnIndex];

            const cell =
              cells[
                home[0]*15+home[1]
              ];

            addLudoPawn3D(
              cell,
              p,
              playerIndex,
              pawnIndex,
              true
            );
          }

          else if(
            position >= 0 &&
            position < 52
          ){

            const global =
              (
                p.start + position
              ) % 52;

            const path =
              LUDO_PATH[global];

            const cell =
              cells[
                path[0]*15+path[1]
              ];

            addLudoPawn3D(
              cell,
              p,
              playerIndex,
              pawnIndex,
              false
            );
          }

          else if(
            position >= 52 &&
            position <= 55
          ){

            const lane =
              LUDO_LANES[p.key][
                position-52
              ];

            const cell =
              cells[
                lane[0]*15+lane[1]
              ];

            addLudoPawn3D(
              cell,
              p,
              playerIndex,
              pawnIndex,
              false
            );
          }

        }
      );
    }
  );
}

/* =========================================================
   COULOIRS
========================================================= */

function LUDO_LANES(){

  return {

    red:[
      [1,7],
      [2,7],
      [3,7],
      [4,7],
      [5,7]
    ],

    green:[
      [7,1],
      [7,2],
      [7,3],
      [7,4],
      [7,5]
    ],

    yellow:[
      [7,13],
      [7,12],
      [7,11],
      [7,10],
      [7,9]
    ],

    blue:[
      [13,7],
      [12,7],
      [11,7],
      [10,7],
      [9,7]
    ]
  };
}

/* =========================================================
   PION 3D
========================================================= */

function addLudoPawn3D(
  cell,
  p,
  playerIndex,
  pawnIndex,
  inHome
){

  const pawn =
    document.createElement("div");

  pawn.className =
    "l3d-pawn " + p.key;

  /*
    Le pion devient lumineux lorsqu'il
    peut être joué.
  */

  if(
    ludoState.rolled &&
    ludoState.turn === playerIndex &&
    p.human &&
    canLudoPawnMove(
      playerIndex,
      pawnIndex
    )
  ){

    pawn.classList.add("movable");

    pawn.onclick = function(){

      ludoMovePawn3D(
        pawnIndex
      );
    };
  }

  cell.appendChild(pawn);
}

/* =========================================================
   DÉ 3D
========================================================= */

function ludoRoll3D(){

  if(!ludoState)
    return;

  if(ludoState.rolled)
    return;

  const current =
    ludoState.players[
      ludoState.turn
    ];

  /*
    Le bouton est réservé au joueur humain.
  */

  if(!current.human)
    return;

  const die =
    Math.floor(
      Math.random()*6
    ) + 1;

  ludoState.dice = die;

  ludoState.rolled = true;

  ludoState.message =
    "Choisis un pion possible.";

  /*
    Animation du dé.
  */

  renderLudo();

  setTimeout(() => {

    const dieElement =
      document.getElementById("ludoDie");

    if(dieElement)
      dieElement.classList.add(
        "rolling"
      );

  },30);

  /*
    Vérification des déplacements.
  */

  const possible =
    current.pawns.some(
      (_,i) =>
        canLudoPawnMove(
          ludoState.turn,
          i
        )
    );

  if(!possible){

    ludoState.message =
      die === 6
      ? "Aucun mouvement. Tu rejoues."
      : "Aucun mouvement possible.";

    renderLudo();

    setTimeout(() => {

      if(die === 6){

        ludoState.rolled = false;

        ludoState.dice = 0;

        ludoState.message =
          "🎲 Tu rejoues !";

        renderLudo();

      }else{

        ludoNextTurn3D();
      }

    },1100);
  }
}

/* =========================================================
   RÈGLES DE DÉPLACEMENT
========================================================= */

function canLudoPawnMove(
  playerIndex,
  pawnIndex
){

  if(!ludoState)
    return false;

  const p =
    ludoState.players[playerIndex];

  const position =
    p.pawns[pawnIndex];

  const die =
    ludoState.dice;

  if(!die)
    return false;

  /*
    Pion dans la maison :
    sortie uniquement avec 6.
  */

  if(position === -1){

    return die === 6;
  }

  /*
    Arrivée exacte.
  */

  return position + die <= 56;
}

/* =========================================================
   DÉPLACEMENT HUMAIN
========================================================= */

function ludoMovePawn3D(
  pawnIndex
){

  if(!ludoState)
    return;

  const playerIndex =
    ludoState.turn;

  const p =
    ludoState.players[playerIndex];

  if(!p.human)
    return;

  if(
    !canLudoPawnMove(
      playerIndex,
      pawnIndex
    )
  ){

    return;
  }

  const die =
    ludoState.dice;

  /*
    Sortie de maison.
  */

  if(p.pawns[pawnIndex] === -1){

    p.pawns[pawnIndex] = 0;

  }else{

    p.pawns[pawnIndex] += die;
  }

  /*
    Capture.
  */

  ludoCapture3D(
    playerIndex,
    pawnIndex
  );

  /*
    Arrivée.
  */

  if(
    p.pawns[pawnIndex] === 56
  ){

    p.finished++;

    if(p.finished >= 4){

      ludoState.winner =
        playerIndex;

      player.points += 100;

      save();

      renderLudo();

      return;
    }
  }

  ludoState.rolled = false;

  /*
    Un 6 donne un tour supplémentaire.
  */

  if(die === 6){

    ludoState.dice = 0;

    ludoState.message =
      "🎲 6 ! Tu rejoues.";

    renderLudo();

  }else{

    ludoNextTurn3D();
  }
}

/* =========================================================
   CAPTURE DES PIONS
========================================================= */

function ludoCapture3D(
  playerIndex,
  pawnIndex
){

  const p =
    ludoState.players[playerIndex];

  const position =
    p.pawns[pawnIndex];

  /*
    Pas de capture dans le couloir final.
  */

  if(
    position < 0 ||
    position >= 52
  ){

    return;
  }

  const global =
    (p.start + position) % 52;

  /*
    Les étoiles sont protégées.
  */

  if(LUDO_SAFE.includes(global))
    return;

  ludoState.players.forEach(
    (other,otherIndex) => {

      if(otherIndex === playerIndex)
        return;

      other.pawns =
        other.pawns.map(
          otherPosition => {

            if(
              otherPosition >= 0 &&
              otherPosition < 52
            ){

              const otherGlobal =
                (
                  other.start +
                  otherPosition
                ) % 52;

              if(
                otherGlobal === global
              ){

                ludoState.message =
                  "💥 Pion capturé !";

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

function ludoNextTurn3D(){

  if(!ludoState)
    return;

  ludoState.turn =
    (
      ludoState.turn + 1
    ) %
    ludoState.players.length;

  ludoState.dice = 0;

  ludoState.rolled = false;

  const current =
    ludoState.players[
      ludoState.turn
    ];

  ludoState.message =
    current.human
    ? "À toi de jouer !"
    : "🤖 Le CPU joue...";

  renderLudo();

  /*
    Le CPU joue automatiquement.
  */

  if(!current.human){

    setTimeout(
      ludoCpuTurn3D,
      900
    );
  }
}

/* =========================================================
   CPU
========================================================= */

function ludoCpuTurn3D(){

  if(!ludoState)
    return;

  if(
    ludoState.winner !== null
  )
    return;

  const p =
    ludoState.players[
      ludoState.turn
    ];

  if(p.human)
    return;

  const die =
    Math.floor(
      Math.random()*6
    ) + 1;

  ludoState.dice = die;

  ludoState.rolled = true;

  ludoState.message =
    "🤖 " +
    p.name +
    " lance le dé...";

  renderLudo();

  /*
    Petite pause pour laisser
    voir le dé.
  */

  setTimeout(() => {

    const possible = [];

    p.pawns.forEach(
      (_,i) => {

        if(
          canLudoPawnMove(
            ludoState.turn,
            i
          )
        ){

          possible.push(i);
        }
      }
    );

    /*
      Aucun mouvement.
    */

    if(!possible.length){

      ludoState.rolled = false;

      if(die === 6){

        ludoState.dice = 0;

        ludoState.message =
          "🤖 Le CPU rejoue.";

        renderLudo();

        setTimeout(
          ludoCpuTurn3D,
          800
        );

      }else{

        ludoNextTurn3D();
      }

      return;
    }

    /*
      Priorité :
      - finir un pion
      - sortir un pion
      - avancer
    */

    possible.sort(
      (a,b) => {

        const pa =
          p.pawns[a];

        const pb =
          p.pawns[b];

        const scoreA =
          pa === -1
          ? 100
          : pa;

        const scoreB =
          pb === -1
          ? 100
          : pb;

        return scoreB-scoreA;
      }
    );

    const chosen =
      possible[0];

    /*
      Déplacement CPU.
    */

    if(p.pawns[chosen] === -1){

      p.pawns[chosen] = 0;

    }else{

      p.pawns[chosen] += die;
    }

    /*
      Capture CPU.
    */

    ludoCapture3D(
      ludoState/* =========================================================
   BLOC 3/3 — FINITIONS LUDO 3D
========================================================= */

/*
  Animation visuelle lorsqu'un pion est déplacé.
*/

function ludoAnimateBoard(){

  const board =
    document.getElementById("ludoBoard3D");

  if(!board) return;

  board.style.transform =
    "scale(.97) rotateX(4deg)";

  setTimeout(() => {

    board.style.transform =
      "scale(1) rotateX(3deg)";

  },180);
}


/*
  Petite vibration du plateau
  lorsque le dé est lancé.
*/

function ludoShakeDice(){

  const die =
    document.getElementById("ludoDie");

  if(!die) return;

  die.classList.remove("rolling");

  void die.offsetWidth;

  die.classList.add("rolling");
}


/*
  Rafraîchissement sécurisé du plateau.
*/

function ludoRefresh(){

  if(!ludoState)
    return;

  renderLudo();

  setTimeout(() => {
    ludoAnimateBoard();
  },30);
}


/*
  Gestion améliorée du lancement du dé.
*/

const oldLudoRoll3D =
  ludoRoll3D;

ludoRoll3D = function(){

  if(!ludoState)
    return;

  if(ludoState.rolled)
    return;

  const current =
    ludoState.players[
      ludoState.turn
    ];

  if(!current || !current.human)
    return;

  /*
    Animation immédiate
  */

  const die =
    document.getElementById("ludoDie");

  if(die){

    die.classList.remove("rolling");

    void die.offsetWidth;

    die.classList.add("rolling");
  }

  /*
    Petit délai pour donner
    l'impression d'un vrai dé 3D.
  */

  setTimeout(() => {

    oldLudoRoll3D();

  },180);
};


/*
  Déplacement avec animation.
*/

const oldLudoMovePawn3D =
  ludoMovePawn3D;

ludoMovePawn3D = function(
  pawnIndex
){

  if(!ludoState)
    return;

  oldLudoMovePawn3D(
    pawnIndex
  );

  setTimeout(() => {

    if(ludoState)
      ludoAnimateBoard();

  },50);
};


/* =========================================================
   EMPÊCHER LE SCROLL HORIZONTAL
========================================================= */

(function(){

  if(document.getElementById("ludo3DExtraStyle"))
    return;

  const style =
    document.createElement("style");

  style.id =
    "ludo3DExtraStyle";

  style.textContent = `

    html, body{
      overflow-x:hidden;
    }

    #ludoGame{
      overflow-x:hidden;
    }

    #ludoBoard3D{
      transition:
        transform .18s ease,
        filter .18s ease;
    }

    .l3d-pawn{
      transition:
        transform .2s ease,
        filter .2s ease;
    }

    .l3d-roll{
      transition:
        transform .12s ease,
        box-shadow .12s ease;
    }

    .l3d-roll:active{
      transform:translateY(5px);
      box-shadow:
        0 2px 0 #947000,
        0 5px 10px #0008;
    }

    .l3d-play{
      transition:
        transform .12s ease;
    }

    .l3d-play:active{
      transform:translateY(5px);
    }

    .l3d-cell{
      transition:
        filter .15s ease;
    }

    .l3d-cell:hover{
      filter:brightness(1.08);
    }

  `;

  document.head.appendChild(style);

})();


/* =========================================================
   COMPATIBILITÉ AVEC LES ANCIENS
