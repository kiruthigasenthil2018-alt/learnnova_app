"""Generates simple synthesized animal sounds (WAV, 22.05 kHz mono) into assets/sounds/animals.
Run:  python3 tools/make_animal_sounds.py      (needs numpy)
These are cartoon-style placeholders. To use real recordings, overwrite the files with the same names (dog.wav ...)."""
import numpy as np, wave, os
SR = 22050
rng = np.random.default_rng(7)
out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'sounds', 'animals')
os.makedirs(out, exist_ok=True)

def t(d): return np.arange(int(SR * d)) / SR
def lerp(x, pts):  # piecewise-linear curve over normalised time 0..1
    xs, ys = zip(*pts); return np.interp(x, xs, ys)
def env(n, a=0.02, r=0.1):
    e = np.ones(n); na, nr = int(SR * a), int(SR * r)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def voice(f0, formants, bw=None, n_harm=40, tilt=1.0):
    """Source-filter synthesis: harmonic series shaped by (moving) formant peaks. formants = list of arrays (Hz per sample)."""
    ph = 2 * np.pi * np.cumsum(f0) / SR; y = np.zeros(len(f0))
    for k in range(1, n_harm + 1):
        fr = k * f0; amp = np.zeros(len(f0))
        for i, F in enumerate(formants):
            w = (bw[i] if bw else 150 + 0.08 * F.mean())
            amp += (1.0 / (i + 1)) * np.exp(-0.5 * ((fr - F) / w) ** 2)
        amp += 0.04 / k ** tilt
        amp[fr > SR / 2 - 500] = 0
        y += amp * np.sin(k * ph)
    return y
def noise(n, lo=0, hi=SR/2):
    x = rng.standard_normal(n); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1/SR)
    X[(f < lo) | (f > hi)] = 0; return np.fft.irfft(X, n)
def norm(y, g=0.85): return g * y / (np.max(np.abs(y)) + 1e-9)
def save(name, y):
    y = np.concatenate([np.zeros(300), norm(y), np.zeros(600)])
    with wave.open(os.path.join(out, name + '.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y * 32767).astype('<i2').tobytes())
def silence(d): return np.zeros(int(SR * d))
def cat_(*a): return np.concatenate(a)

def bark():
    d = 0.22; x = t(d) / d
    f0 = lerp(x, [(0, 330), (0.25, 260), (1, 150)])
    y = voice(f0, [lerp(x, [(0, 700), (1, 550)]), lerp(x, [(0, 1300), (1, 1000)]), np.full_like(x, 2400)], [140, 200, 300])
    y = y * np.exp(-6 * x) * env(len(x), 0.004, 0.03) + 0.5 * noise(len(x), 500, 4000) * np.exp(-18 * x)
    return y
def dog(): return cat_(bark(), silence(0.12), bark() * 0.9, silence(0.15), bark() * 0.8)

def cat():
    d = 1.0; x = t(d) / d
    f0 = lerp(x, [(0, 420), (0.25, 700), (0.6, 640), (1, 380)])
    f1 = lerp(x, [(0, 450), (0.3, 900), (0.7, 750), (1, 500)]); f2 = lerp(x, [(0, 2300), (0.3, 1800), (1, 1100)])
    y = voice(f0 * (1 + 0.012 * np.sin(2 * np.pi * 6 * x * d)), [f1, f2, np.full_like(x, 3200)], [120, 200, 300])
    return y * (np.sin(np.pi * x) ** 0.7) * env(len(x), 0.05, 0.12)

def cow():
    d = 1.6; x = t(d) / d
    f0 = lerp(x, [(0, 105), (0.2, 128), (0.8, 98), (1, 78)]) * (1 + 0.02 * np.sin(2 * np.pi * 5 * x * d))
    f1 = lerp(x, [(0, 300), (0.3, 420), (1, 300)])
    y = voice(f0, [f1, np.full_like(x, 800), np.full_like(x, 1500)], [90, 150, 200], tilt=1.3)
    return y * env(len(x), 0.12, 0.25) * (0.75 + 0.25 * np.sin(np.pi * x))

def duck():
    def q():
        d = 0.2; x = t(d) / d
        f0 = lerp(x, [(0, 420), (1, 300)])
        y = voice(f0, [np.full_like(x, 900), np.full_like(x, 2100), np.full_like(x, 3000)], [200, 300, 400], tilt=0.6)
        y = y * (0.55 + 0.45 * np.sign(np.sin(2 * np.pi * 70 * x * d))) + 0.25 * noise(len(x), 800, 3500)
        return y * env(len(x), 0.008, 0.06) * np.exp(-2 * x)
    return cat_(q(), silence(0.1), q(), silence(0.1), q() * 0.8)

def lion():
    d = 2.0; x = t(d) / d
    f0 = lerp(x, [(0, 70), (0.2, 95), (0.7, 60), (1, 38)]) * (1 + 0.04 * np.sin(2 * np.pi * 14 * x * d))
    y = voice(f0, [lerp(x, [(0, 500), (0.5, 800), (1, 400)]), np.full_like(x, 1400), np.full_like(x, 2500)], [200, 300, 500], tilt=0.7)
    y = y + 0.9 * noise(len(x), 80, 1800) * (0.6 + 0.4 * np.sin(2 * np.pi * 22 * x * d))
    return y * np.minimum(1, x * 6) * np.exp(-1.2 * x ** 2) * env(len(x), 0.05, 0.3)

def sheep():
    d = 1.1; x = t(d) / d
    f0 = lerp(x, [(0, 300), (0.5, 330), (1, 260)]) * (1 + 0.09 * np.sin(2 * np.pi * 26 * x * d))
    y = voice(f0, [lerp(x, [(0, 900), (1, 700)]), np.full_like(x, 1500), np.full_like(x, 2500)], [200, 250, 400], tilt=0.8)
    return y * env(len(x), 0.03, 0.15) * (0.7 + 0.3 * np.sin(2 * np.pi * 26 * x * d) ** 2)

def frog():
    def rib(f):
        d = 0.16; x = t(d) / d
        y = voice(np.full_like(x, f) * (1 + 0.1 * x), [np.full_like(x, 600), np.full_like(x, 1500)], [150, 250], tilt=0.9)
        return y * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 45 * x * d))) * env(len(x), 0.01, 0.04)
    return cat_(rib(140), silence(0.05), rib(170), silence(0.2), rib(140), silence(0.05), rib(175))

