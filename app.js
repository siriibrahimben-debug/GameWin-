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

let rewards = JSON.parse(localStorage.rewards || "null") || [
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

let player = JSON.parse(localStorage.player || "null") || {
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
  localStorage.games = JSON.stringify(games);
  localStorage.rewards = JSON.stringify(rewards);
  localStorage.player = JSON.stringify(player);
  localStorage.rewardRequests = JSON.stringify(rewardRequests);

  render();
}


/* =========================
   NAVIGATION
========================= */

function showPage(id){

  document
    .querySelectorAll(".page")
    .forEach(p => p.classList.remove("active"));

  let page = document.getElementById(id);

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
    b.onclick = () => showPage(b.dataset.page);
  });


/* =========================
   AFFICHAGE PRINCIPAL
========================= */

function render(){

  let userArea = document.getElementById("userArea");

  if(userArea){
    userArea.innerHTML =
      `<button class="primary" onclick="openLogin()">` +
      (player.name === "Visiteur"
        ? "S'inscrire"
        : "👤 " + player.name) +
      `</button>`;
  }


  let statGames = document.getElementById("statGames");
  let statPlayers = document.getElementById("statPlayers");
  let statPoints = document.getElementById("statPoints");

  if(statGames)
    statGames.textContent = games.length;

  if(statPlayers)
    statPlayers.textContent = "1";

  if(statPoints)
    statPoints.textContent = player.points;


  let aGames = document.getElementById("aGames");
  let aPlayers = document.getElementById("aPlayers");
  let aPoints = document.getElementById("aPoints");

  if(aGames)
    aGames.textContent = games.length;

  if(aPlayers)
    aPlayers.textContent = "1";

  if(aPoints)
    aPoints.textContent = player.points;


  /* JEUX */

  let gameGrid = document.getElementById("gameGrid");

  if(gameGrid){

    gameGrid.innerHTML = games.map(g => `

      <div class="game">

        <div class="icon">
          ${g.icon}
        </div>

        <h3>
          ${g.name}
        </h3>

        <p class="muted">
          Joue et gagne jusqu'à ${g.points} points.
        </p>

        ${
          g.type === "quiz"

          ? `
            <button class="primary"
              onclick="startQuiz()">
              Jouer
            </button>
          `

          : g.type === "number"

          ? `
            <button class="primary"
              onclick="startNumberGame()">
              Jouer
            </button>
          `

          : g.type === "ludo"

          ? `
            <button class="primary"
              onclick="startLudo()">
              Jouer
            </button>
          `

          : `
            <button class="primary"
              onclick="alert('Ce jeu sera ajouté dans une prochaine version.')">
              Jouer
            </button>
          `
        }

      </div>

    `).join("");
  }


  /* RÉCOMPENSES */

  let rewardGrid = document.getElementById("rewardGrid");

  if(rewardGrid){

    rewardGrid.innerHTML = rewards.map(r => `

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


  /* CLASSEMENT */

  let rankingBody =
    document.getElementById("rankingBody");

  if(rankingBody){

    rankingBody.innerHTML = `
      <tr>
        <td>1</td>
        <td>${player.name}</td>
        <td>${player.points.toLocaleString("fr-FR")}</td>
      </tr>
    `;
  }


  /* DEMANDES DE RÉCOMPENSE */

  let requestsBox =
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

  document.getElementById("numberGuess").value = "";

  document.getElementById("numberResult").textContent =
    "Entre un nombre entre 1 et 100.";

  showPage("numberGame");
}


function guessNumber(){

  let n =
    +document.getElementById("numberGuess").value;

  if(!n || n < 1 || n > 100){

    alert(
      "Entre un nombre entre 1 et 100."
    );

    return;
  }


  if(n === secretNumber){

    player.points += 50;

    document.getElementById("numberResult").textContent =
      "🎉 Bravo ! Tu as trouvé ! +50 points";

    secretNumber = 0;

    save();

  }else if(n < secretNumber){

    document.getElementById("numberResult").textContent =
      "⬆️ Plus grand !";

  }else{

    document.getElementById("numberResult").textContent =
      "⬇️ Plus petit !";
  }
}


/* =========================
   CONNEXION / PSEUDO
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

  let n =
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

    document.getElementById("question").textContent =
      "Quiz terminé 🎉";

    document.getElementById("answers").innerHTML = `
      <button
        class="primary"
        onclick="showPage('games')">

        Retour aux jeux

      </button>
    `;

    document.getElementById("quizResult").textContent =
      `Tu as maintenant ${player.points} points.`;

    return;
  }


  let x = questions[qi];

  document.getElementById("quizMeta").textContent =
    `Question ${qi + 1}/${questions.length}`;

  document.getElementById("question").textContent =
    x.q;

  document.getElementById("quizResult").textContent =
    "";


  document.getElementById("answers").innerHTML =
    x.a.map((a,i) => `

      <button
        class="answer"
        onclick="answer(${i})">

        ${String.fromCharCode(65+i)} — ${a}

      </button>

    `).join("");
}


function answer(i){

  let x = questions[qi];

  if(i === x.c){

    player.points += 50;

    document.getElementById("quizResult").textContent =
      "Bonne réponse ! +50 points 🎉";

  }else{

    document.getElementById("quizResult").textContent =
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

  let request =
    rewardRequests.find(r => r.id === id);

  if(!request)
    return;

  request.status = "approved";

  save();

  alert("Récompense validée.");
}


function rejectReward(id){

  let request =
    rewardRequests.find(r => r.id === id);

  if(!request)
    return;


  if(request.status === "pending"){

    player.points += request.cost;
  }


  request.status = "rejected";

  save();


  alert(
    "La demande a été refusée et les points ont été rendus au joueur."
  );
}


/* =========================
   ADMIN : AJOUTER UN JEU
========================= */

function addGame(){

  let n =
    document
      .getElementById("newGameName")
      .value
      .trim();

  let p =
    +document.getElementById("newGamePoints").value;


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


  document.getElementById("newGameName").value = "";

  document.getElementById("newGamePoints").value = "";

  save();
}


/* =========================
   ADMIN : AJOUTER RÉCOMPENSE
========================= */

function addReward(){

  let n =
    document
      .getElementById("newRewardName")
      .value
      .trim();

  let c =
    +document.getElementById("newRewardCost").value;


  if(!n || !c){

    alert("Complète les champs.");

    return;
  }


  rewards.push({

    name:n,

    cost:c,

    icon:"🎁"

  });


  document.getElementById("newRewardName").value = "";

  document.getElementById("newRewardCost").value = "";

  save();
}


/* ==================================================
   LUDO — NIVEAU MOYEN
================================================== */

function ensureLudoPage(){

  if(document.getElementById("ludoGame"))
    return;


  const section =
    document.createElement("section");

  section.id = "ludoGame";

  section.className = "page";


  section.innerHTML = `

    <div class="quizbox">

      <h2>🎲 Ludo — Niveau moyen</h2>

      <p id="ludoInfo">
        À toi de jouer.
      </p>

      <div
        id="ludoBoard"
        style="
          display:grid;
          grid-template-columns:repeat(5,1fr);
          gap:5px;
          margin:20px 0;
        ">
      </div>

      <div
        id="ludoPawns"
        style="
          display:grid;
          gap:8px;
        ">
      </div>

      <button
        class="primary"
        onclick="showPage('games')">

        Retour aux jeux

      </button>

    </div>

  `;


  document.body.appendChild(section);
}


/* =========================
   NOUVELLE PARTIE LUDO
========================= */

function startLudo(){

  ensureLudoPage();


  ludoState = {

    turn:0,

    players:[

      {
        name:"Toi",
        color:"🔴",
        pos:[-1,-1,-1,-1],
        score:0,
        human:true
      },

      {
        name:"CPU Bleu",
        color:"🔵",
        pos:[-1,-1,-1,-1],
        score:0
      },

      {
        name:"CPU Vert",
        color:"🟢",
        pos:[-1,-1,-1,-1],
        score:0
      },

      {
        name:"CPU Jaune",
        color:"🟡",
        pos:[-1,-1,-1,-1],
        score:0
      }

    ],

    winner:false
  };


  showPage("ludoGame");

  renderLudo();
}


/* État Ludo */

let ludoState = null;


/* =========================
   LANCER LE DÉ
========================= */

function ludoRoll(){

  if(!ludoState || ludoState.winner)
    return;


  const p =
    ludoState.players[ludoState.turn];


  const dice =
    Math.floor(Math.random() * 6) + 1;


  document.getElementById("ludoInfo").textContent =
    `${p.color} ${p.name} a fait ${dice}.`;


  if(p.human){

    renderLudoChoices(dice);

  }else{

    setTimeout(
      () => ludoCpuMove(dice),
      600
    );

  }
}


/* =========================
   AFFICHAGE DU PLATEAU
========================= */

function renderLudo(){

  const board =
    document.getElementById("ludoBoard");

  if(!board || !ludoState)
    return;


  board.innerHTML = "";


  for(let i=0;i<25;i++){

    const cell =
      document.createElement("div");


    cell.style.cssText =
      "min-height:45px;" +
      "border:1px solid #31527d;" +
      "border-radius:6px;" +
      "background:#102745;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "font-size:18px;" +
      "text-align:center";


    const occupants = [];


    ludoState.players.forEach(p => {

      p.pos.forEach((pos,j) => {

        if(pos === i){

          occupants.push(
            p.color + (j + 1)
          );

        }

      });

    });


    cell.textContent =
      occupants.join(" ") ||
      ((i + 1) % 5 === 0 ? "⭐" : "");


    board.appendChild(cell);
  }


  const pawns =
    document.getElementById("ludoPawns");


  if(!pawns)
    return;


  pawns.innerHTML = "";


  /* PIONS DU JOUEUR */

  ludoState.players[0].pos.forEach(
    (pos,i) => {

      const b =
        document.createElement("button");


      b.className = "answer";


      b.textContent =
        `🔴 Pion ${i + 1} — ` +
        (
          pos < 0
          ? "Maison"
          : pos === 24
          ? "🏆 Arrivée"
          : "Case " + (pos + 1)
        );


      b.disabled = true;


      pawns.appendChild(b);
    }
  );


  /* BOUTON DÉ */

  const roll =
    document.createElement("button");


  roll.className = "primary";

  roll.textContent =
    "🎲 Lancer le dé";


  roll.onclick = ludoRoll;


  if(ludoState.turn !== 0){

    roll.disabled = true;
  }


  pawns.appendChild(roll);


  /* INFORMATIONS CPU */

  ludoState.players.forEach((p,i) => {

    if(i === 0)
      return;


    const info =
      document.createElement("p");


    info.className = "muted";


    info.textContent =
      `${p.color} ${p.name} : ` +
      `${p.score}/4 pions arrivés`;


    pawns.appendChild(info);
  });
}


/* =========================
   CHOIX DU PION
========================= */

function renderLudoChoices(dice){

  renderLudo();


  const pawns =
    document.getElementById("ludoPawns");


  l
