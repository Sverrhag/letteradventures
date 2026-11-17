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

const data = { praise: [], praiseSv: [], streak: {}, inst: {}, worlds: [], levels: [] }, known = new Set(), problems = [];
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
if (problems.length) { console.error(problems.join('\n')); process.exit(1); }

writeFileSync(join(root, GAME, 'data.js'), '// Built by tools/adventure/build.mjs from tools/adventure/content.txt. Do not edit.\nwindow.AA_DATA = ' + JSON.stringify(data) + ';\n');
const clips = new Map();
const add = (k, text, word) => { const key = k + clipId(text); if (!clips.has(key)) clips.set(key, { k, id: clipId(text), text, word }); };
for (const [en] of [...data.praise, ...Object.values(data.streak)]) add('en', en, false);
for (const sv of [...data.praiseSv, ...Object.values(data.inst).flat()]) add('sv', sv, false);
for (const l of data.levels) {
  for (const [en, sv] of l.words) { add('en', en, true); add('sv', svSaid(sv), true); }
  for (const [en, sv] of l.sents) { add('en', en, false); add('sv', sv, false); }
}
const ids = [...clips.values()];
if (new Set(ids.map(c => c.k + c.id)).size !== ids.length) throw new Error('two clips with one name');
writeFileSync(join(here, 'clips.json'), JSON.stringify(ids, null, 0) + '\n');
// Each script of the page is asked for with a mark of its content, so that a cache that kept an older copy fetches the new one.
const page = join(root, GAME, 'index.html');
writeFileSync(page, readFileSync(page, 'utf8').replace(/<script src="([\w-]+\.js)(?:\?v=\w+)?"><\/script>/g, (all, f) => `<script src="${f}?v=${clipId(readFileSync(join(root, GAME, f), 'utf8'))}"></script>`));
const n = (f) => data.levels.reduce((a, l) => a + l[f].length, 0);
console.log(`${data.levels.length} levels, ${n('words')} words, ${n('sents')} sentences, ${ids.length} clips per voice set (${ids.filter(c => c.k === 'en').length} English, ${ids.filter(c => c.k === 'sv').length} Swedish)`);
