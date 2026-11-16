// Builds the page of each language, for search engines:
//
//   node tools/build-pages.mjs
//
// index.html is the English page and the template. This script writes into it, and into a copy per
// language (sv/index.html, es/index.html ...), the things a search engine reads: the title and
// description (seo.js), the links between the language versions, the structured data, and the
// texts of the start screen, so that they are in the page before any script has run. It also
// writes sitemap.xml. Running it again changes nothing. The deploy workflow runs it, so the
// language folders are not kept in git; run it by hand to see them locally.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = f => readFileSync(join(root, f), 'utf8');

// The game's own texts, loaded the way tools/generate-voices.mjs loads them.
const require = createRequire(import.meta.url);
const { LANGS } = require(join(root, 'phrases.js'));
Object.assign(LANGS, require(join(root, 'phrases-more.js')));
for (const f of ['words.js', 'variants.js', 'more-games.js']) require(join(root, f)).apply(LANGS, true);
const { SEO, SITE, PAGE_LANGS, pagePath } = require(join(root, 'seo.js'));
const EMOJI = [...read('game.js').match(/const GAME_META = \[([\s\S]*?)\n\];/)[1].matchAll(/em:'([^']+)'/g)].map(m => m[1]);

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const url = lang => SITE + pagePath(lang);
const OG_LOCALE = { en: 'en_US', sv: 'sv_SE', es: 'es_ES', fr: 'fr_FR', pt: 'pt_BR', de: 'de_DE' };

// Replaces what is between two markers, or the one match of a pattern; stops if it is not there.
function put(html, pattern, to) {
  if (!pattern.test(html)) throw new Error('not found in index.html: ' + pattern);
  return html.replace(pattern, to);
}

function page(tpl, lang) {
  const T = LANGS[lang], S = SEO[lang];
  let h = tpl;
  h = put(h, /<html lang="[^"]*">/, `<html lang="${lang}">`);
  h = put(h, /<title>[^<]*<\/title>/, `<title>${esc(S.title)}</title>`);
  h = put(h, /(<meta name="description" content=")[^"]*"/, `$1${esc(S.desc)}"`);
  h = put(h, /(<meta property="og:title" content=")[^"]*"/, `$1${esc(S.title)}"`);
  h = put(h, /(<meta property="og:description" content=")[^"]*"/, `$1${esc(S.desc)}"`);
  h = put(h, /(<meta property="og:url" content=")[^"]*"/, `$1${url(lang)}"`);
  const data = { '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Letter Adventures', url: url(lang), description: S.desc,
    inLanguage: lang, applicationCategory: 'EducationalApplication', genre: 'Educational game', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true, isFamilyFriendly: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
    audience: { '@type': 'PeopleAudience', audienceType: 'Children' }, image: SITE + '/og-image.png',
    publisher: { '@type': 'Organization', name: 'Sverrhag Consulting AB', url: 'https://sverrhag.com' } };
  const head = [`<link rel="canonical" href="${url(lang)}">`,
    ...PAGE_LANGS.map(l => `<link rel="alternate" hreflang="${l}" href="${url(l)}">`),
    `<link rel="alternate" hreflang="x-default" href="${url('en')}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`].join('\n');
  h = put(h, /(<!-- pages:head -->)[\s\S]*?(<!-- \/pages:head -->)/, `$1\n${head}\n$2`);
  // Every text of the page that the game fills in from its language (data-t), where it is plain text.
  h = h.replace(/(<(\w+)\b[^>]*\sdata-t="(\w+)"[^>]*>)[^<]*(<\/\2>)/g, (all, open, tag, key, close) => typeof T.ui[key] === 'string' ? open + esc(T.ui[key]) + close : all);
  h = put(h, /(<ul id="aboutList">)[\s\S]*?(<\/ul>)/, `$1${T.games.map((g, i) => g ? `<li>${EMOJI[i]} <b>${esc(g[0])}</b> – ${esc(g[1])}</li>` : '').join('')}$2`);
  h = put(h, /(<h2 id="seoH">)[^<]*(<\/h2>)/, `$1${esc(S.h)}$2`);
  h = put(h, /(<p id="seoP">)[^<]*(<\/p>)/, `$1${esc(S.p)}$2`);
  h = put(h, /(<p class="tip" id="seoAlso">)[\s\S]*?(<\/p>)/, `$1${esc(S.also)} ${PAGE_LANGS.filter(l => l !== lang).map(l => `<a href="${pagePath(l)}" hreflang="${l}" lang="${l}" data-lang="${l}">${esc(LANGS[l].label || { sv: 'Svenska', en: 'English' }[l])}</a>`).join(' · ')}$2`);
  return h;
}

const tpl = read('index.html');
for (const lang of PAGE_LANGS) {
  const out = lang === 'en' ? 'index.html' : join(lang, 'index.html');
  if (lang !== 'en') mkdirSync(join(root, lang), { recursive: true });
  writeFileSync(join(root, out), page(tpl, lang));
}
const alt = PAGE_LANGS.map(l => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l)}"/>`).join('\n');
writeFileSync(join(root, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGE_LANGS.map(l => `  <url>\n    <loc>${url(l)}</loc>\n${alt}\n  </url>`).join('\n')}
  <url>
    <loc>${SITE}/privacy.html</loc>
  </url>
</urlset>
`);
console.log('built', PAGE_LANGS.map(pagePath).join(' '), 'and sitemap.xml');
