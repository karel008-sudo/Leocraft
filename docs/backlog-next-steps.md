# Backlog – Další kroky

## Priorita 1 – Okamžitě hratelné vylepšení

- [ ] Zvukový feedback pro přechod mezi světy (zvláštní melodie/jingle)
- [ ] Leo voice clips: "Výborně!", "Zkus to znovu!" (TTS nebo nahrávky)
- [ ] Ilustrovaná zvířata (PNG sprity místo emoji na kartách)
- [ ] Ilustrovaný Leo (sprite sheet: idle, happy, thinking)

## Priorita 2 – Herní obsah

- [ ] Rozšíření každé kategorie na 15+ objektů
- [ ] Obtížnostní stupně (rychlost pásu, počet distraktorů)
- [ ] 4. svět: ZOO nebo ZAHRADA nebo ŠKOLA (snadno přidatelný přes WorldConfig)
- [ ] Lokalizace do angličtiny (i18n systém)

## Priorita 3 – Vizuální polish

- [ ] Phaser Particles emitter (místo emoji konfety)
- [ ] Leo idle animace na platform (dýchání, mrkání)
- [ ] Microanimace pro každý svět (vlající plachty v cirkuse, blikající cena v supermarketu, houpající se lampa doma)
- [ ] Přechod pomocí "wipe" (škrabnutí odhalující nové prostředí)

## Priorita 4 – Technická infrastruktura

- [ ] Sprite Atlas (TextureAtlas) pro výkon
- [ ] localStorage pro uložení progress (děti se mohou vracet)
- [ ] Capacitor wrapper pro Google Play
- [ ] Service Worker (offline support)
- [ ] PWA ikony (192px, 512px)

---

## Doporučený příští prompt

```
Pokračuji v Leocraft. Momentálně máme tři světy (cirkus/supermarket/domov) s emoji objekty.
Chci přidat ilustrovaná zvířata jako PNG sprity:
1. Jak strukturovat assets v public/assets/sprites/circus/ ?
2. Jak načíst sprity v LoadScene.preload() ?
3. Jak nahradit emoji v createCard() a buildBubble() za Phaser Image objekty ?
4. Jak zachovat správné scalování a zarovnání ?
Zachovej existující architekturu, jen ukáž konkrétní úpravy v LoadScene a GameScene.
```
