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
// The number of the recording: raised when clips are recorded again under their old names, so that no cache keeps the old sound.
const REC = 2;
const svSaid = s => s.replace(/\s*\([^)]*\)/g, '').replace(/\//g, ', ').trim();

const STICKERS = [['🐣','chick','kyckling'],['🐶','dog','hund'],['🐴','horse','häst'],['🐑','sheep','får'],['🐰','rabbit','kanin'],['🦆','duck','anka'],['🐐','goat','get'],['🐮','cow','ko'],['🐭','mouse','mus'],['🐓','rooster','tupp'],
  ['🐻','bear','björn'],['🐿️','squirrel','ekorre'],['🦊','fox','räv'],['🦔','hedgehog','igelkott'],['🦉','owl','uggla'],['🐺','wolf','varg'],['🦌','deer','rådjur'],['🐸','frog','groda'],['🦇','bat','fladdermus'],['🐗','boar','vildsvin'],
  ['🦁','lion','lejon'],['🐘','elephant','elefant'],['🦒','giraffe','giraff'],['🦓','zebra','zebra'],['🐵','monkey','apa'],['🦏','rhino','noshörning'],['🦛','hippo','flodhäst'],['🐆','leopard','leopard'],['🦩','flamingo','flamingo'],['🐪','camel','kamel'],
  ['🐬','dolphin','delfin'],['🦈','shark','haj'],['🐙','octopus','bläckfisk'],['🐢','turtle','sköldpadda'],['🦀','crab','krabba'],['🐳','whale','val'],['🐠','fish','fisk'],['🦭','seal','säl'],['🐧','penguin','pingvin'],['🦞','lobster','hummer'],
  ['🦘','kangaroo','känguru'],['🐨','koala','koala'],['🐊','crocodile','krokodil'],['🐍','snake','orm'],['🦜','parrot','papegoja'],['🕷️','spider','spindel'],['🦎','lizard','ödla'],['🦢','swan','svan'],['🐕','dingo','dingo'],['🏆','champion','mästare']];
const PETS = [['🦘','🐶','🐱','🐰','🦊','🐻'], ['🦄','🐷'], ['🦉','🐺'], ['🦁','🐵'], ['🦈','🐙'], ['🐨','🐲']];
const HATS = ['', '👑', '🧢', '🎓', '🎀', '⛑️'];
const VOICES = [['a', '👩 Mia'], ['b', '👨 Jack'], ['c', '👧 Zoe']];
const SOUNDS = [['pling', '🔔 Pling'], ['boing', '🦘 Boing'], ['prutt', '💨 Prutt'], ['kvack', '🦆 Kvack']];
const PALS = ['#2f9e6e', '#2b7fd9', '#d9547d', '#e2742b', '#7a56d6'];
const SILLY = ['Banan-tastiskt!', 'Du är smartare än en bläckfisk med glasögon!', 'Kängurun gör vågen!', 'Hjärnan växer så det knakar!', 'Ost i hatten, vad du kan!', 'Det där var grymmare än en krokodil i kalsonger!', 'Pruttfarligt bra!', 'Wombaten dansar disco!',
  'Du är snabbare än en gepard på rullskridskor!', 'Koalan ramlade nästan ur trädet av glädje!', 'Superduper-apelsin!', 'Papegojan vill ha din autograf!', 'Yippie kaj-känguru!', 'Hajen ger dig en high five. Försiktigt!', 'Blubb blubb, säger fisken. Det betyder bra jobbat!'];
const PET_SAYS = ['Kittla mig inte!', 'Hihi!', 'Jag är en potatis!', 'Oj, jag pruttade!', 'Wiiiii!', 'Har du sett min hatt?', 'Boing boing!', 'Jag kan flyga! Nästan.', 'G\'day mate!', 'Too easy!'];
const PARADE = ['🐔💨', '🦆🦆🦆', '🐷🛹', '🦘🦘', '🐒🍌', '🐘🎺', '🦖', '🐧🛷', '🚀🐮'];
// What the shop sells: [picture, price, name, what it does in the break games (the key of its voice line), the same in words].
const SHOP = [['🪖', 60, 'Hjälmen', 'life', 'Ett extra liv i Känguruhopp'], ['🕶️', 80, 'Solglasögonen', 'slow', 'Djuren tittar upp längre i Pricka djuren'], ['🎧', 100, 'Hörlurarna', 'time', 'Tio sekunder längre i alla spel'],
  ['👒', 120, 'Fjäderhatten', 'feather', 'Djuren faller långsammare i Djurregn'], ['🍌', 150, 'Bananhatten', 'banana', 'Gyllene bananer värda fem poäng'], ['🌸', 150, 'Lyckoblomman', 'safe', 'Bajs och kaktusar ger inga minuspoäng'],
  ['🦋', 200, 'Fjärilsvingarna', 'jump2', 'Dubbelhopp i Känguruhopp'], ['🎩', 250, 'Trollkarlshatten', 'head', 'Börja varje spel med tio poäng'], ['🚀', 300, 'Raketen', 'double', 'Dubbla poäng i alla spel'], ['💩', 400, 'Bajshatten', 'poop', 'Bajs och kaktusar ger pluspoäng!'], ['🛸', 500, 'Ufot', 'ufo', 'Fångar allt på skärmen var tionde sekund']];
const BOSS = [['🦹', 'Morotstjuven'], ['🧌', 'Skogstrollet'], ['👹', 'Savannbusen'], ['🦑', 'Kapten Bläck'], ['🧙‍♂️', 'Ordtjuven']];
const CARRY = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸', '🐵', '🐷', '🐮', '🦁', '🐧', '🦉'];
const ASK = { hear: 'Vilket ord hör du?', pairs: 'Para ihop orden', intro: ['Nytt ord', 'Ny mening'], pickSv: 'Vad betyder ordet?', pickEn: 'Vilket ord är det på engelska?', spell: 'Skriv ordet på engelska', mean: 'Vad betyder meningen?', build: 'Bygg meningen på engelska', dict: 'Lyssna och bygg meningen' };
const CONF = [['is', 'are', 'am', 'be'], ['a', 'an', 'the'], ['he', 'she', 'it', 'they', 'we', 'you', 'I'], ['in', 'on', 'under', 'at', 'to'], ['do', 'does', "don't"], ['have', 'has', 'had'], ['my', 'your', 'his', 'her', 'our', 'their'],
  ['this', 'that'], ['was', 'were'], ['can', "can't", 'will'], ['me', 'him', 'us'], ['what', 'where', 'who', 'when', 'why', 'how'], ['big', 'small', 'little'], ['yes', 'no'], ['and', 'but', 'or']];

// ---- What is kept ----
const KEY = 'zoo1';
const DEF = { name: null, done: {}, tix: 0, coins: 0, own: [], told: {}, route: {}, gold: {}, stat: {}, run: null, hi: {}, set: { voice: 'a', pal: 0, pet: '🦘', hat: '', snd: 'pling', silly: true, sv: true } };
let S = (() => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && typeof s === 'object' ? Object.assign({}, DEF, s, { set: Object.assign({}, DEF.set, s.set) }) : structuredClone(DEF); } catch { return structuredClone(DEF); } })();
if (S.run && (!S.run.st || !S.run.v)) S.run = null;
S.own = [...S.own]; S.told = Object.assign({}, S.told); S.route = Object.assign({}, S.route); S.gold = Object.assign({}, S.gold);
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
  return new Promise(res => { au.pause(); au.onended = au.onerror = res; au.src = `audio/${v}/${clipId(text)}.mp3?r=${REC}`; au.play().catch(res); });
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

// The player's name is said by the Swedish voice. Its recording comes from the name packs of the main game
// (/audio/sv/v3/names/, the same voice): the whole pack of the first letter is fetched and the name is cut
// out here, so that the web host only learns the first letter. A name that is not in the packs is not said.
let nameClip = null, nameOf = null, nameLoading = Promise.resolve();
async function loadName() {
  const k = (S.name || '').trim().toLocaleLowerCase('sv'); if (nameOf === k) return; nameOf = k; nameClip = null;
  const flat = k.normalize('NFD').replace(/[\u0300-\u036f]/g, ''), file = /^[a-z]/.test(flat) ? flat[0] : '0';
  try { const index = await (await fetch(`../audio/sv/v3/names/${file}.json`)).json(), hit = index[k] || index[flat]; if (!hit) return;
    const bytes = await (await fetch(`../audio/sv/v3/names/${file}.bin`)).arrayBuffer(); if (nameOf === k) nameClip = bytes.slice(hit[0], hit[0] + hit[1]); } catch {}
}
// "Bra jobbat," and the name, joined into one sound. Without a recorded name, nothing is said and false comes back.
let joinedUrl = null;
async function sayNamed(key, text) {
  if (!S.set.sv || !nameClip) return false;
  text = text || pick(D.named[key]);
  try { const r = await fetch(`audio/s/${clipId(text)}.mp3?r=${REC}`); if (!r.ok) return false;
    if (joinedUrl) URL.revokeObjectURL(joinedUrl); joinedUrl = URL.createObjectURL(new Blob([await r.arrayBuffer(), nameClip], { type: 'audio/mpeg' }));
    await new Promise(res => { au.pause(); au.onended = au.onerror = res; au.src = joinedUrl; au.play().catch(res); }); return true; } catch { return false; }
}
const withName = text => `${text} ${S.name}!`;
async function nameThen(v, text) {
  if (!nameClip) return say(v, text);
  try { const r = await fetch(`audio/${v}/${clipId(text)}.mp3?r=${REC}`); if (!r.ok) return say(v, text);
    if (joinedUrl) URL.revokeObjectURL(joinedUrl); joinedUrl = URL.createObjectURL(new Blob([nameClip, await r.arrayBuffer()], { type: 'audio/mpeg' }));
    await new Promise(res => { au.pause(); au.onended = au.onerror = res; au.src = joinedUrl; au.play().catch(res); }); } catch { return say(v, text); }
}
const hasName = () => !!(nameClip && S.set.sv);

