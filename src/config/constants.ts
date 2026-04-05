// ─── Canvas dimensions (portrait mobile) ─────────────────────────────────────
export const GAME_WIDTH  = 540;
export const GAME_HEIGHT = 960;

// ─── Scene keys ───────────────────────────────────────────────────────────────
export const SCENES = {
  BOOT:  'BootScene',
  LOAD:  'LoadScene',
  INTRO: 'IntroScene',
  MENU:  'MenuScene',
  GAME:  'GameScene',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];

// ─── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  BACKGROUND:  0x1a1a2e,
  PRIMARY:     0x4a90d9,
  SUCCESS:     0x27ae60,
  SUCCESS_DRK: 0x1e8449,
  ACCENT:      0xf39c12,
  GOLD:        0xFFD700,
  TEXT_LIGHT:  '#ffffff',
  TEXT_DIM:    '#aaaacc',
  TEXT_GOLD:   '#FFD700',
  TEXT_DARK:   '#2E2E3E',
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
  MASTER_VOLUME: 0.8,
} as const;

// ─── Game layout ──────────────────────────────────────────────────────────────
export const LAYOUT = {
  BELT_TOP:   500,
  BELT_BOT:   620,
  BELT_CY:    560,
  LION_X:      90,
  LION_Y:     730,
  BUBBLE_X:   270,
  BUBBLE_Y:   375,
  LABEL_Y:    278,
  CARD_W:      96,
  CARD_H:      96,
  BELT_SPEED:  55,   // px / second
} as const;
