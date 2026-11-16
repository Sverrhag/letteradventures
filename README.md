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

## Privacy rules for this code

The game is for children aged 3 to 7, so it must not send anything to other servers.

- No third-party requests: fonts, scripts, images and audio are all served from this site, and
  the Content-Security-Policy in `index.html` blocks anything else. No analytics or counters.
- What the child types (name, age) stays in the browser's local storage and never goes into a
  URL, header or request body.
- The letter clips are preloaded all at once (`preloadLetters` in `game.js`), so that the order
  of audio requests cannot reveal the name a child is spelling.
- Keep `privacy.html` in step with any change to what is stored or fetched.

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

