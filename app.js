const defaultGames=[
{name:"Quiz Culture Générale",icon:"🧠",points:50,type:"quiz"},
{name:"Puzzle",icon:"🧩",points:40,type:"soon"},
{name:"Défi Rapide",icon:"⚡",points:60,type:"soon"},
{name:"Tir de précision",icon:"🎯",points:50,type:"soon"},
{name:"Échecs",icon:"♟️",points:70,type:"soon"},
{name:"Tournoi",icon:"🏆",points:100,type:"soon"},
{name:"Devine le nombre",icon:"🔢",points:50,type:"number"}
];

const questions=[
{q:"Quelle est la capitale du Burkina Faso ?",a:["Bobo-Dioulasso","Ouagadougou","Koudougou","Banfora"],c:1},
{q:"Combien font 7 × 8 ?",a:["54","56","64","48"],c:1},
{q:"Quelle planète est surnommée la planète rouge ?",a:["Mars","Vénus","Jupiter","Mercure"],c:0}
];

let games=JSON.parse(localStorage.games||"null");
if(!Array.isArray(games)||games.length===0){
games=defaultGames.slice();
}

let rewards=JSON.parse(localStorage.rewards||"null")||[
{name:"Badge Champion",cost:500,icon:"🏅"},
{name:"Carte cadeau",cost:2000,icon:"🎁"},
{name:"Accessoire gaming",cost:5000,icon:"🎧"}
];

let player=JSON.parse(localStorage.player||"null")||{
name:"Visiteur",
points:0
};

let rewardRequests=JSON.parse(localStorage.rewardRequests||"null")||[];

let qi=0;
let secretNumber=0;

function save(){
localStorage.games=JSON.stringify(games);
localStorage.rewards=JSON.stringify(rewards);
localStorage.player=JSON.stringify(player);
localStorage.rewardRequests=JSON.stringify(rewardRequests);
render();
}

function showPage(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));

let page=document.getElementById(id);

if(page){
page.classList.add("active");
}
}

document.querySelectorAll("nav button").forEach(b=>{
b.onclick=()=>showPage(b.dataset.page);
});

function render(){

let userArea=document.getElementById("userArea");

if(userArea){
userArea.innerHTML=
`<button class="primary" onclick="openLogin()">${
player.name==="Visiteur"
?"S'inscrire"
:"👤 "+player.name
}</button>`;
}

let statGames=document.getElementById("statGames");
let statPlayers=document.getElementById("statPlayers");
let statPoints=document.getElementById("statPoints");

if(statGames)statGames.textContent=games.length;
if(statPlayers)statPlayers.textContent="1";
if(statPoints)statPoints.textContent=player.points;

let aGames=document.getElementById("aGames");
let aPlayers=document.getElementById("aPlayers");
let aPoints=document.getElementById("aPoints");

if(aGames)aGames.textContent=games.length;
if(aPlayers)aPlayers.textContent="1";
if(aPoints)aPoints.textContent=player.points;

let gameGrid=document.getElementById("gameGrid");

if(gameGrid){
gameGrid.innerHTML=games.map(g=>`
<div class="game">
<div class="icon">${g.icon}</div>
<h3>${g.name}</h3>
<p class="muted">Joue et gagne jusqu'à ${g.points} points.</p>
${
g.type==="quiz"
?`<button class="primary" onclick="startQuiz()">Jouer</button>`
:g.type==="number"
?`<button class="primary" onclick="startNumberGame()">Jouer</button>`
:`<button class="primary" onclick="alert('Ce jeu sera ajouté dans une prochaine version.')">Jouer</button>`
}
</div>
`).join("");
}

let rewardGrid=document.getElementById("rewardGrid");

if(rewardGrid){
rewardGrid.innerHTML=rewards.map(r=>`
<div class="reward">
<div class="icon">${r.icon}</div>
<h3>${r.name}</h3>
<p>${r.cost} points</p>
<button class="primary" onclick="claim(${r.cost},'${r.name}')">
Échanger
</button>
</div>
`).join("");
}

let rankingBody=document.getElementById("rankingBody");

if(rankingBody){
rankingBody.innerHTML=
`<tr>
<td>1</td>
<td>${player.name}</td>
<td>${player.points.toLocaleString("fr-FR")}</td>
</tr>`;
}

let requestsBox=document.getElementById("rewardRequests");

if(requestsBox){

if(rewardRequests.length===0){

requestsBox.innerHTML=
`<p class="muted">Aucune demande de récompense.</p>`;

}else{

requestsBox.innerHTML=rewardRequests.map(r=>{

let action="";

if(r.status==="pending"){

action=`
<button class="primary" onclick="approveReward(${r.id})">
✅ Valider
</button>

<button class="primary" onclick="rejectReward(${r.id})">
❌ Refuser
</button>
`;

}

return `
<div class="panel">
<h3>🎁 ${r.reward}</h3>
<p>👤 ${r.player}</p>
<p>💰 ${r.cost} points</p>
<p>Statut : <strong>${r.status==="pending"?"🟡 En attente":r.status==="approved"?"✅ Validée":"❌ Refusée"}</strong></p>
${action}
</div>
`;

}).join("");

}

}

}

function startNumberGame(){

secretNumber=Math.floor(Math.random()*100)+1;

document.getElementById("numberGuess").value="";

document.getElementById("numberResult").textContent=
"Entre un nombre entre 1 et 100.";

showPage("numberGame");
}

function guessNumber(){

let n=+document.getElementById("numberGuess").value;

if(!n||n<1||n>100){

alert("Entre un nombre entre 1 et 100.");

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

document.getElementById("loginModal").classList.remove("hidden");

}

function closeLogin(){

document.getElementById("loginModal").classList.add("hidden");

}

function login(){

let n=document.getElementById("username").value.trim();

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
`<button class="primary" onclick="showPage('games')">
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
`<button class="answer" onclick="answer(${i})">
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

let request=rewardRequests.find(r=>r.id===id);

if(!request)return;

request.status="approved";

save();

alert("Récompense validée.");

}

function rejectReward(id){

let request=rewardRequests.find(r=>r.id===id);

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

let n=document.getElementById("newGameName").value.trim();

let p=+document.getElementById("newGamePoints").value;

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

let n=document.getElementById("newRewardName").value.trim();

let c=+document.getElementById("newRewardCost").value;

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

render();
