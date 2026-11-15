# Listens to the recorded word clips with a local speech recogniser (faster-whisper) and
# writes down what it hears, so words that are spoken wrongly can be found without anyone
# having to listen to 12,000 clips.
#
#   python tools/check-words.py words.json out.json sv en      (languages to check)
#
# words.json is {lang: {code, words: [[WORD, emoji], ...]}}. For every word and voice the
# clip say_<i>.mp3 (the bare word) is transcribed. A clip is "ok" when the transcript is the
# word; otherwise word_<i>.mp3 ("Spell the word X.") is transcribed too, where the sentence
# around it makes recognition far more reliable. The result holds everything that did not
# match, for review.
import json, os, sys, re, glob, unicodedata

site = os.path.join(os.path.dirname(sys.executable), '..', 'Lib', 'site-packages', 'nvidia')
for d in glob.glob(os.path.join(site, '*', 'bin')):
    os.add_dll_directory(d); os.environ['PATH'] = d + os.pathsep + os.environ['PATH']
from faster_whisper import WhisperModel

root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
words_file, out_file, langs = sys.argv[1], sys.argv[2], sys.argv[3:]
W = json.load(open(words_file, encoding='utf-8'))
model = WhisperModel('large-v3', device='cuda', compute_type='float16')

def norm(s):
    s = unicodedata.normalize('NFC', s.lower().replace('ß', 'ss'))
    return re.sub(r'[^\w\s]', '', s).strip()
def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', norm(s)) if not unicodedata.combining(c))
def hear(path, lang):
    segs, _ = model.transcribe(path, language=lang, beam_size=5, condition_on_previous_text=False, without_timestamps=True)
    return ' '.join(s.text.strip() for s in segs).strip()

result = json.load(open(out_file, encoding='utf-8')) if os.path.exists(out_file) else {}
for lang in langs:
    bad, n = [], 0
    for v in range(1, 6):
        for i, (word, emoji) in enumerate(W[lang]['words']):
            f = os.path.join(root, 'audio', lang, f'v{v}', f'say_{i}.mp3')
            if not os.path.exists(f): bad.append([v, i, word, emoji, 'MISSING', '']); continue
            n += 1
            t = hear(f, lang)
            if norm(t) == norm(word): continue
            t2 = hear(os.path.join(root, 'audio', lang, f'v{v}', f'word_{i}.mp3'), lang)
            in_sentence = plain(word) in plain(t2).split() or norm(word) in norm(t2)
            bad.append([v, i, word, emoji, t, t2, in_sentence])
        print(lang, 'voice', v, 'done;', len(bad), 'not matching so far', flush=True)
    result[lang] = {'checked': n, 'bad': bad}
    json.dump(result, open(out_file, 'w', encoding='utf-8'), ensure_ascii=False)
print('done')
