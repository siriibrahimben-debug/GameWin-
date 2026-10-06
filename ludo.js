/* GameWin - Ludo (style Ludo Master)
   Module autonome : à charger APRÈS app.js
   <script src="ludo.js?v=1"></script>
*/
(function () {
  'use strict';
  var root = document.getElementById('ludoGame');
  if (!root) return;

  /* ---------- Données du plateau ---------- */
  var ORDER = ['blue', 'red', 'green', 'yellow']; // sens des aiguilles d'une montre
  var PL = {
    blue:   { label: 'Bleu',  hex: '#1e9be8', start: 39, base: [9, 0], home: function (k) { return [14 - k, 7]; } },
    red:    { label: 'Rouge', hex: '#f0391f', start: 0,  base: [0, 0], home: function (k) { return [7, k]; } },
    green:  { label: 'Vert',  hex: '#22c06a', start: 13, base: [0, 9], home: function (k) { return [k, 7]; } },
    yellow: { label: 'Jaune', hex: '#f6c61a', start: 26, base: [9, 9], home: function (k) { return [7, 14 - k]; } }
  };
  var SETUPS = { 2: ['blue', 'green'], 3: ['blue', 'red', 'green'], 4: ORDER };

  var RING = [];
  function add(r, c) { RING.push([r, c]); }
  var i;
  for (i = 1; i <= 5; i++) add(6, i);
  for (i = 5; i >= 0; i--) add(i, 6);
  add(0, 7); add(0, 8);
  for (i = 1; i <= 5; i++) add(i, 8);
  for (i = 9; i <= 14; i++) add(6, i);
  add(7, 14); add(8, 14);
  for (i = 13; i >= 9; i--) add(8, i);
  for (i = 9; i <= 14; i++) add(i, 8);
  add(14, 7); add(14, 6);
  for (i = 13; i >= 9; i--) add(i, 6);
  for (i = 5; i >= 0; i--) add(8, i);
  add(7, 0); add(6, 0); // 52 cases

  var ringAt = {}, homeAt = {}, startAt = {};
  RING.forEach(function (p, k) { ringAt[p[0] + ',' + p[1]] = k; });
  ORDER.forEach(function (c) {
    startAt[PL[c].start] = c;
    for (var k = 1; k <= 5; k++) { var p = PL[c].home(k); homeAt[p[0] + ',' + p[1]] = c; }
  });
  var ARROWS = { '7,0': ['→', 'red'], '0,7': ['↓', 'green'], '7,14': ['←', 'yellow'], '14,7': ['↑', 'blue'] };

  function inBase(r, c) { return (r < 6 || r > 8) && (c < 6 || c > 8); }
  function inCenter(r, c) { return r >= 6 && r <= 8 && c >= 6 && c <= 8; }
  function isSafe(idx) { return idx % 13 === 0 || idx % 13 === 8; }
  // rel : -1 base, 0..50 anneau, 51..55 colonne d'arrivée, 56 arrivé
  function cellOf(color, rel) {
    if (rel <= 50) return RING[(PL[color].start + rel) % 52];
    if (rel <= 55) return PL[color].home(rel - 50);
    return null;
  }

  /* ---------- État ---------- */
  var cfg = { mode: 'vs', lv: 1, n: 4, names: ['Joueur 1', 'Joueur 2', 'Joueur 3', 'Joueur 4'] };
  var S = null;       // partie en cours
  var shown = false;

  function later(g, fn, ms) { setTimeout(function () { if (S === g) fn(); }, ms); }
  function cur(g) { return g.players[g.turn]; }
  function nameOf(g, color) {
    for (var k = 0; k < g.players.length; k++) if (g.players[k].color === color) return g.players[k].name;
    return color;
  }

  /* ---------- Style ---------- */
  var css = '' +
    '.lg{max-width:540px;margin:0 auto;color:#fff;font-family:inherit}' +
    '.lg-bar{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;font-size:18px}' +
    '.lbtn{background:#ffd21c;color:#111;border:0;border-radius:12px;padding:12px 16px;font-weight:bold;font-size:15px;cursor:pointer;font-family:inherit}' +
    '.lbtn.sm{padding:8px 12px;font-size:14px}.lbtn.alt{background:#243d62;color:#fff}.lbtn.sel{background:#2bd16f;color:#04210f}' +
    '.lg-menu{background:#0d1d36;border:1px solid #243d62;border-radius:18px;padding:20px;text-align:center;display:flex;flex-direction:column;gap:12px}' +
    '.lg-menu h2{margin:0 0 4px}.lmuted{color:#9fb3d1;margin:0}' +
    '.lmode{border:3px solid #ffd21c;border-radius:16px;padding:20px 12px;font-size:19px;font-weight:bold;color:#fff;cursor:pointer;font-family:inherit}' +
    '.lmode.vs{background:linear-gradient(135deg,#2d4fb5,#5b3fd1)}.lmode.local{background:linear-gradient(135deg,#c0262d,#e0572a)}' +
    '.lcounts{display:flex;gap:8px;justify-content:center}.lcounts .lbtn{flex:1}' +
    '.lrows{display:flex;flex-direction:column;gap:8px}' +
    '.lrow{display:flex;align-items:center;gap:10px;background:#102745;border-radius:12px;padding:8px 10px}' +
    '.ldot{width:22px;height:22px;border-radius:50%;border:2px solid #fff;flex:none}' +
    '.lrow input{flex:1;min-width:0;background:#0a1730;border:1px solid #243d62;border-radius:8px;color:#fff;padding:9px;font-size:15px;font-family:inherit}' +
    '.lrow input:disabled{opacity:.6}' +
    '.lg-row{display:flex;gap:8px;margin:8px 0}' +
    '.lp{flex:1;display:flex;align-items:center;gap:8px;padding:8px;border-radius:14px;background:#0d1d36;border:2px solid #243d62;min-width:0;position:relative}' +
    '.lp.ghost{visibility:hidden}.lp.on{border-color:var(--tc);box-shadow:0 0 14px var(--tc)}' +
    '.lp-info{min-width:0;flex:1}.lp-name{font-weight:bold;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '.lp-sc{font-size:13px;color:#ffd21c}.lp.on .lp-name::after{content:" 👈"}' +
    '.ld{width:54px;height:54px;flex:none;border-radius:12px;background:#f4f4f4;border:3px solid #333;display:grid;grid-template:repeat(3,1fr)/repeat(3,1fr);padding:6px;cursor:default;opacity:.5}' +
    '.ld i{width:9px;height:9px;border-radius:50%;place-self:center}.ld i.on{background:#111}' +
    '.lp.on .ld{opacity:1}.ld.rdy{cursor:pointer;animation:lglow .8s infinite alternate;border-color:#ffd21c}' +
    '@keyframes lglow{to{transform:scale(1.12);box-shadow:0 0 14px #ffd21c}}' +
    '.lb{display:grid;grid-template-columns:repeat(15,1fr);grid-template-rows:repeat(15,1fr);width:100%;aspect-ratio:1;background:#fff;border:3px solid #20395d;border-radius:10px;overflow:hidden;position:relative}' +
    '.lcell{position:relative;display:flex;flex-wrap:wrap;align-items:center;justify-content:center;background:#fff;border:1px solid #cdd6e3;box-sizing:border-box}' +
    '.lcell.star::before{content:"★";position:absolute;color:#6b7b95;font-size:clamp(9px,3.4vw,18px);line-height:1}' +
    '.lcell.arr::before{content:attr(data-a);position:absolute;color:var(--ac);font-weight:bold;font-size:clamp(10px,3.6vw,20px);line-height:1}' +
    '.lbase{margin:0;display:flex;align-items:center;justify-content:center}.lbase.off{opacity:.35}' +
    '.lbase-in{width:68%;height:68%;background:#fff;border-radius:6px;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;place-items:center;padding:4%;box-sizing:border-box}' +
    '.lslot{width:80%;height:80%;border-radius:50%;background:rgba(0,0,0,.1);display:flex;align-items:center;justify-content:center}' +
    '.lcenter{background:conic-gradient(from -45deg,#22c06a 0 90deg,#f6c61a 90deg 180deg,#1e9be8 180deg 270deg,#f0391f 270deg 360deg)}' +
    '.lt{width:78%;height:78%;border-radius:50%;border:2px solid #fff;background:radial-gradient(circle at 35% 30%,#fff8,var(--tc) 55%);box-shadow:0 2px 4px #0006;padding:0;cursor:default;box-sizing:border-box}' +
    '.lslot .lt{width:92%;height:92%}.lcell.multi .lt{width:46%;height:46%}' +
    '.lt.mv{cursor:pointer;z-index:3;box-shadow:0 0 0 3px #ffd21c;animation:lpulse .6s infinite alternate}' +
    '@keyframes lpulse{to{transform:scale(1.22)}}' +
    '.lg-msg{min-height:44px;margin:10px 0;color:#ffd21c;font-weight:bold;text-align:center}' +
    '.lg-btns{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}' +
    '.lover{position:absolute;inset:0;background:#0b1630ee;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:5;padding:14px;text-align:center}' +
    '.lover h3{margin:0;font-size:22px}.lover p{margin:0;font-size:17px}';
  var st = document.createElement('style');
  st.id = 'ludo-style';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Écrans de menu ---------- */
  function showMenu() {
    S = null;
    root.innerHTML =
      '<div class="lg"><div class="lg-menu"><h2>🎲 Ludo</h2>' +
      '<p class="lmuted">Choisis ton mode de jeu</p>' +
      '<button class="lmode vs" data-act="mode" data-v="vs">🖥️ VS Ordinateur</button>' +
      '<button class="lmode local" data-act="mode" data-v="local">👥 Multijoueur local</button>' +
      '<button class="lbtn alt" data-act="games">← Retour aux jeux</button></div></div>';
  }

  function showSetup() {
    S = null;
    try { if (player && player.name && player.name !== 'Visiteur' && cfg.names[0] === 'Joueur 1') cfg.names[0] = player.name; } catch (e) {}
    var colors = SETUPS[cfg.n];
    var rows = colors.map(function (c, k) {
      var ai = cfg.mode === 'vs' && k > 0;
      var val = ai ? (k === 1 && cfg.n === 2 ? 'Ordinateur' : 'Ordinateur ' + k) : cfg.names[k];
      return '<div class="lrow"><span class="ldot" style="background:' + PL[c].hex + '"></span>' +
        '<input data-k="' + k + '" maxlength="14" value="' + val.replace(/"/g, '&quot;') + '"' + (ai ? ' disabled' : '') + '></div>';
    }).join('');
    var counts = [2, 3, 4].map(function (n) {
      return '<button class="lbtn ' + (n === cfg.n ? 'sel' : 'alt') + '" data-act="count" data-v="' + n + '">' + n + ' joueurs</button>';
    }).join('');
    var lvls = ['🟢 Facile', '🟠 Moyen', '🔴 Difficile'].map(function (t, k) {
      return '<button class="lbtn ' + (k === cfg.lv ? 'sel' : 'alt') + '" data-act="lvl" data-v="' + k + '">' + t + '</button>';
    }).join('');
    root.innerHTML =
      '<div class="lg"><div class="lg-menu"><h2>' + (cfg.mode === 'vs' ? '🖥️ VS Ordinateur' : '👥 Multijoueur local') + '</h2>' +
      '<p class="lmuted">Choisis le nombre de joueurs et les noms</p>' +
      '<div class="lcounts">' + counts + '</div>' +
      (cfg.mode === 'vs' ? '<p class="lmuted">Difficulté de l\'ordinateur (points ×1 / ×1,5 / ×2,2)</p><div class="lcounts">' + lvls + '</div>' : '') +
      '<div class="lrows">' + rows + '</div>' +
      '<button class="lbtn" data-act="play" style="font-size:18px">▶ JOUER</button>' +
      '<button class="lbtn alt" data-act="menu">← Retour</button></div></div>';
  }

  /* ---------- Partie ---------- */
  function startGame() {
    var colors = SETUPS[cfg.n];
    var players = colors.map(function (c, k) {
      var ai = cfg.mode === 'vs' && k > 0;
      return { color: c, ai: ai, name: ai ? (cfg.n === 2 ? 'Ordinateur' : 'Ordinateur ' + k) : (cfg.names[k] || 'Joueur ' + (k + 1)) };
    });
    var g = { players: players, tok: {}, last: {}, turn: 0, dice: 0, phase: 'roll', sixes: 0,
      movable: [], rank: [], rolling: false, msg: '' };
    colors.forEach(function (c) { g.tok[c] = [-1, -1, -1, -1]; g.last[c] = 0; });
    g.msg = 'Au tour de ' + players[0].name + ' : lance le dé !';
    S = g;
    render();
    if (players[0].ai) later(g, roll, 800);
  }

  function movableOf(g, col, v) {
    var out = [], t = g.tok[col];
    for (var k = 0; k < 4; k++) {
      if (t[k] === -1) { if (v === 6) out.push(k); }
      else if (t[k] + v <= 56) out.push(k);
    }
    return out;
  }

  function roll() {
    var g = S;
    if (!g || g.phase !== 'roll' || g.rolling) return;
    var col = cur(g).color, n = 0;
    g.rolling = true;
    var iv = setInterval(function () {
      if (S !== g) { clearInterval(iv); return; }
      g.last[col] = 1 + Math.floor(Math.random() * 6);
      render();
      if (++n >= 7) { clearInterval(iv); g.rolling = false; finishRoll(g, col); }
    }, 70);
  }

  function finishRoll(g, col) {
    if (S !== g) return;
    var v = 1 + Math.floor(Math.random() * 6), p = cur(g), nm = p.name;
    g.last[col] = v; g.dice = v;
    g.sixes = v === 6 ? g.sixes + 1 : 0;
    if (g.sixes >= 3) {
      g.phase = 'wait'; g.msg = nm + ' a fait trois 6 de suite : tour perdu.';
      render(); later(g, function () { endTurn(g); }, 1200); return;
    }
    var mv = movableOf(g, col, v);
    g.movable = mv;
    if (!mv.length) {
      g.phase = 'wait'; g.msg = nm + ' a fait ' + v + ' : aucun pion ne peut bouger.';
      render(); later(g, function () { endTurn(g); }, 1100); return;
    }
    g.phase = 'move';
    if (p.ai) { g.msg = nm + ' a fait ' + v + '.'; render(); later(g, function () { aiPlay(g); }, 800); }
    else if (mv.length === 1) { g.msg = nm + ' a fait ' + v + '.'; render(); later(g, function () { doMove(g, col, mv[0]); }, 500); }
    else { g.msg = nm + ' a fait ' + v + ' : choisis un pion.'; render(); }
  }

  function wouldCapture(g, col, np) {
    if (np > 50) return false;
    var idx = (PL[col].start + np) % 52;
    if (isSafe(idx)) return false;
    for (var a = 0; a < g.players.length; a++) {
      var o = g.players[a].color; if (o === col) continue;
      for (var j = 0; j < 4; j++) {
        var q = g.tok[o][j];
        if (q >= 0 && q <= 50 && (PL[o].start + q) % 52 === idx) return true;
      }
    }
    return false;
  }

  // un pion adverse peut-il atteindre cette case de l'anneau en 1 à 6 pas ?
  function threat(g, col, idx) {
    for (var a = 0; a < g.players.length; a++) {
      var o = g.players[a].color; if (o === col) continue;
      for (var j = 0; j < 4; j++) {
        var q = g.tok[o][j];
        if (q >= 0 && q <= 50) { var d = (idx - (PL[o].start + q) % 52 + 52) % 52; if (d >= 1 && d <= 6) return true; }
      }
    }
    return false;
  }

  function aiPlay(g) {
    if (S !== g || g.phase !== 'move') return;
    var col = cur(g).color, v = g.dice, best = -1, bs = -1e9, lv = cfg.lv;
    // Facile : joue souvent au hasard
    if (lv === 0 && Math.random() < 0.3) { doMove(g, col, g.movable[Math.floor(Math.random() * g.movable.length)]); return; }
    g.movable.forEach(function (k) {
      var p = g.tok[col][k], np = p < 0 ? 0 : p + v, s = np * 0.5;
      if (np === 56) s += 100;
      if (wouldCapture(g, col, np)) s += 90;
      if (p < 0) s += 60;
      if (np > 50 && p <= 50) s += 40;
      if (np <= 50 && isSafe((PL[col].start + np) % 52)) s += 25;
      if (p >= 0 && p <= 50 && isSafe((PL[col].start + p) % 52)) s -= 15; // quitter une case sûre
      if (lv >= 1) { // Moyen et Difficile : évite les cases où un adversaire peut capturer, fuit le danger
        if (np <= 50 && !isSafe((PL[col].start + np) % 52) && threat(g, col, (PL[col].start + np) % 52)) s -= 45;
        if (p >= 0 && p <= 50 && !isSafe((PL[col].start + p) % 52) && threat(g, col, (PL[col].start + p) % 52)) s += 35;
        s += np * 0.3;
      }
      if (lv === 2 && np <= 50) { // Difficile : poursuit les pions adverses (menace de capture) et protège ses pions avancés
        var ci = (PL[col].start + np) % 52;
        for (var a2 = 0; a2 < g.players.length; a2++) {
          var oc = g.players[a2].color; if (oc === col) continue;
          for (var j2 = 0; j2 < 4; j2++) {
            var q2 = g.tok[oc][j2];
            if (q2 >= 0 && q2 <= 50) { var oi = (PL[oc].start + q2) % 52, dd = (oi - ci + 52) % 52; if (dd >= 1 && dd <= 6 && !isSafe(oi)) s += 20; }
          }
        }
        if (p < 0) s += 15; // sortir vite les pions
      }
      s += Math.random() * (lv === 2 ? 0.3 : lv === 1 ? 1.5 : 3);
      if (s > bs) { bs = s; best = k; }
    });
    doMove(g, col, best);
  }

  function doMove(g, col, k) {
    if (S !== g || g.phase !== 'move' || g.movable.indexOf(k) < 0) return;
    var v = g.dice, t = g.tok[col], p = t[k], np = p < 0 ? 0 : p + v, captured = false;
    t[k] = np;
    if (np <= 50) {
      var idx = (PL[col].start + np) % 52;
      if (!isSafe(idx)) {
        g.players.forEach(function (pl) {
          if (pl.color === col) return;
          var ot = g.tok[pl.color];
          for (var j = 0; j < 4; j++) {
            if (ot[j] >= 0 && ot[j] <= 50 && (PL[pl.color].start + ot[j]) % 52 === idx) { ot[j] = -1; captured = true; }
          }
        });
      }
    }
    var nm = cur(g).name, fin = np === 56, msg = '';
    if (captured) msg = nm + ' capture un pion ! ';
    if (fin) msg += nm + ' a amené un pion à l\'arrivée ! ';
    if (t.every(function (x) { return x === 56; })) { g.rank.push(col); msg += nm + ' a terminé ! '; }
    g.movable = [];
    var alive = g.players.filter(function (pl) { return g.rank.indexOf(pl.color) < 0; });
    if (alive.length <= 1) {
      if (alive.length === 1) g.rank.push(alive[0].color);
      g.phase = 'over'; g.msg = '';
      // Points : seulement si le joueur humain gagne contre l'ordinateur
      var win = g.players.filter(function (pl) { return pl.color === g.rank[0]; })[0];
      if (cfg.mode === 'vs' && !win.ai) {
        var pts = Math.round(g.players.length * 25 * [1, 1.5, 2.2][cfg.lv]); // × niveau
        try { player.points += pts; saveData(); g.award = pts; } catch (e) {}
      }
      render();
      return;
    }
    var extra = (v === 6 || captured || fin) && g.rank.indexOf(col) < 0;
    if (extra) {
      g.phase = 'roll'; g.msg = msg + nm + ' rejoue !'; render();
      if (cur(g).ai) later(g, roll, 800);
    } else {
      g.msg = msg; g.phase = 'wait'; render();
      later(g, function () { endTurn(g); }, msg ? 700 : 350);
    }
  }

  function endTurn(g) {
    if (S !== g) return;
    g.sixes = 0; g.movable = [];
    do { g.turn = (g.turn + 1) % g.players.length; } while (g.rank.indexOf(cur(g).color) >= 0);
    g.phase = 'roll';
    g.msg = 'Au tour de ' + cur(g).name + (cur(g).ai ? '…' : ' : lance le dé !');
    render();
    if (cur(g).ai) later(g, roll, 800);
  }

  /* ---------- Affichage ---------- */
  var PIPS = { 0: [], 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function dieHTML(v, rdy, c) {
    var h = '<button class="ld' + (rdy ? ' rdy' : '') + '" data-act="roll" aria-label="Lancer le dé">';
    for (var k = 0; k < 9; k++) h += '<i' + (PIPS[v].indexOf(k) >= 0 ? ' class="on"' : '') + '></i>';
    return h + '</button>';
  }

  function panel(g, c) {
    if (!g.tok[c]) return '<div class="lp ghost"></div>';
    var pl = g.players.filter(function (p) { return p.color === c; })[0];
    var isTurn = g.phase !== 'over' && cur(g).color === c;
    var done = g.tok[c].filter(function (x) { return x === 56; }).length;
    var rdy = isTurn && g.phase === 'roll' && !pl.ai && !g.rolling;
    return '<div class="lp' + (isTurn ? ' on' : '') + '" style="--tc:' + PL[c].hex + '">' +
      '<div class="lp-info"><div class="lp-name">' + esc(pl.name) + '</div><div class="lp-sc">🏅 ' + done + '/4</div></div>' +
      dieHTML(g.last[c] || 0, rdy, c) + '</div>';
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]; }); }

  function tokHTML(g, c, k, mvOK) {
    var mv = mvOK && g.movable.indexOf(k) >= 0;
    return '<button class="lt' + (mv ? ' mv' : '') + '" style="--tc:' + PL[c].hex + '" data-c="' + c + '" data-k="' + k + '"></button>';
  }

  function boardHTML(g) {
    var curP = cur(g), occ = {}, h = '';
    var mvOK = g.phase === 'move' && !curP.ai;
    var baseTok = {};
    ORDER.forEach(function (c) {
      if (!g.tok[c]) return;
      baseTok[c] = '';
      g.tok[c].forEach(function (p, k) {
        var isCur = c === curP.color;
        if (p === -1) baseTok[c] += '<div class="lslot">' + tokHTML(g, c, k, mvOK && isCur) + '</div>';
        else if (p < 56) {
          var cell = cellOf(c, p), key = cell[0] + ',' + cell[1];
          (occ[key] = occ[key] || []).push(tokHTML(g, c, k, mvOK && isCur));
        }
      });
    });
    ORDER.forEach(function (c) {
      var b = PL[c].base, active = !!g.tok[c], inner = '';
      if (active) {
        // les emplacements vides (pions sortis) restent visibles
        var slots = (baseTok[c].match(/lslot/g) || []).length;
        inner = baseTok[c];
        for (var s = slots; s < 4; s++) inner += '<div class="lslot"></div>';
      } else inner = '<div class="lslot"></div><div class="lslot"></div><div class="lslot"></div><div class="lslot"></div>';
      h += '<div class="lbase' + (active ? '' : ' off') + '" style="grid-area:' + (b[0] + 1) + '/' + (b[1] + 1) + '/span 6/span 6;background:' + PL[c].hex + '">' +
        '<div class="lbase-in">' + inner + '</div></div>';
    });
    h += '<div class="lcenter" style="grid-area:7/7/10/10"></div>';
    for (var r = 0; r < 15; r++) for (var c2 = 0; c2 < 15; c2++) {
      if (inBase(r, c2) || inCenter(r, c2)) continue;
      var key2 = r + ',' + c2, idx = ringAt[key2], hc = homeAt[key2], cls = 'lcell', style = '', attr = '';
      if (hc) style = 'background:' + PL[hc].hex + ';';
      else if (idx !== undefined) {
        if (startAt[idx]) style = 'background:' + PL[startAt[idx]].hex + ';';
        else if (idx % 13 === 8) cls += ' star';
      }
      if (ARROWS[key2]) { cls += ' arr'; attr = ' data-a="' + ARROWS[key2][0] + '"'; style += '--ac:' + PL[ARROWS[key2][1]].hex + ';'; }
      var list = occ[key2] || [];
      if (list.length > 1) cls += ' multi';
      h += '<div class="' + cls + '"' + attr + ' style="grid-area:' + (r + 1) + '/' + (c2 + 1) + ';' + style + '">' + list.join('') + '</div>';
    }
    return h;
  }

  function overHTML(g) {
    var medals = ['🥇', '🥈', '🥉', '4️⃣'];
    var lines = g.rank.map(function (c, k) { return '<p>' + medals[k] + ' ' + esc(nameOf(g, c)) + '</p>'; }).join('');
    return '<div class="lover"><h3>🏆 Partie terminée</h3>' + lines +
      (g.award ? '<p style="color:#ffd21c">🎉 +' + g.award + ' points !</p>' : '') +
      '<button class="lbtn" data-act="again">🔄 Rejouer</button>' +
      '<button class="lbtn alt" data-act="menu">⚙️ Changer de mode</button></div>';
  }

  function render() {
    var g = S; if (!g) return;
    root.innerHTML =
      '<div class="lg">' +
      '<div class="lg-bar"><button class="lbtn sm alt" data-act="games">← Jeux</button><b>🎲 Ludo</b><button class="lbtn sm alt" data-act="menu">⚙️</button></div>' +
      '<div class="lg-row">' + panel(g, 'red') + panel(g, 'green') + '</div>' +
      '<div class="lb">' + boardHTML(g) + (g.phase === 'over' ? overHTML(g) : '') + '</div>' +
      '<div class="lg-row">' + panel(g, 'blue') + panel(g, 'yellow') + '</div>' +
      '<div class="lg-msg">' + esc(g.msg) + '</div>' +
      '<div class="lg-btns"><button class="lbtn alt" data-act="again">🔄 Nouvelle partie</button></div></div>';
  }

  /* ---------- Événements ---------- */
  root.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('.lt.mv') : null;
    if (t && S) { doMove(S, t.getAttribute('data-c'), parseInt(t.getAttribute('data-k'), 10)); return; }
    var b = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!b) return;
    var act = b.getAttribute('data-act'), v = b.getAttribute('data-v');
    if (act === 'roll') { if (S && !cur(S).ai) roll(); }
    else if (act === 'mode') { cfg.mode = v; showSetup(); }
    else if (act === 'lvl') { cfg.lv = parseInt(v, 10); showSetup(); }
    else if (act === 'count') { cfg.n = parseInt(v, 10); showSetup(); }
    else if (act === 'play' || act === 'again') startGame();
    else if (act === 'menu') showMenu();
    else if (act === 'games') { S = null; shown = false; if (typeof window.showPage === 'function') window.showPage('games'); }
  });
  root.addEventListener('input', function (e) {
    var k = e.target && e.target.getAttribute && e.target.getAttribute('data-k');
    if (k !== null && k !== undefined && e.target.tagName === 'INPUT') cfg.names[parseInt(k, 10)] = e.target.value;
  });

  /* ---------- Intégration avec l'ancien code ---------- */
  function onShow() {
    if (root.classList.contains('active')) { if (!shown) { shown = true; showMenu(); } }
    else { shown = false; S = null; }
  }
  new MutationObserver(onShow).observe(root, { attributes: true, attributeFilter: ['class'] });
  // anciennes fonctions de app.js : on les remplace pour éviter les conflits
  window.renderLudo = function () { if (!shown) { shown = true; showMenu(); } };
  window.startLudo = function () { showPage('ludoGame'); };
  window.createLudoState = function () { return {}; };
  window.ludoChooseMode = function () { shown = true; showMenu(); };
  window.ludoNewGame = function () { shown = true; if (S) startGame(); else showMenu(); };
  window.ludoRoll = function () { roll(); };
  onShow();
})();
