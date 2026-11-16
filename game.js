(() => {
const { LANGS, SEO, PAGE_LANGS, pagePath } = window.LA;
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const COLORS = ['--r1','--r2','--r3','--r4','--r5','--r6'];
const GAME_META = [
  {id:'alfabet', em:'🌈', c:'--r1'},
  {id:'hitta',   em:'🐞', c:'--r2'},
  {id:'lyssna',  em:'👂', c:'--r3'},
  {id:'para',    em:'🦋', c:'--r4'},
  {id:'ord',     em:'🦄', c:'--r6'},
  // word games
  {id:'bildord', em:'🖼️', c:'--r5'},
  {id:'lasord',  em:'📖', c:'--r2'},
  {id:'forsta',  em:'🔤', c:'--r3'},
  {id:'saknad',  em:'🧩', c:'--r4'},
  // added later; listed last so the numbers of the older games stay the same
  {id:'fanga',   em:'☔', c:'--r5'},
  {id:'memory',  em:'🃏', c:'--r6'},
  {id:'rimma',   em:'🎵', c:'--r1'},
];
const WORD_GROUP = ['bildord','lasord','forsta','saknad','memory','rimma']; // shown under "Words" on the home screen
const LETTER_GAMES = 5; // the first five are letter games, the rest word games
const WORD_GAMES = ['bildord','lasord','forsta','saknad'];
const WORD_ROUNDS = [0, 4, 5, 6, 8, 10];   // words per round on levels 1-5
const ORD_WORDS   = [0, 2, 3, 4, 5, 6];    // words per round in the spelling game, besides the child's name
const PROG_GAMES = ['ord', ...WORD_GAMES, 'memory']; // games with their own word level
const PER_LEVEL = 20, MAX_WORD_LEVEL = 20;
const VOICE_EM = ['🦄','🐞','🦉','🐻','🦊'];
const STICKERS = [...'🦄🐞🌈⭐🌸🦋🍓🧁👑💖🐱🐶🍭🎀🌟🐰🍉🎈🐥🌻🚀🦖⚽🚗🐯🐙🤖🏆🚂🦈🐉🪐🦁🐬🎸🛹🚁🦕🐢🎯'];

// Looks: colours (set in index.html), a mascot, background decorations and the confetti of each.
// `cast` is the figure each of the five voices appears as in that look (names and greetings: CAST in variants.js).
const LOOKS = [
  {id:'adventure', em:'🏕️', cast:['🐿️','🐰','🦉','🐻','🦊'], hero:'🦊', marker:'🦊', walker:'🦔', decor:['⛰️','🌳','☀️','🎈','🌲'], fx:['⭐','🎈','🦊','🌟','✨','🍃','🏆']},
  {id:'rainbow',   em:'🦄', hero:'🦄', marker:'🐞', walker:'🐞', decor:[],                     fx:['⭐','💖','🦄','🐞','🌸','✨','🌈']},
  {id:'space',     em:'🚀', cast:['🧑‍🚀','⭐','🌙','🤖','👽'], hero:'🚀', marker:'🚀', walker:'🛸', decor:['🪐','⭐','🌙','☄️','✨'], fx:['⭐','🚀','🪐','👽','✨','🌟','☄️']},
  {id:'jungle',    em:'🦖', cast:['🦜','🐒','🐯','🦖','🐸'], hero:'🦖', marker:'🦕', walker:'🐒', decor:['🌴','🌿','🦜','🌴','🍃'], fx:['⭐','🦖','🌴','🦜','✨','🍃','🐒']},
  {id:'ocean',     em:'🐙', cast:['🐬','🐠','🐢','🐳','🐙'], hero:'🐙', marker:'🐠', walker:'🐢', decor:['🐚','🪸','🐬','🫧','🐳'], fx:['⭐','🐠','🐙','🫧','✨','🐬','🐚']},
];
// Where the five background decorations sit: [left %, top %, size in vmin].
const DECOR_SPOTS = [[3,62,24],[76,58,28],[10,10,13],[80,8,15],[44,78,17]];
// The pictures that fill the progress row, per game.
const PIPS = {hitta:['🎯','🔎'], lyssna:['👂','🎧','🔔'], para:['🧩','🔗'], ord:['✏️','📝','📖'], bildord:['🖼️','📷'], lasord:['📖','📚'],
  forsta:['🔤','🎧'], saknad:['🧩','🔎'], fanga:['☔','💧'], memory:['🃏','🧠'], rimma:['🎵','🎶','🥁']};
const cap = s => s[0].toUpperCase() + s.slice(1);

/* ---------- state ---------- */
const KEY = 'letter-adventure-v1';
const S = {name:'', lang:'en', letterCase:'upper', voice:true, voiceChar:0, speed:1, sfx:true, kb:true, stars:0, stickers:[], age:null, level:2, look:'adventure', boards:{}, prog:{}, profiles:{}};
try { Object.assign(S, JSON.parse(localStorage.getItem(KEY)) || {}); } catch {}
if (!LANGS[S.lang]) S.lang = 'en';
// Each language has a page of its own (/sv/, /es/ ...; see seo.js). Such a page starts in its language;
// the English one, at the top, keeps the language that was chosen last. The address then follows the language.
const PAGE_LANG = document.documentElement.lang;
if (PAGE_LANG !== 'en' && LANGS[PAGE_LANG]) S.lang = PAGE_LANG;
function syncAddress(){
  if (!/^https?:$/.test(location.protocol) || !/^\/(?:[a-z]{2}\/)?(?:index\.html)?$/.test(location.pathname)) return;
  if (location.pathname !== pagePath(S.lang)) try { history.replaceState(null, '', pagePath(S.lang) + location.hash); } catch {}
}
if (!VOICE_EM[S.voiceChar]) S.voiceChar = 0;
delete S.counted; // left over from the play counter that has been removed

/* ---------- difficulty: level 1 (age 3) to level 5 (age 7) ----------
   rounds   letters per round in the find, listen and match games
   choices  buttons to choose between in the listen and match games
   hintAt   mistakes on one letter before the right key lights up (0 = lit from the start)
   show     the letter to press is shown; false hides it until hintAt mistakes
   say      the voice names the next letter in the alphabet and spelling games
   words    how many short, medium and long words in the spelling game
   short    longest "short" word */
const LEVELS = [null,
  {rounds:5,  choices:2, hintAt:0, show:true,  say:true,  words:[2,0,0], short:3},
  {rounds:8,  choices:3, hintAt:1, show:true,  say:true,  words:[3,0,0], short:4},
  {rounds:10, choices:4, hintAt:2, show:true,  say:false, words:[3,1,1], short:4},
  {rounds:10, choices:5, hintAt:2, show:false, say:false, words:[3,1,1], short:4},
  {rounds:12, choices:6, hintAt:3, show:false, say:false, words:[2,2,2], short:4},
];
if (S.hard !== undefined){ S.level = S.hard ? 4 : 2; delete S.hard; } // from the earlier easy/hard switch
if (!LEVELS[S.level]) S.level = 2;
const LV = () => LEVELS[S.level];
const save = () => { try { stashPlayer(); localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };

/* ---------- looks ---------- */
const look = () => LOOKS.find(l => l.id === S.look) || LOOKS[0];
// The picture, name and greeting of voice i in the look that is chosen.
const voiceEm = i => (look().cast || VOICE_EM)[i];
const voiceName = i => (T.cast && T.cast[look().id] || T.voices)[i];
const voiceHello = i => { const c = T.helloCast && T.helloCast[look().id]; return c ? {id:`hello_${look().id}`, text:c[i]} : {id:'hello', text:T.hello[i]}; };
function applyLook(){
  const l = look(), root = document.documentElement;
  root.dataset.look = l.id; root.style.setProperty('--marker', `"${l.marker}"`);
  $('#hero').textContent = l.hero; $('#walker').textContent = l.walker;
  $('#decor').innerHTML = l.decor.map((em, i) => `<span style="left:${DECOR_SPOTS[i][0]}%; top:${DECOR_SPOTS[i][1]}%; font-size:${DECOR_SPOTS[i][2]}vmin">${em}</span>`).join('');
}

/* ---------- players ----------
   Each name has its own stars, stickers, word levels, age, difficulty, letter case, voice, look,
   language and speaking speed. The fields of the player who is playing live directly in S; the
   others wait in S.profiles. Sound on/off, the on-screen keyboard and the alphabet top list are
   shared by everyone on the device. A player saved before language was per player keeps the
   language that is in use when they are chosen. */
const PLAYER_FIELDS = ['name','age','level','letterCase','voiceChar','look','stars','stickers','prog','lang','speed'];
const NEW_PLAYER = () => ({age:null, level:2, letterCase:'upper', look:'adventure', stars:0, stickers:[], prog:{}});
const playerKey = n => (n || '').trim().toLocaleLowerCase();
const cleanName = v => v.trim().replace(/\s+/g,' ').slice(0,16);
const copy = o => JSON.parse(JSON.stringify(o));
// A name that is being typed on the start screen is a draft: it becomes a saved player when the
// game is started, not for every letter typed.
let draft = !S.profiles[playerKey(S.name)];
function stashPlayer(){ if (playerKey(S.name) && !draft) S.profiles[playerKey(S.name)] = copy(Object.fromEntries(PLAYER_FIELDS.map(f => [f, S[f]]))); }
// Makes the name in the name field the active player; a new name starts from zero.
function syncName(){
  const n = cleanName($('#name').value), saved = S.profiles[playerKey(n)];
  delete S.profiles[''];
  if (playerKey(n) === playerKey(S.name)){ S.name = n; return; }
  stashPlayer();
  if (saved){ Object.assign(S, copy(saved), {name: n}); draft = false; }
  else if (draft) S.name = n;                       // still typing: keep the age and look chosen so far
  else { Object.assign(S, NEW_PLAYER(), {name: n}); draft = true; }
}
function renderPlayers(){
  const names = Object.values(S.profiles).map(p => p.name).filter(Boolean);
  names.sort((a, b) => a.localeCompare(b));
  const fill = (box, list) => {
    box.innerHTML = '';
    list.forEach(n => {
      const b = document.createElement('button');
      b.className = 'player'; b.dataset.player = n; b.textContent = n;
      b.setAttribute('aria-pressed', playerKey(n) === playerKey(S.name));
      box.append(b);
    });
  };
  $('#playersLabel').hidden = $('#players').hidden = names.length === 0;
  fill($('#players'), names);
  // On the home screen the names are there to switch player with one tap, so one name alone is not shown.
  // and a "+" for adding a new player.
  fill($('#homePlayers'), names.length < 2 ? [] : names);
  const add = document.createElement('button');
  add.className = 'player'; add.id = 'addPlayer'; add.textContent = '+'; add.setAttribute('aria-label', T.ui.newPlayer); add.title = T.ui.newPlayer;
  $('#homePlayers').append(add);
  // In the settings: the saved players, to remove one.
  $('#removeRow').hidden = names.length === 0;
  fill($('#removeList'), names);
  $$('#removeList .player').forEach(b => b.setAttribute('aria-pressed', b.dataset.player === removing));
}
let removing = null; // the player the settings are asking to have typed, before it is removed
// Switches to another saved player, with that player's own language, voice, look and level.
function choosePlayer(name){
  const lang = S.lang;
  $('#name').value = name; syncName(); save();
  if (S.lang !== lang) applyLang(); else refresh();
}
let T = LANGS[S.lang], ALPHA = [...T.alpha];

const pick = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a = [...a]; for (let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const disp = (L,c) => c==='lower' ? L.toLowerCase() : L;
const pickCase = () => S.letterCase==='both' ? (Math.random()<.5?'upper':'lower') : S.letterCase;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const nm = () => S.name || T.friend;
// On screen the name marker "{, n}" becomes ", Moa"; with no name it disappears.
const shown = s => s.replace(/\{([^}]*)n\}/g, (_, pre) => S.name ? pre + S.name : '');

/* ---------- alphabet clock and top list (kept in this browser) ---------- */
const PENALTY = 5000; // each mistake costs five seconds
const boardKey = () => `${S.lang}-L${S.level}`;
const fmtTime = ms => { const t = Math.round(ms/100); return `${Math.floor(t/600)}:${String(Math.floor(t/10)%60).padStart(2,'0')}${T.dec}${t%10}`; };
function fillBoard(ol, mark){
  const list = S.boards[boardKey()] || [];
  ol.innerHTML = '';
  list.forEach(r => {
    const li = document.createElement('li'), n = document.createElement('span'), t = document.createElement('b');
    n.textContent = r.name; t.textContent = fmtTime(r.ms);
    if (r.at === mark) li.className = 'me';
    li.append(n, t); ol.append(li);
  });
  return list.length;
}
let clock = null;
function stopClock(){ clearInterval(clock); clock = null; }
function startClock(){
  stopClock();
  clock = setInterval(() => {
    if (!G || !G.t0) return stopClock();
    $('#timer').textContent = '⏱ ' + fmtTime(performance.now() - G.t0 + G.errs*PENALTY).slice(0, -2);
  }, 250);
}

/* ---------- installing as an app ---------- */
// Opened from its home-screen icon the game runs without browser bars; then the instructions are not needed.
const isInstalled = () => matchMedia('(display-mode: fullscreen), (display-mode: standalone)').matches || navigator.standalone === true;
function showInstallState(){ const on = isInstalled(); $('#install').hidden = on; $('#installed').hidden = !on; }
let installPrompt = null;
// Chrome offers its own install dialog; where it does, show a button for it.
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; $('#installBtn').hidden = false; });
addEventListener('appinstalled', () => { installPrompt = null; $('#installBtn').hidden = true; });

/* ---------- phrases: {id, text} parts ---------- */
// Picks one of n alternatives, never the one picked last time for the same key.
const lastPick = {};
function vary(key, n){
  let i = Math.floor(Math.random()*n);
  if (n > 1 && i === lastPick[key]) i = (i + 1 + Math.floor(Math.random()*(n-1))) % n;
  return lastPick[key] = i;
}
function g(key){
  const v = T.g[key];
  if (v === undefined) return null; // a phrase this language does not have yet
  const named = raw => /\{[^}]*n\}[^\p{L}]*$/u.test(raw); // the phrase has a place for the player's name
  // A phrase that names a figure has its own wording, and clip, in each look (THEMED in variants.js).
  const inLook = (id, raw) => { const o = T.gLook && T.gLook[look().id] && T.gLook[look().id][id]; return o ? {id:`${id}_${look().id}`, text:shown(o), named:named(o)} : {id, text:shown(raw), named:named(raw)}; };
  if (Array.isArray(v)){ const i = vary(key, v.length); return inLook(`${key}_${i}`, v[i]); }
  return inLook(key, v);
}
// The caption must not give away what the screen hides: the letter in the listening
// game, and on the levels without visible letters, until the answer has been revealed.
const secret = () => G && !G.revealed && (G.id==='lyssna' || (!LV().show && G.id!=='para'));
// The plain letter for an accented one (É -> E), unless the language counts it as a letter of its own (Å, Ñ).
const base = ch => !ch || ALPHA.includes(ch) ? ch : ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const per = (key, L, open) => { L = base(L); return {id:`${key}_${ALPHA.indexOf(L)}`, text:T.per[key](!open && secret() ? '?' : L)}; };
// A per-letter sentence in one of its wordings ("find", "find2", "find3"), varied from time to time.
function perV(key, L, open){
  const keys = [key, key+'2', key+'3'].filter(k => T.per[k]);
  return per(keys[vary('per:'+key, keys.length)], L, open);
}
const wordPart = (key, it) => ({id:`${key}_${it.wi}`, text:T.perWord[key](key==='word' && secret() ? '…' : it.w.toLowerCase())});

