const defaultGames=[

{name:"Quiz Culture Générale",icon:"🧠",points:50,type:"quiz"},

{name:"Puzzle",icon:"🧩",points:40,type:"soon"},

{name:"Défi Rapide",icon:"⚡",points:60,type:"soon"},

{name:"Tir de précision",icon:"🎯",points:50,type:"soon"},

{name:"Échecs",icon:"♟️",points:70,type:"soon"},

{name:"Tournoi",icon:"🏆",points:100,type:"soon"},

{name:"Devine le nombre",icon:"🔢",points:50,type:"number"},

{name:"Ludo",icon:"🎲",points:100,type:"ludo"}

];


const questions=[

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


let games=JSON.parse(localStorage.games||"null");

if(!Array.isArray(games)||games.length===0){

games=defaultGames.slice();

}else{

if(!games.some(g=>g.name==="Ludo")){

games.push({
name:"Ludo",
icon:"🎲",
points:100,
type:"ludo"
});

}

}


let rewards=JSON.parse(localStorage.rewards||"null")||[

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


let player=JSON.parse(localStorage.player||"null")||{

name:"Visiteur",
points:0

};


let rewardRequests=
JSON.parse(localStorage.rewardRequests||"null")||[];


let qi=0;

let secretNumber=0;



function save(){

localStorage.games=
JSON.stringify(games);

localStorage.rewards=
JSON.stringify(rewards);

localStorage.player=
JSON.stringify(player);

localStorage.rewardRequests=
JSON.stringify(rewardRequests);

render();

}



function showPage(id){

document
.querySelectorAll(".page")
.forEach(p=>p.classList.remove("active"));

let page=document.getElementById(id);

if(page){

page.classList.add("active");

}

if(id==="ludoGame"){

ludoRender();

}

}



document
.querySelectorAll("nav button")
.forEach(b=>{

b.onclick=()=>showPage(b.dataset.page);

});



function render(){


let userArea=
document.getElementById("userArea");


if(userArea){

userArea.innerHTML=
`<button class="primary" onclick="openLogin()">`+
(player.name==="Visiteur"
?"S'inscrire"
:"👤 "+player.name)+
`</button>`;

}


let statGames=
document.getElementById("statGames");

let statPlayers=
document.getElementById("statPlayers");

let statPoints=
document.getElementById("statPoints");


if(statGames)
statGames.textContent=games.length;

if(statPlayers)
statPlayers.textContent="1";

if(statPoints)
statPoints.textContent=player.points;



let aGames=
document.getElementById("aGames");

let aPlayers=
document.getElementById("aPlayers");

let aPoints=
document.getElementById("aPoints");


if(aGames)
aGames.textContent=games.length;

if(aPlayers)
aPlayers.textContent="1";

if(aPoints)
aPoints.textContent=player.points;



let gameGrid=
document.getElementById("gameGrid");


if(gameGrid){

gameGrid.innerHTML=

games.map(g=>`

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
g.type==="quiz"

?`<button class="primary"
onclick="startQuiz()">
Jouer
</button>`

:g.type==="number"

?`<button class="primary"
onclick="startNumberGame()">
Jouer
</button>`

:g.type==="ludo"

?`<button class="primary"
onclick="startLudo()">
Jouer
</button>`

:`<button class="primary"
onclick="alert('Ce jeu sera ajouté dans une prochaine version.')">
Jouer
</button>`

}

</div>

`).join("");

}



let rewardGrid=
document.getElementById("rewardGrid");


if(rewardGrid){

rewardGrid.innerHTML=

rewards.map(r=>`

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



let rankingBody=
document.getElementById("rankingBody");


if(rankingBody){

rankingBody.innerHTML=

`<tr>

<td>1</td>

<td>${player.name}</td>

<td>${player.points.toLocaleString("fr-FR")}</td>

</tr>`;

}



let requestsBox=
document.getElementById("rewardRequests");


if(requestsBox){

if(rewardRequests.length===0){

requestsBox.innerHTML=
`<p class="muted">
Aucune demande de récompense.
</p>`;

}else{

requestsBox.innerHTML=

rewardRequests.map(r=>{

let action="";


if(r.status==="pending"){

action=`

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
r.status==="pending"
?"🟡 En attente"
:r.status==="approved"
?"✅ Validée"
:"❌ Refusée"
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



function startNumberGame(){

secretNumber=
Math.floor(Math.random()*100)+1;

document.getElementById("numberGuess").value="";

document.getElementById("numberResult").textContent=
"Entre un nombre entre 1 et 100.";

showPage("numberGame");

}



function guessNumber(){

let n=
+document.getElementById("numberGuess").value;


if(!n||n<1||n>100){

alert(
"Entre un nombre entre 1 et 100."
);

return;

}


if(n===secretNumber){

player.points+=50;

document.getElementById("numberResult").textContent=
"🎉 Bravo ! Tu as trouvé ! +50 points";

secretNumber=0;

save();

}else if(n<secretNumber){

document.getElementById("numberResult").textContent=
"⬆️ Plus grand !";

}else{

document.getElementById("numberResult").textContent=
"⬇️ Plus petit !";

}

}



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

let n=
document.getElementById("username")
.value.trim();


if(!n){

alert("Entre un pseudo.");

return;

}


player.name=n;

closeLogin();

save();

}



function startQuiz(){

qi=0;

showPage("quiz");

nextQuestion();

}



function nextQuestion(){

if(qi>=questions.length){

document.getElementById("question").textContent=
"Quiz terminé 🎉";

document.getElementById("answers").innerHTML=

`<button class="primary"
onclick="showPage('games')">

Retour aux jeux

</button>`;

document.getElementById("quizResult").textContent=
`Tu as maintenant ${player.points} points.`;

return;

}


let x=questions[qi];


document.getElementById("quizMeta").textContent=
`Question ${qi+1}/${questions.length}`;

document.getElementById("question").textContent=x.q;

document.getElementById("quizResult").textContent="";


document.getElementById("answers").innerHTML=

x.a.map((a,i)=>

`<button
class="answer"
onclick="answer(${i})">

${String.fromCharCode(65+i)} — ${a}

</button>`

).join("");

}



function answer(i){

let x=questions[qi];


if(i===x.c){

player.points+=50;

document.getElementById("quizResult").textContent=
"Bonne réponse ! +50 points 🎉";

}else{

document.getElementById("quizResult").textContent=
"Pas cette fois. Continue !";

}


qi++;


setTimeout(()=>{

save();

nextQuestion();

},700);

}



function claim(cost,name){

if(player.points<cost){

alert("Pas assez de points.");

return;

}


if(confirm(
"Confirmer l'échange de "+
cost+
" points contre "+
name+
" ?"
)){

player.points-=cost;


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

let request=
rewardRequests.find(r=>r.id===id);


if(!request)return;


request.status="approved";

save();


alert("Récompense validée.");

}



function rejectReward(id){

let request=
rewardRequests.find(r=>r.id===id);


if(!request)return;


if(request.status==="pending"){

player.points+=request.cost;

}


request.status="rejected";

save();


alert(
"La demande a été refusée et les points ont été rendus au joueur."
);

}



function addGame(){

let n=
document.getElementById("newGameName")
.value.trim();

let p=
+document.getElementById("newGamePoints")
.value;


if(!n||!p){

alert("Complète les champs.");

return;

}


games.push({

name:n,

icon:"🎮",

points:p,

type:"soon"

});


document.getElementById("newGameName").value="";

document.getElementById("newGamePoints").value="";


save();

}



function addReward(){

let n=
document.getElementById("newRewardName")
.value.trim();

let c=
+document.getElementById("newRewardCost")
.value;


if(!n||!c){

alert("Complète les champs.");

return;

}


rewards.push({

name:n,

cost:c,

icon:"🎁"

});


document.getElementById("newRewardName").value="";

document.getElementById("newRewardCost").value="";


save();

}



/* =========================
   LUDO
========================= */


const ludoPlayers=[

{
name:"Joueur vert",
color:"green",
start:0
},

{
name:"Joueur jaune",
color:"yellow",
start:13
},

{
name:"Joueur rouge",
color:"red",
start:26
},

{
name:"Joueur bleu",
color:"blue",
start:39
}

];


const ludoCoords=[];

for(let c=0;c<14;c++){

ludoCoords.push([0,c]);

}

for(let r=1;r<14;r++){

ludoCoords.push([r,13]);

}

for(let c=12;c>=0;c--){

ludoCoords.push([13,c]);

}

for(let r=12;r>0;r--){

ludoCoords.push([r,0]);

}



let ludoState={

turn:0,

dice:0,

selected:false,

message:"Lance le dé pour commencer.",

pawns:ludoPlayers.map(()=>[-1,-1,-1,-1]),

winner:null

};



function startLudo(){

ludoNewGame();

showPage("ludoGame");

}



function ludoNewGame(){

ludoState={

turn:0,

dice:0,

selected:false,

message:"Lance le dé pour commencer.",

pawns:ludoPlayers.map(()=>[-1,-1,-1,-1]),

winner:null

};

ludoRender();

}



function ludoRoll(){

if(ludoState.winner!==null){

return;

}


if(ludoState.dice!==0){

ludoState.message=
"Choisis un pion possible.";

ludoRender();

return;

}


let value=
Math.floor(Math.random()*6)+1;


ludoState.dice=value;

ludoState.selected=false;


let possible=[];


for(let i=0;i<4;i++){

if(ludoCanMove(i)){

possible.push(i);

}

}


if(possible.length===0){

ludoState.message=
`🎲 ${value} — Aucun pion ne peut bouger.`;

ludoRender();


setTimeout(()=>{

if(ludoState.dice!==6){

ludoNextTurn();

}else{

ludoState.dice=0;

ludoState.message=
"Tu as fait 6 ! Relance le dé.";

ludoRender();

}

},900);

return;

}


ludoState.message=
`🎲 Tu as fait ${value}. Choisis un pion.`;

ludoRender();

}



function ludoCanMove(index){

let pos=
ludoState.pawns[ludoState.turn][index];

let dice=
ludoState.dice;


if(dice===0)return false;


if(pos===-1){

return dice===6;

}


return pos+dice<=52;

}



function ludoMove(index){

if(!ludoCanMove(index)){

ludoState.message=
"Ce pion ne peut pas être déplacé.";

ludoRender();

return;

}


let playerIndex=
ludoState.turn;

let pos=
ludoState.pawns[playerIndex][index];


if(pos===-1){

pos=0;

}else{

pos+=ludoState.dice;

}


ludoState.pawns[playerIndex][index]=pos;


if(pos<52){

ludoCapture(playerIndex,index);

}


if(ludoState.pawns[playerIndex]
.every(p=>p===52)){

ludoState.winner=playerIndex;

ludoState.message=
`🏆 ${ludoPlayers[playerIndex].name} gagne la partie ! +100 points`;


if(playerIndex===0){

player.points+=100;

save();

}


ludoState.dice=0;

ludoRender();

return;

}


let oldDice=
ludoState.dice;

ludoState.dice=0;


if(oldDice===6){

ludoState.message=
"🎉 Tu as fait 6 ! Relance le dé.";

}else{

ludoNextTurn();

}


ludoRender();

}



function ludoCapture(playerIndex,pawnIndex){

let pos=
ludoState.pawns[playerIndex][pawnIndex];


if(pos<0||pos>=52)return;


let global=
(ludoPlayers[playerIndex].start+pos)%52;


for(let p=0;p<4;p++){

if(p===playerIndex)continue;


for(let i=0;i<4;i++){

let other=
ludoState.pawns[p][i];


if(other<0||other>=52)continue;


let otherGlobal=
(ludoPlayers[p].start+other)%52;


if(global===otherGlobal){

ludoState.pawns[p][i]=-1;

ludoState.message=
"💥 Pion adverse renvoyé à la base !";

}

}

}

}



function ludoNextTurn(){

ludoState.dice=0;

ludoState.selected=false;

ludoState.turn=
(ludoState.turn+1)%4;

ludoState.message=
`${ludoPlayers[ludoState.turn].name}, à toi de jouer.`;

}



function ludoTokenHTML(playerIndex,pawnIndex){

let color=
ludoPlayers[playerIndex].color;


return `

<button

class="ludo-token ludo-${color}"

onclick="ludoMove(${pawnIndex})"

>

${pawnIndex+1}

</button>

`;

}



function ludoRender(){

let board=
document.getElementById("ludoBoard");

let homes=
document.getElementById("ludoHomes");

let turn=
document.getElementById("ludoTurn");

let dice=
document.getElementById("ludoDice");

let message=
document.getElementById("ludoMessage");


if(!board||!homes)return;


turn.textContent=
ludoPlayers[ludoState.turn].name+
" — à toi";


dice.textContent=
ludoState.dice
?["⚀","⚁","⚂","⚃","⚄","⚅"][ludoState.dice-1]
:"🎲";


message.textContent=
ludoState.message;


board.innerHTML="";


for(let i=0;i<52;i++){

let cell=
document.createElement("div");

cell.className="ludo-cell";


if(i===0)cell.classList.add("start0");

if(i===13)cell.classList.add("start1");

if(i===26)cell.classList.add("start2");

if(i===39)cell.classList.add("start3");


let content="";


for(let p=0;p<4;p++){

for(let k=0;k<4;k++){

let pos=
ludoState.pawns[p][k];


if(pos<0||pos>=52)continue;


let global=
(ludoPlayers[p].start+pos)%52;


if(global===i){

content+=
ludoTokenHTML(p,k);

}

}

}


cell.innerHTML=content;

board.appendChild(cell);

}



homes.innerHTML="";


for(let p=0;p<4;p++){

let home=
document.createElement("div");

home.className="ludo-home";


let color=
ludoPlayers[p].color;


let title=
document.createElement("h3");

title.textContent=
ludoPlayers[p].name;


home.appendChild(title);


let pawns=
document.createElement("div");

pawns.className="ludo-pawns";


for(let i=0;i<4;i++){

let pos=
ludoState.pawns[p][i];


let token=
document.createElement("button");

token.className=
`ludo-token ludo-${color}`;


token.textContent=i+1;


if(p===ludoState.turn&&
ludoCanMove(i)){

token.onclick=()=>ludoMove(i);

token.title=
"Déplacer ce pion";

}else{

token.disabled=true;

}


if(pos===-1){

token.textContent=
`${i+1} 🏠`;

}else if(pos===52){

token.textContent=
`${i+1} 🏆`;

}


pawns.appendChild(token);

}


home.appendChild(pawns);

homes.appendChild(home);

}

}



render();f
/* ===== LUDO NIVEAU MOYEN ===== */
let ludoState=null;

const ludoColors=["🔴","🔵","🟢","🟡"];

function ensureLudoPage(){
  if(document.getElementById("ludoGame")) return;

  const section=document.createElement("section");

  section.id="ludoGame";
  section.className="page";

  section.innerHTML=`
    <div class="quizbox">
      <h2>🎲 Ludo — Niveau moyen</h2>

      <p id="ludoInfo">À toi de jouer.</p>

      <div id="ludoBoard"
      style="display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:20px 0;">
      </div>

      <div id="ludoPawns" style="display:grid;gap:8px;"></div>

      <button class="primary"
      onclick="showPage('games')">
      Retour aux jeux
      </button>
    </div>`;

  document.body.appendChild(section);
}

function startLudoGame(){

  ensureLudoPage();

  ludoState={
    turn:0,

    players:[
      {name:"Toi",color:"🔴",pos:[-1,-1,-1,-1],score:0,human:true},
      {name:"CPU Bleu",color:"🔵",pos:[-1,-1,-1,-1],score:0},
      {name:"CPU Vert",color:"🟢",pos:[-1,-1,-1,-1],score:0},
      {name:"CPU Jaune",color:"🟡",pos:[-1,-1,-1,-1],score:0}
    ],

    winner:false
  };

  showPage("ludoGame");

  renderLudo();
}

function ludoRoll(){

  if(!ludoState || ludoState.winner)return;

  const p=ludoState.players[ludoState.turn];

  const dice=Math.floor(Math.random()*6)+1;

  document.getElementById("ludoInfo").textContent=
  `${p.color} ${p.name} a fait ${dice}.`;

  if(p.human){

    renderLudoChoices(dice);

  }else{

    setTimeout(()=>ludoCpuMove(dice),500);

  }
}

function renderLudo(){

  const board=document.getElementById("ludoBoard");

  board.innerHTML="";

  for(let i=0;i<25;i++){

    const cell=document.createElement("div");

    cell.style.cssText=
    "min-height:45px;border:1px solid #31527d;border-radius:6px;background:#102745;display:flex;align-items:center;justify-content:center;font-size:22px";

    const occupants=[];

    ludoState.players.forEach(p=>{

      p.pos.forEach((pos,j)=>{

        if(pos===i){

          occupants.push(p.color+(j+1));

        }

      });

    });

    cell.textContent=
    occupants.join(" ")||
    ((i+1)%5===0?"⭐":"");

    board.appendChild(cell);
  }

  const pawns=document.getElementById("ludoPawns");

  pawns.innerHTML="";

  ludoState.players[0].pos.forEach((pos,i)=>{

    const b=document.createElement("button");

    b.className="answer";

    b.textContent=
    `🔴 Pion ${i+1} — ${
      pos<0
      ?"Maison"
      :pos===24
      ?"Arrivée"
      :"Case "+(pos+1)
    }`;

    b.disabled=true;

    pawns.appendChild(b);
  });

  const roll=document.createElement("button");

  roll.className="primary";

  roll.textContent="🎲 Lancer le dé";

  roll.onclick=ludoRoll;

  if(ludoState.turn!==0){

    roll.disabled=true;

  }

  pawns.appendChild(roll);
}

function renderLudoChoices(dice){

  renderLudo();

  const pawns=document.getElementById("ludoPawns");

  ludoState.players[0].pos.forEach((pos,i)=>{

    const b=pawns.children[i];

    const can=
    (pos<0&&dice===6)||
    (pos>=0&&pos<24&&pos+dice<=24);

    b.disabled=!can;

    b.onclick=()=>{

      moveLudoPawn(0,i,dice);

    };

  });

  const extra=document.createElement("button");

  extra.className="answer";

  extra.textContent="Passer le tour";

  extra.onclick=()=>nextLudoTurn(dice===6);

  pawns.appendChild(extra);
}

function moveLudoPawn(playerIndex,pawnIndex,dice){

  const p=ludoState.players[playerIndex];

  let pos=p.pos[pawnIndex];

  if(pos<0){

    pos=0;

  }else{

    pos+=dice;

  }

  p.pos[pawnIndex]=pos;

  if(pos===24){

    p.score++;

  }

  ludoCapture(playerIndex,pos);

  if(p.score>=4){

    ludoState.winner=true;

    document.getElementById("ludoInfo").textContent=
    `🏆 ${p.name} gagne ! +100 points`;

    if(p.human){

      player.points+=100;

      save();

    }

    renderLudo();

    return;
  }

  nextLudoTurn(dice===6);
}

function ludoCapture(playerIndex,pos){

  if(pos<=0||pos>=24)return;

  ludoState.players.forEach((p,i)=>{

    if(i===playerIndex)return;

    p.pos=p.pos.map(x=>x===pos?-1:x);

  });
}

function nextLudoTurn(extra){

  ludoState.turn=
  extra
  ?ludoState.turn
  :(ludoState.turn+1)%4;

  renderLudo();

  if(ludoState.turn!==0&&!ludoState.winner){

    setTimeout(ludoCpuTurn,500);

  }
}

function ludoCpuTurn(){

  if(!ludoState||
     ludoState.winner||
     ludoState.turn===0)return;

  const dice=Math.floor(Math.random()*6)+1;

  const p=ludoState.players[ludoState.turn];

  let choices=p.pos.map((pos,i)=>{

    if(pos<0&&dice===6)return i;

    if(pos>=0&&pos<24&&pos+dice<=24)return i;

    return -1;

  }).filter(i=>i>=0);

  if(choices.length){

    choices.sort((a,b)=>{

      const pa=p.pos[a];

      const pb=p.pos[b];

      return (pb<0?0:pb)-(pa<0?0:pa);

    });

    moveLudoPawn(
      ludoState.turn,
      choices[0],
      dice
    );

  }else{

    nextLudoTurn(dice===6);

  }
}

function ludoCpuMove(dice){

  const p=ludoState.players[ludoState.turn];

  const choices=p.pos.map((pos,i)=>{

    if(pos<0&&dice===6)return i;

    if(pos>=0&&pos<24&&pos+dice<=24)return i;

    return -1;

  }).filter(i=>i>=0);

  if(choices.length){

    moveLudoPawn(
      ludoState.turn,
      choices[0],
      dice
    );

  }else{

    nextLudoTurn(dice===6);

  }
}

const oldRenderForLudo=render;

render=function(){

  oldRenderForLudo();

  const grid=document.getElementById("gameGrid");

  if(!grid)return;

  [...grid.querySelectorAll(".game")].forEach(card=>{

    const title=card.querySelector("h3");

    const btn=card.querySelector("button");

    if(
      title&&
      btn&&
      title.textContent.trim().toLowerCase()==="ludo"
    ){

      btn.onclick=startLudoGame;

    }

  });
};

render();
