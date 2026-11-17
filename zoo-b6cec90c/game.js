// The animal adventure: a course from Swedish to English in 5 worlds of 10 levels.
// The course itself is data.js (built from tools/adventure/content.txt). Everything the player
// does is kept in the browser's local storage and nothing is sent anywhere.
//
// How the game makes sure a word is understood, not guessed:
// - every question takes one answer only, so the choices cannot be tried one after the other;
// - a wrong answer shows the right one, and the same question comes back twice: soon, and at the end;
// - every word and sentence must also be built from letters or word tiles, with extra tiles that do not
//   belong, and a sentence is also built from listening alone;
// - a level is done when every question has been answered right, and earlier misses come back in later levels.
(() => {
'use strict';
const D = window.AA_DATA, $ = s => document.querySelector(s), app = $('#app');
const rnd = n => Math.floor(Math.random() * n), pick = a => a[rnd(a.length)];
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// The name of a clip; the same sum as in tools/adventure/build.mjs.
const clipId = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0') + s.length.toString(36); };
const svSaid = s => s.replace(/\s*\([^)]*\)/g, '').replace(/\//g, ', ').trim();

const STICKERS = [['🐣','chick','kyckling'],['🐶','dog','hund'],['🐴','horse','häst'],['🐑','sheep','får'],['🐰','rabbit','kanin'],['🦆','duck','anka'],['🐐','goat','get'],['🐮','cow','ko'],['🐭','mouse','mus'],['🐓','rooster','tupp'],
  ['🐻','bear','björn'],['🐿️','squirrel','ekorre'],['🦊','fox','räv'],['🦔','hedgehog','igelkott'],['🦉','owl','uggla'],['🐺','wolf','varg'],['🦌','deer','rådjur'],['🐸','frog','groda'],['🦇','bat','fladdermus'],['🐗','boar','vildsvin'],
  ['🦁','lion','lejon'],['🐘','elephant','elefant'],['🦒','giraffe','giraff'],['🦓','zebra','zebra'],['🐵','monkey','apa'],['🦏','rhino','noshörning'],['🦛','hippo','flodhäst'],['🐆','leopard','leopard'],['🦩','flamingo','flamingo'],['🐪','camel','kamel'],
  ['🐬','dolphin','delfin'],['🦈','shark','haj'],['🐙','octopus','bläckfisk'],['🐢','turtle','sköldpadda'],['🦀','crab','krabba'],['🐳','whale','val'],['🐠','fish','fisk'],['🦭','seal','säl'],['🐧','penguin','pingvin'],['🦞','lobster','hummer'],
  ['🦘','kangaroo','känguru'],['🐨','koala','koala'],['🐊','crocodile','krokodil'],['🐍','snake','orm'],['🦜','parrot','papegoja'],['🕷️','spider','spindel'],['🦎','lizard','ödla'],['🦢','swan','svan'],['🐕','dingo','dingo'],['🏆','champion','mästare']];
const PETS = [['🦘','🐶','🐱','🐰','🦊','🐻'], ['🦄','🐷'], ['🦉','🐺'], ['🦁','🐵'], ['🦈','🐙'], ['🐨','🐲']];
const HATS = ['', '🎩', '👑', '🧢', '🎓', '🎀', '⛑️'];
const VOICES = [['a', '👩 Mia'], ['b', '👨 Jack'], ['c', '👧 Zoe']];
const SOUNDS = [['pling', '🔔 Pling'], ['boing', '🦘 Boing'], ['prutt', '💨 Prutt'], ['kvack', '🦆 Kvack']];
const PALS = ['#2f9e6e', '#2b7fd9', '#d9547d', '#e2742b', '#7a56d6'];
const SILLY = ['Banan-tastiskt!', 'Du är smartare än en bläckfisk med glasögon!', 'Kängurun gör vågen!', 'Hjärnan växer så det knakar!', 'Ost i hatten, vad du kan!', 'Det där var grymmare än en krokodil i kalsonger!', 'Pruttfarligt bra!', 'Wombaten dansar disco!',
  'Du är snabbare än en gepard på rullskridskor!', 'Koalan ramlade nästan ur trädet av glädje!', 'Superduper-apelsin!', 'Papegojan vill ha din autograf!', 'Yippie kaj-känguru!', 'Hajen ger dig en high five. Försiktigt!', 'Blubb blubb, säger fisken. Det betyder bra jobbat!'];
const PET_SAYS = ['Kittla mig inte!', 'Hihi!', 'Jag är en potatis!', 'Oj, jag pruttade!', 'Wiiiii!', 'Har du sett min hatt?', 'Boing boing!', 'Jag kan flyga! Nästan.', 'G\'day mate!', 'Too easy!'];
const PARADE = ['🐔💨', '🦆🦆🦆', '🐷🛹', '🦘🦘', '🐒🍌', '🐘🎺', '🦖', '🐧🛷', '🚀🐮'];
const ASK = { intro: ['Nytt ord', 'Ny mening'], pickSv: 'Vad betyder ordet?', pickEn: 'Vilket ord är det på engelska?', spell: 'Skriv ordet på engelska', mean: 'Vad betyder meningen?', build: 'Bygg meningen på engelska', dict: 'Lyssna och bygg meningen' };
const CONF = [['is', 'are', 'am', 'be'], ['a', 'an', 'the'], ['he', 'she', 'it', 'they', 'we', 'you', 'I'], ['in', 'on', 'under', 'at', 'to'], ['do', 'does', "don't"], ['have', 'has', 'had'], ['my', 'your', 'his', 'her', 'our', 'their'],
  ['this', 'that'], ['was', 'were'], ['can', "can't", 'will'], ['me', 'him', 'us'], ['what', 'where', 'who', 'when', 'why', 'how'], ['big', 'small', 'little'], ['yes', 'no'], ['and', 'but', 'or']];

// ---- What is kept ----
const KEY = 'zoo1';
const DEF = { name: null, done: {}, tix: 0, stat: {}, run: null, hi: {}, set: { voice: 'a', pal: 0, pet: '🦘', hat: '', snd: 'pling', silly: true, sv: true } };
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && typeof s === 'object' ? Object.assign({}, DEF, s, { set: Object.assign({}, DEF.set, s.set) }) : structuredClone(DEF); } catch { return structuredClone(DEF); } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const stars = () => Object.values(S.done).reduce((a, b) => a + b, 0);
const open = li => li === 0 || S.done[li - 1] > 0;
const nextLevel = () => { let i = 0; while (S.done[i] && i < D.levels.length - 1) i++; return i; };
const worldsDone = () => [0, 1, 2, 3, 4].filter(w => S.done[w * 10 + 9]).length;
const item = st => D.levels[st.li][st.t === 'w' ? 'words' : 'sents'][st.i];
const statKey = st => st.t + st.li + '.' + st.i;

// The words taught up to each level, and the words that keep their capital letter.
const TAUGHT = new Map(), CAPS = new Set();
D.levels.forEach((l, li) => l.words.forEach(([en]) => en.split(' ').forEach(t => { if (!TAUGHT.has(t)) TAUGHT.set(t, li); if (/^[A-Z]/.test(t)) CAPS.add(t); })));
const toks = en => en.replace(/[.,!?]/g, '').split(' ').map(t => CAPS.has(t) ? t : t.toLowerCase());

// ---- Sound ----
const au = new Audio(); let ctx;
function say(v, text) {
  return new Promise(res => { au.pause(); au.onended = au.onerror = res; au.src = `audio/${v}/${clipId(text)}.mp3`; au.play().catch(res); });
}
const sayEn = t => say(S.set.voice, t), saySv = t => say('s', svSaid(t));
function tone(f1, f2, dur, type = 'sine', at = 0, vol = .18) {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur);
  } catch {}
}
const SFX = {
  pling: () => { tone(880, 880, .12); tone(1320, 1320, .25, 'sine', .1); },
  boing: () => { tone(180, 520, .18, 'sine'); tone(520, 240, .25, 'sine', .16); },
  prutt: () => { tone(110, 55, .45, 'sawtooth', 0, .22); tone(95, 70, .12, 'square', .1, .08); },
  kvack: () => { tone(520, 380, .12, 'square', 0, .1); tone(500, 360, .14, 'square', .16, .1); },
  bad: () => tone(200, 140, .3, 'triangle', 0, .2),
  pop: () => tone(600, 900, .07),
  fanfare: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .22, 'triangle', i * .15, .2)),
};

