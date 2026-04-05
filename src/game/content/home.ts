import type { Animal } from '../animals';

/** Household objects – Phase 3. */
export const HOME_OBJECTS: readonly Animal[] = [
  { id: 'shoe',       name: 'Bota',     emoji: '👟', color: 0x4A7AB8, accentColor: 0x305898 },
  { id: 'fork',       name: 'Příbor',   emoji: '🍴', color: 0xA0A8B8, accentColor: 0x708098 },
  { id: 'shirt',      name: 'Tričko',   emoji: '👕', color: 0x3888C8, accentColor: 0x2068A8 },
  { id: 'helmet',     name: 'Helma',    emoji: '⛑️',  color: 0xD08020, accentColor: 0xA86000 },
  { id: 'underwear',  name: 'Trenky',   emoji: '🩲', color: 0xC03858, accentColor: 0xA02040 },
  { id: 'tv',         name: 'Televize', emoji: '📺', color: 0x282838, accentColor: 0x181828 },
  { id: 'phone',      name: 'Mobil',    emoji: '📱', color: 0x303040, accentColor: 0x202030 },
  { id: 'car',        name: 'Autíčko',  emoji: '🚗', color: 0xC03028, accentColor: 0xA01818 },
  { id: 'book',       name: 'Kniha',    emoji: '📚', color: 0xB06030, accentColor: 0x884020 },
  { id: 'toothbrush', name: 'Kartáček', emoji: '🪥', color: 0x38B898, accentColor: 0x209070 },
  { id: 'mug',        name: 'Hrnek',    emoji: '☕', color: 0x906040, accentColor: 0x704028 },
  { id: 'lamp',       name: 'Lampa',    emoji: '💡', color: 0xD8A020, accentColor: 0xB07800 },
] as const;
