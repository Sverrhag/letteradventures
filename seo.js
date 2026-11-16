// What search engines read about the game, per language: the title and description of the page,
// and a short text shown at the end of "About the game". Each language has its own address
// (/ for English, /sv/, /es/ ...), built from index.html by tools/build-pages.mjs, which also
// writes these texts into the pages so that they are there without any script having run.
(function (root) {
const SITE = 'https://letteradventures.com';
const SEO = {
  en: { title: 'Alphabet and letter games for kids – free, no ads | Letter Adventures',
    desc: 'A free letter and word game for children: learn the alphabet, find letters, spell and read first words in twelve small games with a friendly voice. No ads, no account.',
    h: 'Free alphabet games in the browser',
    p: 'Letter Adventures is a free learning game for children who are getting to know the alphabet and starting to spell and read. It runs straight in the browser with nothing to install, and a friendly voice says every letter and word aloud. There are no ads and no account, and what your child does in the game stays on the device.',
    also: 'The game in other languages:' },
  sv: { title: 'Bokstavsspel för barn – lär dig bokstäver och ord, gratis | Letter Adventures',
    desc: 'Ett gratis bokstavsspel för barn: lär dig alfabetet, hitta bokstäver, stava och läs de första orden i tolv små spel med en vänlig röst. Ingen reklam, inget konto.',
    h: 'Gratis bokstavsspel i webbläsaren',
    p: 'Letter Adventures är ett gratis lärospel för barn som håller på att lära sig alfabetet och börjar stava och läsa. Det körs direkt i webbläsaren utan att något behöver installeras, och en vänlig röst säger varje bokstav och ord högt. Ingen reklam och inget konto, och det barnet gör i spelet stannar på enheten.',
    also: 'Spelet på andra språk:' },
  es: { title: 'Juegos de letras y del abecedario para niños – gratis | Letter Adventures',
    desc: 'Un juego gratuito de letras y palabras para niños: aprende el abecedario, encuentra letras, deletrea y lee las primeras palabras en doce pequeños juegos con una voz amable. Sin anuncios ni cuenta.',
    h: 'Juegos gratis del abecedario en el navegador',
    p: 'Letter Adventures es un juego educativo gratuito para niños que están conociendo el abecedario y empiezan a deletrear y a leer. Funciona directamente en el navegador, sin instalar nada, y una voz amable dice en voz alta cada letra y cada palabra. Sin anuncios y sin cuenta, y lo que hace el niño en el juego se queda en el dispositivo.',
    also: 'El juego en otros idiomas:' },
  fr: { title: 'Jeux de lettres et d’alphabet pour enfants – gratuit | Letter Adventures',
    desc: 'Un jeu gratuit de lettres et de mots pour les enfants : apprendre l’alphabet, trouver les lettres, épeler et lire ses premiers mots dans douze petits jeux, avec une voix amicale. Sans publicité ni compte.',
    h: 'Des jeux d’alphabet gratuits dans le navigateur',
    p: 'Letter Adventures est un jeu éducatif gratuit pour les enfants qui découvrent l’alphabet et commencent à épeler et à lire. Il fonctionne directement dans le navigateur, sans rien installer, et une voix amicale prononce chaque lettre et chaque mot. Sans publicité et sans compte, et ce que fait l’enfant dans le jeu reste sur l’appareil.',
    also: 'Le jeu dans d’autres langues :' },
  pt: { title: 'Jogos de letras e do alfabeto para crianças – grátis | Letter Adventures',
    desc: 'Um jogo gratuito de letras e palavras para crianças: aprender o alfabeto, encontrar letras, soletrar e ler as primeiras palavras em doze pequenos jogos com uma voz amigável. Sem anúncios e sem conta.',
    h: 'Jogos gratuitos do alfabeto no navegador',
    p: 'Letter Adventures é um jogo educativo gratuito para crianças que estão conhecendo o alfabeto e começando a soletrar e a ler. Funciona direto no navegador, sem instalar nada, e uma voz amigável diz cada letra e cada palavra em voz alta. Sem anúncios e sem conta, e o que a criança faz no jogo fica no dispositivo.',
    also: 'O jogo em outros idiomas:' },
  de: { title: 'Buchstabenspiele für Kinder – ABC und erste Wörter, kostenlos | Letter Adventures',
    desc: 'Ein kostenloses Buchstaben- und Wörterspiel für Kinder: das ABC lernen, Buchstaben finden, erste Wörter schreiben und lesen in zwölf kleinen Spielen mit einer freundlichen Stimme. Ohne Werbung, ohne Konto.',
    h: 'Kostenlose ABC-Spiele im Browser',
    p: 'Letter Adventures ist ein kostenloses Lernspiel für Kinder, die das Alphabet kennenlernen und anfangen zu schreiben und zu lesen. Es läuft direkt im Browser, ohne Installation, und eine freundliche Stimme spricht jeden Buchstaben und jedes Wort laut aus. Ohne Werbung und ohne Konto, und was das Kind im Spiel macht, bleibt auf dem Gerät.',
    also: 'Das Spiel in anderen Sprachen:' },
};
// The address of a language's page, and the languages in the order they are listed.
const PAGE_LANGS = ['en', 'es', 'fr', 'pt', 'de', 'sv'];
const pagePath = lang => lang === 'en' ? '/' : `/${lang}/`;

const api = { SITE, SEO, PAGE_LANGS, pagePath };
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else Object.assign(root.LA, api);
})(typeof window !== 'undefined' ? window : globalThis);
