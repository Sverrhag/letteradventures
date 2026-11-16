# Records the clip of a word on its own (say_<i>.mp3) in a way that can be checked.
#
# Asked for a short word alone ("Fe."), the voice service sometimes says something else, and a
# speech recogniser cannot tell, because it mishears bare one-syllable words itself. So the word
# is recorded at the end of a sentence, after a pause: "The word is ... fe." The recogniser
# checks the whole sentence, and when it hears the word, everything after the pause is cut out
# and saved as the clip. A recording that is not heard right is thrown away and made again.
#
#   python tools/say-after-pause.py sv 5 1 [--voices 2,4] [--tries 8]      (word numbers)
#
# Needs GOOGLE_TTS_KEY or GOOGLE_TTS_KEY_FILE. The word is the text of say_<i> in the voice's
# manifest.json, which is left as it is, so generate-voices.mjs keeps the new clip.
import base64, glob, json, os, re, sys, tempfile, unicodedata, urllib.request
import numpy as np

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel
from faster_whisper.audio import decode_audio

sys.stdout.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..')
CARRIER = {'sv': 'Ordet är', 'en': 'The word is', 'es': 'La palabra es', 'fr': 'Le mot est', 'pt': 'A palavra é', 'de': 'Das Wort ist'}
args = sys.argv[1:]
def opt(name, default):
    if '--' + name in args:
        i = args.index('--' + name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
voices = [int(v) for v in opt('voices', '1,2,3,4,5').split(',')]
tries = int(opt('tries', '8'))
lang, numbers = args[0], args[1:]
key = (os.environ.get('GOOGLE_TTS_KEY') or open(os.environ['GOOGLE_TTS_KEY_FILE'], encoding='utf-8').read()).strip()
VOICES = json.load(open(os.path.join(here, 'voices.json'), encoding='utf-8'))
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def plain(s):
    s = unicodedata.normalize('NFD', s.lower().replace('ß', 'ss'))
    return ' '.join(re.sub(r'[^\w\s]', ' ', ''.join(c for c in s if not unicodedata.combining(c))).split())

PRON = json.load(open(os.path.join(here, 'pronunciations.json'), encoding='utf-8')).get(lang, {})

def synth(word, voice):
    ipa = PRON.get(word.lower(), '')                          # the same pronunciations as generate-voices.mjs
    said = ipa[1:].capitalize() if ipa[:1] == '=' else f'<phoneme alphabet="ipa" ph="{ipa}">{word}</phoneme>' if ipa else word
    ssml = f'<speak>{CARRIER[lang]}<break time="800ms"/>{said}.</speak>'
    body = {'input': {'ssml': ssml}, 'voice': {'languageCode': voice['name'].split('-Chirp')[0], 'name': voice['name']},
            'audioConfig': {'audioEncoding': 'MP3', 'speakingRate': voice.get('rate', 1), 'sampleRateHertz': 24000}}
    req = urllib.request.Request('https://texttospeech.googleapis.com/v1/text:synthesize', json.dumps(body).encode(),
                                 {'Content-Type': 'application/json', 'X-Goog-Api-Key': key})
    return base64.b64decode(json.load(urllib.request.urlopen(req))['audioContent'])

def frames(b):
    """Byte ranges of the MPEG-2 layer III frames (24 ms each at 24 kHz)."""
    BR = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]; SR = [22050, 24000, 16000]
    out, i = [], 0
    while i + 4 <= len(b):
        n = 72 * BR[b[i + 2] >> 4] * 1000 // SR[(b[i + 2] >> 2) & 3] + ((b[i + 2] >> 1) & 1)
        out.append((i, i + n)); i += n
    return out

def word_part(b, path):
    """The frames after the pause: from two frames before the word's first sound to just after its last."""
    x = np.abs(decode_audio(path, sampling_rate=24000)); win = 120
    env = x[:len(x) // win * win].reshape(-1, win).max(1)
    loud = np.nonzero(env > max(env.max() * 0.03, 0.004))[0]
    gaps = np.nonzero(np.diff(loud) > 80)[0]                     # silences longer than 0.4 s
    if not len(gaps): return None
    first, last = loud[gaps[-1] + 1] * win, (loud[-1] + 1) * win
    fr = frames(b)
    a = max(0, (first - 1105) // 576 - 2); z = min(len(fr), (last - 1105) // 576 + 4)
    return b[fr[a][0]:fr[z - 1][1]]

tmp = os.path.join(tempfile.gettempdir(), 'say-after-pause.mp3')
for n in numbers:
    for v in voices:
        d = os.path.join(root, 'audio', lang, f'v{v}')
        word = json.load(open(os.path.join(d, 'manifest.json'), encoding='utf-8'))[f'say_{n}'].split('|', 2)[2]
        word = re.sub(r'<[^>]+>', '', word).strip(' .!¡')
        want, got = plain(f'{CARRIER[lang]} {word}'), ''
        for t in range(tries):
            b = synth(word, VOICES[lang][v - 1]); open(tmp, 'wb').write(b)
            segs, _ = model.transcribe(tmp, language=lang, beam_size=5, condition_on_previous_text=False)
            got = ' '.join(s.text.strip() for s in segs)
            part = word_part(b, tmp) if plain(got) == want else None
            if part:
                open(os.path.join(d, f'say_{n}.mp3'), 'wb').write(part)
                print(f'v{v} say_{n} "{word}": ok on try {t + 1}', flush=True); break
        else: print(f'v{v} say_{n} "{word}": NOT heard right, last heard "{got}"; clip left as it was', flush=True)
