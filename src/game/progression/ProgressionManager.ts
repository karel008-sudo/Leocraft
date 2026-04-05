import type { Animal } from '../animals';
import { CIRCUS_ANIMALS }     from '../content/circus';
import { SUPERMARKET_PRODUCE } from '../content/supermarket';
import { HOME_OBJECTS }        from '../content/home';

// ─── World theme ──────────────────────────────────────────────────────────────

export interface WorldTheme {
  // Ceiling gradient (top → bottom)
  ceilingTop:    number;
  ceilingBot:    number;
  // Wall gradient (top → bottom)
  wallTop:       number;
  wallBot:       number;
  // Floor gradient (top → bottom)
  floorTop:      number;
  floorBot:      number;
  // Belt colours
  beltFrame:     number;
  beltSurf:      number;
  beltStripe:    number;
  beltShine:     number;
  // Atmosphere
  accentColor:   number;   // dominant accent (stars, badge, progress dots)
  lightColor:    number;   // ceiling lamp / bulb colour
  lightGlow:     number;   // glow halo colour
  // Ceiling light style
  lightStyle:    'pendant' | 'fluorescent' | 'pendant-warm';
}

// ─── World config ─────────────────────────────────────────────────────────────

export interface WorldConfig {
  id:          'circus' | 'supermarket' | 'home';
  name:        string;   // Czech
  icon:        string;   // emoji identifier
  items:       readonly Animal[];
  targetScore: number;   // correct answers needed to advance
  badgeColor:  number;   // speech-bubble header colour
  theme:       WorldTheme;
}

// ─── Themes ───────────────────────────────────────────────────────────────────

const CIRCUS_THEME: WorldTheme = {
  ceilingTop:  0x4A0808,   // deep crimson
  ceilingBot:  0xA01820,   // mid crimson
  wallTop:     0xFFF4E8,   // warm cream
  wallBot:     0xF0DCC0,
  floorTop:    0x8B5020,   // warm wood-ring
  floorBot:    0x5C2E0C,
  beltFrame:   0x1A0808,   // near-black crimson frame
  beltSurf:    0x380A0A,   // dark velvet-red
  beltStripe:  0x581818,   // stripe (lighter red)
  beltShine:   0x702020,   // highlight
  accentColor: 0xFFD700,   // gold
  lightColor:  0xFFD060,   // warm carnival yellow
  lightGlow:   0xFFAA20,
  lightStyle:  'pendant',
};

const SUPERMARKET_THEME: WorldTheme = {
  ceilingTop:  0x1A3A6A,   // commercial navy
  ceilingBot:  0xC0D8F8,   // pale sky-blue
  wallTop:     0xF5F9FF,   // near-white
  wallBot:     0xE4F0FF,
  floorTop:    0xD8D8E0,   // light gray tile
  floorBot:    0xB8B8C8,
  beltFrame:   0x181820,   // standard industrial
  beltSurf:    0x2E2E42,
  beltStripe:  0x404058,
  beltShine:   0x484860,
  accentColor: 0x2EC4B6,   // fresh teal
  lightColor:  0xE8F5FF,   // cold fluorescent
  lightGlow:   0xCCDDFF,
  lightStyle:  'fluorescent',
};

const HOME_THEME: WorldTheme = {
  ceilingTop:  0xF8ECD8,   // warm linen
  ceilingBot:  0xFFF5E8,
  wallTop:     0xFAF0E6,   // linen white
  wallBot:     0xEEDDC8,
  floorTop:    0xC8A070,   // warm hardwood
  floorBot:    0x8B6030,
  beltFrame:   0x4A3020,   // dark wood
  beltSurf:    0x8B6030,   // warm wood surface
  beltStripe:  0x7A5020,   // wood grain stripe
  beltShine:   0xA08040,   // light wood highlight
  accentColor: 0xF4A20A,   // warm amber
  lightColor:  0xFFE8A0,   // warm incandescent
  lightGlow:   0xFFCC60,
  lightStyle:  'pendant-warm',
};

// ─── World catalogue ──────────────────────────────────────────────────────────

export const WORLDS: readonly WorldConfig[] = [
  {
    id:          'circus',
    name:        'Cirkus',
    icon:        '🎪',
    items:       CIRCUS_ANIMALS,
    targetScore: 5,
    badgeColor:  0xC41E3A,
    theme:       CIRCUS_THEME,
  },
  {
    id:          'supermarket',
    name:        'Supermarket',
    icon:        '🛒',
    items:       SUPERMARKET_PRODUCE,
    targetScore: 5,
    badgeColor:  0x20A040,
    theme:       SUPERMARKET_THEME,
  },
  {
    id:          'home',
    name:        'Doma',
    icon:        '🏠',
    items:       HOME_OBJECTS,
    targetScore: 5,
    badgeColor:  0xE09010,
    theme:       HOME_THEME,
  },
] as const;

// ─── Manager ──────────────────────────────────────────────────────────────────

export class ProgressionManager {
  private worldIndex = 0;
  private _score     = 0;

  /** Current world configuration. */
  get world(): WorldConfig { return WORLDS[this.worldIndex]; }

  /** Correct answers so far in the current phase. */
  get score(): number { return this._score; }

  /** True when all three worlds have been completed. */
  get isComplete(): boolean {
    return this.worldIndex >= WORLDS.length - 1
        && this._score >= this.world.targetScore;
  }

  /** True if there is a next world to advance to. */
  get hasNextWorld(): boolean { return this.worldIndex < WORLDS.length - 1; }

  /**
   * Record one correct answer.
   * @returns true if the phase target has been reached (trigger transition).
   */
  scorePoint(): boolean {
    this._score++;
    return this._score >= this.world.targetScore;
  }

  /**
   * Advance to the next world. Call only after scorePoint() returns true.
   * @returns The new WorldConfig, or null if we were already on the last world.
   */
  advance(): WorldConfig | null {
    if (!this.hasNextWorld) return null;
    this.worldIndex++;
    this._score = 0;
    return this.world;
  }

  /** Reset to the very beginning. */
  reset(): void {
    this.worldIndex = 0;
    this._score     = 0;
  }
}
