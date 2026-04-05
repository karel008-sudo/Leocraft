# Transitions and Progression

## Progression systém

Třída `ProgressionManager` (`src/game/progression/ProgressionManager.ts`) spravuje stav hry:

```typescript
const pm = new ProgressionManager();

pm.world           // current WorldConfig
pm.score           // correct answers in current phase (0-5)
pm.hasNextWorld    // true if not on last world
pm.isComplete      // true if last world finished

pm.scorePoint()    // record correct answer, returns true if phase complete
pm.advance()       // move to next world, returns new WorldConfig or null
pm.reset()         // restart from beginning
```

## Přechod mezi světy

Spouští se po `pm.scorePoint()` → true a `pm.hasNextWorld` → true.

### Sekvence (`triggerWorldTransition()`)

```
1. [0ms]     roundActive = false, transitioning = true, clearCards()
2. [0ms]     Dark overlay rectangle fades in (alpha 0→0.92, 500ms)
3. [500ms]   buildEnvironment() – přestaví pozadí pod překryvem
             updateBubbleBadge(nextWorld.badgeColor)
             worldIconText.setText(nextWorld.icon)
4. [500ms]   Transition card animates in (Back.easeOut, scale 0→1, 420ms)
             Card content:
               - Velká světová ikona (100px emoji)
               - Název světa (40px bold)
               - Motivační zpráva (🛒 "Jedeme nakupovat!" nebo 🏠 "Jedeme domů!")
               - Dekorativní tečky (accentColor)
5. [2300ms]  Overlay + card fade out (alpha→0, 500ms)
6. [2800ms]  transitioning = false, startRound()
```

### Transition card design

- Bílý zaoblený rectangle (380×440px, radius 28)
- Zlatý rámeček (world accentColor)
- Dekorativní bubliny v rozích
- Velká emoji světa (centred)
- Název světa (bold, tmavý)
- Motivační text (menší, šedý)

## Konec hry

Po dokončení 3. fáze (`!pm.hasNextWorld`):

```
triggerGameComplete()
  → Dark overlay fades in
  → Slavnostní card: 🏆 "Výborně!" + všechny tři světové ikony
  → "🔄 Hrát znovu" button → scene.restart()
```

## Progress dots

5 malých kruhů pod speech bubble (y=485), centrovaných na x=BX=288.

- Prázdné: jen outline (accentColor 35%)
- Vyplněné: plný fill (accentColor 100%) + bílý glow outline
- Refresh: `refreshProgressDots()` volán po každém `scorePoint()`
- Barva: `progression.world.theme.accentColor`
