# Game Flow – Three Worlds

## Celkový herní arc

```
INTRO SCENE (animace, 3.5s)
  ↓
MENU SCENE (Nová hra / Ukončit)
  ↓
GAME SCENE – FÁZE 1: CIRKUS 🎪
  └─ 5 správných odpovědí
        ↓ PŘECHOD: Cinematic overlay → "Jedeme nakupovat!" 🛒
GAME SCENE – FÁZE 2: SUPERMARKET 🛒
  └─ 5 správných odpovědí
        ↓ PŘECHOD: Cinematic overlay → "Jedeme domů!" 🏠
GAME SCENE – FÁZE 3: RODINNÝ DŮM 🏠
  └─ 5 správných odpovědí
        ↓ SLAVNOSTNÍ OBRAZOVKA (v GameScene)
            🏆 "Výborně! Prošel jsi celou hru!"
            🔄 Hrát znovu (scene.restart)
```

## Herní mechanika (stejná ve všech třech světech)

1. Lev Leo ukáže v **speech bubble** cílový objekt (emoji + název).
2. Na pásu projíždějí **4 karty** – jedna je správná, tři jsou distraktory.
3. Hráč **klepne** na správnou kartu.
4. **Správně:** zlatá animace + konfety + Leo skočí + progress dot se vyplní.
5. **Špatně:** jemné otřesení karty, Leo zakroutí hlavou, hra pokračuje.
6. Po dosažení **5 správných odpovědí** v dané fázi se spustí přechod do dalšího světa.

## Ovládání

- Jedno klepnutí / tap na kartu se zvířetem/objektem.
- Žádné swipe, žádné gesta, žádné multi-touch.
- Touch targety ≥ 116 × 126 px (104 + 12px padding na obou stranách).

## Progrese

- Každá fáze: 5 správných odpovědí (cíl viditelný jako 5 progress dots pod bublinou).
- Celá hra: 15 správných odpovědí (5+5+5).
- Žádné game over, žádný time limit, žádný stres.
- Špatná odpověď neodečítá nic – jen jemný feedback a pokračování.
