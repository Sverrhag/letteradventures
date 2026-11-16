# Listens to every recorded clip with a local speech recogniser (faster-whisper) and writes
# down the ones where what it hears is not the text the clip was made from.
#
#   python tools/check-clips.py out.jsonl sv en      (languages to check)
#
# Each line of the result is [lang, voice, id, text, heard]. Nothing heard at all usually
# means a clip without sound. Single letters and very short words are often misheard by the
# recogniser itself, so the list is something to read through, not a list of faults.
import json, os, sys, re, glob, unicodedata

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
out_file, langs = sys.argv[1], sys.argv[2:]
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def plain(s):
    s = unicodedata.normalize('NFD', s.lower().replace('ß', 'ss'))
    s = ''.join(c for c in s if not unicodedata.combining(c))
    return ' '.join(re.sub(r'[^\w\s]', ' ', s).split())

with open(out_file, 'a', encoding='utf-8') as out:
    for lang in langs:
        for v in range(1, 6):
            d = os.path.join(root, 'audio', lang, f'v{v}')
            manifest = json.load(open(os.path.join(d, 'manifest.json'), encoding='utf-8'))
            n = bad = 0
            for id, made_from in manifest.items():
                f = os.path.join(d, id + '.mp3')
                if not os.path.exists(f): continue
                text = re.sub(r'<[^>]+>', '', made_from.split('|', 2)[2])
                segs, _ = model.transcribe(f, language=lang, beam_size=5, condition_on_previous_text=False, without_timestamps=True)
                heard = ' '.join(s.text.strip() for s in segs).strip()
                n += 1
                if plain(heard) != plain(text):
                    bad += 1; out.write(json.dumps([lang, v, id, text, heard], ensure_ascii=False) + '\n'); out.flush()
            print(lang, 'voice', v, 'done:', n, 'clips,', bad, 'not matching', flush=True)
print('done')