/* ---------- voice: recorded clips ---------- */
const player = new Audio();

/* ---------- the player's name, spoken ----------
   Common names are recorded once per voice and packed by first letter. The game downloads the
   whole pack for the first letter and cuts the name out here, so the web host only ever sees
   the first letter. A name that is not in the pack is simply not said. */
let nameClip = null, nameFor = '';
const plainText = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let nameLoading = null; // the fetch that is under way, so that a second caller waits for the same one
function loadNameClip(){
  const k = playerKey(S.name), want = `${S.lang}/v${S.voiceChar+1}/${k}`;
  if (nameFor === want) return nameLoading;
  nameFor = want;
  nameClip = null;
  return nameLoading = fetchNameClip(k, want);
}
async function fetchNameClip(k, want){
  if (!k) return;
  // A name that has not been recorded in the language being played is taken from another
  // language, where the same voice says it (a Swedish name while playing in English).
  const first = plainText(k)[0], file = /^[a-z]$/.test(first) ? first : '0';
  for (const lang of [S.lang, ...Object.keys(LANGS).filter(l => l !== S.lang)]){
    const pack = `audio/${lang}/v${S.voiceChar+1}/names/${file}`;
    try {
      const r = await fetch(pack + '.json'); if (!r.ok) continue;
      const index = await r.json(), hit = index[k] || index[plainText(k)];
      if (!hit) continue;
      const bytes = await (await fetch(pack + '.bin')).arrayBuffer();
      if (nameFor === want) nameClip = bytes.slice(hit[0], hit[0] + hit[1]);
      return;
    } catch {}
  }
}
// The name is joined to the phrase before it (and after it) into one sound, so that it is said
// in one breath: "Well done," + "Moa!". The clips have had their silence trimmed for this.
let joinedUrl = null;
async function joined(ids){
  const clip = nameClip;
  const bufs = await Promise.all(ids.map(async id => {
    if (!id) return clip;
    const r = await fetch(clipUrl(id)); if (!r.ok) throw 0;
    return r.arrayBuffer();
  }));
  if (joinedUrl) URL.revokeObjectURL(joinedUrl);
  return joinedUrl = URL.createObjectURL(new Blob(bufs, {type: 'audio/mpeg'}));
}
let tok = 0;
// The clips that name a letter are fetched all at once, in a fixed order, and kept in memory.
// Fetched one by one while a child spells their name, their order would show the name to the web host.
let clipCache = {}, cacheKey = '';
async function preloadLetters(){
  const key = `${S.lang}/v${S.voiceChar+1}`;
  if (cacheKey === key) return;
  Object.values(clipCache).forEach(u => URL.revokeObjectURL(u));
  cacheKey = key; const mine = clipCache = {};
  const ids = [];
  [...T.alpha].forEach((_, i) => Object.keys(T.per).forEach(k => ids.push(`${k}_${i}`)));
  let next = 0;
  await Promise.all(Array.from({length: 6}, async () => {
    while (next < ids.length && cacheKey === key){
      const id = ids[next++];
      try { const r = await fetch(`audio/${key}/${id}.mp3`); if (r.ok) mine[id] = URL.createObjectURL(await r.blob()); } catch {}
    }
  }));
}
const clipUrl = id => clipCache[id] || `audio/${S.lang}/v${S.voiceChar+1}/${id}.mp3`;
// The last things the voice said, so that a grown-up can report one that sounded wrong (see the
// feedback dialog). Kept only while the page is open: [{at: 'sv v4 jungle', ids, text}], newest first.
const heard = [];
function remember(p){
  if (!p.id || !p.text) return;
  const at = `${S.lang} v${S.voiceChar+1} ${look().id}`, i = heard.findIndex(h => h.at === at && h.ids[0] === p.id);
  if (i >= 0) heard.splice(i, 1);
  heard.unshift({at, ids: (p.join || [p.id]).filter(Boolean), text: p.text});
  heard.length = Math.min(heard.length, 8);
}
function say(parts, then){
  parts = [].concat(parts).filter(Boolean);
  if (nameClip) parts = parts.map(p => p.named ? {...p, join: [p.id, null]} : p); // "Well done," + "Moa!"
  const text = parts.map(p => p.text).filter(Boolean).join(' ');
  $$('.say').forEach(e => e.textContent = text);
  if (S.voice) parts.forEach(remember);
  const my = ++tok; let done = false, tm, i = 0;
  const fin = () => { if (done) return; done = true; clearTimeout(tm); if (then && my===tok) then(); };
  player.pause();
  if (!S.voice){ if (then) tm = setTimeout(fin, 1300); return; }
  tm = setTimeout(fin, 3000 + text.length*120);
  const next = async () => {
    if (my !== tok) return;
    if (i >= parts.length) return fin();
    const p = parts[i++]; let moved = false, src = clipUrl(p.id);
    const go = () => { if (!moved){ moved = true; next(); } };
    if (p.join){ try { src = await joined(p.join); } catch {} if (my !== tok) return; }
    player.onended = go; player.onerror = go;
    player.src = src; player.playbackRate = S.speed;
    player.play().catch(go);
  };
  next();
}