// ---- Silly things, which change nothing in the course ----
function parade() { const el = document.createElement('div'); el.className = 'fly'; el.textContent = pick(PARADE); el.style.top = 10 + rnd(60) + 'vh'; el.style.animationDuration = 2 + Math.random() * 2 + 's'; document.body.append(el); setTimeout(() => el.remove(), 4500); }
function rain(ems, n = 18) { for (let i = 0; i < n; i++) { const el = document.createElement('div'); el.className = 'drop'; el.textContent = pick(ems); el.style.left = rnd(95) + 'vw'; el.style.animationDuration = 1.5 + Math.random() * 2 + 's'; el.style.animationDelay = Math.random() * .8 + 's'; document.body.append(el); setTimeout(() => el.remove(), 4800); } }
function bubble(text, ms = 2200) { const p = $('#pet'); if (!p) return; (p.querySelector('#say') || {}).remove?.(); const b = document.createElement('span'); b.id = 'say'; b.textContent = text; p.append(b); setTimeout(() => b.remove(), ms); }
function petTrick() {
  const p = $('#pet'); if (!p) return;
  const k = pick(['hop', 'spin', 'flip', 'grow', 'prutt']);
  if (k === 'prutt') { SFX.prutt(); bubble('💨 ' + pick(PET_SAYS)); p.classList.add('hop'); setTimeout(() => p.classList.remove('hop'), 600); return; }
  SFX.boing(); p.classList.add(k); bubble(pick(PET_SAYS)); setTimeout(() => p.classList.remove(k), k === 'hop' ? 600 : 1500);
}
const petHtml = () => `<button id="pet" aria-label="Kompis">${S.set.pet}${S.set.hat ? `<span class="hat">${S.set.hat}</span>` : ''}</button>`;

