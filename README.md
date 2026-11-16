# Letter Adventures

A letter and word game for children aged 3 to 7, at https://letteradventures.com.
Plain HTML, CSS and JavaScript; no build step.

## Files

```
index.html             The page and all styles
game.js                Game logic
phrases.js             Swedish and English texts, words and spoken phrases
phrases-more.js        Spanish, French, Portuguese and German
words.js               The 400-word list in six languages, sorted into 20 word levels
variants.js            Alternative wordings, so the voice does not repeat one sentence
more-games.js          Texts and rhyme lists for Catch the letter, Memory and Rhyme
audio/<lang>/v<1-5>/   Recorded voice clips, five voices per language
icons/                 App icons
fonts/                 Fredoka and Andika, served from this site
licenses/              Licence texts for the fonts and the icon artwork
privacy.html           Privacy notice, publisher and licences, in six languages
manifest.webmanifest   Makes the game installable in full screen
tools/                 The voice-recording script and the icon artwork (icon.html)
CNAME                  Custom domain for GitHub Pages
```

## Changing what the voice says

Every spoken phrase is a recorded clip. After editing a phrase in `phrases.js`
or `phrases-more.js`, record the changed clips:

```
GOOGLE_TTS_KEY_FILE=/path/to/key.txt node tools/generate-voices.mjs
```

The script only records clips whose text or voice has changed. It needs a
Google Cloud API key with access to the Cloud Text-to-Speech API. The key must
never be committed.

## Deployment

Pushing to `main` publishes the site to GitHub Pages through
`.github/workflows/deploy.yml`.

## Changing the app icon

The icon is `tools/icon.html` rendered to PNG in three sizes with headless Chrome:

```
chrome --headless=new --hide-scrollbars --window-size=512,512 --screenshot=icons/icon-512.png tools/icon.html
```

Repeat with 192 and 180 for `icon-192.png` and `icon-180.png`.

The picture shown when a link to the game is shared, `og-image.png`, is `tools/share-image.html`
rendered the same way at `--window-size=1200,627`.

## Privacy rules for this code

The game is for children aged 3 to 7, so it must not send anything to other servers.

- No third-party requests: fonts, scripts, images and audio are all served from this site, and
  the Content-Security-Policy in `index.html` blocks anything else. No analytics or counters.
- What the child types (name, age) stays in the browser's local storage and never goes into a
  URL, header or request body.
- The letter clips are preloaded all at once (`preloadLetters` in `game.js`), so that the order
  of audio requests cannot reveal the name a child is spelling.
- Keep `privacy.html` in step with any change to what is stored or fetched.

## The voices as figures of each look

There are five recorded voices. Each look shows them as its own five figures (Space: astronaut,
star, moon, robot, alien), with their names and greetings in `CAST` in `variants.js` and their
pictures in `LOOKS` in `game.js`. Only the greeting is recorded per look (`hello_<look>.mp3`);
everything else the voice says is the same clip in every look.

## The player's name, spoken

Common first names are recorded once per voice with `node tools/generate-names.mjs --lang <lang>`,
from the list in `tools/names/<lang>.txt`. The clips are published as packs per first letter
(`audio/<lang>/v<n>/names/<letter>.bin` + `.json`). The game downloads the whole pack for the
first letter and cuts the name out on the device, so the host only learns the first letter –
keep it that way, and keep `privacy.html` in step. A name that is not in the list of the language
being played is taken from another language's packs, where the same voice says it (a Swedish child
playing in English hears the Swedish recording of the name). A name in no list is not said.

The game joins the name to the phrase before it ("Well done," + "Moa!") into one sound. The voice
puts up to a second of silence around every clip, so after recording names, cut it off and pack
again, or the name is said with long pauses around it:

    python tools/trim-silence.py --trail 200 .cache/names/<lang>
    node tools/generate-names.mjs --lang <lang> --pack

The phrases a name is joined to are trimmed the same way after they have been recorded:

    python tools/trim-silence.py "audio/*/v*/hi.mp3" "audio/*/v*/greetRest.mp3" "audio/*/v*/long_*.mp3" "audio/*/v*/hurra*.mp3"

The voice service now and then returns a clip with no sound for a very short text (a single
letter, "Hi,"). `trim-silence.py` reports those as SILENT; delete them and record again.

## Checking the pronunciation

Nobody has to listen to the clips. `tools/check-words.py` transcribes every word clip with a
local speech recogniser (faster-whisper) and lists the ones that do not come back as the word;
most of those are homophones or short words the recogniser struggles with, so the list is read
through, not acted on blindly. `tools/hear-phonemes.py` writes down the sounds and their lengths,
which tells apart words that are spelled alike but said differently. Such words get their
pronunciation fixed in `tools/pronunciations.json` (IPA, or `=respelling`), and the recording tool
then re-records their clips. Single short words on their own are judged least reliably; the
sentence clips ("Spell the word bow.") are the ones to trust.

Short words said on their own ("Fe.", "Bi.") are where the voice service goes wrong most, and
the recogniser cannot judge a bare one-syllable word. Two tools deal with that:

    python tools/retry-clips.py sv word_5 wrote_5        record again until the sentence is heard right
    python tools/say-after-pause.py sv 5                 make say_5.mp3 from "The word is ... fe."

`say-after-pause.py` records the word at the end of a sentence, after a pause, lets the recogniser
check the sentence, and saves what comes after the pause as the clip. A clip made that way is
replaced by an ordinary recording if `generate-voices.mjs --force` is run, so run it again then.

## Reports of clips that sound wrong

The feedback dialog (settings) lists the last things the voice said. A grown-up ticks what sounded
wrong, and the email they send, with the subject "Letter Adventures: pronunciation", gets one line
per sound clip: `clip sv v4 jungle word_5` (language, voice, look, clip). The phrase itself is not
sent, since it can hold the child's name. Those lines go to

    python tools/fix-reported.py "clip sv v4 jungle word_5"

which records the clips again until the speech recogniser hears their text, and says which ones it
already heard right; for those, look at the spelling and at `tools/pronunciations.json`. Only lines
of that exact shape, naming a clip that exists, are acted on. Nothing else in an email is.

## Search engines and the page of each language

Each language has its own address: `/` is English, and `/sv/`, `/es/`, `/fr/`, `/pt/` and `/de/`
are copies of `index.html` in that language. They are built by `node tools/build-pages.mjs`,
which the deploy workflow runs, so the language folders are not kept in git. The script writes the
title and description (`seo.js`), the links between the language versions (`hreflang`), the
structured data and the texts of the start screen into every page, `index.html` included, and
writes `sitemap.xml`. Run it after changing those texts if you want `index.html` in git to match;
the published site is built fresh either way.

A language page starts the game in its language. The English page keeps the language chosen
last, and the address follows the language when it is changed. All paths in `index.html` start at
the top of the site (`<base href="/">`), so the site must be served from the root of its domain.

Each game also has a page of its own in each language (`/sv/rimspel/`, `/en/rhyming-game/` ...;
`GAME_PAGES` in `seo.js` holds the address, title and text of each). It is the same game: the
game is named on the start screen, the first "Start" opens that game, and the list of games in
"About the game" links to these pages. English game pages are under `/en/`, while the English
start page stays at `/`.