/* ---------- sound effects ---------- */
let ac = null;
function tone(f, at, dur, type='sine', vol=.16){
  if (!S.sfx || !ac) return;
  const o = ac.createOscillator(), gn = ac.createGain(), t = ac.currentTime + at;
  o.type = type; o.frequency.value = f;
  gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t+.02); gn.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.connect(gn).connect(ac.destination); o.start(t); o.stop(t+dur+.05);
}
const sfxYes = () => [523,659,784,1047].forEach((f,i)=>tone(f,i*.07,.22,'triangle',.1));
const sfxNo  = () => { tone(300,0,.18,'sine',.1); tone(240,.12,.22,'sine',.1); };
const sfxWin = () => [523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,i*.13,.3,'triangle',.1));

/* ---------- sparkle ---------- */
function burst(n, el){
  if (reduced) n = Math.ceil(n/4);
  const r = el ? el.getBoundingClientRect() : {left:innerWidth/2, top:innerHeight/2, width:0, height:0};
  const x = r.left + r.width/2, y = r.top + r.height/2;
  for (let i=0;i<n;i++){
    const s = document.createElement('span'); s.textContent = pick(look().fx);
    s.style.left = x+'px'; s.style.top = y+'px'; $('#fx').append(s);
    const a = Math.random()*Math.PI*2, d = 140 + Math.random()*260;
    s.animate([{transform:'translate(-50%,-50%) scale(.3)', opacity:1},
               {transform:`translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d - 60}px)) scale(1.3) rotate(${Math.random()*360}deg)`, opacity:0}],
              {duration:900+Math.random()*700, easing:'cubic-bezier(.1,.7,.3,1)'}).onfinish = () => s.remove();
  }
}
function rain(n){
  if (reduced) n = Math.ceil(n/5);
  for (let i=0;i<n;i++){
    const s = document.createElement('span'); s.textContent = pick(look().fx);
    s.style.left = Math.random()*100+'%'; s.style.top = '-50px'; $('#fx').append(s);
    s.animate([{transform:'translateY(0) rotate(0)'},{transform:`translateY(${innerHeight+120}px) rotate(${Math.random()*720-360}deg)`}],
              {duration:2200+Math.random()*2600, delay:Math.random()*1800, easing:'linear'}).onfinish = () => s.remove();
  }
}

