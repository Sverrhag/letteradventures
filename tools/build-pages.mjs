// Builds the pages that search engines read: one per language, and one per game in each language.
//
//   node tools/build-pages.mjs
//
// index.html is the English page and the template. This script writes into it, and into a copy per
// language (sv/index.html, es/index.html ...) and per game (sv/rimspel/index.html,
// en/rhyming-game/index.html ...), the things a search engine reads: the title and description
// (seo.js), the links between the language versions, the structured data, and the texts of the
// start screen, so that they are in the page before any script has run. It also writes
// sitemap.xml. Running it again changes nothing. The deploy workflow runs it, so the language
// folders are not kept in git; run it by hand to see them locally.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(root, f), 'utf8');

// The game's own texts, loaded the way tools/generate-voices.mjs loads them.
const require = createRequire(import.meta.url);
const { LANGS } = require(join(root, 'phrases.js'));
Object.assign(LANGS, require(join(root, 'phrases-more.js')));
for (const f of ['words.js', 'variants.js', 'more-games.js']) require(join(root, f)).apply(LANGS, true);
const { SEO, SITE, GAME_PAGES, PAGE_LANGS, pagePath } = require(join(root, 'seo.js'));
// The games in the order of the game: [{id, em}].
const GAMES = [...read('game.js').match(/const GAME_META = \[([\s\S]*?)\n\];/)[1].matchAll(/id:'([^']+)',\s*em:'([^']+)'/g)].map(m => ({ id: m[1], em: m[2] }));
for (const lang of PAGE_LANGS) for (const { id } of GAMES) if (!GAME_PAGES[lang][id]) throw new Error(`seo.js: no page for the game ${id} in ${lang}`);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = (lang, game) => SITE + pagePath(lang, game);
const OG_LOCALE = { en: 'en_US', sv: 'sv_SE', es: 'es_ES', fr: 'fr_FR', pt: 'pt_BR', de: 'de_DE' };

// Replaces the one match of a pattern; stops if it is not there.
function put(html, pattern, to) {
  if (!pattern.test(html)) throw new Error('not found in index.html: ' + pattern);
  return html.replace(pattern, to);
}

// The page of a language, or of one game (its id) in that language.
function page(tpl, lang, game) {
  const T = LANGS[lang], S = SEO[lang], i = GAMES.findIndex(g => g.id === game), G = game && GAME_PAGES[lang][game];
  const title = G ? `${G[1]} | Letter Adventures` : S.title, desc = G ? `${G[2]} ${S.free}` : S.desc;
  let h = tpl;
  h = put(h, /<html lang="[^"]*"[^>]*>/, `<html lang="${lang}"${G ? ` data-game="${game}"` : ''}>`);
  h = put(h, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  h = put(h, /(<meta name="description" content=")[^"]*"/, `$1${esc(desc)}"`);
  h = put(h, /(<meta property="og:title" content=")[^"]*"/, `$1${esc(title)}"`);
  h = put(h, /(<meta property="og:description" content=")[^"]*"/, `$1${esc(desc)}"`);
  h = put(h, /(<meta property="og:url" content=")[^"]*"/, `$1${url(lang, game)}"`);
  const data = { '@context': 'https://schema.org', '@type': 'WebApplication', name: G ? `Letter Adventures: ${T.games[i][0]}` : 'Letter Adventures', url: url(lang, game), description: desc,
    inLanguage: lang, applicationCategory: 'EducationalApplication', genre: 'Educational game', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true, isFamilyFriendly: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    audience: { '@type': 'PeopleAudience', audienceType: 'Children' }, image: SITE + '/og-image.png',
    publisher: { '@type': 'Organization', name: 'Sverrhag Consulting AB', url: 'https://sverrhag.com' } };
  const head = [`<link rel="canonical" href="${url(lang, game)}">`,
    ...PAGE_LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${url(l, game)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url('en', game)}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`].join('\n');
  h = put(h, /(<!-- pages:head -->)[\s\S]*?(<!-- \/pages:head -->)/, `$1\n${head}\n$2`);
  // Each script is asked for with a mark of its content, so that a browser or cache that kept an older
  // copy fetches the new one together with the new page.
  h = h.replace(/<script src="([\w-]+\.js)(?:\?v=\w+)?"><\/script>/g, (all, f) => `<script src="${f}?v=${createHash('sha1').update(read(f)).digest('hex').slice(0, 10)}"></script>`);
  // Every text of the page that the game fills in from its language (data-t), where it is plain text.
  h = h.replace(/(<(\w+)\b[^>]*\sdata-t="(\w+)"[^>]*>)[^<]*(<\/\2>)/g, (all, open, tag, key, close) => typeof T.ui[key] === 'string' ? open + esc(T.ui[key]) + close : all);
  // The game that the page is about, named under the title.
  h = put(h, /<h2 id="pageGame"[^>]*>[^<]*<\/h2>/, `<h2 id="pageGame"${G ? '' : ' hidden'}>${G ? `${GAMES[i].em} ${esc(T.games[i][0])} – ${esc(T.games[i][1])}` : ''}</h2>`);
  h = put(h, /<p id="pageGameP"[^>]*>[^<]*<\/p>/, `<p id="pageGameP"${G ? '' : ' hidden'}>${G ? esc(G[2]) : ''}</p>`);
  h = put(h, /(<ul id="aboutList">)[\s\S]*?(<\/ul>)/, `$1${GAMES.map((g, k) => T.games[k] ? `<li>${g.em} <a href="${pagePath(lang, g.id)}"><b>${esc(T.games[k][0])}</b></a> – ${esc(T.games[k][1])}</li>` : '').join('')}$2`);
  h = put(h, /(<h2 id="seoH">)[^<]*(<\/h2>)/, `$1${esc(S.h)}$2`);
  h = put(h, /(<p id="seoP">)[^<]*(<\/p>)/, `$1${esc(S.p)}$2`);
  h = put(h, /(<p class="tip" id="seoAlso">)[\s\S]*?(<\/p>)/, `$1${esc(S.also)} ${PAGE_LANGS.filter(l => l !== lang).map(l => `<a href="${pagePath(l, game)}" hreflang="${l}" lang="${l}" data-lang="${l}">${esc(LANGS[l].label || { sv: 'Svenska', en: 'English' }[l])}</a>`).join(' · ')}$2`);
  return h;
}

const tpl = read('index.html'), pages = [];
for (const lang of PAGE_LANGS) for (const game of [undefined, ...GAMES.map(g => g.id)]) {
  const path = pagePath(lang, game);
  mkdirSync(join(root, path), { recursive: true });
  writeFileSync(join(root, path, 'index.html'), page(tpl, lang, game));
  pages.push([lang, game]);
}
const alt = game => PAGE_LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, game)}"/>`).join('\n');
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${pages.map(([l, game]) => `  <url>\n    <loc>${url(l, game)}</loc>\n${alt(game)}\n  </url>`).join('\n')}
  <url>
    <loc>${SITE}/privacy.html</loc>
  </url>
</urlset>
`);
console.log(`built ${pages.length} pages and sitemap.xml`);
