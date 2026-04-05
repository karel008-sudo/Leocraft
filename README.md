# Leocraft

Mobilní vzdělávací hra pro děti od 3 let.  
Stack: **Phaser 3 · TypeScript · Vite** — web-first, PWA-ready, Capacitor-later.

---

## Rychlý start

```bash
npm install
npm run dev          # Dev server → http://localhost:3000
```

Otevři na mobilu přes IP adresy, kterou Vite vypíše (`Network: http://192.168…`).

---

## Scripts

| Příkaz | Popis |
|---|---|
| `npm run dev` | Dev server s HMR |
| `npm run build` | Produkční build → `dist/` |
| `npm run preview` | Lokální preview produkčního buildu |
| `npm run typecheck` | Kontrola TypeScript bez emitování |

---

## Struktura projektu

```
leocraft/
├── src/
│   ├── config/          # Konstanty, barvy, rozměry
│   ├── game/            # Phaser GameConfig + boot
│   ├── scenes/          # Scény hry (Boot → Load → Menu → Game)
│   ├── ui/              # Znovupoužitelné UI komponenty (Button…)
│   ├── types/           # Sdílené TypeScript typy
│   └── main.ts          # Vstupní bod
├── public/
│   ├── manifest.json    # PWA manifest
│   └── assets/          # Statické assety (obrázky, audio, fonty)
├── docs/                # Architektura, strategie, design principy
├── .github/workflows/   # CI/CD pipeline
├── CLAUDE.md            # Pravidla pro AI agenty
├── index.html
├── vite.config.ts
└── tsconfig.json
```

---

## Git workflow (sólo vývoj s AI agentem)

```
main   ──────●──────────────────●────────  (stabilní, release-ready)
              \                /
dev    ─────●──●──●──●──●──●──             (aktivní vývoj)
                    \    /
feature        ──●──●──                    (krátké feature branches)
```

1. Nový feature vždy v `dev` nebo krátkém `feature/xxx` branchi.
2. Po otestování merge do `dev`.
3. Do `main` mergeuj jen funkční, build-passing verzi.
4. Commity malé a popisné: `feat: add bounce animation to bunny`.

---

## Doporučený další postup

1. Dodej přesné herní zadání (mechaniky, postavy, cíl).
2. Přidej skutečné assety do `public/assets/`.
3. Nahraď placeholder scény (`GameScene`) skutečnou herní logikou.
4. Spusť `npm run build` a ověř produkční build.
5. Nasaď `dist/` na statický hosting (Netlify / GitHub Pages).
6. Až bude hra stabilní, přidej Capacitor pro Android/iOS obaly.

Viz `docs/backlog-initial.md` pro kompletní seznam kroků.