/* ---------- screens ---------- */
let screen = 'start', G = null, lastId = 'alfabet';
function show(id){
  screen = id; $$('.screen').forEach(s => s.classList.toggle('on', s.id===id));
  document.activeElement?.blur?.();
}
function applyLang(){
  T = LANGS[S.lang]; ALPHA = [...T.alpha];
  document.documentElement.lang = S.lang; document.title = SEO[S.lang].title; syncAddress();
  $('#gameTitle').textContent = T.title;
  $$('[data-t]').forEach(e => e.textContent = T.ui[e.dataset.t]);
  $('#installSteps').innerHTML = T.ui.installSteps.map(([who, how]) => `<li><b>${who}:</b> ${how}</li>`).join('');
  $$('[data-ta]').forEach(e => e.setAttribute('aria-label', T.ui[e.dataset.ta]));
  $('#name').placeholder = T.ui.namePh;
  $('#privacyLink').href = 'privacy.html#' + S.lang;
  $('#langSeg').innerHTML = ['en','es','fr','pt','de','sv'].map(k => [k, LANGS[k]]).map(([k, L]) => `<button data-lang="${k}" aria-pressed="${k===S.lang}">${L.label || {sv:'Svenska', en:'English'}[k]}</button>`).join('');
  $('#seoH').textContent = SEO[S.lang].h; $('#seoP').textContent = SEO[S.lang].p;
  $('#seoAlso').replaceChildren(SEO[S.lang].also + ' ', ...PAGE_LANGS.filter(l => l !== S.lang).flatMap((l, i) => { const a = document.createElement('a'); a.href = pagePath(l); a.lang = a.hreflang = l; a.dataset.lang = l; a.textContent = LANGS[l].label || {sv:'Svenska', en:'English'}[l]; return i ? [' · ', a] : [a]; }));
  $('#aboutList').innerHTML = GAME_META.map((gm,i)=> !T.games[i] ? '' : `<li>${gm.em} <b>${T.games[i][0]}</b> – ${T.games[i][1]}</li>`).join('');
  refresh();
}
// The game cards; the word games also show their word level and how far it has come.
function renderCards(){
  // Numbered in the order they are shown: the letter games first, then the word games.
  const shownIds = GAME_META.filter((gm,i) => T.games[i]).map(gm => gm.id);
  const order = [...shownIds.filter(id => !WORD_GROUP.includes(id)), ...shownIds.filter(id => WORD_GROUP.includes(id))];
  const cards = GAME_META.map((gm,i) => {
    if (!T.games[i]) return ''; // a game this language does not have yet
    const pr = PROG_GAMES.includes(gm.id) ? prog(gm.id) : null;
    return `<button class="game" data-g="${gm.id}" style="background:var(${gm.c})"><span class="num">${order.indexOf(gm.id)+1}</span><span class="em">${gm.em}</span>${T.games[i][0]}<small>${T.games[i][1]}</small>${pr ? `<small class="lv">${T.ui.wordLevel(pr.lv, pr.done.length)}</small>` : ''}</button>`;
  });
  $('#games').innerHTML = cards.filter((_,i) => !WORD_GROUP.includes(GAME_META[i].id)).join('');
  $('#games2').innerHTML = cards.filter((_,i) => WORD_GROUP.includes(GAME_META[i].id)).join('');
}
function refresh(){
  const p = T.poss(nm());
  renderCards(); renderPlayers();
  // Without a name, languages where "friend's letters" reads badly say "My letters" instead.
  $('#homeTitle').textContent = !S.name && T.homePlain || T.homeTitle(p);
  $('#shelfTitle').textContent = !S.name && T.shelfPlain || T.shelfTitle(p);
  $('#winTitle').textContent = shown(T.g.hurra);
  $$('.starcount').forEach(e => e.textContent = S.stars);
  $$('[data-case]').forEach(b => b.setAttribute('aria-pressed', b.dataset.case===S.letterCase));
  $$('.voices:not(.looks):not(#players)').forEach(box => box.innerHTML = VOICE_EM.map((_,i)=>`<button class="voice" data-voice="${i}" aria-pressed="${i===S.voiceChar}"><span>${voiceEm(i)}</span>${voiceName(i)}</button>`).join(''));
  $$('[data-level]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.level===S.level));
  $$('[data-age]').forEach(b => b.setAttribute('aria-pressed', +b.dataset.age===S.age));
  const lookButtons = LOOKS.map((l,i) => `<button class="voice" data-look="${l.id}" aria-pressed="${l.id===look().id}"><span>${l.em}</span>${T.ui.looks[i]}</button>`).join('');
  $$('.looks').forEach(box => box.innerHTML = lookButtons);
  applyLook();
  $('#levelChip').textContent = T.ui.levelChip(S.level);
  $$('.who').forEach(e => e.textContent = voiceEm(S.voiceChar));
  const st = $('#stickers');
  st.classList.toggle('none', !S.stickers.length);
  st.textContent = S.stickers.length ? S.stickers.slice(-45).join('') : T.ui.noStickers;
  $('#optVoice').checked = S.voice; $('#optSfx').checked = S.sfx; $('#optKb').checked = S.kb; $('#optRate').value = S.speed;
  buildKb();
}
function goHome(first){
  G = null; stopClock(); clearStage(); show('home'); refresh(); preloadLetters();
  // With a recorded name the greeting is said as "Hi" + name + the rest.
  if (first && nameClip && T.g.hi) say({id:'greet', text:shown(T.g.greet), join:['hi', null, 'greetRest']});
  else say(g(first ? 'greet' : 'homeAgain'));
}
function begin(){
  syncName(); draft = false; save();
  try { ac = ac || new (window.AudioContext||window.webkitAudioContext)(); ac.resume?.(); } catch {}
  // Wait briefly for the name clip, so the very first greeting can use it.
  Promise.race([loadNameClip(), new Promise(r => setTimeout(r, 1500))]).then(() => goHome(true));
}

document.addEventListener('click', e => { const b = e.target.closest('[data-g]'); if (b) startGame(b.dataset.g); });

// Games answered by tapping a choice instead of typing.
const usesChoices = () => G && (['lyssna','para','bildord','lasord','rimma','memory'].includes(G.id) || (G.id==='forsta' && S.level<=3));
function buildKb(){
  const kb = $('#kb');
  kb.hidden = !S.kb || usesChoices();
  const c = S.letterCase==='lower' ? 'lower' : 'upper';
  kb.innerHTML = T.kb.map(r => `<div class="kr">${[...r].map(L=>`<button class="key" data-k="${L}">${disp(L,c)}</button>`).join('')}</div>`).join('');
}
$('#kb').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
$('#choices').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });

/* ---------- games ---------- */
function nameWord(){
  const w = S.name.toLocaleUpperCase(S.lang);
  return w.length>=2 && w.length<=10 && [...w].every(ch => ALPHA.includes(base(ch))) ? w : null;
}
/* ---------- word levels: 20 levels of 20 words, one progress per game and language ---------- */
function prog(id){ const a = (S.prog[S.lang] ||= {}); return (a[id] ||= {lv:1, done:[]}); }
// Words for one round: mostly words of the current level that have not been done yet,
// filled up with words from this and earlier levels for repetition.
function pickWords(id, n){
  const p = prog(id), all = T.words.map(([w,e],wi)=>({w,e,wi}));
  const lo = (p.lv-1)*PER_LEVEL, unlocked = all.slice(0, lo+PER_LEVEL);
  const fresh = shuffle(all.slice(lo, lo+PER_LEVEL).filter(x => !p.done.includes(x.wi)));
  const chosen = fresh.slice(0, Math.max(1, Math.ceil(n*2/3)));
  const rest = shuffle(unlocked.filter(x => !chosen.includes(x)));
  return shuffle([...chosen, ...rest.slice(0, n - chosen.length)]);
}
// A word done right counts once towards its level; when all 20 are done the game moves up a level.
function markWord(it){
  if (!G || it.isName || it.wi == null) return;
  const p = prog(G.id), lo = (p.lv-1)*PER_LEVEL;
  if (it.wi < lo || it.wi >= lo+PER_LEVEL || p.done.includes(it.wi)) return;
  p.done.push(it.wi);
  if (p.done.length >= PER_LEVEL && p.lv < MAX_WORD_LEVEL){ p.lv++; p.done = []; G.leveled = p.lv; }
  save();
}
function startGame(id){
  lastId = id;
  G = {id, i:0, pos:0, wrong:0, lock:false, errs:0, t0:0};
  stopClock();
  $('#timer').hidden = id!=='alfabet'; $('#timer').textContent = '⏱ 0:00';
  clearStage();
  if (id==='memory') return startMemory();
  if (id==='fanga') return startFanga();
  if (id==='alfabet') G.items = ALPHA.map(L=>({L}));
  else if (id==='ord'){
    const me = nameWord();
    const ws = [...(me ? [{w:me, e:'💖', isName:true}] : []), ...pickWords(id, ORD_WORDS[S.level])];
    G.items = ws.map(x=>({...x, c:pickCase()}));
  } else if (WORD_GAMES.includes(id)){
    const unlocked = T.words.slice(0, prog(id).lv*PER_LEVEL).map(([w,e],wi)=>({w,e,wi}));
    G.items = pickWords(id, WORD_ROUNDS[S.level]).map(x => {
      const it = {...x, c:pickCase()}, first = base(x.w[0]);
      // Other words to choose between, taken from the levels reached so far;
      // from difficulty 4 words with the same first letter come first.
      const others = shuffle(unlocked.filter(o => o.wi!==x.wi));
      if (!LV().show) others.sort((a,b) => (base(b.w[0])===first) - (base(a.w[0])===first));
      it.opts = shuffle([x, ...others.slice(0, LV().choices - 1)]);
      it.letters = shuffle([first, ...shuffle(ALPHA.filter(l => l!==first)).slice(0, LV().choices - 1)]);
      // Missing letters: the first one on difficulty 1-2, any one on 3, two on 4-5.
      const idx = shuffle([...x.w].map((_,i)=>i));
      it.gaps = S.level<=2 ? [0] : idx.slice(0, S.level>=4 && x.w.length>=3 ? 2 : 1).sort((a,b)=>a-b);
      return it;
    });
  } else if (id==='rimma'){
    G.items = rhymeItems();
  } else G.items = shuffle(ALPHA).slice(0, LV().rounds).map(L=>({L,c:pickCase()}));
  show('game'); buildKb(); render();
  say([g('intro'+cap(id)), ...prompt()]);
}
const item = () => G.items[G.i];
function target(){
  const it = item();
  switch (G.id){
    case 'ord': return it.w[G.pos];
    case 'bildord': case 'lasord': return String(it.wi); // the choice buttons carry the word's index
    case 'forsta': return base(it.w[0]);
    case 'saknad': return it.w[it.gaps[G.pos]];
    case 'rimma': return 'r' + it.ans.ri; // the choice buttons carry the rhyme word's number
    default: return it.L;
  }
}
// The word itself, spoken. On screen it is hidden where it would give the answer away.
const sayWord = (it, open) => ({id:`say_${it.wi}`, text: open ? T.perWord.say(it.w.toLowerCase()) : '…'});
const findKey = c => S.letterCase==='both' && c ? (c==='lower' ? 'findL' : 'findU') : 'find';

