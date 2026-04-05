// ─── Shared selectable-item interface ─────────────────────────────────────────
// Used by all three worlds (circus, supermarket, home).
// Named "Animal" for historical reasons; it represents any selectable game object.

export interface Animal {
  id:          string;
  name:        string;   // Czech display name
  emoji:       string;   // Visual representation (sprite placeholder)
  color:       number;   // Card background (Phaser hex)
  accentColor: number;   // Card border / accent
}

// ─── Helpers (list-aware) ─────────────────────────────────────────────────────

/** Returns a random item from `from`, excluding specified ids. */
export function getRandomAnimal(
  from:       readonly Animal[],
  excludeIds: string[] = [],
): Animal {
  const pool = from.filter(a => !excludeIds.includes(a.id));
  if (pool.length === 0) return from[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Returns `count` distinct wrong items from `from` (all different from targetId). */
export function getWrongAnimals(
  from:     readonly Animal[],
  targetId: string,
  count:    number,
): Animal[] {
  const pool   = from.filter(a => a.id !== targetId);
  const result: Animal[] = [];
  const used   = new Set<string>([targetId]);

  for (let i = 0; i < count && pool.length > 0; i++) {
    const available = pool.filter(a => !used.has(a.id));
    if (available.length === 0) break;
    const pick = available[Math.floor(Math.random() * available.length)];
    result.push(pick);
    used.add(pick.id);
  }
  return result;
}
