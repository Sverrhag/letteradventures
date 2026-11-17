// Turns tools/adventure/content.txt into the data of the animal adventure.
//
//   node tools/adventure/build.mjs
//
// Writes <game folder>/data.js (what the game loads) and tools/adventure/clips.json (what
// tools/adventure/record.py records). Stops if a sentence uses a word that no level has taught yet,
// so that the course never asks for something it has not shown.
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, '..', '..');
export const GAME = 'zoo-b6cec90c';

// The name of a clip: the same sum in the game (game.js, clipId).
export const clipId = s => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(16).padStart(8, '0') + s.length.toString(36); };
// What is said for a Swedish text: "en/ett (före a, e)" is said as "en, ett".
export const svSaid = s => s.replace(/\s*\([^)]*\)/g, '').replace(/\//g, ', ').trim();
const tokens = s => s.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean);

const data = { praise: [], praiseSv: [], streak: {}, inst: {}, ui: {}, named: {}, perk: {}, facts: [], saga: [], worlds: [], levels: [] }, known = new Set(), problems = [];
let level = null;
const knows = t => known.has(t) || [t.replace(/s$/, ''), t.replace(/es$/, ''), t.replace(/ing$/, ''), t.replace(/ing$/, 'e')].some(b => b !== t && known.has(b));
for (const raw of readFileSync(join(here, 'content.txt'), 'utf8').split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line[0] === '#') continue;
  const kind = line[0], cells = line.slice(2).split('|').map(c => c.trim());
  if (kind === 'p') data.praise.push(cells);
  else if (kind === 'v') data.praiseSv.push(cells[0]);
  else if (kind === 'k') data.streak[cells[0]] = cells.slice(1);
  else if (kind === 'i') (data.inst[cells[0]] = data.inst[cells[0]] || []).push(cells[1]);
  else if (kind === 'u') (data.ui[cells[0]] = data.ui[cells[0]] || []).push(cells[1]);
  else if (kind === 'f') data.facts.push(cells[0]);
  else if (kind === 'x') data.perk[cells[0]] = cells[1];
  else if (kind === 'n') (data.named[cells[0]] = data.named[cells[0]] || []).push(cells[1]);
  else if (kind === 'e') data.saga.push(line.slice(2).trim());
  else if (kind === 'W') data.worlds.push({ name: cells[0], em: cells[1] });
  else if (kind === 'L') data.levels.push(level = { w: data.worlds.length - 1, title: cells[0], words: [], sents: [] });
  else if (kind === 'w') { level.words.push(cells); tokens(cells[0]).forEach(t => known.add(t)); }
  else if (kind === 's') { level.sents.push(cells); for (const t of tokens(cells[0])) if (!knows(t)) problems.push(`level ${data.levels.length} "${cells[0]}": "${t}" has not been taught`); }
  else problems.push('unknown line: ' + line);
  if ('ws'.includes(kind) && (cells.length < 2 || !cells[0] || !cells[1])) problems.push('incomplete line: ' + line);
}
for (const [i, l] of data.levels.entries()) {
  if (l.sents.some(s => l.sents.filter(o => o[0] === s[0] || o[1] === s[1]).length > 1)) problems.push(`level ${i + 1}: a sentence is there twice`);
  if (l.words.some(w => l.words.filter(o => o[1] === w[1]).length > 1)) problems.push(`level ${i + 1}: two words with the same Swedish`);
}
if (data.saga.length !== data.levels.length) problems.push('the tale needs one chapter for each level');
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

