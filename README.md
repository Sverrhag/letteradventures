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
manifest.webmanifest   Makes the game installable in full screen
tools/                 Scripts that record the voice clips and draw the icons
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