// ---- Screens ----
let screen = '', stopGame = null, mw = 0;
function show(name, html, world) {
  if (stopGame) { stopGame(); stopGame = null; }
  screen = name; app.innerHTML = html;
  document.body.dataset.pal = S.set.pal; document.body.dataset.world = world ?? Math.floor(nextLevel() / 10);
}
const on = (sel, fn) => app.querySelectorAll(sel).forEach(el => el.onclick = ev => fn(el, ev));

function start() {
  if (S.name == null) {
    show('start', `<div class="center"><div class="pic">🦘🐨🐬</div><h1>Djuräventyret</h1><div class="card"><p>Vad heter du?</p><input type="text" id="nm" maxlength="20" autocomplete="off"><p><button class="btn big" id="go">Starta äventyret ➜</button></p></div></div>`);
    $('#go').onclick = () => { S.name = $('#nm').value.trim(); save(); SFX.fanfare(); map(); };
  } else map();
}

function map(w) {
  mw = w ?? Math.floor(nextLevel() / 10);
  const nx = nextLevel();
  show('map', `<div class="top"><h1>${S.set.pet} ${esc(S.name || 'Djuräventyret')}</h1><span class="chip">⭐ ${stars()}</span><button class="chip" id="bMini">🎮 Pausspel ${S.tix}</button><button class="chip" id="bAlbum">📒 Klistermärken</button><button class="chip" id="bSet">⚙️</button></div>
    <div class="worlds">${D.worlds.map((x, i) => `<button data-w="${i}" class="${i === mw ? 'on' : ''}" ${open(i * 10) ? '' : 'disabled'}><b>${open(i * 10) ? x.em : '🔒'}</b>${esc(x.name)}</button>`).join('')}</div>
    <div class="path">${D.levels.map((l, li) => l.w !== mw ? '' : `<button class="node ${S.done[li] ? 'done' : li === nx ? 'next' : open(li) ? '' : 'lock'}" data-li="${li}">
      ${li === nx ? `<span class="me">${S.set.pet}</span>` : ''}<span class="n">${open(li) ? li + 1 : '🔒'}</span><span class="t">${esc(l.title)}</span><span class="st">${S.done[li] ? '⭐'.repeat(S.done[li]) : S.run && S.run.li === li ? '▶️' : ''}</span></button>`).join('')}</div>`, mw);
  on('[data-w]', el => map(+el.dataset.w));
  on('[data-li]', el => { const li = +el.dataset.li; if (!open(li)) { SFX.bad(); return; } SFX.pop(); if (!S.run || S.run.li !== li) S.run = newRun(li); save(); preload(li); play(); });
  $('#bMini').onclick = mini; $('#bAlbum').onclick = album; $('#bSet').onclick = settings;
}

