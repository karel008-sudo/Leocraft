# Architektura – Leocraft

## Technologický stack

| Vrstva | Technologie | Důvod |
|---|---|---|
| Herní engine | Phaser 3 | Zralý, zadarmo, výborná podpora touch & mobile; velká komunita |
| Jazyk | TypeScript | Typová bezpečnost, lepší DX; Phaser 3 má kvalitní typy |
| Bundler | Vite 5 | Okamžitý HMR, rychlý build; nulová konfigurace pro TS |
| Runtime | Prohlížeč (web-first) | Žádná App Store friction; okamžité testování na mobilu |
| Nativní obaly | Capacitor (plánováno) | Hladká migrace z web verze, sdílí 100 % kódu |

---

## Scény a jejich pipeline

```
BootScene → LoadScene → MenuScene → GameScene
                           ↑              |
                           └──────────────┘  (back button)
```

| Scéna | Odpovědnost |
|---|---|
| `BootScene` | Načte minimální assety pro loading screen, přejde do LoadScene |
| `LoadScene` | Zobrazí progress bar, načte všechny herní assety |
| `MenuScene` | Hlavní menu — jedno velké tlačítko HRÁT, bez textu navíc |
| `GameScene` | Herní smyčka (placeholder; nahradit po dodání zadání) |

---

## Souborová struktura – principy

- `src/config/constants.ts` – **jediné místo** pro čísla (rozměry, barvy, klíče scén).  
  Nikdy hardcode čísla přímo do scén.
- `src/types/index.ts` – sdílené typy; scény si přidávají vlastní typy lokálně.
- `src/ui/` – znovupoužitelné herní objekty (Button, Panel…); žádné one-off widgety.
- `src/scenes/` – každá scéna je jedna třída, jeden soubor.

---

## Scaling strategie

Canvas je **540 × 960** (9:16 portrait).  
Phaser Scale Manager ho přizpůsobí viewportu přes `Scale.FIT + CENTER_BOTH`.  
Na tabletech se přidají okraje – hra zůstane čitelná.

---

## Rozšiřování projektu

### Nová scéna
1. Vytvoř `src/scenes/FooScene.ts` (extends `Phaser.Scene`).
2. Přidej klíč do `SCENES` v `constants.ts`.
3. Přidej scénu do `gameConfig.scene[]` v `GameConfig.ts`.

### Nové assety
1. Vlož soubory do `public/assets/images/` nebo `public/assets/audio/`.
2. Načti je v `LoadScene.preload()`.

### Capacitor (nativní obaly)
Viz `docs/mobile-strategy.md` – sekce „Kdy přidat Capacitor".
