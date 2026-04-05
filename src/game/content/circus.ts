import type { Animal } from '../animals';

/** Circus animals – Phase 1. Leo (🦁) is host and excluded. */
export const CIRCUS_ANIMALS: readonly Animal[] = [
  { id: 'elephant', name: 'Slon',    emoji: '🐘', color: 0x7C73C0, accentColor: 0x5A52A0 },
  { id: 'giraffe',  name: 'Žirafa',  emoji: '🦒', color: 0xE8A838, accentColor: 0xC07820 },
  { id: 'monkey',   name: 'Opice',   emoji: '🐒', color: 0xA0714A, accentColor: 0x785232 },
  { id: 'zebra',    name: 'Zebra',   emoji: '🦓', color: 0x5A6070, accentColor: 0x3A4050 },
  { id: 'bear',     name: 'Medvěd',  emoji: '🐻', color: 0x8B4513, accentColor: 0x6B3210 },
  { id: 'hippo',    name: 'Hroch',   emoji: '🦛', color: 0x7E8CB0, accentColor: 0x5E6C90 },
  { id: 'tiger',    name: 'Tygr',    emoji: '🐯', color: 0xE07820, accentColor: 0xC05810 },
  { id: 'panda',    name: 'Panda',   emoji: '🐼', color: 0x4A4A4A, accentColor: 0x2A2A2A },
] as const;
