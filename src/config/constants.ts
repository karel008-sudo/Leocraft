// ─── Canvas dimensions (portrait mobile) ─────────────────────────────────────
export const GAME_WIDTH = 540;
export const GAME_HEIGHT = 960;

// ─── Scene keys ───────────────────────────────────────────────────────────────
export const SCENES = {
  BOOT: 'BootScene',
  LOAD: 'LoadScene',
  MENU: 'MenuScene',
  GAME: 'GameScene',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];

// ─── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  BACKGROUND: 0x1a1a2e,
  PRIMARY: 0x4a90d9,
  SUCCESS: 0x27ae60,
  ACCENT: 0xf39c12,
  TEXT_LIGHT: '#ffffff',
  TEXT_DIM: '#aaaacc',
} as const;

// ─── Child UX – accessibility constants ───────────────────────────────────────
/** Minimum touch-target size (px) for children aged 3+. */
export const MIN_TOUCH_TARGET = 88;

/** Minimum font size for readable text in a kids game. */
export const MIN_FONT_SIZE = 28;

/** Maximum simultaneous touch points to track. */
export const MAX_POINTERS = 3;

// ─── Audio ────────────────────────────────────────────────────────────────────
export const AUDIO = {
  /** Master volume (0–1). */
  MASTER_VOLUME: 0.8,
} as const;
