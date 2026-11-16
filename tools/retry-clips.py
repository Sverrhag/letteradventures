# Records clips again until a local speech recogniser hears the text they were made from.
# The voice service does not say a text the same way twice, so a word it got wrong once
# is often right on the next attempt.
#
#   python tools/retry-clips.py sv say_5 word_5 wrote_5 [--voices 2,4] [--rounds 6]
#
# For every voice, each named clip is checked; the ones that are not heard as their text are
# deleted and recorded again with tools/generate-voices.mjs (which needs GOOGLE_TTS_KEY or
# GOOGLE_TTS_KEY_FILE), up to --rounds times. What is still not heard right is listed at the
# end. Bare one-syllable words are often misheard by the recogniser itself, so a clip that
# stays on the list is not necessarily wrong.
import json, os, sys, re, glob, subprocess, unicodedata

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..')
args = sys.argv[1:]
def opt(name, default):
    if '--' + name in args:
        i = args.index('--' + name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
voices = [int(v) for v in opt('voices', '1,2,3,4,5').split(',')]
rounds = int(opt('rounds', '6'))
lang, ids = args[0], args[1:]
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def plain(s):
    s = unicodedata.normalize('NFD', s.lower().replace('ß', 'ss'))
    return ' '.join(re.sub(r'[^\w\s]', ' ', ''.join(c for c in s if not unicodedata.combining(c))).split())
def heard(f):
    segs, _ = model.transcribe(f, language=lang, beam_size=5, condition_on_previous_text=False, without_timestamps=True)
    return ' '.join(s.text.strip() for s in segs).strip()
def wrong():
    out = []
    for v in voices:
        d = os.path.join(root, 'audio', lang, f'v{v}')
        manifest = json.load(open(os.path.join(d, 'manifest.json'), encoding='utf-8'))
        for id in ids:
            text = re.sub(r'<[^>]+>', '', manifest[id].split('|', 2)[2])
            f = os.path.join(d, id + '.mp3')
            h = heard(f) if os.path.exists(f) else ''
            if plain(h) != plain(text): out.append((v, id, text, h, f))
    return out

todo = wrong()
for r in range(rounds):
    print(f'round {r + 1}: {len(todo)} not heard right', flush=True)
    if not todo: break
    keep = {(v, id) for v, id, *_ in todo}
    for *_, f in todo:
        if os.path.exists(f): os.remove(f)
    subprocess.run(['node', os.path.join(here, 'generate-voices.mjs'), '--lang', lang], check=True, stdout=subprocess.DEVNULL)
    all_wrong = wrong()
    todo = [w for w in all_wrong if (w[0], w[1]) in keep]
for v, id, text, h, f in todo: print(f'v{v} {id}: "{text}" heard as "{h}"')
print('done')
