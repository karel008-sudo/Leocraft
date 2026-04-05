import { Animal, getRandomAnimal, getWrongAnimals } from './animals';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Round {
  /** The animal the child must find. */
  target: Animal;
  /** All animals shown on the belt, in display order (already shuffled). */
  beltAnimals: Animal[];
  /** Index of the target within beltAnimals. */
  targetIndex: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

/** Total number of animal cards on the belt per round. */
const BELT_CARD_COUNT = 4;

// ─── Round factory ────────────────────────────────────────────────────────────

/**
 * Creates a new round.
 * @param prevTargetId – id of the previous target, so we never repeat immediately.
 */
export function createRound(prevTargetId?: string): Round {
  // Pick target
  const target = getRandomAnimal(prevTargetId ? [prevTargetId] : []);

  // Pick wrong animals (distinct from target)
  const wrongs = getWrongAnimals(target.id, BELT_CARD_COUNT - 1);

  // Shuffle: insert target at a random position among the wrongs
  const beltAnimals: Animal[] = [...wrongs];
  const targetIndex = Math.floor(Math.random() * (beltAnimals.length + 1));
  beltAnimals.splice(targetIndex, 0, target);

  return { target, beltAnimals, targetIndex };
}