// ---- A level: the list of questions ----
function newRun(li) {
  const L = D.levels[li], q = [], st = (k, t, i, l = li) => ({ k, t, li: l, i });
  const part = (t, n, size, kinds) => { for (let a = 0; a < n; a += size) { const ids = [...Array(Math.min(size, n - a)).keys()].map(x => x + a); ids.forEach(i => q.push(st('intro', t, i))); kinds.forEach(k => shuffle(ids).forEach(i => q.push(st(k, t, i)))); } };
  part('w', L.words.length, 4, ['pickSv', 'pickEn', 'spell']);
  part('s', L.sents.length, 5, ['mean', 'build', 'dict']);
  // Repetition: what was missed before first, then anything from earlier levels; twice as much in the last level of a world.
  if (li > 0) {
    const old = [];
    for (let l = 0; l < li; l++) { D.levels[l].words.forEach((_, i) => old.push(st('spell', 'w', i, l))); D.levels[l].sents.forEach((_, i) => old.push(st('build', 's', i, l))); }
    const n = li % 10 === 9 ? 14 : 7, hard = shuffle(old.filter(o => S.stat[statKey(o)] > 0)).sort((a, b) => S.stat[statKey(b)] - S.stat[statKey(a)]).slice(0, Math.ceil(n / 2));
    const rest = shuffle(old.filter(o => !hard.includes(o) && o.li >= li - 12)).slice(0, n - hard.length);
    shuffle([...hard, ...rest]).forEach(o => q.push(Object.assign(o, { rev: 1 })));
  }
  return { li, q, p: 0, miss: 0, base: q.filter(x => x.k !== 'intro').length, ok: 0 };
}
function preload(li) { const L = D.levels[li]; [...L.words, ...L.sents].forEach(([en]) => fetch(`audio/${S.set.voice}/${clipId(en)}.mp3`).catch(() => {})); }

