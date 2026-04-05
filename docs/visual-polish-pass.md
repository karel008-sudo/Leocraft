# Visual Polish Pass – v0.3.0

## Co bylo přepracováno

### Globální art direction
- **Barevná paleta:** Deep indigo (#1B1F3B) jako primární pozadí, warm amber stropy, prémiový gold jako akcent
- **Vizuální hloubka:** Každá scéna má vrstvené pozadí / střed / popředí s odlišnou hloubkou
- **Gradient simulace:** Vícevrstvé obarvené obdélníky simulují plynulé přechody (utility v `src/utils/draw.ts`)
- **Glow efekty:** Vícevrstvé semi-transparentní kruhy/elipsy kolem klíčových prvků

### IntroScene
- Bohatší hvězdné pozadí (50 hvězd různých velikostí a jasů)
- Nebula blobs (velké semi-transparentní barevné elipsy)
- Zlatý kruh/glow za lvem (spotlight efekt)
- "LEOCRAFT" s outline + animovaný příchod (Back.easeOut z níže)
- Orbitové hvězdičky (10 kusů, staggered, pulsing)
- Tap-to-skip pro netrpělivé

### MenuScene
- Jednotné pozadí s IntroScene (hvězdy + nebula)
- Prémiová tlačítka s gradient fill, drop shadow a inner highlight
- Lion s větším glow spotlightem
- Quit overlay v premium card stylu

### GameScene – herní scéna (nejvýraznější změny)
- **Strop:** Gradient od amber (#B86A08) po pale gold (#FFE8A8), premium pendant světla s glow
- **Stěny:** Warm cream gradient s architektonickými detaily, výlohy/display cases
- **Podlaha:** Premium wood gradient s tile grid a highlight pruhem
- **Pás:** Industrial dark frame (near black), belt surface s gradient, metallic shine pruh,  pohyblivé diagonální pruhy, side roller s detailem
- **Lev:** Circular warm spotlight za emoji, drop shadow elipsa, zlatý glow ring
- **Komiksová bublina:** Shadow layer + main bubble s gradient fill, "NAJDI:" badge v barevné hlavičce, větší zvíře emoji, name v pill
- **Animal karty:** Gradient fill (lighten→animal color), drop shadow, inner highlight strip, name v pill, premium border
- **Top bar:** Full gradient panel, pill-shaped komponenty, mute toggle tlačítko
- **Zpětná vazba:** Złatý card shimmer + confetti burst (barevné kruhy), wrong = brief červený flash

### utils/draw.ts (nový soubor)
- `vGradient()` – simulace svislého gradientu
- `hGradient()` – simulace vodorovného gradientu  
- `circleGlow()` – kruhový glow efekt
- `rectGlow()` – obdélníkový glow efekt
- `lighten()`, `darken()`, `mixColor()` – color math utilities

## Co je stále placeholder

| Prvek | Stav | Náhrada |
|---|---|---|
| Zvířata na kartách | ✅ Emoji (visuálně sjednoceno) | Ilustrované PNG sprity |
| Lev Leo | ✅ Emoji s framing | Animovaná postava |
| Stěny / police | ✅ Graphics procedurálně | Ilustrovaný background |
| Ambientní zvuky | ❌ Chybí | Atmosférické smyčky |
| Particle system | ✅ Emoji tweeny | Phaser Particles emitter |

## Technické detaily

- Všechny efekty jsou Phaser Graphics + Text, žádné externí assety
- Výkon: max ~200 draw calls per frame (Graphics redraw v update() omezen na beltStripes)
- Mobile-safe: žádné WebGL shadery, funkční i v Canvas fallback módu
