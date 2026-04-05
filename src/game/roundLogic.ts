import { Animal, getRandomAnimal, getWrongAnimals } from './animals';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Round {
  /** The item the child must find on the belt. */
  target:      Animal;
  /** All items displayed on the belt, already shuffled. */
  beltAnimals: Animal[];
  /** Position of the target within beltAnimals. */
  targetIndex: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BELT_CARD_COUNT = 4;

// ─── Round factory ────────────────────────────────────────────────────────────

/**
 * Creates a new round from the provided item list.
 *
 * @param items        – Full item pool for the current world.
 * @param prevTargetId – Id of the previous target (never repeat immediately).
 */
export function createRound(items: readonly Animal[], prevTargetId?: string): Round {
  const target  = getRandomAnimal(items, prevTargetId ? [prevTargetId] : []);
  const wrongs  = getWrongAnimals(items, target.id, BELT_CARD_COUNT - 1);

  const beltAnimals: Animal[] = [...wrongs];
  const targetIndex = Math.floor(Math.random() * (beltAnimals.length + 1));
  beltAnimals.splice(targetIndex, 0, target);

  return { target, beltAnimals, targetIndex };
}