function play() {
  const R = S.run; if (!R) return map();
  if (R.p >= R.q.length) return finish();
  const st = R.q[R.p], [en, sv, em] = item(st), L = D.levels[R.li];
  show('play', `<div class="top"><button class="chip" id="bX">✕</button><div class="bar"><i style="width:${Math.round(R.p / R.q.length * 100)}%"></i></div><span class="chip">${R.li + 1}. ${esc(L.title)}</span></div>
    <div class="stage" id="stage"></div><div class="foot">${petHtml()}<div id="act"></div></div>`, L.w);
  $('#bX').onclick = () => { save(); map(L.w); };
  $('#pet').onclick = petTrick;
  const stage = $('#stage'), act = $('#act');
  const ask = `<div class="ask">${st.rev ? '🔁 Repetition · ' : ''}${st.k === 'intro' ? ASK.intro[st.t === 'w' ? 0 : 1] : ASK[st.k]}</div>`;
  const next = () => { R.p++; save(); play(); };
  // After an answer: the right answer is shown and said; a wrong one brings the question back twice.
  function answered(ok, said) {
    const key = statKey(st);
    if (ok) {
      R.ok++; SFX[S.set.snd](); $('#pet').classList.add('hop');
      if (st.rev && S.stat[key]) S.stat[key]--;
      const pr = Math.random() < .3 ? pick(D.praise) : null;
      stage.insertAdjacentHTML('beforeend', `<div class="fb ok">${pr ? `${esc(pr[0])} <small>${esc(pr[1])}</small>` : '✔ Rätt!'}<b>${esc(en)}</b><small>${esc(sv)}</small></div>`);
      if (S.set.silly) { if (Math.random() < .22) bubble(pick(SILLY), 2600); if (R.ok % 12 === 0) (Math.random() < .5 ? parade : () => rain(['🍌', '⭐', '🦘', '🐸']))(); }
      let gone = false; const go = () => { if (!gone) { gone = true; next(); } };
      act.innerHTML = `<button class="btn big" id="bN">Fortsätt ➜</button>`; $('#bN').onclick = go;
      (said ? (pr ? sayEn(pr[0]) : Promise.resolve()) : sayEn(en)).then(() => setTimeout(() => { if (screen === 'play' && S.run === R && R.q[R.p] === st) go(); }, 700));
    } else {
      R.miss++; S.stat[key] = (S.stat[key] || 0) + 1; SFX.bad();
      R.q.splice(Math.min(R.p + 4, R.q.length), 0, Object.assign({}, st, { r: 1 }));
      if (!st.r) R.q.push(Object.assign({}, st, { r: 1 }));
      stage.insertAdjacentHTML('beforeend', `<div class="fb bad">Inte riktigt. Rätt svar är:<b>${esc(en)}</b><small>= ${esc(sv)}</small></div>`);
      act.innerHTML = `<button class="btn big" id="bN">Jag förstår ➜</button>`; $('#bN').onclick = next; sayEn(en);
    }
    save();
  }
  const spk = (cls, fn) => { const b = document.createElement('button'); b.className = 'spk ' + cls; b.textContent = '🔊'; b.onclick = fn; return b; };

  if (st.k === 'intro') {
    stage.innerHTML = `${ask}${em ? `<div class="pic">${em}</div>` : ''}<div class="prompt ${st.t === 's' ? 'sm' : ''}">${esc(en)}</div><div class="sub">= ${esc(sv)}</div><div id="sp"></div>`;
    $('#sp').append(spk('', () => sayEn(en)), ' ', Object.assign(spk('', () => saySv(sv)), { textContent: 'Sv' }));
    act.innerHTML = `<button class="btn big" id="bN">Nästa ➜</button>`; $('#bN').onclick = next;
    sayEn(en);
    return;
  }
  // One answer among several: the buttons lock at the first press.
  function choose(options, right, cols) {
    stage.insertAdjacentHTML('beforeend', `<div class="opts ${cols ? '' : 'one'}">${options.map((o, i) => `<button class="opt" data-i="${i}">${esc(o)}</button>`).join('')}</div>`);
    on('.opt', el => { const good = options[+el.dataset.i] === right; app.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (options[+b.dataset.i] === right) b.classList.add('ok'); }); if (!good) el.classList.add('bad'); answered(good, st.k !== 'pickEn'); });
  }
  const others = (list, col, n, not) => shuffle(list.map(x => x[col]).filter((x, i, a) => x !== not && a.indexOf(x) === i)).slice(0, n);
  if (st.k === 'pickSv') {
    stage.innerHTML = `${ask}<div class="prompt">${esc(en)}</div>`; stage.append(spk('', () => sayEn(en)));
    choose(shuffle([sv, ...others(D.levels[st.li].words, 1, 3, sv)]), sv, true); sayEn(en);
  } else if (st.k === 'pickEn') {
    stage.innerHTML = `${ask}<div class="prompt">${esc(sv)}</div>`;
    choose(shuffle([en, ...others(D.levels[st.li].words, 0, 5, en)]), en, true); if (S.set.sv) saySv(sv);
  } else if (st.k === 'mean') {
    stage.innerHTML = `${ask}<div class="prompt sm">${esc(en)}</div>`; stage.append(spk('', () => sayEn(en)));
    choose(shuffle([sv, ...others(D.levels[st.li].sents, 1, 3, sv)]), sv, false); sayEn(en);
  } else {
    // Built from tiles: the letters of a word, or the words of a sentence, with tiles that do not belong.
    const words = st.t === 's' || en.includes(' '), answer = words ? toks(en) : [...en];
    let extra;
    if (words) {
      const low = answer.map(a => a.toLowerCase()), free = w => !low.includes(w.toLowerCase()) && TAUGHT.get(w) <= S.run.li;
      extra = shuffle(CONF.filter(g => g.some(w => low.includes(w.toLowerCase()))).map(g => pick(g.filter(free))).filter(Boolean)).slice(0, 2);
      const pool = shuffle([...TAUGHT.keys()].filter(w => free(w) && !extra.includes(w) && TAUGHT.get(w) >= st.li - 3));
      while (extra.length < 3 && pool.length) extra.push(pool.pop());
    } else extra = shuffle([...'abdeghiklmnoprstuwy'].filter(c => !en.toLowerCase().includes(c))).slice(0, 3);
    const bank = shuffle([...answer, ...extra]), put = [];
    stage.innerHTML = `${ask}${st.k === 'dict' ? '' : `<div class="prompt sm">${esc(sv)}</div>`}`;
    if (st.k === 'dict') stage.append(spk('huge', () => sayEn(en)));
    stage.insertAdjacentHTML('beforeend', `<div class="slots" id="slots"></div><div class="bank" id="bank">${bank.map((t, i) => `<button class="tile ${words ? '' : 'l'}" data-i="${i}">${esc(t)}</button>`).join('')}</div>`);
    act.innerHTML = `<button class="btn big" id="bC" disabled>Kolla ✔</button>`;
    let locked = false;
    const draw = () => { $('#slots').innerHTML = put.map((i, n) => `<button class="tile ${words ? '' : 'l'}" data-n="${n}">${esc(bank[i])}</button>`).join(''); $('#bC').disabled = !put.length;
      on('#slots .tile', el => { if (locked) return; const i = put.splice(+el.dataset.n, 1)[0]; $(`#bank [data-i="${i}"]`).classList.remove('used'); SFX.pop(); draw(); }); };
    on('#bank .tile', el => { if (locked || el.classList.contains('used')) return; el.classList.add('used'); put.push(+el.dataset.i); SFX.pop(); draw(); });
    $('#bC').onclick = () => { locked = true; const good = put.map(i => bank[i]).join(words ? ' ' : '').toLowerCase() === answer.join(words ? ' ' : '').toLowerCase(); $('#slots').classList.add(good ? 'ok' : 'bad'); $('#bank').style.visibility = 'hidden'; answered(good, false); };
    if (st.k === 'dict') sayEn(en); else if (S.set.sv) saySv(sv);
  }
}

