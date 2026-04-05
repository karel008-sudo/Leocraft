# Audio systém – Leocraft

## Architektura

Soubor: `src/audio/AudioManager.ts`  
Export: `audioManager` (singleton instance)

## Jak to funguje

Leocraft používá **Web Audio API** pro procedurální generování zvuků bez externích souborů.

### AudioContext a user gesture

Prohlížeče vyžadují user gesture před spuštěním AudioContext. Řešení:
- `audioManager.unlock()` je zavoláno při první interakci uživatele
- Dokud uživatel neklepne, AudioContext neexistuje → žádné chyby, žádný zvuk
- Po prvním tapnutí je context vytvořen a všechny další zvuky fungují

### Zvuky

| Metoda | Popis | Frekvence |
|---|---|---|
| `playSuccess()` | Stoupající C-major arpeggio (4 tóny) | C5→E5→G5→C6 |
| `playWrong()` | Jemný klesající dvoutón | B3→G3 |

### Master gain a mute

- Master gain node (`GainNode`) je mezi všemi oscillátory a výstupem
- `toggleMute()` nastaví master gain na 0 nebo 0.7 s plynulým fade (setTargetAtTime)
- Stav je synchronizován s UI tlačítkem v top baru

## Použití ve scénách

```typescript
import { audioManager } from '../audio/AudioManager';

// V create() – odemknout po první interakci:
this.input.once('pointerdown', () => audioManager.unlock());

// Po správné odpovědi:
audioManager.playSuccess();

// Po špatné odpovědi:
audioManager.playWrong();

// Toggle mute (vrací nový stav):
const nowMuted = audioManager.toggleMute();
```

## Mute toggle v UI

Top bar GameScene obsahuje 🔊/🔇 ikonu:
- Tap toggleuje `audioManager.toggleMute()`
- Text ikony se okamžitě aktualizuje
- Stav je vizuálně jasný (ikona + opacity změna pill pozadí)

## Rozšiřitelnost

Pro přidání nových zvuků přidej metodu do `AudioManager`:
```typescript
playLevelUp(): void {
  if (this._muted) return;
  const env = this.ensure();
  if (!env) return;
  // ... definuj tóny
}
```

## Limity

- WebAudio generované tóny jsou jednoduché (sine wave) – vhodné pro prototyp
- Pro finální produkci doporučujeme nahradit real audio soubory (.ogg/.mp3) přes Phaser.Loader
- iOS Safari může stále vyžadovat user gesture i s unlock() voláním – testuj na reálném zařízení