def horse():
    d = 1.7; x = t(d) / d
    f0 = lerp(x, [(0, 500), (0.2, 1050), (0.45, 900), (0.75, 650), (1, 330)]) * (1 + 0.03 * np.sin(2 * np.pi * 13 * x * d))
    y = voice(f0, [lerp(x, [(0, 900), (0.3, 1500), (1, 800)]), np.full_like(x, 2800), np.full_like(x, 4000)], [250, 400, 500], tilt=0.7)
    y = y + 0.35 * noise(len(x), 1000, 5000) * (x > 0.7)
    return y * np.minimum(1, x * 12) * env(len(x), 0.02, 0.25)

def elephant():
    d = 1.5; x = t(d) / d
    f0 = lerp(x, [(0, 300), (0.25, 650), (0.7, 720), (1, 420)]) * (1 + 0.015 * np.sin(2 * np.pi * 9 * x * d))
    y = voice(f0, [np.full_like(x, 1400), np.full_like(x, 2600), np.full_like(x, 3800)], [500, 600, 700], tilt=0.5)
    y = y + 0.4 * noise(len(x), 600, 4000)
    return y * np.minimum(1, x * 10) * env(len(x), 0.02, 0.3) * (0.8 + 0.2 * np.sin(2 * np.pi * 30 * x * d))

def monkey():
    def hoot(f, ah=False):
        d = 0.26; x = t(d) / d
        f0 = lerp(x, [(0, f * 0.8), (0.3, f * 1.1), (1, f * 0.9)])
        f1 = np.full_like(x, 750 if ah else 360); f2 = np.full_like(x, 1200 if ah else 800)
        return voice(f0, [f1, f2, np.full_like(x, 2800)], [120, 180, 300]) * env(len(x), 0.02, 0.08)
    return cat_(hoot(520), silence(0.05), hoot(560), silence(0.05), hoot(600), silence(0.12), hoot(700, True), silence(0.05), hoot(760, True))

for name, fn in dict(dog=dog, cat=cat, cow=cow, duck=duck, lion=lion, sheep=sheep, frog=frog, horse=horse, elephant=elephant, monkey=monkey).items():
    save(name, fn()); print('wrote', name)
