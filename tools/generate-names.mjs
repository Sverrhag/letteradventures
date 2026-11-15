// Records children's first names, so the voice can say the player's name.
//
//   node tools/generate-names.mjs --lang sv            record and pack one language
//   node tools/generate-names.mjs --lang sv --pack     only rebuild the packs from the cache
//   node tools/generate-names.mjs --lang sv --file x.txt   use another list (for testing)
//
// Names come from tools/names/<lang>.txt, one per line. Each name is recorded once per
// voice and kept in .cache/names/ (not published). The published files are packs:
//
//   audio/<lang>/v<1-5>/names/<letter>.bin    all clips for names starting with that letter
//   audio/<lang>/v<1-5>/names/<letter>.json   { "moa": [offset, length], ... }
//
// The game downloads the whole pack for the first letter of the player's name and cuts
// the clip out locally. That way the web host sees only the first letter, never the name.
//
// The API key is read from GOOGLE_TTS_KEY or from the file named by GOOGLE_TTS_KEY_FILE.
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const require = createRequire(import.meta.url);
const { LANGS } = require(join(root, 'phrases.js'));
Object.assign(LANGS, require(join(root, 'phrases-more.js')));
const VOICES = JSON.parse(readFileSync(join(here, 'voices.json'), 'utf8'));

const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf('--' + name); return i < 0 ? null : (args[i + 1] ?? true); };
const lang = opt('lang');
if (!lang || !LANGS[lang]) { console.error('Use --lang with one of: ' + Object.keys(LANGS).join(', ')); process.exit(1); }

// The same rules as the game uses to look a name up (see nameKeys in game.js).
const keyOf = n => n.trim().toLocaleLowerCase();
const plain = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const letterOf = k => { const c = plain(k)[0]; return /^[a-z]$/.test(c) ? c : '0'; };
const fileOf = k => encodeURIComponent(k).replace(/%/g, '_');

const names = [...new Map(readFileSync(opt('file') || join(here, 'names', lang + '.txt'), 'utf8').split(/\r?\n/)
  .map(s => s.trim()).filter(Boolean).map(n => [keyOf(n), n])).values()];

const key = (process.env.GOOGLE_TTS_KEY || (process.env.GOOGLE_TTS_KEY_FILE && readFileSync(process.env.GOOGLE_TTS_KEY_FILE, 'utf8')) || '').trim();
const packOnly = !!opt('pack');
if (!key && !packOnly) { console.error('Set GOOGLE_TTS_KEY or GOOGLE_TTS_KEY_FILE.'); process.exit(1); }

let slot = 0; // at most one request every 500 ms, to stay under the per-minute quota
async function throttle() {
  const now = Date.now();
  slot = Math.max(slot + 500, now);
  if (slot > now) await new Promise(s => setTimeout(s, slot - now));
}
async function synth(text, voice) {
  for (let attempt = 0; ; attempt++) {
    await throttle();
    const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': key },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: LANGS[lang].code, name: voice.name },
        audioConfig: { audioEncoding: 'MP3', speakingRate: voice.rate ?? 1, sampleRateHertz: 24000 },
      }),
    });
    if (r.ok) return Buffer.from((await r.json()).audioContent, 'base64');
    if ((r.status === 429 || r.status >= 500) && attempt < 8) { await new Promise(s => setTimeout(s, 20000)); continue; }
    throw new Error(`${r.status} ${await r.text()}`);
  }
}

let made = 0, chars = 0;
for (let vi = 0; vi < 5; vi++) {
  const voice = VOICES[lang][vi];
  const cache = join(root, '.cache', 'names', lang, `v${vi + 1}`);
  mkdirSync(cache, { recursive: true });

  if (!packOnly) {
    const todo = names.filter(n => !existsSync(join(cache, fileOf(keyOf(n)) + '.mp3')));
    console.log(`${lang} v${vi + 1} ${voice.name}: ${todo.length} of ${names.length} names to record`);
    let next = 0;
    await Promise.all(Array.from({ length: 4 }, async () => {
      while (next < todo.length) {
        const n = todo[next++];
        writeFileSync(join(cache, fileOf(keyOf(n)) + '.mp3'), await synth(n + '!', voice));
        made++; chars += n.length + 1;
      }
    }));
  }

  // Pack by first letter.
  const out = join(root, 'audio', lang, `v${vi + 1}`, 'names');
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const groups = {};
  for (const n of names) {
    const k = keyOf(n), f = join(cache, fileOf(k) + '.mp3');
    if (existsSync(f)) (groups[letterOf(k)] ||= []).push([k, f]);
  }
  for (const [letter, list] of Object.entries(groups)) {
    const index = {}, bufs = []; let offset = 0;
    for (const [k, f] of list) {
      const b = readFileSync(f);
      index[k] = [offset, b.length];
      // "zoe" also finds "zoé", unless another name already owns the plain spelling.
      const p = plain(k);
      if (p !== k && !list.some(([other]) => other === p)) index[p] = index[k];
      bufs.push(b); offset += b.length;
    }
    writeFileSync(join(out, letter + '.bin'), Buffer.concat(bufs));
    writeFileSync(join(out, letter + '.json'), JSON.stringify(index));
  }
}
console.log(`Recorded ${made} name clips (${chars} characters) for ${lang}; packs rebuilt.`);