function prompt(){
  const it = item(), L = target();
  switch (G.id){
    case 'alfabet':
      if (!LV().say) return []; // from level 3 the voice no longer says which letter comes next
      if (G.i===0) return [perV('start',L)];
      if (G.i===ALPHA.length-1) return [g('alphaLast')];
      return [perV('next',L)];
    case 'hitta': case 'lyssna': return [perV(findKey(it.c), L)];
    case 'para': return [perV(it.c==='upper' ? 'pairU' : 'pairL', L)];
    case 'ord':
      if (G.pos>0) return LV().say ? [perV('next',L)] : [];
      // The word is introduced either as one sentence ("Spell the word sun.") or as a question followed by the word.
      return [...(it.isName ? [g('nameStart')] : (!T.g.askOrd || vary('ordLead', 3)===0) ? [wordPart('word',it)] : [g('askOrd'), sayWord(it, LV().show)]), LV().say && perV('start',L)];
    // Word games: the voice reads the word aloud on the easier levels only.
    case 'bildord': return [g('askBildord'), LV().say && sayWord(it)];
    case 'lasord': return [g('askLasord'), LV().say && sayWord(it, true)];
    case 'forsta': return [g('askForsta'), sayWord(it)];
    case 'saknad': return G.pos>0 ? [] : [g('askSaknad'), LV().show && sayWord(it)];
    // Rhyme: the question, the word, and on the easier levels each of the choices read aloud.
    case 'rimma': return [g('askRimma'), rim(it.q, true), ...(S.level<=3 ? it.opts.map(o => rim(o)) : [])];
    case 'memory': return [g('askMemory')];
    case 'fanga': return [g('askFanga')];
  }
}

function render(){
  const it = item(), card = $('#card'), ch = $('#choices'), id = G.id;
  G.wrong = 0; G.revealed = false;
  card.className = ''; ch.innerHTML = ''; ch.hidden = true;
  $$('.hint').forEach(e=>e.classList.remove('hint'));
  const hide = !LV().show;
  if (id==='alfabet') card.textContent = hide ? '?' : S.letterCase==='both' ? it.L+' '+it.L.toLowerCase() : disp(it.L,S.letterCase);
  if (id==='hitta') card.textContent = hide ? '👂' : disp(it.L,it.c);
  if (id==='lyssna' || id==='para'){
    card.classList.add('compact');
    card.textContent = id==='lyssna' ? '👂' : disp(it.L,it.c);
    it.opts = it.opts || shuffle([it.L, ...shuffle(ALPHA.filter(x=>x!==it.L)).slice(0, LV().choices - 1)]);
    const oc = id==='para' ? (it.c==='upper'?'lower':'upper') : it.c;
    ch.hidden = false;
    ch.innerHTML = it.opts.map((L,i)=>`<button class="choice" data-k="${L}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(L,oc)}</button>`).join('');
  }
  if (id==='ord'){
    card.classList.add('compact');
    card.innerHTML = `<span class="pic">${it.e}</span><div class="slots" style="--n:${it.w.length}">${[...it.w].map((L,i)=>`<span class="slot ${i<G.pos?'done':i===G.pos?'now':''}">${hide && i>=G.pos ? '' : disp(L,it.c)}</span>`).join('')}</div>`;
  }
  const wordSlots = (cls, txt) => `<div class="slots" style="--n:${it.w.length}">${[...it.w].map((L,i)=>`<span class="slot ${cls(i)}">${txt(i) ? disp(L,it.c) : ''}</span>`).join('')}</div>`;
  if (id==='bildord'){
    card.classList.add('compact'); card.textContent = it.e;
    ch.hidden = false;
    ch.innerHTML = it.opts.map((o,i)=>`<button class="choice word" data-k="${o.wi}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(o.w,it.c)}</button>`).join('');
  }
  if (id==='lasord'){
    card.classList.add('compact','wordcard'); card.style.setProperty('--n', it.w.length); card.textContent = disp(it.w,it.c);
    ch.hidden = false;
    ch.innerHTML = it.opts.map((o,i)=>`<button class="choice" data-k="${o.wi}" style="background:var(${COLORS[(i*2+G.i)%6]})">${o.e}</button>`).join('');
  }
  if (id==='forsta'){
    card.classList.add('compact');
    // Level 1 shows the whole word under the picture; after that the child has to listen.
    card.innerHTML = `<span class="pic">${it.e}</span>` + (S.level===1 ? wordSlots(i => i===0 ? 'now' : '', () => true) : '');
    if (usesChoices()){
      ch.hidden = false;
      ch.innerHTML = it.letters.map((L,i)=>`<button class="choice" data-k="${L}" style="background:var(${COLORS[(i*2+G.i)%6]})">${disp(L,it.c)}</button>`).join('');
    }
  }
  if (id==='saknad'){
    card.classList.add('compact');
    const gi = i => it.gaps.indexOf(i); // -1 for letters that are given
    card.innerHTML = `<span class="pic">${it.e}</span>` + wordSlots(i => gi(i)<0 ? 'given' : gi(i)<G.pos ? 'done' : gi(i)===G.pos ? 'now' : '', i => gi(i)<0 || gi(i)<G.pos);
  }
  if (id==='rimma'){
    card.classList.add('compact','wordcard'); card.style.setProperty('--n', it.q.w.length);
    card.innerHTML = `<span class="pic">${it.q.e}</span>${disp(it.q.w,it.c)}`;
    ch.hidden = false;
    // Pictures help on levels 1-3 (level 3 shows only the picture); levels 4-5 have to be read.
    ch.innerHTML = it.opts.map((o,i)=>`<button class="choice word rhyme" data-k="r${o.ri}" style="background:var(${COLORS[(i*2+G.i)%6]})">${S.level<=3 ? `<span class="pic">${o.e}</span>` : ''}${S.level===3 ? '' : disp(o.w,it.c)}</button>`).join('');
  }
  card.classList.toggle('tap', card.textContent==='👂');
  const p = $('#progress');
  if (id==='alfabet') p.innerHTML = ALPHA.map((L,i)=>`<span class="dot ${i<G.i?'done':i===G.i?'now':''}" ${i<G.i?`style="background:var(${COLORS[i%6]})"`:''}>${hide && i>=G.i ? '' : disp(L,S.letterCase==='lower'?'lower':'upper')}</span>`).join('');
  else p.innerHTML = pipsHtml(G.items.length, G.i);
  // On the easiest level the right key is lit from the start in the typing games.
  if (LV().hintAt===0 && ['alfabet','hitta','ord','saknad'].includes(id)) hint();
}

