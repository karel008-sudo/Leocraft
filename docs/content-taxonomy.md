# Content Taxonomy

Všechny selectable objekty sdílejí stejné rozhraní `Animal` (historický název, platí pro všechny kategorie):

```typescript
interface Animal {
  id:          string;
  name:        string;   // Czech display name
  emoji:       string;   // Visual placeholder (sprite later)
  color:       number;   // Card background (Phaser hex)
  accentColor: number;   // Card border
}
```

---

## 🎪 Fáze 1 – Cirkus (`src/game/content/circus.ts`)

| Id | Název | Emoji | Barva karty |
|---|---|---|---|
| elephant | Slon | 🐘 | fialová |
| giraffe | Žirafa | 🦒 | oranžová |
| monkey | Opice | 🐒 | hnědá |
| zebra | Zebra | 🦓 | šedá |
| bear | Medvěd | 🐻 | tmavě hnědá |
| hippo | Hroch | 🦛 | modravá |
| tiger | Tygr | 🐯 | oranžovohnědá |
| panda | Panda | 🐼 | tmavá |

---

## 🛒 Fáze 2 – Supermarket (`src/game/content/supermarket.ts`)

| Id | Název | Emoji | Barva karty |
|---|---|---|---|
| apple | Jablko | 🍎 | červená |
| banana | Banán | 🍌 | žlutá |
| pear | Hruška | 🍐 | zelená |
| orange | Pomeranč | 🍊 | oranžová |
| strawberry | Jahoda | 🍓 | tmavě červená |
| carrot | Mrkev | 🥕 | oranžová |
| cucumber | Okurka | 🥒 | zelená |
| tomato | Rajče | 🍅 | červená |
| corn | Kukuřice | 🌽 | žlutá |
| broccoli | Brokolice | 🥦 | tmavě zelená |
| lemon | Citron | 🍋 | citronová |
| pepper | Paprika | 🫑 | jasně zelená |

---

## 🏠 Fáze 3 – Domov (`src/game/content/home.ts`)

| Id | Název | Emoji | Barva karty |
|---|---|---|---|
| shoe | Bota | 👟 | modrá |
| fork | Příbor | 🍴 | šedá |
| shirt | Tričko | 👕 | světle modrá |
| helmet | Helma | ⛑️ | zlatá |
| underwear | Trenky | 🩲 | červenorůžová |
| tv | Televize | 📺 | tmavá |
| phone | Mobil | 📱 | tmavá |
| car | Autíčko | 🚗 | červená |
| book | Kniha | 📚 | hnědá |
| toothbrush | Kartáček | 🪥 | tyrkysová |
| mug | Hrnek | ☕ | hnědá |
| lamp | Lampa | 💡 | zlatožlutá |

---

## Round generation

```typescript
// createRound(items: readonly Animal[], prevTargetId?: string): Round
// - Picks 1 target (not same as previous)
// - Picks 3 wrong distractors (distinct, same world)
// - Shuffles all 4 into random order
// - Returns { target, beltAnimals[4], targetIndex }
```