function finish() {
  const R = S.run, li = R.li, rate = R.miss / R.base, n = rate <= .08 ? 3 : rate <= .2 ? 2 : 1, first = !S.done[li], worldEnd = li % 10 === 9, w = D.levels[li].w;
  S.done[li] = Math.max(S.done[li] || 0, n); if (first) S.tix += 3; S.run = null; save();
  const [em, en, sv] = STICKERS[li], last = li === D.levels.length - 1;
  show('result', `<div class="center"><div class="stars">${[1, 2, 3].map(i => `<span class="${i > n ? 'off' : ''}" style="animation-delay:${i * .25}s">⭐</span>`).join('')}</div>
    <h1>${n === 3 ? 'Helt perfekt!' : n === 2 ? 'Jättebra!' : 'Du klarade det!'} Delnivå ${li + 1} är klar.</h1>
    <div class="card">${first ? `<p><b>Nytt klistermärke!</b></p><p><span class="sticker"><b>${em}</b><small>${en}</small></span></p><p>${en} = ${sv} · 🎮 Du får 3 pausspel!</p>` : `<p>Du har redan klistermärket <b>${em}</b>.</p>`}
    ${first && worldEnd ? `<p>🏆 <b>Du har klarat hela ${esc(D.worlds[w].name)}!</b> Nya kompisar väntar under ⚙️: ${PETS[w + 1].join(' ')}</p>` : ''}</div>
    <p>${S.tix ? `<button class="btn big" id="bM">🎮 Pausspel (${S.tix})</button> ` : ''}<button class="btn big ghost" id="bK">${last && first ? 'Till diplomet 🏆' : 'Till kartan ➜'}</button></p></div>`, w);
  SFX.fanfare(); rain(['⭐', em, '🎉', '🎈'], 24); say(S.set.voice, pick(D.praise)[0]);
  if (first && worldEnd) setTimeout(parade, 900);
  if ($('#bM')) $('#bM').onclick = mini;
  $('#bK').onclick = () => last && first ? diploma() : map();
}

function diploma() {
  show('diploma', `<div class="center"><div class="card" style="border:.4em double var(--gold);max-width:44em"><div class="pic">🏆</div><h1>DIPLOM</h1><p style="font-size:1.4em"><b>${esc(S.name || 'Äventyraren')}</b></p>
    <p>har klarat hela Djuräventyret: 50 delnivåer, 400 ord och 500 meningar på engelska.</p><p style="font-size:1.3em">⭐ ${stars()} stjärnor · Welcome to Australia, mate! 🦘</p></div><button class="btn big" id="bK">Till kartan ➜</button></div>`, 4);
  SFX.fanfare(); rain(['🦘', '🐨', '⭐', '🎉', '🏆'], 40); sayEn('Welcome to Australia!');
  $('#bK').onclick = () => map(4);
}