// Things said one after the other; a new chain, or a new screen, ends the one before.
let chainId = 0;
const chain = (...fns) => { const id = ++chainId; return (async () => { for (const f of fns) { if (id !== chainId) return false; await f(); } return id === chainId; })(); };
const tell = key => S.set.sv ? say('s', pick(D.ui[key])) : Promise.resolve();
// What a word or sentence means, said in Swedish: "betyder ledsen", or "Det betyder:" and the sentence.
const means = (t, sv) => () => !S.set.sv ? Promise.resolve() : t === 'w' ? say('s', `betyder ${svSaid(sv)}.`) : say('s', pick(D.ui.means)).then(() => say('s', sv));

// ---- The scenery of each world: things to look at and to poke ----
const GOALS = ['🥕', '🍯', '🍌', '🐟', '🪃'];
// [picture, what it turns into when poked, left %, bottom vh, size vmin, movement]
const SCENES = {
  farm: { sky: ['#aee3ff', '#e9f7d0'], ground: '#8fce6a', props: [['☀️', '😎', 88, 78, 13, 'turn'], ['☁️', '🌧️', 12, 80, 13, 'drift'], ['☁️', '🌈', 55, 86, 9, 'drift2'], ['🏡', '🐔', 3, 11, 15, 'sway'], ['🚜', '💨', 22, 10, 10, ''], ['🌻', '🐝', 70, 10, 8, 'sway'], ['🐄', '🥛', 82, 10, 10, ''], ['🌾', '🐭', 93, 10, 8, 'sway']] },
  forest: { sky: ['#bfe8d8', '#e3f4c4'], ground: '#5fae6a', props: [['☁️', '🌧️', 20, 82, 12, 'drift'], ['🌤️', '🌈', 86, 80, 12, ''], ['🌲', '🐿️', 2, 10, 17, 'sway'], ['🌳', '🦉', 13, 10, 14, 'sway'], ['🍄', '🧚', 27, 10, 6, ''], ['🪵', '🐛', 68, 10, 8, ''], ['🎋', '🐼', 80, 10, 16, 'sway'], ['🌳', '🐒', 91, 10, 13, 'sway']] },
  savanna: { sky: ['#ffd58a', '#ffe9bd'], ground: '#d9b25f', props: [['☀️', '🥵', 80, 76, 16, 'turn'], ['☁️', '🦅', 25, 84, 9, 'drift2'], ['🌴', '🐒', 3, 10, 16, 'sway'], ['🪨', '🦎', 20, 10, 7, ''], ['⛰️', '🌋', 62, 11, 15, ''], ['🌾', '🦁', 78, 10, 9, 'sway'], ['🌴', '🦒', 90, 10, 14, 'sway']] },
  sea: { sky: ['#9fdcff', '#d6f3ff'], ground: '#2f8fd1', props: [['☀️', '😎', 10, 78, 12, 'turn'], ['☁️', '🌧️', 60, 84, 12, 'drift'], ['⛵', '🏴‍☠️', 8, 10, 12, 'bob'], ['🏝️', '🦜', 84, 10, 15, ''], ['🐟', '🐡', 30, 6, 7, 'bob'], ['🦀', '🦞', 70, 10, 7, ''], ['🐚', '🫧', 58, 9, 6, '']] },
  outback: { sky: ['#ffcf9f', '#ffe9c8'], ground: '#c8743a', props: [['☀️', '🥵', 86, 76, 15, 'turn'], ['☁️', '🦅', 30, 86, 9, 'drift2'], ['🌵', '🦎', 3, 10, 13, ''], ['🪃', '🌀', 20, 60, 8, 'turn'], ['🪨', '🐍', 64, 10, 12, ''], ['🌳', '🐨', 80, 10, 16, 'sway'], ['🌵', '🦘', 93, 10, 10, '']] },
  city: { sky: ['#b9dcff', '#ffe8d2'], ground: '#b9b3a8', props: [['🌤️', '🌈', 86, 80, 12, ''], ['☁️', '🎈', 15, 84, 11, 'drift'], ['🏰', '👑', 2, 10, 16, ''], ['🏠', '🐈', 16, 10, 10, ''], ['🚲', '🛴', 28, 10, 7, ''], ['⛲', '🐦', 66, 10, 9, ''], ['🏛️', '🕊️', 78, 10, 14, ''], ['🚌', '💨', 91, 10, 9, '']] },
  desert: { sky: ['#ffe0a3', '#fff1cf'], ground: '#e8c27a', props: [['☀️', '🥵', 84, 76, 16, 'turn'], ['☁️', '🦅', 30, 86, 8, 'drift2'], ['🌴', '🥥', 3, 10, 15, 'sway'], ['🐪', '💦', 18, 10, 10, ''], ['⛺', '🔥', 66, 10, 10, ''], ['🏜️', '🦂', 80, 10, 14, ''], ['🌵', '🦎', 93, 10, 10, '']] },
  mountain: { sky: ['#b7dcff', '#e8f3ff'], ground: '#9fbf8f', props: [['🌤️', '🌈', 12, 80, 12, ''], ['☁️', '🌨️', 55, 84, 12, 'drift'], ['🏔️', '⛷️', 0, 10, 22, ''], ['🌲', '🦅', 20, 10, 11, 'sway'], ['🐐', '🧀', 30, 10, 7, ''], ['⛰️', '🌋', 66, 10, 17, ''], ['🏕️', '🔥', 82, 10, 10, ''], ['🌲', '🐻', 93, 10, 12, 'sway']] },
  jungle: { sky: ['#bfeacc', '#e6f7c8'], ground: '#3f9a5a', props: [['🌤️', '🌈', 86, 80, 12, ''], ['☁️', '🌧️', 25, 84, 11, 'drift'], ['🌴', '🐒', 2, 10, 17, 'sway'], ['🌿', '🐍', 16, 10, 9, 'sway'], ['🦜', '🪶', 26, 30, 7, 'bob'], ['🪷', '🐸', 66, 10, 7, ''], ['🌴', '🦧', 80, 10, 16, 'sway'], ['🎋', '🐅', 92, 10, 13, 'sway']] },
  map: { sky: ['#8fd3f4', '#8fd3f4'], ground: '#8fd3f4', props: [] },
};
let sceneW = '';
function scene(w) {
  const el = $('#scene'); w = w || sceneW || 'farm'; if (!el || sceneW === w) return; sceneW = w; const sc = SCENES[w];
  el.style.background = `linear-gradient(${sc.sky[0]}, ${sc.sky[1]} 87%, ${sc.ground} 87%)`;
  el.innerHTML = sc.props.map(([em, alt, x, y, size, mv], i) => `<button class="prop ${mv}" data-i="${i}" style="left:${x}%;bottom:${y}vh;font-size:${size}vmin">${em}</button>`).join('');
  el.querySelectorAll('.prop').forEach(b => b.onclick = () => { if (!S.set.silly || b.dataset.on) return; const [em, alt] = sc.props[+b.dataset.i];
    b.dataset.on = 1; b.textContent = alt; b.classList.add('poke'); pick([SFX.boing, SFX.kvack, SFX.pop, SFX.prutt])(); setTimeout(() => { b.textContent = em; b.classList.remove('poke'); delete b.dataset.on; }, 1800); });
}
// An animal that runs along the ground.
function critter() { const el = document.createElement('div'); el.className = 'fly low'; el.textContent = pick(['🐓', '🐇', '🦔', '🐢', '🦆', '🐕', '🦘', '🐖💨', '🐈']); el.style.animationDuration = 3 + Math.random() * 3 + 's'; document.body.append(el); setTimeout(() => el.remove(), 6500); }

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
let screen = '', stopGame = null, touched = false, mapTold = false;
function show(name, html, sc) {
  if (stopGame) { stopGame(); stopGame = null; }
  chainId++; au.pause(); screen = name; app.innerHTML = html;
  document.body.dataset.pal = S.set.pal; scene(sc);
}
const on = (sel, fn) => app.querySelectorAll(sel).forEach(el => el.onclick = ev => fn(el, ev));