function hint(){
  const t = base(target());
  $$(`#kb [data-k="${t}"], #choices [data-k="${t}"]`).forEach(e=>e.classList.add('hint'));
}
// After enough mistakes: light up the key, and on the levels that hide the letter, show it.
function reveal(){
  const t = target(), it = item();
  hint();
  if (LV().show) return;
  G.revealed = true;
  if (G.id==='alfabet' || G.id==='hitta'){ const c = $('#card'); c.textContent = disp(t, it.c || (S.letterCase==='lower' ? 'lower' : 'upper')); c.classList.remove('tap'); }
  if (G.id==='ord'){ const s = $('#card .slot.now'); if (s) s.textContent = disp(t, it.c); }
}
function flash(cls){ const c = $('#card'); c.classList.remove('yay','no'); void c.offsetWidth; c.classList.add(cls); }
function showStars(){ $$('.starcount').forEach(e => e.textContent = S.stars); }

function press(k){
  if (screen!=='game' || !G || G.lock) return;
  if (G.id==='fanga') return catchLetter(base(k));
  if (G.id==='memory') return;
  const t = target(), it = item();
  if (base(k) !== base(t)){
    G.wrong++; G.errs++; sfxNo(); flash('no');
    const helped = G.wrong >= Math.max(1, LV().hintAt);
    if (helped) reveal();
    // Where the letter is hidden, the answer is only said aloud once it has been revealed.
    const tell = LV().show || helped || (G.id!=='alfabet' && G.id!=='ord');
    let follow = tell && !WORD_GAMES.includes(G.id) && G.id!=='rimma' && per(G.id==='hitta' || G.id==='lyssna' ? findKey(it.c) : 'find', t);
    // In the word games the letter is only named once the help has appeared.
    if ((G.id==='forsta' || G.id==='saknad') && helped) follow = per('find', t, true);
    say([g('wrong'), follow]);
    return;
  }
  if (G.id==='alfabet' && !G.t0){ G.t0 = performance.now(); startClock(); }
  S.stars++; save(); showStars(); sfxYes(); flash('yay'); burst(12, $('#card'));
  const last = G.i === G.items.length-1;
  if (G.id==='alfabet'){
    if (last){ G.result = {ms: performance.now() - G.t0 + G.errs*PENALTY, errs: G.errs}; stopClock(); $('#timer').textContent = '⏱ ' + fmtTime(G.result.ms);
      G.lock = true; $$('#progress .dot').forEach((d,i)=>{ d.className='dot done'; d.style.background=`var(${COLORS[i%6]})`; }); say([per('L',t,true), g('long')], win); return; }
    G.i++; render(); say([g('short'), ...prompt()]); return;
  }
  if (G.id==='ord'){
    G.pos++;
    if (G.pos < it.w.length){ render(); say([g('short'), ...prompt()]); return; }
    G.lock = true; markWord(it); render(); burst(16, $('#card'));
    say(it.isName ? [g('wroteName'), g('long')] : (!T.g.wroteMore || vary('ordDone', 2)===0) ? [wordPart('wrote',it), g('long')] : [sayWord(it, true), g('wroteMore')], () => advance(last)); return;
  }
  if (G.id==='saknad'){
    G.pos++;
    if (G.pos < it.gaps.length){ render(); say(g('short')); return; }
    G.lock = true; markWord(it); render(); burst(16, $('#card'));
    say([sayWord(it, true), g('long')], () => advance(last)); return;
  }
  G.lock = true;
  if (WORD_GAMES.includes(G.id)) markWord(it);
  if (G.id==='lyssna') $('#card').textContent = disp(it.L,it.c);
  $$('#choices .choice').forEach(b => { if (b.dataset.k!==t) b.style.opacity = .25; });
  // After a right answer in a word game the voice says the word, so sound and spelling meet.
  say(G.id==='rimma' ? [rim(it.q), rim(it.ans), g('long')] : [WORD_GAMES.includes(G.id) && sayWord(it, true), g('long')], () => advance(last));
}
function advance(last){
  if (!G) return;
  if (last) return win();
  G.i++; G.pos = 0; G.lock = false; render(); say(prompt());
}
function win(){
  if (!G) return;
  const id = G.id, res = G.result, leveled = G.leveled; G = null; clearStage();
  const st = pick(STICKERS); S.stickers.push(st); S.stars += 5;
  $('#result').hidden = !res; $('#win').classList.toggle('timed', !!res);
  if (res){
    const mark = Date.now(), list = (S.boards[boardKey()] ||= []);
    list.push({name: nm(), ms: Math.round(res.ms), errors: res.errs, at: mark});
    list.sort((a,b) => a.ms - b.ms); list.splice(10);
    $('#yourTime').textContent = T.ui.yourTime(fmtTime(res.ms), res.errs) + (list[0].at===mark ? ' ' + T.ui.newBest : '');
    fillBoard($('#winBoard'), mark);
  }
  save();
  $('#prize').textContent = st;
  show('win'); refresh(); sfxWin(); rain(70);
  const wl = $('#wordLevel'), pr = PROG_GAMES.includes(id) ? prog(id) : null;
  wl.hidden = !pr;
  if (pr) wl.textContent = leveled ? '⭐ ' + T.ui.newWordLevel(leveled) : T.ui.wordLevel(pr.lv, pr.done.length);
  say([g('hurra'), g('win'+cap(id)), leveled && g('levelUp'), g('winTail')]);
}

/* ---------- the stage for the games that do not use the big card ---------- */
function clearStage(){
  $('#sky').innerHTML = ''; $('#sky').hidden = true;
  $('#memory').innerHTML = ''; $('#memory').hidden = true;
  $('#card').hidden = false;
}
const pipIcon = i => { const set = PIPS[G && G.id] || ['⭐']; return set[i % set.length]; };
const pipsHtml = (total, done) => Array.from({length: total}, (_, i) => `<span class="pip ${i<done?'done':''}">${i<done?pipIcon(i):''}</span>`).join('');

/* ---------- rhyme ---------- */
// A rhyme word as a spoken part: "hus?" when it is the question, "Hus." otherwise.
const rim = (o, ask) => ({id:`rim_${o.ri}`, text: ask ? o.w.toLocaleLowerCase(S.lang) + '?' : T.g.rim[o.ri]});
function rhymeItems(){
  const groups = shuffle(T.rhymes), n = Math.min(WORD_ROUNDS[S.level], groups.length), nOpt = S.level===1 ? 2 : 3;
  return groups.slice(0, n).map(grp => {
    const [q, ans] = shuffle(grp);
    // Wrong answers come from other groups, one from each, so none of them rhymes.
    const others = shuffle(groups.filter(x => x!==grp)).slice(0, nOpt-1).map(x => pick(x));
    return {q, ans, opts: shuffle([ans, ...others]), c: pickCase()};
  });
}

