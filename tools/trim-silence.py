# Cuts the silence off the start and end of recorded clips, without encoding them
# again; whole MP3 frames (24 ms each) are dropped. Used for the name clips and the phrases a name is joined
# to ("Hi," + "Moa!" + "Welcome ..."), where the voice's own pauses would add up to a long gap.
#
#   python tools/trim-silence.py [--trail 200] <files, folders or patterns ...>
#
# --trail is how many milliseconds of silence to keep after the last sound (default 30).
# About 50 ms is always kept before the first sound. Running it again on a trimmed clip
# changes nothing. A clip with no sound at all is reported and left alone.
import sys, os, glob
import numpy as np
from faster_whisper.audio import decode_audio

BITRATES = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]
RATES = [22050, 24000, 16000]

def frames(b):
    """The byte ranges of the MPEG-2 layer III frames in b, and the sample rate; None if it is something else."""
    out, i, rate = [], 0, None
    while i + 4 <= len(b):
        if b[i] != 0xFF or (b[i + 1] & 0xFE) != 0xF2: return None
        br, sr, pad = b[i + 2] >> 4, (b[i + 2] >> 2) & 3, (b[i + 2] >> 1) & 1
        if br in (0, 15) or sr == 3: return None
        rate = RATES[sr]
        n = 72 * BITRATES[br] * 1000 // rate + pad
        out.append((i, i + n)); i += n
    return out, rate

def trim(path, trail_ms):
    b = open(path, 'rb').read()
    fr = frames(b)
    if not fr: return 'not trimmed (unknown format)'
    fr, rate = fr
    x = decode_audio(path, sampling_rate=rate)
    win = rate // 200                                    # 5 ms
    peak = np.abs(x[:len(x) // win * win]).reshape(-1, win).max(1) if len(x) >= win else np.zeros(0)
    if not len(peak) or peak.max() < 0.02: return 'SILENT'
    loud = np.nonzero(peak > max(peak.max() * 0.03, 0.004))[0]   # louder than breath and hiss
    # The decoder puts out every frame about 1105 samples late.
    first, last = max(0, loud[0] * win - 1105) // 576, max(0, (loud[-1] + 1) * win - 1105) // 576
    # Two frames are kept before the first sound; a frame or two too many are left as they are,
    # so that a clip that has been trimmed once is not cut again.
    a = first - 2 if first > 3 else 0
    z = last + 2 + -(-trail_ms * rate // 1000 // 576)
    if z > len(fr) - 2: z = len(fr)
    if a == 0 and z == len(fr): return None
    open(path, 'wb').write(b[fr[a][0]:fr[z - 1][1]])
    return None

if __name__ == '__main__':
    args, trail = sys.argv[1:], 30
    if args[:1] == ['--trail']: trail, args = int(args[1]), args[2:]
    files = []
    for a in args:
        if os.path.isdir(a): files += glob.glob(os.path.join(a, '**', '*.mp3'), recursive=True)
        else: files += glob.glob(a) or [a]
    for n, f in enumerate(files):
        note = trim(f, trail)
        if note: print(f, note, flush=True)
        if n % 5000 == 4999: print(n + 1, 'of', len(files), flush=True)
    print('trimmed', len(files), 'clips')