function album() {
  show('album', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>📒 Mina klistermärken (${Object.keys(S.done).length}/50)</h1></div>
    <div class="scroll"><div class="grid">${STICKERS.map(([em, en, sv], i) => `<button class="sticker ${S.done[i] ? '' : 'no'}" data-i="${i}"><b>${em}</b><small>${S.done[i] ? `${en} · ${sv}` : i + 1}</small></button>`).join('')}</div></div>`);
  $('#bX').onclick = () => map();
  on('.sticker', el => { if (el.classList.contains('no')) return SFX.bad(); el.classList.remove('wig'); void el.offsetWidth; el.classList.add('wig'); pick([SFX.boing, SFX.kvack, SFX.pling, SFX.prutt])(); });
}

function settings() {
  const have = PETS.slice(0, worldsDone() + 1).flat(), row = (label, html) => `<b>${label}</b><div class="pick">${html}</div>`, onoff = (k) => [[true, 'På'], [false, 'Av']].map(([v, t]) => `<button data-k="${k}" data-v="${v}" class="${S.set[k] === v ? 'on' : ''}">${t}</button>`).join('');
  show('settings', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>⚙️ Gör spelet till ditt</h1></div><div class="scroll"><div class="set card">
    ${row('Röst', VOICES.map(([v, t]) => `<button data-k="voice" data-v="${v}" class="${S.set.voice === v ? 'on' : ''}">${t}</button>`).join(''))}
    ${row('Kompis', PETS.flat().map(p => `<button class="em ${S.set.pet === p ? 'on' : ''}" data-k="pet" data-v="${p}" ${have.includes(p) ? '' : 'disabled'}>${have.includes(p) ? p : '🔒'}</button>`).join(''))}
    ${row('Hatt', HATS.map(h => `<button class="em ${S.set.hat === h ? 'on' : ''}" data-k="hat" data-v="${h}">${h || '🚫'}</button>`).join(''))}
    ${row('Färg', PALS.map((c, i) => `<button data-k="pal" data-v="${i}" class="${S.set.pal === i ? 'on' : ''}" style="background:${c};color:#fff">${S.set.pal === i ? '✔' : '&nbsp;'}</button>`).join(''))}
    ${row('Ljud vid rätt svar', SOUNDS.map(([v, t]) => `<button data-k="snd" data-v="${v}" class="${S.set.snd === v ? 'on' : ''}">${t}</button>`).join(''))}
    ${row('Tokigheter', onoff('silly'))}${row('Läs upp svenskan', onoff('sv'))}
    ${row('Tokknappen', `<button id="bSilly">🤪 Tryck inte här!</button>`)}
    ${row('Vuxna', `<button id="bAd">🔐 Håll in i 3 sekunder</button>`)}</div><div id="adult"></div></div><div class="foot">${petHtml()}<span></span></div>`);
  $('#bX').onclick = () => map(); $('#pet').onclick = petTrick;
  on('[data-k]', el => { const k = el.dataset.k, v = el.dataset.v; S.set[k] = k === 'pal' ? +v : v === 'true' ? true : v === 'false' ? false : v; save();
    settings(); if (k === 'voice') sayEn('Hello!'); else if (k === 'snd') SFX[S.set.snd](); else SFX.pop(); });
  $('#bSilly').onclick = () => { pick([parade, () => rain(['💩', '🍌', '🦆', '🧦']), SFX.prutt, petTrick])(); if (Math.random() < .4) SFX.kvack(); };
  let t; const b = $('#bAd'); b.onpointerdown = () => { t = setTimeout(adult, 3000); }; b.onpointerup = b.onpointerleave = () => clearTimeout(t);
}

// For the grown-up: what has been done, and what has been hardest.
function adult() {
  const hard = Object.entries(S.stat).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => { const m = /^(\w)(\d+)\.(\d+)$/.exec(k), it = item({ t: m[1], li: +m[2], i: +m[3] }); return `<tr><td>${esc(it[0])}</td><td>${esc(it[1])}</td><td>${n}</td></tr>`; }).join('');
  $('#adult').innerHTML = `<div class="card" style="margin:1em auto;max-width:52em"><p><b>${Object.keys(S.done).length} av 50 delnivåer klara</b> · ${stars()} stjärnor av 150 · pausspel kvar: ${S.tix}</p>
    <table><tr><th>Svårast just nu</th><th></th><th>Fel</th></tr>${hard || '<tr><td colspan="3">Inga fel sparade.</td></tr>'}</table>
    <p class="pick" style="justify-content:center"><button id="aNext">Lås upp nästa delnivå</button><button id="aReset">Nollställ allt (tryck två gånger)</button></p></div>`;
  $('#aNext').onclick = () => { const n = nextLevel(); if (!S.done[n]) { S.done[n] = 1; if (S.run && S.run.li === n) S.run = null; save(); } adult(); };
  let armed = false; $('#aReset').onclick = ev => { if (!armed) { armed = true; ev.target.textContent = 'Säker? Tryck igen för att radera allt'; return; } const name = S.name; S = structuredClone(DEF); S.name = name; save(); map(); };
}