/* ---------- memory ---------- */
const MEM_PAIRS = [0, 3, 4, 6, 8, 10]; // pairs on difficulty 1-5
function startMemory(){
  const words = pickWords('memory', MEM_PAIRS[S.level]).map(x => ({...x, c: pickCase()}));
  // Each word gives two cards: its picture, and the written word (with a small picture on difficulty 1-2).
  const cards = shuffle(words.flatMap(x => [{x, pic:true}, {x, pic:false}]));
  G.items = words; G.mem = {cards, open: [], found: 0};
  const box = $('#memory');
  box.style.setProperty('--cols', cards.length<=6 ? 3 : cards.length<=16 ? 4 : 5);
  box.innerHTML = cards.map((cd,i) => `<button class="mcard" data-m="${i}"><span class="back">${look().em}</span><span class="front">${cd.pic ? `<span class="pic">${cd.x.e}</span>` : `${S.level<=2 ? `<span class="pic small">${cd.x.e}</span>` : ''}<span class="mw" style="--n:${cd.x.w.length}">${disp(cd.x.w, cd.x.c)}</span>`}</span></button>`).join('');
  $('#card').hidden = true; $('#choices').hidden = true; box.hidden = false;
  show('game'); buildKb();
  $('#progress').innerHTML = pipsHtml(words.length, 0);
  say([g('introMemory'), g('askMemory')]);
}
function memTap(i){
  if (!G || G.id!=='memory' || G.lock) return;
  const m = G.mem, cd = m.cards[i], my = G;
  if (cd.done || m.open.includes(i)) return;
  const el = n => $(`#memory [data-m="${n}"]`);
  el(i).classList.add('open'); m.open.push(i);
  // The voice names pictures always, written words only on difficulty 1-3, so that 4-5 have to be read.
  if (cd.pic || S.level<=3) say(sayWord(cd.x, true));
  if (m.open.length < 2) return;
  const [a, b] = m.open; m.open = [];
  if (m.cards[a].x === m.cards[b].x){
    m.cards[a].done = m.cards[b].done = true; m.found++;
    [a, b].forEach(n => el(n).classList.add('found'));
    S.stars++; save(); showStars(); sfxYes(); burst(10, el(i)); markWord(cd.x);
    $('#progress').innerHTML = pipsHtml(G.items.length, m.found);
    if (m.found === G.items.length){ G.lock = true; setTimeout(() => { if (G===my) win(); }, 1600); }
  } else {
    G.lock = true; sfxNo();
    setTimeout(() => { if (G!==my) return; [a, b].forEach(n => el(n).classList.remove('open')); G.lock = false; }, 1300);
  }
}
$('#memory').addEventListener('click', e => { const b = e.target.closest('[data-m]'); if (b) memTap(+b.dataset.m); });

/* ---------- catch the letter ---------- */
// n letters to catch, how many fall at once, and seconds from top to bottom, for difficulty 1-5.
const FANGA = [null, {n:8, live:1, secs:14}, {n:10, live:1, secs:11}, {n:12, live:2, secs:10}, {n:15, live:2, secs:8}, {n:20, live:3, secs:7}];
function startFanga(){
  const cfg = FANGA[S.level], my = G;
  G.items = Array.from({length: cfg.n}, () => ({})); G.fang = {caught: 0, cfg};
  $('#card').hidden = true; $('#choices').hidden = true; $('#sky').hidden = false;
  show('game'); buildKb();
  $('#progress').innerHTML = pipsHtml(cfg.n, 0);
  say([g('introFanga'), g('askFanga')], () => { if (G===my) spawnDrops(); });
}
function spawnDrops(){
  if (!G || G.id!=='fanga' || G.lock) return;
  const sky = $('#sky'), f = G.fang, my = G;
  const falling = () => [...sky.children].filter(d => !d.classList.contains('gone'));
  while (falling().length < f.cfg.live && f.caught + falling().length < f.cfg.n){
    const taken = falling().map(d => d.dataset.k), L = pick(ALPHA.filter(x => !taken.includes(x)));
    const d = document.createElement('button');
    d.className = 'drop'; d.dataset.k = L; d.textContent = disp(L, pickCase());
    d.style.left = (6 + Math.random()*76) + '%'; d.style.background = `var(${pick(COLORS)})`;
    d.style.animationDuration = f.cfg.secs + 's';
    // A letter that lands is not counted as a mistake; another one simply follows.
    d.addEventListener('animationend', () => { d.remove(); setTimeout(() => { if (G===my) spawnDrops(); }, 500); });
    sky.append(d);
    // With one letter at a time the voice names it, which helps the youngest.
    if (f.cfg.live === 1) say(per('L', L, true));
  }
}
function catchLetter(k){
  if (!G || G.id!=='fanga') return;
  const sky = $('#sky'), d = [...sky.children].find(x => x.dataset.k === k && !x.classList.contains('gone'));
  if (!d){ sfxNo(); return; }
  const f = G.fang, my = G, r = d.getBoundingClientRect(), s0 = sky.getBoundingClientRect();
  burst(8, d); sfxYes(); S.stars++; save(); showStars();
  d.style.top = (r.top - s0.top) + 'px'; d.classList.add('gone'); // freeze it where it was caught
  f.caught++; $('#progress').innerHTML = pipsHtml(f.cfg.n, f.caught);
  if (f.caught >= f.cfg.n){ G.lock = true; say(g('long'), () => { if (G===my) win(); }); return; }
  if (f.cfg.live > 1 && f.caught % 3 === 0) say(g('short'));
  setTimeout(() => { if (G===my) spawnDrops(); }, 400);
}
$('#sky').addEventListener('click', e => { const d = e.target.closest('.drop'); if (d && G && !G.lock) catchLetter(d.dataset.k); });

/* ---------- buttons & keys ---------- */
$('#name').value = S.name;
$('#go').onclick = begin;
$('#toHome').onclick = () => goHome();
$('#winHome').onclick = () => goHome();
$('#replay').onclick = () => startGame(lastId);
const repeat = () => { if (!G || G.lock) return; const p = prompt().filter(Boolean); if (p.length) say(p); };
$('#again').onclick = repeat;
$('#card').onclick = () => { if ($('#card').classList.contains('tap')) repeat(); };
const boardDlg = $('#boardDlg');
$('#openBoard').onclick = () => {
  $('#boardTitle').textContent = `${T.ui.boardH} (${T.ui.levelChip(S.level)})`;
  $('#boardEmpty').hidden = fillBoard($('#boardList')) > 0;
  boardDlg.showModal();
};
$('#closeBoard').onclick = () => boardDlg.close();

