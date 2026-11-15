# Letter Adventures

A letter and word game for children aged 3 to 7, at https://letteradventures.com.
Plain HTML, CSS and JavaScript; no build step.

## Files

```
index.html             The page and all styles
game.js                Game logic
phrases.js             Swedish and English texts, words and spoken phrases
phrases-more.js        Spanish, French, Portuguese and German
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
