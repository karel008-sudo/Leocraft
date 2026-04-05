# Design principy – Leocraft (děti 3+)

Tyto principy jsou technicky závazné. Každá nová feature musí projít tímto filtrem.

---

## 1. Ovládání

| Pravidlo | Minimum | Proč |
|---|---|---|
| Velikost touch targetu | ≥ 88 × 88 px | Prsty 3letých jsou nepřesné; konstanta `MIN_TOUCH_TARGET` |
| Feedback na tap | Vždy vizuální (scale, color, particle) | Dítě musí vědět, že klepnutí zaregistrovalo |
| Audio feedback | Doporučeno na každou akci | Zvuk potvrzuje akci; musí jít globálně vypnout |
| Počet současných akcí | Max 1 | Žádné combo, žádné gesta (swipe only jako doplněk) |
| Gesta | Pouze tap; swipe max jako bonus | Drag & drop je pro 3leté těžký |

## 2. Vizuál

- Velké, jasné objekty; minimální detail v pozadí.
- Max 3–4 barvy na scénu (pozadí, hlavní objekt, akce, text).
- Žádný blikající ani strobující obsah (epileptická bezpečnost).
- Animace: plynulé, pomalé (300–600 ms tweeny); žádné náhlé skoky.
- Font: velký (min 28 px), bez serifů, vysoký kontrast (4.5:1+).

## 3. UX flow

- **Žádný onboarding s textem.** Dítě hru pochopí hraním.
- Maximálně 1 tlačítko na obrazovce v klíčových momentech.
- Žádné časové limity, které by stresovaly.
- Žádné trestné mechaniky (Game Over s negativní hudbou apod.).
- Průběh vždy uložen — dítě může hru kdykoli přerušit.

## 4. Audio

```typescript
// Každý zvuk musí:
// 1) být krátký (< 2 s pro feedback)
// 2) být přátelský (žádné disonance, žádné výkřiky)
// 3) jít globálně vypnout přes soundEnabled v GameState
// 4) NIKDY nespouštět bez gesta uživatele (browser autoplay policy)
```

- Hudba: klidná, smyčková, dětsky přátelská.
- SFX: pop, ping, woosh — žádné drsné zvuky.
- Hlasitost: výchozí 80 %, konstanta `AUDIO.MASTER_VOLUME`.

## 5. Bezpečnost obsahu

- Žádné in-app purchases ani reklamy bez rodičovského svolení.
- Žádné odkazy na internet, sociální sítě nebo chat.
- Žádný text, který dítě v 3 letech nemůže přečíst (preferuj ikony).
- Žádné násilné nebo děsivé elementy.

## 6. Výkon

- Cíl: 60 FPS na mid-range Androidu (2020+).
- Max velikost bundlu: 5 MB gzipped (Phaser ~1.5 MB, zbytek assets).
- Lazy-load assety ve scénách, kde jsou potřeba.
- Žádné synchronní blokující operace v `update()`.

---

## Checklist pro nové features

Před merge každé nové herní feature zkontroluj:

- [ ] Touch target ≥ 88 px
- [ ] Vizuální feedback na tap
- [ ] Zvuk jde vypnout
- [ ] Žádný text nutný k pochopení mechaniky
- [ ] Funguje v portrait mode na 375 px šířce
- [ ] 60 FPS na low-end zařízení (or profiling done)