// Feedback goes by ordinary email from the visitor's own mail app; the page itself sends nothing.
const fbDlg = $('#feedbackDlg'), FEEDBACK_TO = 'hello@letteradventures.com';
// Opened from the settings, and from the flag inside a game, where a phrase that sounded wrong was just heard.
const openFeedback = fromGame => {
  dlg.close();$('#fbText').placeholder = T.ui.fbPh; $('#fbCopy').textContent = T.ui.fbCopy;
  // What the voice said last, to tick if it sounded wrong.
  $('#fbHeard').hidden = !heard.length;
  $('#fbHeardList').replaceChildren(...heard.map((h, i) => { const l = document.createElement('label'), c = document.createElement('input'); c.type = 'checkbox'; c.value = i; l.append(c, h.text); return l; }));
  fbDlg.showModal(); if (!fromGame || !heard.length) $('#fbText').focus();
};
$('#openFeedback').onclick = () => openFeedback(false);
$$('[data-report]').forEach(b => b.onclick = () => openFeedback(true));
$('#fbClose').onclick = () => fbDlg.close();
$('#fbSend').onclick = () => {
  // The child's name is deliberately left out; only language and difficulty are added, to help answer.
  // A ticked phrase is sent as the name of its sound clip, never as its text, which can hold the child's name.
  const clips = $$('#fbHeardList input:checked').flatMap(c => heard[c.value].ids.map(id => `clip ${heard[c.value].at} ${id}`));
  const body = `${$('#fbText').value.trim()}\n\n--\nLetter Adventures · ${S.lang} · ${T.ui.levelChip(S.level)}` + (clips.length ? '\n' + clips.join('\n') : '');
  const subject = clips.length ? 'Letter Adventures: pronunciation' : 'Letter Adventures: feedback';
  location.href = `mailto:${FEEDBACK_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
$('#fbCopy').onclick = async e => {
  try { await navigator.clipboard.writeText(FEEDBACK_TO); e.target.textContent = T.ui.fbCopied; }
  catch { const r = document.createRange(); r.selectNodeContents($('.addr')); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
};
$('#levelChip').onclick = () => $('#openSettings').click();
$('#installBtn').onclick = async () => {
  if (!installPrompt) return;
  installPrompt.prompt();
  try { await installPrompt.userChoice; } catch {}
  installPrompt = null; $('#installBtn').hidden = true;
};
showInstallState();
matchMedia('(display-mode: fullscreen), (display-mode: standalone)').addEventListener?.('change', showInstallState);
// The links to the other languages at the end of the about text change language the same way, without loading the page again.
$('#seoAlso').addEventListener('click', e => { const a = e.target.closest('[data-lang]'); if (!a) return; e.preventDefault(); syncName(); S.lang = a.dataset.lang; save(); applyLang(); loadNameClip(); scrollTo(0, 0); });
$('#langSeg').addEventListener('click', e => { const b = e.target.closest('[data-lang]'); if (!b) return; syncName(); S.lang = b.dataset.lang; save(); applyLang(); loadNameClip(); });

const dlg = $('#settings');
$('#openSettings').onclick = () => { askRemove(null); refresh(); $('#fullscreen').hidden = !document.fullscreenEnabled; dlg.showModal(); };
$('#closeSettings').onclick = () => dlg.close();
$('#changeName').onclick = () => { dlg.close(); G = null; stopClock(); tok++; player.pause(); show('start'); };
document.addEventListener('click', e => {
  const c = e.target.closest('[data-case]');
  if (c){ S.letterCase = c.dataset.case; save(); refresh(); if (!dlg.open) say(g('case'+cap(S.letterCase))); return; }
  const lv = e.target.closest('[data-level]');
  if (lv){ S.level = +lv.dataset.level; save(); refresh(); say({id:`level_${S.level-1}`, text:T.g.level[S.level-1]}); return; }
  const lk = e.target.closest('.looks [data-look]');
  if (lk){ if (screen==='start') syncName(); S.look = lk.dataset.look; save(); refresh(); say(voiceHello(S.voiceChar)); return; }
  const ag = e.target.closest('[data-age]');
  if (ag){ syncName(); S.age = +ag.dataset.age; S.level = S.age - 2; save(); refresh(); return; }
  const v = e.target.closest('[data-voice]');
  if (v){ if (screen==='start') syncName(); S.voiceChar = +v.dataset.voice; save(); refresh(); if (screen!=='start'){ preloadLetters(); loadNameClip(); } say(voiceHello(S.voiceChar)); }
});
$('#optVoice').onchange = e => { S.voice = e.target.checked; if (!S.voice) player.pause(); save(); };
$('#optSfx').onchange = e => { S.sfx = e.target.checked; save(); };
$('#optKb').onchange = e => { S.kb = e.target.checked; save(); buildKb(); };
$('#optRate').onchange = e => { S.speed = +e.target.value; save(); };
// Loads the page again, which fetches the newest version of the game. Nothing saved is lost.
$('#reload').onclick = () => location.reload();
$('#fullscreen').onclick = () => { (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen())?.catch?.(()=>{}); };
let armed = false;
// Removes everything the game has saved on this device: name, age, settings, stars, stickers and top lists.
let wipeArmed = false;
$('#wipe').onclick = e => {
  if (!wipeArmed){ wipeArmed = true; e.target.textContent = T.ui.setWipeArm; setTimeout(() => { if (wipeArmed){ wipeArmed = false; e.target.textContent = T.ui.setWipe; } }, 4000); return; }
  try { localStorage.removeItem(KEY); } catch {}
  location.reload();
};
// Choosing a saved name on the start screen, or typing one that is already saved, switches player.
$('#players').addEventListener('click', e => {
  const b = e.target.closest('[data-player]'); if (!b) return;
  choosePlayer(b.dataset.player);
});
// While a name is typed, the player it names is the one chosen: a saved player when the name is
// one, otherwise a new player (so no saved name stays marked above the field).
$('#name').addEventListener('input', () => {
  const lang = S.lang;
  syncName(); save();
  if (S.lang !== lang) applyLang(); else refresh();
});
// On the home screen a tap on another name switches straight to that player and greets them.
$('#homePlayers').addEventListener('click', e => {
  if (e.target.closest('#addPlayer')){ // the start screen with an empty name; the player who was playing is kept
    G = null; stopClock(); tok++; player.pause();
    $('#name').value = ''; syncName(); save(); show('start'); refresh(); $('#name').focus();
    return;
  }
  const b = e.target.closest('[data-player]'); if (!b || playerKey(b.dataset.player) === playerKey(S.name)) return;
  tok++; player.pause();
  choosePlayer(b.dataset.player);
  Promise.race([loadNameClip(), new Promise(r => setTimeout(r, 1500))]).then(() => goHome(true));
});
// Removes a saved player, with everything saved under that name. So that a child does not do it
// by accident, the player's name has to be typed first.
function askRemove(name){
  removing = name;
  $('#removeGate').hidden = !name; $('#removeName').value = ''; $('#removeGo').disabled = true;
  if (name) $('#removeAsk').textContent = T.ui.setRemoveType(name);
  $$('#removeList .player').forEach(b => b.setAttribute('aria-pressed', b.dataset.player === removing));
}
$('#removeList').addEventListener('click', e => {
  const b = e.target.closest('[data-player]'); if (!b) return;
  askRemove(b.dataset.player === removing ? null : b.dataset.player);
  if (removing) $('#removeName').focus();
});
$('#removeName').addEventListener('input', e => { $('#removeGo').disabled = !removing || playerKey(e.target.value) !== playerKey(removing); });
$('#removeGo').onclick = () => {
  if (!removing || playerKey($('#removeName').value) !== playerKey(removing)) return;
  const key = playerKey(removing), current = key === playerKey(S.name);
  askRemove(null);
  delete S.profiles[key];
  if (!current){ save(); refresh(); return; }
  Object.assign(S, NEW_PLAYER(), {name: ''}); draft = true;
  save(); dlg.close(); G = null; stopClock(); tok++; player.pause();
  $('#name').value = ''; show('start'); refresh();
};
$('#reset').onclick = e => {
  if (!armed){ armed = true; e.target.textContent = T.ui.setResetArm; setTimeout(()=>{ if (armed){ armed=false; e.target.textContent=T.ui.setReset; } }, 4000); return; }
  S.stars = 0; S.stickers = []; save(); refresh(); armed = false; e.target.textContent = T.ui.setResetDone;
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || dlg.open || boardDlg.open || fbDlg.open) return;
  if (screen==='start'){ if (e.key==='Enter'){ e.preventDefault(); begin(); } return; }
  if (e.key==='Escape'){ if (screen!=='home') goHome(); return; }
  if (screen==='home'){ const n = e.key.length===1 ? '123456789'.indexOf(e.key) : -1; if (n>=0 && T.games[n]){ e.preventDefault(); startGame(GAME_META[n].id); } return; }
  if (screen==='win'){ if (e.key==='Enter' || e.key===' '){ e.preventDefault(); startGame(lastId); } return; }
  if (screen==='game'){
    if (e.key===' ' || e.key==='Enter'){ e.preventDefault(); repeat(); return; }
    const k = base(e.key.toLocaleUpperCase(S.lang));
    if (k.length===1 && ALPHA.includes(k)){ e.preventDefault(); press(k); }
  }
});

/* ---------- no zooming ----------
   Small hands pinch, double-tap and ctrl-scroll by accident, and a zoomed game is hard to get
   back from. The viewport and touch-action settings in index.html cover most browsers; these
   handlers cover the rest (Safari's pinch gesture, two-finger moves, ctrl+wheel, ctrl+plus/minus). */
['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), {passive: false}));
document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, {passive: false});
document.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, {passive: false});
document.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault(); });
let lastTap = 0;
document.addEventListener('touchend', e => { const now = Date.now(); if (now - lastTap < 350 && !e.target.closest('button, input, textarea, select, a')) e.preventDefault(); lastTap = now; }, {passive: false});

applyLang();
if (!S.name && matchMedia('(pointer:fine)').matches) $('#name').focus();
})();
