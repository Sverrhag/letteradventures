# Writes down the sounds (IPA phonemes) heard in audio clips, with a multilingual phoneme
# recogniser. Used to tell apart words that are spelled alike but said differently
# (English "bow", Swedish "banan"), which a normal speech recogniser cannot do.
#
#   python tools/hear-phonemes.py audio/en/v1/say_46.mp3 [more clips...]
import sys, json, torch
from faster_whisper.audio import decode_audio
from transformers import Wav2Vec2ForCTC
from huggingface_hub import hf_hub_download

NAME = 'facebook/wav2vec2-lv-60-espeak-cv-ft'
model = Wav2Vec2ForCTC.from_pretrained(NAME).eval()
vocab = {i: p for p, i in json.load(open(hf_hub_download(NAME, 'vocab.json'), encoding='utf-8')).items()}

def phonemes(path):
    x = torch.tensor(decode_audio(path, sampling_rate=16000))
    x = (x - x.mean()) / (x.std() + 1e-7)
    with torch.no_grad(): ids = model(x[None]).logits[0].argmax(-1).tolist()
    # Each sound, followed by the time until the next sound begins, in hundredths of a second
    # (a rough measure of its length, which shows where the stress falls).
    skip, out, last = ('<pad>', '<s>', '</s>', '<unk>', '|'), [], None
    for t, i in enumerate(ids):
        if i != last and vocab[i] not in skip: out.append([vocab[i], t])
        last = i
    ends = [t for _, t in out[1:]] + [len(ids)]
    return ' '.join(f'{p}{(e - t) * 2}' for (p, t), e in zip(out, ends))

if __name__ == '__main__':
    for f in sys.argv[1:]: print(f, '\t', phonemes(f), flush=True)