function start() {
  if (S.name == null) {
    show('start', `<div class="center"><div class="pic">⛪ ➜ 🦘</div><h1>Djuräventyret</h1><p><b>Sagan om Polly och Ordtjuven</b> 🦜🧙‍♂️</p><div class="card"><p>Vad heter du? Skriv ditt förnamn, så säger rösten det.</p><input type="text" id="nm" maxlength="20" autocomplete="off"><p><button class="btn big" id="go">${Object.keys(S.done).length || S.run ? 'Fortsätt äventyret ➜' : 'Starta äventyret ➜'}</button></p></div></div>`);
    $('#go').onclick = () => { S.name = $('#nm').value.trim(); save(); SFX.fanfare(); nameLoading = loadName(); mapTold = false; map(); };
  } else map();
}

// ---- The map: the journey from Lund to Gold Coast ----
const J = window.AA_JOURNEY, LAND = window.AA_LAND;
const routeOf = r => r === 0 ? 'A' : S.route[r];
const stopsOf = (r, x) => J.parts[r][x || routeOf(r) || 'A'].stops;
const stopOf = li => stopsOf(Math.floor(li / 10))[li % 10];
const fromOf = li => li % 10 ? stopOf(li - 1) : li ? J.parts[li / 10 - 1].A.stops[9] : J.start;
let mv = 0;
function map(view) {
  const nx = nextLevel(), allDone = !!S.done[D.levels.length - 1];
  mv = view ?? Math.floor(nx / 10);
  show('map', `<div class="top"><h1>${S.set.pet} ${esc(S.name || 'Djuräventyret')}</h1><span class="chip">⭐ ${stars()}</span><button class="chip" id="bShop">🛍️ Affär · 🪙 ${S.coins}</button><span class="chip">🦜 ${Object.keys(S.done).reduce((n, li) => n + D.levels[li].words.length, 0)} ord</span><button class="chip" id="bMini">🎮 Pausspel ${S.tix}</button><button class="chip" id="bAlbum">📒 Klistermärken</button><button class="chip" id="bSet">⚙️</button></div>
    <div class="worlds">${D.worlds.map((x, i) => `<button data-w="${i}" class="${i === mv ? 'on' : ''}"><b>${open(i * 10) ? x.em : '🔒'}</b>${esc(x.name)}</button>`).join('')}<button data-w="all" class="${mv === 'all' ? 'on' : ''}"><b>🌍</b>Hela resan</button></div>
    <div class="mapbox" id="mapbox"></div>`, 'map');
  on('[data-w]', el => { SFX.pop(); map(el.dataset.w === 'all' ? 'all' : +el.dataset.w); });
  // The view: the stops of one part, or of the whole journey, with the land drawn under them.
  const box = $('#mapbox'), W = box.clientWidth || 1000, H = box.clientHeight || 600, parts = mv === 'all' ? [0, 1, 2, 3, 4] : [mv];
  const routes = r => routeOf(r) ? [routeOf(r)] : ['A', 'B'];
  const pts = parts.flatMap(r => [fromOf(r * 10), ...routes(r).flatMap(x => stopsOf(r, x))]), lat = pts.map(p => p.y);
  const kx = Math.cos((Math.min(...lat) + Math.max(...lat)) / 2 * Math.PI / 180), P = p => [p.x * kx, -p.y];
  const xs = pts.map(p => P(p)[0]), ys = pts.map(p => P(p)[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const px = (x1 - x0) * .1 + 1.2, py = (y1 - y0) * .14 + 1.2; x0 -= px; x1 += px; y0 -= py; y1 += py * 1.9;
  let vw = x1 - x0, vh = y1 - y0;
  if (vw / vh < W / H) { const n = vh * W / H; x0 -= (n - vw) / 2; vw = n; } else { const n = vw * H / W; y0 -= (n - vh) / 2; vh = n; }
  const f = p => p[0].toFixed(2) + ' ' + p[1].toFixed(2), m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const path = poly => { const q = poly.map(([x, y]) => P({ x, y })); return 'M' + f(m(q[q.length - 1], q[0])) + q.map((p, i) => 'Q' + f(p) + ' ' + f(m(p, q[(i + 1) % q.length]))).join('') + 'Z'; };
  const u = vh / 100;
  const line = (r, x) => { const mine = routeOf(r) === x; return `<polyline points="${[fromOf(r * 10), ...stopsOf(r, x)].map(p => f(P(p)).replace(' ', ',')).join(' ')}" fill="none" stroke="${mine ? '#7a4b1e' : x === 'A' ? '#e2742b' : '#7a56d6'}" stroke-width="${u * .8}" stroke-dasharray="${u * .1} ${u * 1.9}" stroke-linecap="round"/>`; };
  const at = p => `left:${((P(p)[0] - x0) / vw * 100).toFixed(2)}%;top:${((P(p)[1] - y0) / vh * 100).toFixed(2)}%`;
  const inside = p => { const [x, y] = P(p); return x > x0 && x < x0 + vw && y > y0 && y < y0 + vh; };
  let html = `<svg viewBox="${x0.toFixed(2)} ${y0.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}" preserveAspectRatio="none"><path d="${LAND.land.map(path).join('')}" fill="#bfe6a0" stroke="#74b86c" stroke-width="${u * .6}" stroke-linejoin="round"/><path d="${LAND.sea.map(path).join('')}" fill="#8fd3f4"/>${[0, 1, 2, 3, 4].flatMap(r => routes(r).map(x => line(r, x))).join('')}</svg>`;
  html += LAND.deco.filter(([, x, y]) => inside({ x, y })).map(([em, x, y]) => `<span class="deco" style="${at({ x, y })}">${em}</span>`).join('');
  const mark = (li, s) => S.done[li] ? (S.gold[li] ? '👑' : '⭐'.repeat(S.done[li])) : open(li) ? s.e : '🔒';
  if (mv === 'all') {
    html += [0, 1, 2, 3, 4].flatMap(r => routes(r).flatMap(x => stopsOf(r, x).map((s, i) => `<i class="dot ${routeOf(r) && S.done[r * 10 + i] ? 'done' : ''}" style="${at(s)}"></i>`))).join('');
    html += `<span class="stop tag" style="${at(J.start)}"><b>${J.start.e}</b><small>${J.start.n}</small></span><span class="stop tag" style="${at(stopsOf(4, 'A')[9])}"><b>🏁</b><small>Gold Coast</small></span>`;
  } else {
    const a = fromOf(mv * 10);
    html += `<span class="stop tag" style="${at(a)}"><b>${a.e}</b><small>${esc(a.n)}</small></span>`;
    if (routeOf(mv)) html += stopsOf(mv).map((s, i) => { const li = mv * 10 + i; return `<button class="stop ${S.done[li] ? 'done' : li === nx ? 'next' : open(li) ? '' : 'lock'}" data-li="${li}" style="${at(s)}"><b>${mark(li, s)}</b><small>${esc(s.n)}</small></button>`; }).join('');
    else html += ['A', 'B'].flatMap(x => stopsOf(mv, x).slice(0, 9).map(s => `<span class="stop ghost ${x}" style="${at(s)}"><b>${s.e}</b><small>${esc(s.n)}</small></span>`)).join('') + (s => `<span class="stop tag" style="${at(s)}"><b>${s.e}</b><small>${esc(s.n)}</small></span>`)(stopsOf(mv, 'A')[9]);
  }
  // Where the traveller is: between two stops, a quarter of the way further for every stage done.
  if (!allDone) { const a = fromOf(nx), b = stopOf(nx), t = (S.run && S.run.li === nx ? S.run.s : 0) / 4, here = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; if (inside(here)) html += `<span class="me2" style="${at(here)}">${S.set.pet}</span>`; }
  const pick1 = !allDone && !routeOf(Math.floor(nx / 10));
  html += `<button class="btn big cta" id="bGo">${allDone ? '🏆 Visa diplomet' : pick1 ? '🔀 Välj väg' : `Fortsätt resan mot ${esc(stopOf(nx).n)} ➜`}</button><span class="chip left">${allDone ? 'Framme i Gold Coast! 🏁' : `🏁 ${stopOf(nx).st ? leftKm(nx) : ''} km kvar`}</span>`;
  box.innerHTML = html;
  on('[data-li]', el => { const li = +el.dataset.li; if (!open(li)) { SFX.bad(); return; } go(li); });
  $('#bGo').onclick = () => allDone ? diploma() : go(nx);
  $('#bMini').onclick = mini; $('#bAlbum').onclick = album; $('#bSet').onclick = settings; $('#bShop').onclick = () => shop(true);
  if (touched && !mapTold) { mapTold = true; chain(() => Promise.race([nameLoading, new Promise(r => setTimeout(r, 1500))]).then(() => sayNamed('hi')), () => tell('map')); }
}
// How far it is left, as the voice last said it.
const leftKm = li => { const s = stopOf(li), n = S.run && S.run.li === li ? S.run.s : 0, text = n ? s.st[n - 1] : li ? fromOf(li).ar || '' : ''; const m = /(\d[\d ]*) kilometer/.exec(text); return m ? m[1] : J.total; };
function go(li) { SFX.pop(); const r = Math.floor(li / 10); if (!routeOf(r)) return fork(r, li); if (!S.run || S.run.li !== li) S.run = newRun(li); save(); preload(li); if (S.run.s === 0 && S.run.p === 0) depart(li); else play(); }
// Two ways to the same place: the lessons are the same, the places are not.
function fork(r, li) {
  const hub = fromOf(li);
  show('fork', `<div class="center"><h1>🔀 ${S.name ? esc(S.name) + ', välj' : 'Välj'} väg från ${esc(hub.n)}!</h1><div class="card" style="max-width:40em">${esc(D.ui['world' + r][0])}</div>
    <div class="grid">${['A', 'B'].map(x => { const p = J.parts[r][x]; return `<button class="card forkc ${x}" data-x="${x}"><div class="pic">${p.em}</div><b>${esc(p.name)}</b><br><small>${esc(p.desc)}</small><div class="few">${p.stops.slice(0, 9).map(s => s.e).join(' ')}</div></button>`; }).join('')}</div></div>`, hub.sc);
  chain(() => tell('world' + r), () => sayNamed('choose').then(ok => ok || tell('fork')));
  on('[data-x]', el => { S.route[r] = el.dataset.x; S.told[r] = 1; save(); SFX.fanfare(); rain([J.parts[r][el.dataset.x].em, '⭐'], 14); go(li); });
}
// Before a level: where the way goes next.
function depart(li) {
  const a = fromOf(li), b = stopOf(li), r = Math.floor(li / 10), intro = li === 0 && !S.told[0], boss = li % 10 === 9;
  if (intro) { S.told[0] = 1; save(); }
  show('story', `<div class="center"><div class="pic dance"><span>${a.e}</span><span>${S.set.pet}</span><span>➜</span><span>${b.e}</span></div><h1>${esc(a.n)} ➜ ${esc(b.n)}</h1>
    ${intro ? `<div class="card" style="max-width:40em">📖 ${esc(D.ui.world0[0])}</div>` : ''}<div class="card" style="max-width:40em;font-size:1.1em"><b>📖 Kapitel ${li + 1}${S.name ? ` · Lyssna nu, ${esc(S.name)}!` : ''}</b><br>${esc(D.saga[li])}</div><div class="card" style="max-width:40em">${esc(b.go)}</div>
    ${boss ? `<p style="font-size:1.3em">${BOSS[r][0]} <b>${BOSS[r][1]}</b> väntar på sista etappen!</p>` : ''}<button class="btn big" id="bN">Starta ➜</button></div>`, a.sc);
  SFX.fanfare(); chain(...(intro ? [() => tell('world0')] : [() => sayNamed('listen')]), () => S.set.sv ? say('s', D.saga[li]) : 0, () => sayNamed('go'), () => S.set.sv ? say('s', b.go) : 0); $('#bN').onclick = play;
}

// ---- A level: four short stages of questions ----
function newRun(li) {
  const L = D.levels[li], st = (k, t, i, l = li) => ({ k, t, li: l, i });
  const two = (t, ids, check) => { const q = []; for (let a = 0; a < ids.length; a += 2) { const pair = ids.slice(a, a + 2); pair.forEach(i => q.push(st('intro', t, i))); shuffle(pair).forEach(i => q.push(st(check, t, i))); } return q; };
  const rounds = (t, ids, kinds) => kinds.flatMap(k => shuffle(ids).map(i => st(k, t, i)));
  const cut = (n, size) => { const out = []; for (let a = 0; a < n; a += size) out.push([...Array(Math.min(size, n - a)).keys()].map(x => x + a)); return out; };
  const stages = [...cut(L.words.length, 4).map(ids => [...two('w', ids, 'pickSv'), ...rounds('w', ids, ['hear', 'pickEn', 'spell']), Object.assign(st('pairs', 'w', ids[0]), { ids })]),
    ...cut(L.sents.length, 5).map(ids => [...two('s', ids, 'mean'), ...rounds('s', ids, ['build', 'dict'])])];
  // Repetition: what was missed before first, then anything from earlier levels; twice as much in the last level of a world.
  if (li > 0) {
    const old = [];
    for (let l = 0; l < li; l++) { D.levels[l].words.forEach((_, i) => old.push(st('spell', 'w', i, l))); D.levels[l].sents.forEach((_, i) => old.push(st('build', 's', i, l))); }
    const n = li % 10 === 9 ? 14 : 7, hard = shuffle(old.filter(o => S.stat[statKey(o)] > 0)).sort((a, b) => S.stat[statKey(b)] - S.stat[statKey(a)]).slice(0, Math.ceil(n / 2));
    const rest = shuffle(old.filter(o => !hard.includes(o) && o.li >= li - 12)).slice(0, n - hard.length);
    const rev = shuffle([...hard, ...rest]).map(o => Object.assign(o, { rev: 1 })), half = Math.floor(rev.length * .4);
    stages[1].push(...rev.slice(0, half)); stages[stages.length - 1].push(...rev.slice(half));
  }
  return { v: 2, li, st: stages, s: 0, p: 0, miss: 0, base: stages.flat().filter(x => x.k !== 'intro').length, ok: 0, row: 0, first: !S.done[li] };
}
function preload(li) { const L = D.levels[li]; [...L.words, ...L.sents].forEach(([en]) => fetch(`audio/${S.set.voice}/${clipId(en)}.mp3?r=${REC}`).catch(() => {})); }

let trailAt = 0;
function play() {
  const R = S.run; if (!R) return map();
  const Q = R.st[R.s];
  if (R.p >= Q.length) return R.s < R.st.length - 1 ? stageDone() : finish();
  const st = Q[R.p], [en, sv, em] = item(st), L = D.levels[R.li], at = R.p / Q.length * 92, boss = R.li % 10 === 9 && R.s === R.st.length - 1, dest = stopOf(R.li);
  if (R.p === 0) trailAt = 0;
  show('play', `<div class="top"><button class="chip" id="bX">✕</button><div class="trail"><span class="goal ${boss ? 'boss' : ''}" style="${boss ? `font-size:${(3.4 - R.p / Q.length * 2).toFixed(2)}em` : ''}">${boss ? BOSS[L.w][0] : dest.e}</span><span class="rn" id="rn" style="left:${trailAt}%"><span>${S.set.pet}</span></span></div><span class="chip" id="cn">🪙 ${S.coins}</span><span class="chip">${boss ? `Boss: ${BOSS[L.w][1]}` : `➜ ${esc(dest.n)}`} · ${R.s + 1}/${R.st.length}</span></div>
    <div class="stage" id="stage"></div><div class="foot">${petHtml()}<div id="act"></div></div>`, dest.sc);
  setTimeout(() => { const r = $('#rn'); if (r && at !== trailAt) { r.style.left = at + '%'; r.classList.add('hop'); } trailAt = at; }, 40);
  $('#bX').onclick = () => { save(); map(); if (hasName() && Math.random() < .5) chain(() => sayNamed('bye')); };
  $('#pet').onclick = petTrick;
  const stage = $('#stage'), act = $('#act');
  const ask = `<div class="ask">${st.rev ? '🔁 Repetition · ' : ''}${st.k === 'intro' ? ASK.intro[st.t === 'w' ? 0 : 1] : ASK[st.k]}</div>`;
  const next = () => { R.p++; save(); play(); };
  const alive = () => screen === 'play' && S.run === R && Q[R.p] === st;
  // The voice says what to do before every question, in one of several wordings.
  const kind = st.k === 'intro' ? (st.t === 'w' ? 'introW' : 'introS') : st.k;
  const lead = () => (boss && R.p === 0 && !R.bt ? (R.bt = 1, sayNamed('watch').then(() => tell('boss'))) : Promise.resolve()).then(() => !S.set.sv ? 0 : Math.random() < .35 ? nameThen('s', pick(D.inst[kind])) : say('s', pick(D.inst[kind])));
  const coin = n => { S.coins += n; const c = $('#cn'); c.textContent = '🪙 ' + S.coins; c.insertAdjacentHTML('beforeend', `<span class="plus">+${n}</span>`); };
  const svWord = () => S.set.sv ? say('s', `Ordet är ${svSaid(sv)}.`) : Promise.resolve();
  // After an answer: the right answer is shown and said; a wrong one brings the question back twice in this stage.
  function answered(ok, said) {
    const key = statKey(st);
    if (ok) {
      R.ok++; R.row = (R.row || 0) + 1; SFX[S.set.snd](); $('#pet').classList.add('hop'); $('#rn').classList.add(pick(['loop', 'hop', 'loop'])); coin(R.row >= 5 ? 2 : 1); if (boss) { $('.goal').classList.add('hit'); SFX.boing(); }
      if (st.rev && S.stat[key]) S.stat[key]--;
      // Praise after every right answer: for some numbers in a row, else in English or now and then in Swedish.
      const row = D.streak[R.row], svp = !row && Math.random() < .3 ? pick(D.praiseSv) : null;
      let pr = row || (svp ? [svp, ''] : pick(D.praise));
      const named = !row && hasName() && Math.random() < .45 ? pick(D.named.good) : null; if (named) pr = [withName(named), ''];
      const cheer = () => named ? sayNamed('good', named) : svp ? say('s', svp) : sayEn(pr[0]);
      if (row && S.set.silly) rain(['⭐', '🔥', '🎉'], 12);
      stage.insertAdjacentHTML('beforeend', `<div class="fb ok"><span class="ic">✔</span><span><span class="h">${row ? '🔥 ' : ''}${esc(pr[0])}${pr[1] ? ` <i>· ${esc(pr[1])}</i>` : ''}</span><b>${esc(en)}</b><small>= ${esc(sv)}</small></span></div>`); stage.lastElementChild.scrollIntoView({ block: 'nearest' });
      if (S.set.silly) { if (Math.random() < .25) bubble(pick(SILLY), 2600); if (R.ok % 8 === 0) pick([parade, () => rain(['🍌', '⭐', '🦘', '🐸']), critter, petTrick])(); }
      let gone = false; const go = () => { if (!gone) { gone = true; next(); } };
      act.innerHTML = `<button class="btn big" id="bN">Fortsätt ➜</button>`; $('#bN').onclick = go;
      chain(...(said ? [] : [() => sayEn(en)]), cheer).then(done => done && setTimeout(() => { if (alive()) go(); }, 600));
    } else {
      R.miss++; R.sm = (R.sm || 0) + 1; R.row = 0; S.stat[key] = (S.stat[key] || 0) + 1; SFX.bad(); if (S.set.silly) bubble(pick(['Hoppsan!', 'Oj då!', 'Det fixar du nästa gång!', 'Ingen fara!']));
      Q.splice(Math.min(R.p + 4, Q.length), 0, Object.assign({}, st, { r: 1 }));
      if (!st.r) Q.push(Object.assign({}, st, { r: 1 }));
      stage.insertAdjacentHTML('beforeend', `<div class="fb bad"><span class="ic">✖</span><span><span class="h">${hasName() ? `Nästan, ${esc(S.name)}! ` : 'Inte riktigt. '}Rätt svar är:</span><b>${esc(en)}</b><small>= ${esc(sv)}</small></span></div>`); stage.lastElementChild.scrollIntoView({ block: 'nearest' });
      act.innerHTML = `<button class="btn big" id="bN">Jag förstår ➜</button>`; $('#bN').onclick = next;
      chain(() => Math.random() < .7 ? sayNamed('oops').then(ok => ok || tell('wrong')) : tell('wrong'), () => sayEn(en), means(st.t, sv));
    }
    save();
  }
  const spk = (cls, fn) => { const b = document.createElement('button'); b.className = 'spk ' + cls; b.textContent = '🔊'; b.onclick = fn; return b; };

  if (st.k === 'pairs') {
    const ws = st.ids.map(i => D.levels[st.li].words[i]), cards = shuffle(ws.flatMap((w, n) => [{ n, en: 1, t: w[0] }, { n, en: 0, t: w[1] }]));
    stage.innerHTML = `${ask}<div class="pairs">${cards.map((c, i) => `<button class="pr ${c.en ? 'en' : ''}" data-i="${i}">${esc(c.t)}</button>`).join('')}</div>`;
    let sel = null, left = ws.length;
    on('.pr', el => { const c = cards[+el.dataset.i]; if (el.classList.contains('gone')) return;
      if (!sel || sel === el || cards[+sel.dataset.i].en === c.en) { if (sel) sel.classList.remove('sel'); sel = el; el.classList.add('sel'); SFX.pop(); if (c.en) chain(() => sayEn(c.t)); return; }
      const a = sel, o = cards[+a.dataset.i]; sel = null; a.classList.remove('sel');
      if (o.n === c.n) { [a, el].forEach(x => x.classList.add('gone')); SFX[S.set.snd](); chain(() => sayEn(ws[c.n][0])); coin(1);
        if (!--left) { R.ok++; $('#pet').classList.add('hop'); $('#rn').classList.add('loop'); stage.insertAdjacentHTML('beforeend', `<div class="fb ok"><span class="ic">✔</span><span><span class="h">Alla par hittade!</span><b>${ws.map(w => esc(w[0])).join(' · ')}</b></span></div>`);
          act.innerHTML = `<button class="btn big" id="bN">Fortsätt ➜</button>`; $('#bN').onclick = next; if (S.set.silly) rain(['⭐', '🪙'], 10); }
      } else { [a, el].forEach(x => { x.classList.add('no'); setTimeout(() => x.classList.remove('no'), 500); }); SFX.bad(); R.miss++; R.sm = (R.sm || 0) + 1; R.row = 0; [o.n, c.n].forEach(n => { const k = 'w' + st.li + '.' + st.ids[n]; S.stat[k] = (S.stat[k] || 0) + 1; }); }
      save(); });
    chain(lead); return;
  }
  if (st.k === 'intro') {
    stage.innerHTML = `${ask}${em ? `<div class="pic">${em}</div>` : ''}<div class="prompt ${st.t === 's' ? 'sm' : ''}">${esc(en)}</div><div class="sub">= ${esc(sv)}</div><div id="sp"></div>`;
    $('#sp').append(spk('', () => chain(() => sayEn(en))), ' ', Object.assign(spk('', () => chain(() => sayEn(en), means(st.t, sv))), { textContent: '🔊 = ?' , className: 'spk wide' }));
    act.innerHTML = `<button class="btn big" id="bN">Nästa ➜</button>`; $('#bN').onclick = next;
    // "Sad" – "betyder ledsen".
    chain(lead, () => sayEn(en), means(st.t, sv));
    return;
  }
  // One answer among several: the buttons lock at the first press.
  function choose(options, right, cols) {
    const skin = pick(['', 'balloon', 'sign', 'sign']), ems = shuffle(CARRY);
    stage.insertAdjacentHTML('beforeend', `<div class="opts ${cols ? '' : 'one'} ${skin}">${options.map((o, i) => `<button class="opt" data-i="${i}" data-em="${ems[i]}" style="--n:${i}">${esc(o)}</button>`).join('')}</div>`);
    on('.opt', el => { const good = options[+el.dataset.i] === right; app.querySelectorAll('.opt').forEach(b => { b.disabled = true; if (options[+b.dataset.i] === right) b.classList.add('ok'); }); if (!good) el.classList.add('bad'); answered(good, st.k !== 'pickEn'); });
  }
  const others = (list, col, n, not) => shuffle(list.map(x => x[col]).filter((x, i, a) => x !== not && a.indexOf(x) === i)).slice(0, n);
  if (st.k === 'pickSv') {
    stage.innerHTML = `${ask}<div class="prompt">${esc(en)}</div>`; stage.append(spk('', () => chain(() => sayEn(en))));
    choose(shuffle([sv, ...others(D.levels[st.li].words, 1, 3, sv)]), sv, true); chain(lead, () => sayEn(en));
  } else if (st.k === 'hear') {
    stage.innerHTML = ask; stage.append(spk('huge', () => chain(() => sayEn(en))));
    choose(shuffle([en, ...others(D.levels[st.li].words, 0, 3, en)]), en, true); chain(lead, () => sayEn(en));
  } else if (st.k === 'pickEn') {
    stage.innerHTML = `${ask}<div class="prompt">${esc(sv)}</div>`;
    choose(shuffle([en, ...others(D.levels[st.li].words, 0, 5, en)]), en, true); chain(lead, svWord);
  } else if (st.k === 'mean') {
    stage.innerHTML = `${ask}<div class="prompt sm">${esc(en)}</div>`; stage.append(spk('', () => chain(() => sayEn(en))));
    choose(shuffle([sv, ...others(D.levels[st.li].sents, 1, 3, sv)]), sv, false); chain(lead, () => sayEn(en));
  } else {
    // Built from tiles: the letters of a word, or the words of a sentence, with tiles that do not belong.
    const words = st.t === 's' || en.includes(' '), answer = words ? toks(en) : [...en];
    let extra;
    if (words) {
      const low = answer.map(a => a.toLowerCase()), free = w => !low.includes(w.toLowerCase()) && TAUGHT.get(w) <= R.li;
      extra = shuffle(CONF.filter(g => g.some(w => low.includes(w.toLowerCase()))).map(g => pick(g.filter(free))).filter(Boolean)).slice(0, 2);
      const pool = shuffle([...TAUGHT.keys()].filter(w => free(w) && !extra.includes(w) && TAUGHT.get(w) >= st.li - 3));
      while (extra.length < 3 && pool.length) extra.push(pool.pop());
    } else extra = shuffle([...'abdeghiklmnoprstuwy'].filter(c => !en.toLowerCase().includes(c))).slice(0, 3);
    const bank = shuffle([...answer, ...extra]), put = [];
    stage.innerHTML = `${ask}${st.k === 'dict' ? '' : `<div class="prompt sm">${esc(sv)}</div>`}`;
    if (st.k === 'dict') stage.append(spk('huge', () => chain(() => sayEn(en))));
    stage.insertAdjacentHTML('beforeend', `<div class="slots" id="slots"></div><div class="bank" id="bank">${bank.map((t, i) => `<button class="tile ${words ? '' : 'l'}" data-i="${i}">${esc(t)}</button>`).join('')}</div>`);
    act.innerHTML = `<button class="btn big" id="bC" disabled>Kolla ✔</button>`;
    let locked = false;
    const draw = () => { $('#slots').innerHTML = put.map((i, n) => `<button class="tile ${words ? '' : 'l'}" data-n="${n}">${esc(bank[i])}</button>`).join(''); $('#bC').disabled = !put.length;
      on('#slots .tile', el => { if (locked) return; const i = put.splice(+el.dataset.n, 1)[0]; $(`#bank [data-i="${i}"]`).classList.remove('used'); SFX.pop(); draw(); }); };
    on('#bank .tile', el => { if (locked || el.classList.contains('used')) return; el.classList.add('used'); put.push(+el.dataset.i); SFX.pop(); draw(); });
    $('#bC').onclick = () => { locked = true; const good = put.map(i => bank[i]).join(words ? ' ' : '').toLowerCase() === answer.join(words ? ' ' : '').toLowerCase(); $('#slots').classList.add(good ? 'ok' : 'bad'); $('#bank').style.visibility = 'hidden'; answered(good, false); };
    chain(lead, () => st.k === 'dict' ? sayEn(en) : st.t === 'w' ? svWord() : S.set.sv ? saySv(sv) : 0);
  }
}

// A stage is done: a break game ticket, and a funny fact about an animal.
function stageDone() {
  const R = S.run, L = D.levels[R.li], n = R.s + 1, of = R.st.length, fact = pick(D.facts), a = fromOf(R.li), b = stopOf(R.li), closer = b.st[Math.min(n, 3) - 1], perfect = !R.sm;
  R.s++; R.p = 0; R.sm = 0; if (R.first) S.tix++; save();
  show('stage', `<div class="center"><div class="pic dance"><span>${S.set.pet}</span><span>🎉</span><span>${STICKERS[R.li][0]}</span></div><h1>${S.name ? `Bra jobbat, ${esc(S.name)}! ` : ''}Etapp ${n} av ${of} klar!${perfect ? ' 🌟 Alla rätt!' : ''}</h1>
    <div class="leg"><span>${a.e}</span><i style="--f:${n / of}"><b>${S.set.pet}</b></i><span>${b.e}</span></div><div class="dots" hidden></div>
    <div class="card" style="max-width:38em">${esc(closer)}</div>
    <button class="chest ${perfect ? 'gold' : ''}" id="bG">🎁</button><div class="card" id="cF" style="max-width:36em" hidden><b id="cW"></b><p style="margin:.4em 0 0">🤪 ${esc(fact)}</p></div>
    <p><button class="btn big" id="bN">Nästa etapp ➜</button> ${S.tix ? `<button class="btn big ghost" id="bM">🎮 Pausspel (${S.tix})</button> ` : ''}<button class="btn ghost" id="bK">Kartan</button></p></div>`, b.sc);
  SFX.fanfare(); rain(['⭐', '🎉', STICKERS[R.li][0]], 16); if (S.set.silly) setTimeout(critter, 700);
  chain(() => sayNamed('good'), () => S.set.sv ? say('s', closer) : 0, ...(perfect ? [() => tell('perfect')] : []), () => tell('chest'));
  $('#bG').onclick = () => { const n = perfect ? 20 + rnd(16) : 5 + rnd(11), bonus = perfect || Math.random() < .15; S.coins += n; if (bonus) S.tix++; save(); $('#bG').classList.add('open'); $('#bG').textContent = '🪙'; $('#bG').disabled = true;
    $('#cW').textContent = `Du fick ${n} mynt!${bonus ? ' Och ett extra pausspel! 🎮' : ''}`; $('#cF').hidden = false; SFX.fanfare(); rain(['🪙', '⭐'], 18); chain(() => sayNamed('gift'), () => tell('fact'), () => S.set.sv ? say('s', fact) : 0); };
  $('#bN').onclick = play; if ($('#bM')) $('#bM').onclick = mini; $('#bK').onclick = () => map();
}

function finish() {
  const R = S.run, li = R.li, rate = R.miss / R.base, n = rate <= .08 ? 3 : rate <= .2 ? 2 : 1, first = R.first, worldEnd = li % 10 === 9, w = D.levels[li].w, dest = stopOf(li), gold = R.miss === 0 && !S.gold[li];
  S.done[li] = Math.max(S.done[li] || 0, n); if (first) S.tix++; if (gold) { S.gold[li] = 1; S.coins += 50; } S.run = null; save();
  const [em, en, sv] = STICKERS[li], last = li === D.levels.length - 1;
  show('result', `<div class="center"><div class="stars">${[1, 2, 3].map(i => `<span class="${i > n ? 'off' : ''}" style="animation-delay:${i * .25}s">⭐</span>`).join('')}</div>
    <h1>${dest.e} ${S.name ? `${esc(S.name)}, du är framme: ` : 'Framme: '}${esc(dest.n)}!</h1>
    <div class="card" style="max-width:42em"><p>${esc(dest.ar)}</p>${gold ? '<p>👑 <b>Guldkrona!</b> Hela vägen utan ett enda fel: +50 mynt.</p>' : ''}${first ? `<p><b>Nytt klistermärke!</b></p><p><span class="sticker wig"><b>${em}</b><small>${en}</small></span></p><p>${en} = ${sv} · 🎮 Du får ett pausspel!</p>` : `<p>Du har redan klistermärket <b>${em}</b>.</p>`}
    ${first && worldEnd ? `<p>🏆 <b>Du har klarat hela ${esc(D.worlds[w].name)}!</b> Nya kompisar väntar under ⚙️: ${PETS[w + 1].join(' ')}</p>` : ''}</div>
    <p>${S.tix ? `<button class="btn big" id="bM">🎮 Pausspel (${S.tix})</button> ` : ''}<button class="btn big ghost" id="bK">${last && first ? 'Till diplomet 🏆' : 'Till kartan ➜'}</button></p></div>`, dest.sc);
  SFX.fanfare(); rain(['⭐', em, '🎉', '🎈'], 24); chain(...(worldEnd ? [() => tell('bosswin')] : []), () => sayNamed('good'), () => S.set.sv ? say('s', dest.ar) : 0, ...(gold ? [() => sayNamed('wow'), () => tell('gold')] : []), ...(first ? [() => tell('level')] : []), () => sayEn(pick(D.praise)[0]));
  if (first && worldEnd) setTimeout(parade, 900);
  if ($('#bM')) $('#bM').onclick = mini;
  $('#bK').onclick = () => last && first ? diploma() : map();
}

function diploma() {
  show('diploma', `<div class="center"><div class="card" style="border:.4em double var(--gold);max-width:44em"><div class="pic">🏆</div><h1>DIPLOM</h1><p style="font-size:1.4em"><b>${esc(S.name || 'Äventyraren')}</b></p>
    <p>har rest hela vägen från Lund till Gold Coast, samlat 400 ord åt Polly och lärt sig 500 meningar på engelska.</p><p>📖 ${esc(D.ui.ending[0])}</p><p style="font-size:1.3em">⭐ ${stars()} stjärnor · Welcome to Australia, mate! 🦘</p></div><button class="btn big" id="bK">Till kartan ➜</button></div>`, 'sea');
  SFX.fanfare(); rain(['🦘', '🐨', '⭐', '🎉', '🏆'], 40); chain(() => tell('ending'), () => sayNamed('wow'), () => tell('diploma'), () => sayEn('Welcome to Australia!'));
  $('#bK').onclick = () => map('all');
}

function album() {
  show('album', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>📒 Mina klistermärken (${Object.keys(S.done).length}/50)</h1></div>
    <div class="scroll"><div class="grid">${STICKERS.map(([em, en, sv], i) => `<button class="sticker ${S.done[i] ? '' : 'no'}" data-i="${i}"><b>${em}</b><small>${S.done[i] ? `${en} · ${sv}` : i + 1}</small></button>`).join('')}</div></div>`);
  $('#bX').onclick = () => map();
  on('.sticker', el => { if (el.classList.contains('no')) return SFX.bad(); el.classList.remove('wig'); void el.offsetWidth; el.classList.add('wig'); pick([SFX.boing, SFX.kvack, SFX.pling, SFX.prutt])(); });
}

// The shop: every thing bought with coins is a hat to wear and gives an advantage in the break games, for good.
function shop(hello) {
  show('shop', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>🛍️ Affären</h1><span class="chip">🪙 ${S.coins} mynt</span></div>
    <div class="scroll"><div class="center" style="overflow:visible"><div class="try">${petHtml()}</div><p>Allt du köper hjälper dig i pausspelen, för alltid. Du kan också ha det som hatt!</p>
    <div class="grid">${SHOP.map(([h, c, name, , what]) => { const mine = S.own.includes(h), on = S.set.hat === h; return `<button class="card ware ${mine ? 'mine' : S.coins >= c ? '' : 'dear'} ${on ? 'on' : ''}" data-h="${h}" data-c="${c}"><b>${h}</b><span class="nm">${name}</span><span class="wt">${what}</span><small>${on ? '✔ Köpt · har på sig' : mine ? '✔ Köpt · sätt på' : `🪙 ${c}`}</small></button>`; }).join('')}</div>
    <p>Du får mynt för rätt svar, i paketen efter varje etapp och när du spelar pausspel.</p></div></div>`);
  $('#bX').onclick = () => map(); $('#pet').onclick = petTrick;
  if (hello) chain(() => tell('shop'));
  on('[data-h]', el => { const h = el.dataset.h, c = +el.dataset.c, item = SHOP.find(x => x[0] === h);
    if (S.own.includes(h)) { S.set.hat = S.set.hat === h ? '' : h; save(); SFX.pop(); return shop(); }
    if (S.coins < c) { SFX.bad(); el.classList.add('no'); setTimeout(() => el.classList.remove('no'), 500); bubble(`Du behöver ${c - S.coins} mynt till!`, 2600); chain(() => tell('poor')); return; }
    S.coins -= c; S.own.push(h); S.set.hat = h; save(); shop(); SFX.fanfare(); rain([h, '🪙'], 16); $('#pet').classList.add('spin'); chain(() => tell('bought'), () => S.set.sv ? say('s', D.perk[item[3]]) : 0); });
}

function settings() {
  const have = PETS.slice(0, worldsDone() + 1).flat(), row = (label, html) => `<b>${label}</b><div class="pick">${html}</div>`, onoff = (k) => [[true, 'På'], [false, 'Av']].map(([v, t]) => `<button data-k="${k}" data-v="${v}" class="${S.set[k] === v ? 'on' : ''}">${t}</button>`).join('');
  show('settings', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>⚙️ Gör spelet till ditt</h1></div><div class="scroll"><div class="set card">
    ${row('Röst', VOICES.map(([v, t]) => `<button data-k="voice" data-v="${v}" class="${S.set.voice === v ? 'on' : ''}">${t}</button>`).join(''))}
    ${row('Kompis', PETS.flat().map(p => `<button class="em ${S.set.pet === p ? 'on' : ''}" data-k="pet" data-v="${p}" ${have.includes(p) ? '' : 'disabled'}>${have.includes(p) ? p : '🔒'}</button>`).join(''))}
    ${row('Hatt', [...HATS, ...S.own].map(h => `<button class="em ${S.set.hat === h ? 'on' : ''}" data-k="hat" data-v="${h}">${h || '🚫'}</button>`).join(''))}
    ${row('Färg', PALS.map((c, i) => `<button data-k="pal" data-v="${i}" class="${S.set.pal === i ? 'on' : ''}" style="background:${c};color:#fff">${S.set.pal === i ? '✔' : '&nbsp;'}</button>`).join(''))}
    ${row('Ljud vid rätt svar', SOUNDS.map(([v, t]) => `<button data-k="snd" data-v="${v}" class="${S.set.snd === v ? 'on' : ''}">${t}</button>`).join(''))}
    ${row('Tokigheter', onoff('silly'))}${row('Svensk röst', onoff('sv'))}
    ${row('Namn', `<span style="align-self:center">${esc(S.name || '(inget)')}</span><button id="bName">✏️ Byt namn</button>`)}
    ${row('Tokknappen', `<button id="bSilly">🤪 Tryck inte här!</button>`)}
    ${row('Vuxna', `<button id="bAd">🔐 Håll in i 3 sekunder</button>`)}</div><div id="adult"></div></div><div class="foot">${petHtml()}<span></span></div>`);
  $('#bX').onclick = () => map(); $('#pet').onclick = petTrick;
  on('[data-k]', el => { const k = el.dataset.k, v = el.dataset.v; S.set[k] = k === 'pal' ? +v : v === 'true' ? true : v === 'false' ? false : v; save();
    settings(); if (k === 'voice') sayEn('Hello!'); else if (k === 'snd') SFX[S.set.snd](); else SFX.pop(); });
  $('#bName').onclick = () => { S.name = null; save(); start(); };
  $('#bSilly').onclick = () => { pick([parade, () => rain(['💩', '🍌', '🦆', '🧦']), SFX.prutt, petTrick])(); if (Math.random() < .4) SFX.kvack(); };
  let t; const b = $('#bAd'); b.onpointerdown = () => { t = setTimeout(adult, 3000); }; b.onpointerup = b.onpointerleave = () => clearTimeout(t);
}

// For the grown-up: what has been done, and what has been hardest.
function adult() {
  const hard = Object.entries(S.stat).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => { const m = /^(\w)(\d+)\.(\d+)$/.exec(k), it = item({ t: m[1], li: +m[2], i: +m[3] }); return `<tr><td>${esc(it[0])}</td><td>${esc(it[1])}</td><td>${n}</td></tr>`; }).join('');
  $('#adult').innerHTML = `<div class="card" style="margin:1em auto;max-width:52em"><p><b>${Object.keys(S.done).length} av 50 nivåer klara</b> · ${stars()} stjärnor av 150 · pausspel kvar: ${S.tix}</p>
    <table><tr><th>Svårast just nu</th><th></th><th>Fel</th></tr>${hard || '<tr><td colspan="3">Inga fel sparade.</td></tr>'}</table>
    <p class="pick" style="justify-content:center"><button id="aNext">Lås upp nästa nivå</button><button id="aReset">Nollställ allt (tryck två gånger)</button></p></div>`;
  $('#aNext').onclick = () => { const n = nextLevel(); if (!S.done[n]) { S.done[n] = 1; if (S.run && S.run.li === n) S.run = null; save(); } adult(); };
  let armed = false; $('#aReset').onclick = ev => { if (!armed) { armed = true; ev.target.textContent = 'Säker? Tryck igen för att radera allt'; return; } const name = S.name; S = structuredClone(DEF); S.name = name; save(); map(); };
}

// ---- Break games: one go for every finished stage ----
const GAMES = [['whack', '🐹', 'Pricka djuren', 'Tryck på djuren som tittar upp. Akta bajset!'], ['rain', '🌧️', 'Djurregn', 'Fånga djuren som faller. Rör inte kaktusen!'], ['roo', '🦘', 'Känguruhopp', 'Hoppa över kaktusarna och ta stjärnorna. Men stå kvar på marken när fåglarna kommer!']];
function mini() {
  show('mini', `<div class="top"><button class="chip" id="bX">← Kartan</button><h1>🎮 Pausspel</h1><span class="chip">🎟️ ${S.tix} kvar</span></div>
    <div class="center">${S.tix ? '<p>Välj ett spel. Varje spel kostar en biljett.</p>' : '<p><b>Biljetterna är slut!</b> Klara en etapp till så får du en ny.</p>'}
    <div class="grid">${GAMES.map(([id, em, name, how]) => `<button class="card" data-g="${id}" style="width:15em" ${S.tix ? '' : 'disabled'}><div class="pic">${em}</div><b>${name}</b><br><small>${how}</small><br><small>🏅 Rekord: ${S.hi[id] || 0}</small></button>`).join('')}</div><p>${S.own.length ? `Dina prylar hjälper dig: ${S.own.join(' ')}` : 'I 🛍️ affären finns saker som hjälper dig i spelen.'}</p></div>`);
  $('#bX').onclick = () => map(); if (!S.tix) chain(() => tell('notix'));
  on('[data-g]', el => { if (!S.tix) return; S.tix--; save(); game(el.dataset.g); });
}
function game(id) {
  const ANIMALS = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐨', '🐸', '🐵', '🐷', '🐮', '🦁', '🐧'], g = GAMES.find(x => x[0] === id);
  // What has been bought in the shop helps here.
  const P = Object.fromEntries(SHOP.map(x => [x[3], S.own.includes(x[0])])), mine = SHOP.filter(x => S.own.includes(x[0])).map(x => x[0]).join('');
  show('game', `<div class="top"><h1>${g[1]} ${g[2]}</h1><span class="chip" id="gP">${mine || 'Inga prylar än'}</span><span class="chip" id="gT">⏱️</span><span class="chip" id="gS">⭐ 0</span></div><div id="field"></div>`);
  chain(() => tell(id), () => sayNamed('luck'));
  const field = $('#field'), timers = []; let score = P.head ? 10 : 0, left = 40 + (P.time ? 10 : 0), over = false, combo = 0, lives = id === 'roo' ? 3 + (P.life ? 1 : 0) : 0;
  const hud = () => { if ($('#gS')) { $('#gS').textContent = `⭐ ${score}${combo >= 5 ? ` 🔥${combo}` : ''}${lives ? ' · ' + '❤️'.repeat(lives) : ''}`; $('#gT').textContent = '⏱️ ' + left; } };
  const float = (el, text) => { const r = el.getBoundingClientRect(), f = document.createElement('div'); f.className = 'pts'; f.textContent = text; f.style.left = r.left + r.width / 2 + 'px'; f.style.top = r.top + 'px'; document.body.append(f); setTimeout(() => f.remove(), 800); };
  // Points: doubled by the rocket, and every fifth hit in a row gives two more.
  const hit = (n, el) => { n *= P.double ? 2 : 1; combo++; if (combo % 5 === 0) n += 2; score += n; SFX.pop(); if (el) float(el, '+' + n); hud(); };
  // Something that should not be touched: with the poo hat it gives points, with the flower nothing happens.
  const oops = el => { if (P.poop) return hit(3, el); combo = 0; if (P.safe) { SFX.boing(); if (el) float(el, '🌸'); } else { score = Math.max(0, score - 2); SFX.prutt(); if (el) float(el, '−2'); } hud(); };
  const end = () => { if (over) return; over = true; stopGame = null; timers.forEach(clearInterval);
    const rec = score > (S.hi[id] || 0), coins = Math.min(40, Math.floor(score / 4)); if (rec) S.hi[id] = score; S.coins += coins; save(); SFX.fanfare(); rain(rec ? ['🏅', '⭐', '🪙'] : ['🪙'], 14);
    show('gameover', `<div class="center"><div class="pic">${g[1]}</div><h1>${score} poäng!${rec ? ' Nytt rekord! 🏅' : ''}</h1><div class="card"><b>Du tjänade 🪙 ${coins} mynt</b><br><small>Nu har du 🪙 ${S.coins}. I affären finns saker som gör dig ännu bättre!</small></div>
      <p>${S.tix ? `<button class="btn big" id="bM">🎮 Spela igen (${S.tix} kvar)</button> ` : ''}<button class="btn big ghost" id="bS">🛍️ Affären</button> <button class="btn big ghost" id="bK">Tillbaka till äventyret ➜</button></p></div>`);
    if ($('#bM')) $('#bM').onclick = mini; $('#bS').onclick = () => shop(true); $('#bK').onclick = () => S.run ? play() : map(); };
  stopGame = () => { over = true; timers.forEach(clearInterval); };
  timers.push(setInterval(() => { left--; hud(); if (left <= 0) end(); }, 1000));
  const golden = () => P.banana && Math.random() < .12;
  let sweep = () => {};
  // The UFO: every ten seconds it catches everything on the screen.
  if (P.ufo) timers.push(setInterval(() => { const u = document.createElement('div'); u.className = 'fly'; u.textContent = '🛸'; u.style.top = '18vh'; u.style.animationDuration = '1.6s'; document.body.append(u); setTimeout(() => u.remove(), 2000); SFX.fanfare(); sweep(); }, 10000));
  hud();
  if (id === 'whack') {
    field.innerHTML = `<div class="holes">${'<button class="hole"></button>'.repeat(12)}</div>`;
    const holes = [...field.querySelectorAll('.hole')];
    const whack = h => { const t = h.textContent; if (!t) return; h.textContent = ''; t === '💩' ? oops(h) : hit(t === '🍌' ? 5 : 1, h); };
    holes.forEach(h => h.onpointerdown = () => whack(h));
    sweep = () => holes.forEach(h => { if (h.textContent && h.textContent !== '💩') whack(h); });
    timers.push(setInterval(() => { const h = pick(holes); if (h.textContent) return; const what = Math.random() < .15 ? '💩' : golden() ? '🍌' : pick(ANIMALS); h.innerHTML = `<span>${what}</span>`;
      setTimeout(() => { if (h.textContent === what) { h.textContent = ''; if (what !== '💩') { combo = 0; hud(); } } }, 700 + left * 12 + (P.slow ? 500 : 0)); }, 420));
  } else if (id === 'rain') {
    const pop = b => { if (!b.isConnected) return; const bad = b.dataset.bad, t = b.textContent; float(b, ''); b.remove(); bad ? oops(field) : hit(t === '🍌' ? 5 : 1, field); };
    sweep = () => field.querySelectorAll('.fall:not([data-bad])').forEach(pop);
    timers.push(setInterval(() => { const b = document.createElement('button'), bad = Math.random() < .18; b.className = 'fall'; if (bad) b.dataset.bad = 1; b.textContent = bad ? '🌵' : golden() ? '🍌' : pick(ANIMALS); b.style.left = rnd(88) + '%'; b.style.animationDuration = 2 + Math.random() * 2 + left / 25 + (P.feather ? 1.5 : 0) + 's';
      b.onpointerdown = () => pop(b); b.onanimationend = () => { if (!bad) { combo = 0; hud(); } b.remove(); }; field.append(b); }, 480));
  } else {
    // Jump over what stands on the ground, stay down when a bird comes, and jump for the stars.
    // Jumping all the time does not work: a bird flies at the height of a jump. It gets faster all the while.
    field.innerHTML = `<div id="ground"></div><div id="roo">🦘</div>`;
    const roo = $('#roo'), T0 = left; let y = 0, vy = 0, jumps = 0, obs = [], t0 = performance.now(), spawn = 1.2, lastKind = '';
    field.onpointerdown = () => { if (y === 0 || (P.jump2 && jumps < 2)) { vy = 2.9; jumps = y === 0 ? 1 : 2; SFX.boing(); } };
    sweep = () => { obs.forEach(o => { if (!o.hit && o.kind !== 'star') { o.el.textContent = '✨'; o.hit = true; hit(1, roo); } }); };
    const hurt = o => { o.hit = true; o.el.textContent = '💥'; combo = 0; lives--; SFX.prutt(); roo.classList.add('ouch'); setTimeout(() => roo.classList.remove('ouch'), 500); hud(); if (lives <= 0) end(); };
    timers.push(setInterval(() => { const t = performance.now(), dt = Math.min(.05, (t - t0) / 1000), hard = Math.min(1, (T0 - left) / 35); t0 = t;
      vy -= 9 * dt; y = Math.max(0, y + vy * dt); if (y === 0) { vy = 0; jumps = 0; } roo.style.bottom = 12 + y * 55 + '%';
      spawn -= dt;
      if (spawn <= 0) {
        // Never two birds in a row, so that there is always something to jump over or a moment to land.
        const r = Math.random(), kind = golden() ? 'banana' : r < .3 && lastKind !== 'bird' ? 'bird' : r < .45 ? 'star' : 'ground', el = document.createElement('div'); lastKind = kind;
        el.className = 'cactus'; el.textContent = kind === 'bird' ? pick(['🦅', '🐝', '🦇']) : kind === 'star' ? '⭐' : kind === 'banana' ? '🍌' : pick(['🌵', '🌵', '🪨', '🐊', '🦂']);
        if (kind !== 'ground') el.style.bottom = kind === 'bird' ? '33%' : '36%'; if (kind === 'bird') el.classList.add('wing');
        field.append(el); obs.push({ x: 105, el, kind }); spawn = (1.25 - hard * .45) * (.8 + Math.random() * .5);
      }
      const speed = 62 + hard * 55;
      obs = obs.filter(o => { if (over) return false; o.x -= speed * dt; o.el.style.left = o.x + '%';
        if (!o.hit && o.x < 17 && o.x > 5) {
          if (o.kind === 'star' || o.kind === 'banana') { if (y > .18) { o.hit = true; o.el.textContent = '✨'; hit(o.kind === 'banana' ? 5 : 2, roo); } }
          else if (o.kind === 'bird' ? y > .16 : y < .2) { hurt(o); if (over) return false; } }
        if (o.x < -10) { o.el.remove(); if (!o.hit && (o.kind === 'ground' || o.kind === 'bird')) hit(1, roo); return false; } return true; });
    }, 16));
  }
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
window.addEventListener('contextmenu', e => e.preventDefault());
window.addEventListener('pointerdown', () => { touched = true; }, true);
setInterval(() => { if (S.set.silly && screen !== 'game' && !document.hidden && Math.random() < .5) critter(); }, 30000);
nameLoading = loadName();
start();
})();
