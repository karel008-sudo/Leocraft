# Gameplay – první hratelná verze

## Popis hry

Leocraft je vzdělávací hra pro děti od 3 let. Hráč pomáhá lvovi Leovi v obchodě
najít správné zvíře na pokladním pásu.

---

## Herní flow

```
Spuštění
  └─▶ IntroScene  (3,5 s animace s názvem hry)
        └─▶ MenuScene  (Nová hra / Ukončit)
              └─▶ GameScene  (hlavní herní smyčka)
                    └─▶ MenuScene  (tlačítko ←)
```

---

## Herní scéna – jak to funguje

1. **Obchodní centrum** – barevné pozadí s regály, stropními světly a dřevěnou podlahou.
2. **Lev Leo** stojí vlevo u pokladního pásu.
3. **Komiksová bublina** nad Leem zobrazuje cílové zvíře (emoji + název).
4. **"Najdi:"** nápis nad bublinou napovídá, co má hráč hledat.
5. **Pás** se pohybuje zprava doleva; na něm jezdí 4 karty se zvířaty.
6. Hráč **klepne na kartu** s odpovídajícím zvířetem.
7. **Správná odpověď:** karta se rozsvítí zlatě, vybuchnou hvězdičky, Leo skočí radostí, přičítá se ⭐.
8. **Špatná odpověď:** karta se lehce otřese, Leo zakroutí hlavou – nic víc, žádný trest.
9. Po 1,6 s nastoupí **nové kolo** s jiným cílovým zvířetem.
10. Hra **nemá konec** – pokračuje donekonečna, dokud dítě nechce jít zpět.

---

## Zvířata v první verzi

| Emoji | Název     | Barva karty |
|-------|-----------|-------------|
| 🐘    | Slon      | fialová     |
| 🦒    | Žirafa    | oranžová    |
| 🐒    | Opice     | hnědá       |
| 🦓    | Zebra     | šedá        |
| 🐻    | Medvěd    | tmavě hnědá |
| 🦛    | Hroch     | modravá     |
| 🐯    | Tygr      | oranžovohnědá |
| 🐼    | Panda     | tmavá       |

Lev (🦁) je fixní postava – neobjevuje se na pásu.

---

## Placeholder vs. finální obsah

| Prvek               | Stav         | Co nahradit                          |
|---------------------|--------------|--------------------------------------|
| Zvířata na kartách  | ✅ Emoji     | Vlastní ilustrované sprity           |
| Lev Leo             | ✅ Emoji 🦁  | Animovaná postava s výrazy           |
| Obchod – pozadí     | ✅ Graphics  | Ilustrovaný background               |
| Zvuky – správně     | ❌ Chybí     | Veselý zvuk (ding, fanfára)          |
| Zvuky – špatně      | ❌ Chybí     | Jemný zvuk (bloop)                   |
| Hudba na pozadí     | ❌ Chybí     | Klidná smyčkovaná melodie            |
| Leo reakce – výrazy | ✅ Animace   | Různé emoji výrazy nebo sprite sheet |
| Skóre               | ✅ ⭐ počítá | Volitelně duhová animace, odměny     |

---

## Technické detaily

- **Canvas:** 540 × 960 px (portrait 9:16)
- **Belt speed:** 55 px/sec (klidné tempo pro 3leté)
- **Cards per round:** 4 (1 correct + 3 wrong)
- **Next round delay:** 1 600 ms po správném kliknutí
- **Hit area:** 108 × 108 px (přes MIN_TOUCH_TARGET 88 px)