writeFileSync(join(root, GAME, 'data.js'), '// Built by tools/adventure/build.mjs from tools/adventure/content.txt. Do not edit.\nwindow.AA_DATA = ' + JSON.stringify(data) + ';\n');
const clips = new Map();
const add = (k, text, word) => { const key = k + clipId(text); if (!clips.has(key)) clips.set(key, { k, id: clipId(text), text, word }); };
for (const [en] of [...data.praise, ...Object.values(data.streak)]) add('en', en, false);
for (const sv of [...data.praiseSv, ...Object.values(data.inst).flat(), ...Object.values(data.ui).flat(), ...data.facts, ...data.saga, ...Object.values(data.named).flat(), ...Object.values(data.perk)]) add('sv', sv, false);
for (const l of data.levels) {
  // A Swedish word is never said on its own, where the voice goes wrong most: it is said in a short sentence.
  for (const [en, sv] of l.words) { add('en', en, true); add('sv', `betyder ${svSaid(sv)}.`, false); add('sv', `Ordet är ${svSaid(sv)}.`, false); }
  for (const [en, sv] of l.sents) { add('en', en, false); add('sv', sv, false); }
}
// ---- The journey: places.txt ----
const J = { start: null, parts: [] };
let route = null;
for (const raw of readFileSync(join(here, 'places.txt'), 'utf8').split(/\r?\n/)) {
  const line = raw.trim(); if (!line || line[0] === '#') continue;
  const c = line.slice(2).split('|').map(x => x.trim());
  if (line[0] === 'S') J.start = { n: c[0], x: +c[1], y: +c[2], e: c[3], sc: c[4] };
  else if (line[0] === 'R') { const [r, x] = c[0].split(' '); (J.parts[r] = J.parts[r] || {})[x] = route = { name: c[1], em: c[2], desc: c[3], stops: [] }; }
  else if (line[0] === 'P') route.stops.push({ n: c[0], x: +c[1], y: +c[2], e: c[3], sc: c[4], fact: c[5] });
  else throw new Error('places.txt: ' + line);
}
if (J.parts.length !== 5 || J.parts.some(p => Object.values(p).some(r => r.stops.length !== 10))) throw new Error('places.txt: 5 parts of 10 stops are needed');
const km = (a, b) => { const R = Math.PI / 180, h = Math.sin((b.y - a.y) * R / 2) ** 2 + Math.cos(a.y * R) * Math.cos(b.y * R) * Math.sin((b.x - a.x) * R / 2) ** 2; return 12742 * Math.asin(Math.sqrt(h)); };
const from = r => r ? J.parts[r - 1].A.stops[9] : J.start;
const legs = (r, x) => J.parts[r][x].stops.map((s, i, a) => km(i ? a[i - 1] : from(r), s));
const sum = a => a.reduce((p, q) => p + q, 0);
const later = r => sum(J.parts.slice(r + 1).map((p, q) => sum(Object.keys(p).map(x => sum(legs(r + 1 + q, x)))) / Object.keys(p).length));
const far = n => (Math.round(n / 10) * 10).toLocaleString('sv-SE').replace(/\s/g, ' ');
// What the voice says: before a level, after each of its first three stages, and on arrival. Every one is its own.
const GO = [(a, b) => `Nästa stopp: ${b}! Klara fyra etapper, så är du framme.`, (a, b) => `Nu lämnar vi ${a}. Resan går vidare mot ${b}!`, (a, b) => `Dags att resa vidare! Fyra etapper till ${b}.`];
const ST = [[(a, b, k) => `Bra jobbat! Du har lämnat ${a} och är på väg mot ${b}. Nu är det ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `Iväg! ${a} försvinner bakom dig. Nästa stopp är ${b}, och det är ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `Resan från ${a} har börjat! Du är ett steg närmare Australien. ${k} kilometer kvar till Gold Coast.`],
  [(a, b, k) => `Halvvägs till ${b}! Nu är det ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `Du är mitt emellan ${a} och ${b}. Australien kommer närmare! ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `Hälften av vägen till ${b} är klar! Det är ${k} kilometer kvar till Gold Coast.`],
  [(a, b, k) => `Nu syns ${b} långt där borta! Bara en etapp till. ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `Snart framme! Nästa stopp är ${b}. Det är ${k} kilometer kvar till Gold Coast.`, (a, b, k) => `En etapp kvar till ${b}! Du kommer närmare och närmare Australien. ${k} kilometer kvar till Gold Coast.`]];
const AR = [(b, f, k) => `Framme! Det här är ${b}. ${f} Nu är det ${k} kilometer kvar till Gold Coast.`, (b, f, k) => `Du har kommit fram till ${b}! ${f} Det är ${k} kilometer kvar till Gold Coast.`, (b, f, k) => `Hurra, ${b}! ${f} Nu är du ${k} kilometer från Gold Coast.`];
let turn = 0;
J.parts.forEach((p, r) => Object.keys(p).forEach(x => { const L = legs(r, x); p[x].stops.forEach((s, i, a) => {
  const prev = i ? a[i - 1] : from(r), left = sum(L.slice(i + 1)) + later(r), t = turn++;
  s.go = GO[t % 3](prev.n, s.n);
  s.st = [1, 2, 3].map(k => ST[k - 1][(t + k) % 3](prev.n, s.n, far(left + L[i] * (1 - k / 4))));
  s.ar = r === 4 && i === 9 ? `Du klarade det! Du har rest hela vägen från Lund till Gold Coast. Här finns långa stränder, surfare och sol nästan varje dag.` : AR[t % 3](s.n, s.fact, far(left));
  delete s.fact; for (const text of [s.go, ...s.st, s.ar]) add('sv', text, false);
}); }));
J.total = far(sum(legs(0, 'A')) + later(0));
writeFileSync(join(root, GAME, 'journey.js'), '// Built by tools/adventure/build.mjs from tools/adventure/places.txt. Do not edit.\nwindow.AA_JOURNEY = ' + JSON.stringify(J) + ';\n');

const ids = [...clips.values()];
if (new Set(ids.map(c => c.k + c.id)).size !== ids.length) throw new Error('two clips with one name');
writeFileSync(join(here, 'clips.json'), JSON.stringify(ids, null, 0) + '\n');
// Each script of the page is asked for with a mark of its content, so that a cache that kept an older copy fetches the new one.
const page = join(root, GAME, 'index.html');
writeFileSync(page, readFileSync(page, 'utf8').replace(/<script src="([\w-]+\.js)(?:\?v=\w+)?"><\/script>/g, (all, f) => `<script src="${f}?v=${clipId(readFileSync(join(root, GAME, f), 'utf8'))}"></script>`));
const n = (f) => data.levels.reduce((a, l) => a + l[f].length, 0);
console.log(`${data.levels.length} levels, ${n('words')} words, ${n('sents')} sentences, ${ids.length} clips per voice set (${ids.filter(c => c.k === 'en').length} English, ${ids.filter(c => c.k === 'sv').length} Swedish)`);
