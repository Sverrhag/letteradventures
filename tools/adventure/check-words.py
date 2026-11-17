# Listens to every English word clip of the animal adventure on its own and lists the ones that a
# speech recogniser does not hear as the word.
#
#   python tools/adventure/check-words.py [--delete]
#
# A bare short word is hard for a recogniser, so the list is read through, not acted on blindly:
# "I" heard as "eye" is fine. With --delete the listed clips are removed, except those heard as a
# word in ALSO, so that record.py records them again.
import glob, json, os, re, sys, unicodedata

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel

sys.stdout.reconfigure(encoding='utf-8')
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..', '..')
GAME = 'zoo-b6cec90c'
ALSO = json.load(open(os.path.join(here, 'homophones.json'), encoding='utf-8')) if os.path.exists(os.path.join(here, 'homophones.json')) else {}
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def plain(s):
    s = unicodedata.normalize('NFD', s.lower())
    return ' '.join(re.sub(r'[^\w\s]', ' ', ''.join(c for c in s if not unicodedata.combining(c))).split())

clips = [c for c in json.load(open(os.path.join(here, 'clips.json'), encoding='utf-8')) if c['k'] == 'en' and c['word']]
bad = 0
for c in clips:
    for v in 'abc':
        path = os.path.join(root, GAME, 'audio', v, c['id'] + '.mp3')
        if not os.path.exists(path): continue
        segs, _ = model.transcribe(path, language='en', beam_size=5, condition_on_previous_text=False, initial_prompt='One word:')
        got = plain(' '.join(s.text for s in segs)).replace('see also ', ''); want = plain(c['text'])   # 'see also' is something the recogniser makes up
        if got == want or got.replace(' ', '') == want.replace(' ', '') or got in ALSO.get(c['text'], []): continue
        bad += 1; print(f"{v}|{c['text']}|{got}", flush=True)
        if '--delete' in sys.argv: os.remove(path)
print('listed', bad, 'of', len(clips) * 3)