// ---- Break games: three goes for every finished level ----
const GAMES = [['whack', '🐹', 'Pricka djuren', 'Tryck på djuren som tittar upp. Akta bajset!'], ['rain', '🌧️', 'Djurregn', 'Fånga djuren som faller. Rör inte kaktusen!'], ['roo', '🦘', 'Känguruhopp', 'Tryck för att hoppa över kaktusarna.']];
function mini() {
  show('mini', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>🎮 Pausspel</h1><span class="chip">🎟️ ${S.tix} kvar</span></div>
    <div class="center">${S.tix ? '<p>Välj ett spel. Varje spel kostar en biljett.</p>' : '<p><b>Biljetterna är slut!</b> Klara en ny delnivå så får du tre till.</p>'}
    <div class="grid">${GAMES.map(([id, em, name, how]) => `<button class="card" data-g="${id}" style="width:15em" ${S.tix ? '' : 'disabled'}><div class="pic">${em}</div><b>${name}</b><br><small>${how}</small><br><small>🏅 Rekord: ${S.hi[id] || 0}</small></button>`).join('')}</div></div>`);
  $('#bX').onclick = () => map();
  on('[data-g]', el => { if (!S.tix) return; S.tix--; save(); game(el.dataset.g); });
}
function game(id) {
  const ANIMALS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐨', '🐸', '🐵', '🐷', '🐮', '🦁', '🐧'], g = GAMES.find(x => x[0] === id);
  show('game', `<div class="top"><h1>${g[1]} ${g[2]}</h1><span class="chip" id="gT">⏱️ 40</span><span class="chip" id="gS">⭐ 0</span></div><div id="field"></div>`);
  const field = $('#field'), timers = []; let score = 0, left = 40, over = false, raf = 0;
  const add = n => { score = Math.max(0, score + n); $('#gS').textContent = '⭐ ' + score; n > 0 ? SFX.pop() : SFX.prutt(); };
  const end = () => { if (over) return; over = true; stopGame = null; timers.forEach(clearInterval); cancelAnimationFrame(raf);
    const rec = score > (S.hi[id] || 0); if (rec) S.hi[id] = score; save(); SFX.fanfare(); if (rec) rain(['🏅', '⭐']);
    show('gameover', `<div class="center"><div class="pic">${g[1]}</div><h1>${score} poäng!${rec ? ' Nytt rekord! 🏅' : ''}</h1><p>${S.tix ? `<button class="btn big" id="bM">🎮 Spela igen (${S.tix} kvar)</button> ` : ''}<button class="btn big ghost" id="bK">Tillbaka till äventyret ➜</button></p></div>`);
    if ($('#bM')) $('#bM').onclick = mini; $('#bK').onclick = () => map(); };
  stopGame = () => { over = true; timers.forEach(clearInterval); cancelAnimationFrame(raf); };
  timers.push(setInterval(() => { left--; if ($('#gT')) $('#gT').textContent = '⏱️ ' + left; if (left <= 0) end(); }, 1000));
  if (id === 'whack') {
    field.innerHTML = `<div class="holes">${'<button class="hole"></button>'.repeat(12)}</div>`;
    const holes = [...field.querySelectorAll('.hole')];
    holes.forEach(h => h.onpointerdown = () => { if (!h.textContent) return; add(h.textContent === '💩' ? -2 : 1); h.textContent = ''; });
    timers.push(setInterval(() => { const h = pick(holes); if (h.textContent) return; h.innerHTML = `<span>${Math.random() < .15 ? '💩' : pick(ANIMALS)}</span>`; setTimeout(() => { h.textContent = ''; }, 700 + left * 12); }, 420));
  } else if (id === 'rain') {
    timers.push(setInterval(() => { const b = document.createElement('button'), bad = Math.random() < .18; b.className = 'fall'; b.textContent = bad ? '🌵' : pick(ANIMALS); b.style.left = rnd(88) + '%'; b.style.animationDuration = 2 + Math.random() * 2 + left / 25 + 's';
      b.onpointerdown = () => { add(bad ? -2 : 1); b.remove(); }; b.onanimationend = () => b.remove(); field.append(b); }, 480));
  } else {
    field.innerHTML = `<div id="ground"></div><div id="roo">🦘</div>`;
    const roo = $('#roo'); let y = 0, vy = 0, obs = [], t0 = performance.now(), spawn = 1, lives = 3; $('#gS').textContent = '⭐ 0 · ❤️❤️❤️';
    field.onpointerdown = () => { if (y === 0) { vy = 2.5; SFX.boing(); } };
    timers.push(setInterval(() => { const t = performance.now(), dt = Math.min(.05, (t - t0) / 1000); t0 = t;
      vy -= 6.5 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = 0; roo.style.bottom = 12 + y * 55 + '%';
      spawn -= dt; if (spawn <= 0) { const el = document.createElement('div'); el.className = 'cactus'; el.textContent = pick(['🌵', '🌵', '🪨', '🐊']); field.append(el); obs.push({ x: 105, el }); spawn = .9 + Math.random() * 1.3; }
      const speed = 55 + (40 - left) * 1.2;
      obs = obs.filter(o => { if (over) return false; o.x -= speed * dt; o.el.style.left = o.x + '%';
        if (!o.hit && o.x < 17 && o.x > 5 && y < .22) { o.hit = true; lives--; SFX.prutt(); o.el.textContent = '💥'; $('#gS').textContent = `⭐ ${score} · ${'❤️'.repeat(Math.max(0, lives))}`; if (lives <= 0) { end(); return false; } }
        if (o.x < -10) { o.el.remove(); if (!o.hit) { score++; SFX.pop(); $('#gS').textContent = `⭐ ${score} · ${'❤️'.repeat(lives)}`; } return false; } return true; });
    }, 16));
  }
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
window.addEventListener('contextmenu', e => e.preventDefault());
start();
})();
