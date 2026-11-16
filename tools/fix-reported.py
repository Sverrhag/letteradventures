# Records again the clips that a visitor has reported as sounding wrong.
#
# A report comes by email from the feedback dialog of the game, with one line per clip:
#   clip sv v4 jungle word_5
# Give those lines, or just their last parts, to this script:
#
#   python tools/fix-reported.py "clip sv v4 jungle word_5" "clip en v1 rainbow long_3"
#
# Nothing else from the email is used. Each line is checked against the list of clips that exist
# (the voice's manifest.json), so a line that names anything else is refused. A word said on its
# own (say_<n>) is made again with say-after-pause.py, everything else with retry-clips.py, which
# only records a clip again when the speech recogniser does not hear its text. A clip that the
# recogniser already hears right is listed as such: then the text itself is probably read in an
# unexpected way (see tools/pronunciations.json), and that takes a person, or Claude, to decide.
#
# Needs GOOGLE_TTS_KEY or GOOGLE_TTS_KEY_FILE.
import json, os, re, subprocess, sys

here = os.path.dirname(os.path.abspath(__file__)); root = os.path.join(here, '..')
LINE = re.compile(r'^(?:clip\s+)?(sv|en|es|fr|pt|de)\s+v([1-5])\s+(?:[a-z]+\s+)?([A-Za-z0-9_]{1,40})$')

todo, refused = {}, []
for arg in sys.argv[1:]:
    m = LINE.match(arg.strip())
    if not m: refused.append(arg); continue
    lang, v, clip = m.group(1), m.group(2), m.group(3)
    manifest = json.load(open(os.path.join(root, 'audio', lang, f'v{v}', 'manifest.json'), encoding='utf-8'))
    if clip not in manifest: refused.append(arg); continue
    todo.setdefault((lang, v), set()).add(clip)

def run(script, *args):
    out = subprocess.run([sys.executable, os.path.join(here, script), *args], capture_output=True, text=True, encoding='utf-8', errors='replace')
    return [l for l in out.stdout.splitlines() if l.strip()]

for (lang, v), clips in sorted(todo.items()):
    words = sorted(c[4:] for c in clips if re.fullmatch(r'say_\d+', c))
    rest = sorted(c for c in clips if not re.fullmatch(r'say_\d+', c))
    print(f'== {lang} v{v}')
    if rest:
        lines = run('retry-clips.py', lang, *rest, '--voices', v, '--rounds', '5')
        first = next((l for l in lines if l.startswith('round 1:')), '')
        if first.startswith('round 1: 0 '): print('  already heard right, nothing recorded:', ' '.join(rest))
        for l in lines:
            if 'heard as' in l: print('  still not heard right:', l)
        if not any('heard as' in l for l in lines) and not first.startswith('round 1: 0 '): print('  recorded again and now heard right:', ' '.join(rest))
    if words:
        for l in run('say-after-pause.py', lang, *words, '--voices', v, '--tries', '8'): print('  ' + l)
# The clips a name is joined to must not have silence around them.
if todo:
    run('trim-silence.py', os.path.join(root, 'audio', '*', 'v*', 'long_*.mp3'), os.path.join(root, 'audio', '*', 'v*', 'hi.mp3'),
        os.path.join(root, 'audio', '*', 'v*', 'greetRest.mp3'), os.path.join(root, 'audio', '*', 'v*', 'hurra*.mp3'))
for r in refused: print('refused (not a clip line):', r[:80])
print('done')
