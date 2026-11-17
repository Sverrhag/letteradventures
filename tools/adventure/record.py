# Records the clips of the animal adventure: every word and sentence of the course in three
# Australian English voices and one Swedish voice.
#
#   python tools/adventure/record.py            (with the Python of the speech recogniser)
#
# Reads tools/adventure/clips.json (written by build.mjs) and writes <game>/audio/<voice>/<id>.mp3,
# only the clips that are not there yet. A word on its own is recorded at the end of a sentence,
# after a pause ("The word is ... dog."), and the part after the pause is kept: asked for a bare
# short word the voice service sometimes says something else. Every recording is checked by a
# speech recogniser and made again when it is not heard right; one that is never heard right is
# kept anyway and listed in tools/adventure/unverified.txt, for a person to listen to.
# The silence around each recording is cut off here, with a wide margin: a soft first or last sound
# (h, f, s) is much quieter than the vowels, and a tight cut takes it away. Do not run
# tools/trim-silence.py on these clips.
#
# Needs GOOGLE_TTS_KEY or GOOGLE_TTS_KEY_FILE.
import base64, glob, json, os, re, sys, time, unicodedata, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor
import numpy as np

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..')
GAME = 'zoo-b6cec90c'
VOICES = {'a': ('en', 'en-AU-Chirp3-HD-Leda'), 'b': ('en', 'en-AU-Chirp3-HD-Charon'), 'c': ('en', 'en-AU-Chirp3-HD-Aoede'), 's': ('sv', 'sv-SE-Chirp3-HD-Kore')}
CARRIER = {'sv': 'Ordet är', 'en': 'The word is'}
TRIES = 3
key = (os.environ.get('GOOGLE_TTS_KEY') or open(os.environ['GOOGLE_TTS_KEY_FILE'], encoding='utf-8').read()).strip()
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def plain(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ' '.join(re.sub(r'[^\w\s]', ' ', ''.join(c for c in s if not unicodedata.combining(c))).split())

def synth(job):
    voice, clip = job
    lang, name = VOICES[voice]
    text = clip['text'].replace('&', '&amp;').replace('<', '&lt;')
    ssml = f'<speak>{CARRIER[lang]}<break time="800ms"/>{text}.</speak>' if clip['word'] else f'<speak>{text}</speak>'
    body = {'input': {'ssml': ssml}, 'voice': {'languageCode': name.split('-Chirp')[0], 'name': name},
            'audioConfig': {'audioEncoding': 'MP3', 'sampleRateHertz': 24000}}
    for wait in (2, 5, 15, 40, None):
        try:
            req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize', json.dumps(body).encode(),
                                         {'Content-Type': 'application/json', 'X-Goog-Api-Key': key})
            return base64.b64decode(json.load(urllib.request.urlopen(req, timeout=60))['audioContent'])
        except (urllib.error.URLError, TimeoutError) as e:
            if wait is None or getattr(e, 'code', 500) in (400, 403): raise
            time.sleep(wait)

def frames(b):
    BR = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]; SR = [22050, 24000, 16000]
    out, i = [], 0
    while i + 4 <= len(b):
        n = 72 * BR[b[i + 2] >> 4] * 1000 // SR[(b[i + 2] >> 2) & 3] + ((b[i + 2] >> 1) & 1)
        out.append((i, i + n)); i += n
    return out

def cut(b, path, word):
    """The sound without the silence around it; for a word, only what comes after the pause.
    150 ms are kept before the first sound and 250 ms after the last, measured at a low level."""
    x = np.abs(decode_audio(path, sampling_rate=24000)); win = 120
    env = x[:len(x) // win * win].reshape(-1, win).max(1)
    loud = np.nonzero(env > max(env.max() * 0.008, 0.0015))[0]
    if not len(loud): return None
    start = loud[0]
    if word:
        strong = np.nonzero(env > max(env.max() * 0.03, 0.004))[0]
        gaps = np.nonzero(np.diff(strong) > 80)[0]                 # the pause: 0.4 s without speech
        if not len(gaps): return None
        before, after = strong[gaps[-1]], strong[gaps[-1] + 1]
        quiet = loud[(loud > before + 20) & (loud <= after)]       # the first faint sound after the pause
        start = max(quiet[0] if len(quiet) else after, after - 60)
    first, last = start * win, (loud[-1] + 1) * win
    fr = frames(b)
    a = max(0, (first - 1105) // 576 - 6); z = min(len(fr), (last - 1105) // 576 + 11)
    return b[fr[a][0]:fr[z - 1][1]]

clips = json.load(open(os.path.join(here, 'clips.json'), encoding='utf-8'))
jobs = []
for voice, (lang, _) in VOICES.items():
    os.makedirs(os.path.join(root, GAME, 'audio', voice), exist_ok=True)
    jobs += [(voice, c) for c in clips if c['k'] == lang and not os.path.exists(os.path.join(root, GAME, 'audio', voice, c['id'] + '.mp3'))]
print(len(jobs), 'clips to record', flush=True)
tmp = os.path.join(here, '.tmp.mp3'); unverified = []; done = 0
left = [(j, 0) for j in jobs]
with ThreadPoolExecutor(8) as pool:
    while left:
        batch, left = left[:32], left[32:]
        for (job, t), b in zip(batch, pool.map(synth, [j for j, _ in batch])):
            voice, clip = job; lang = VOICES[voice][0]
            open(tmp, 'wb').write(b)
            segs, _ = model.transcribe(tmp, language=lang, beam_size=5, condition_on_previous_text=False)
            got = ' '.join(s.text.strip() for s in segs)
            want = plain(f"{CARRIER[lang]} {clip['text']}" if clip['word'] else clip['text'])
            part = cut(b, tmp, clip['word'])
            ok = plain(got) == want and part
            if not ok and t + 1 < TRIES: left.append((job, t + 1)); continue
            if not part: unverified.append(f"{voice} {clip['id']} NOT SAVED (no pause found): {clip['text']}"); continue
            open(os.path.join(root, GAME, 'audio', voice, clip['id'] + '.mp3'), 'wb').write(part)
            if not ok: unverified.append(f"{voice} {clip['id']} \"{clip['text']}\" heard as \"{got}\"")
            done += 1
        print(done, 'saved,', len(left), 'left', flush=True)
if os.path.exists(tmp): os.remove(tmp)
open(os.path.join(here, 'unverified.txt'), 'a', encoding='utf-8').write('\n'.join(unverified) + ('\n' if unverified else ''))
print('done;', len(unverified), 'not heard right, see tools/adventure/unverified.txt')
