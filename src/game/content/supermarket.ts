import type { Animal } from '../animals';

/** Supermarket produce – Phase 2. */
export const SUPERMARKET_PRODUCE: readonly Animal[] = [
  { id: 'apple',      name: 'Jablko',    emoji: '🍎', color: 0xC83020, accentColor: 0xA01810 },
  { id: 'banana',     name: 'Banán',     emoji: '🍌', color: 0xD8B020, accentColor: 0xB08800 },
  { id: 'pear',       name: 'Hruška',    emoji: '🍐', color: 0x6AA028, accentColor: 0x487010 },
  { id: 'orange',     name: 'Pomeranč',  emoji: '🍊', color: 0xD87020, accentColor: 0xB05010 },
  { id: 'strawberry', name: 'Jahoda',    emoji: '🍓', color: 0xC82040, accentColor: 0xA01030 },
  { id: 'carrot',     name: 'Mrkev',     emoji: '🥕', color: 0xD86020, accentColor: 0xB04010 },
  { id: 'cucumber',   name: 'Okurka',    emoji: '🥒', color: 0x489028, accentColor: 0x306010 },
  { id: 'tomato',     name: 'Rajče',     emoji: '🍅', color: 0xC02028, accentColor: 0xA01018 },
  { id: 'corn',       name: 'Kukuřice',  emoji: '🌽', color: 0xD0B818, accentColor: 0xA88800 },
  { id: 'broccoli',   name: 'Brokolice', emoji: '🥦', color: 0x308028, accentColor: 0x185810 },
  { id: 'lemon',      name: 'Citron',    emoji: '🍋', color: 0xD0C818, accentColor: 0xA89800 },
  { id: 'pepper',     name: 'Paprika',   emoji: '🫑', color: 0x289028, accentColor: 0x106010 },
] as const;
