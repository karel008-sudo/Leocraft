// ─── Animal definition ────────────────────────────────────────────────────────

export interface Animal {
  id:          string;
  name:        string;   // Czech display name
  emoji:       string;   // Placeholder visual (replaced by sprite later)
  color:       number;   // Card background color (Phaser hex)
  accentColor: number;   // Card border / accent color
}

// ─── Animal roster ────────────────────────────────────────────────────────────
// Lion (🦁) is the host character and is intentionally excluded from this list.

export const ANIMALS: readonly Animal[] = [
  { id: 'elephant', name: 'Slon',    emoji: '🐘', color: 0x7C73C0, accentColor: 0x5A52A0 },
  { id: 'giraffe',  name: 'Žirafa',  emoji: '🦒', color: 0xE8A838, accentColor: 0xC07820 },
  { id: 'monkey',   name: 'Opice',   emoji: '🐒', color: 0xA0714A, accentColor: 0x785232 },
  { id: 'zebra',    name: 'Zebra',   emoji: '🦓', color: 0x5A6070, accentColor: 0x3A4050 },
  { id: 'bear',     name: 'Medvěd',  emoji: '🐻', color: 0x8B4513, accentColor: 0x6B3210 },
  { id: 'hippo',    name: 'Hroch',   emoji: '🦛', color: 0x7E8CB0, accentColor: 0x5E6C90 },
  { id: 'tiger',    name: 'Tygr',    emoji: '🐯', color: 0xE07820, accentColor: 0xC05810 },
  { id: 'panda',    name: 'Panda',   emoji: '🐼', color: 0x4A4A4A, accentColor: 0x2A2A2A },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns a random animal, optionally excluding specific ids. */
export function getRandomAnimal(excludeIds: string[] = []): Animal {
  const pool = ANIMALS.filter(a => !excludeIds.includes(a.id));
  if (pool.length === 0) return ANIMALS[0]; // fallback, should not happen
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Returns distinct wrong animals for use alongside the target. */
export function getWrongAnimals(targetId: string, count: number): Animal[] {
  const pool = ANIMALS.filter(a => a.id !== targetId);
  const result: Animal[] = [];
  const used = new Set<string>([targetId]);

  for (let i = 0; i < count && pool.length > 0; i++) {
    const available = pool.filter(a => !used.has(a.id));
    if (available.length === 0) break;
    const pick = available[Math.floor(Math.random() * available.length)];
    result.push(pick);
    used.add(pick.id);
  }
  return result;
}
