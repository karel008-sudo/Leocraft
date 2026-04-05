# Backlog – další vizuální kroky

## Priorita 1 – Art assets (největší skok kvality)

- [ ] Ilustrovaný mascot Leo (SVG nebo PNG sprite sheet s animacemi: idle, happy, thinking)
- [ ] Ilustrované karty zvířat (8 zvířat × 2 stavy: normal + highlighted)
- [ ] Illustrated store background (painting/illustration style, ne procedurální)
- [ ] Logo "LEOCRAFT" jako skutečný asset (SVG/PNG s premium typografií)
- [ ] PWA ikony (192px, 512px) z finálního brandu

## Priorita 2 – Animace a motion

- [ ] Phaser Particles emitter pro konfety (nahradit emoji tweeny)
- [ ] Leo idle animation: sprite sheet s dýcháním, mrkáním, pohybem uší
- [ ] Belt entrance: karty se "najedou" na pás z pravé strany (slide-in effect)
- [ ] Screen shake mikro-efekt při správné odpovědi (camera.shake)
- [ ] Transitional animations mezi scénami (slide, reveal)
- [ ] "Streak" bonusová animace po 3 správných v řadě

## Priorita 3 – Audio

- [ ] Nahradit procedurální tóny reálnými audio soubory (.ogg)
- [ ] Ambient store sounds (jemný šum supermarketu)
- [ ] Leo voice: "Výborně!", "Zkus to znovu!", "Slon!" (hlasové popisky)
- [ ] Intro jingle (krátká melodie na uvítání)
- [ ] Transition sound effects

## Priorita 4 – UI/UX

- [ ] Animovaný score display (čísla "vyletí" při přičítání)
- [ ] "Streak" indikátor (3+ v řadě = speciální feedback)
- [ ] Settings screen (hlasitost, jazyk)
- [ ] Better quit confirmation (animovaný modal s Leem)
- [ ] Onboarding arrow/highlight (první kolo: arrow ukazuje na bublinu a pás)

## Priorita 5 – Tech polish

- [ ] Sprite atlasy pro výkon (TextureAtlas místo jednotlivých PNG)
- [ ] WebGL shader pro belt (scanline efekt, metallic shimmer)
- [ ] Adaptive quality (automaticky snižuj efekty na low-end zařízeních)
- [ ] Lighthouse PWA audit a optimalizace

---

## Doporučený příští prompt (vizuální iterace)

> "Pokračuji v Leocraft visual polish. Chci přidat Phaser Particles emitter pro konfety
> při správné odpovědi — nahraď emoji tweeny v `spawnStarBurst()` v GameScene.ts.
> Použij Phaser.GameObjects.Particles s jednoduchou konfigurací bez externích texture assets
> (použij Graphics texture nebo zabudovaný shape). Zachovej existující logiku kol."
