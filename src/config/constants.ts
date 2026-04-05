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

// ─── Premium colour palette ───────────────────────────────────────────────────
// Phaser uses 0xRRGGBB numbers. Text objects use CSS '#RRGGBB' strings.

export const COLORS = {
  // Core UI
  BACKGROUND:   0x1B1F3B,
  PRIMARY:      0x4A90D9,
  SUCCESS:      0x2ECC71,
  SUCCESS_DRK:  0x27AE60,
  ACCENT:       0xF39C12,
  GOLD:         0xFFD700,
  GOLD_DRK:     0xC8A000,
  CORAL:        0xFF6B6B,
  CORAL_DRK:    0xC0392B,
  TEAL:         0x2EC4B6,

  // Store environment
  CEILING_TOP:  0xB86A08,   // deep warm amber (top of ceiling gradient)
  CEILING_MID:  0xE8A030,   // mid amber
  CEILING_BOT:  0xFFE8A8,   // pale gold (bottom of ceiling)
  WALL_LIGHT:   0xFFF5E8,   // warm cream walls
  WALL_SHADE:   0xEDD8B8,   // wall shadow / alcove
  FLOOR_MAIN:   0x8B6030,   // warm wood
  FLOOR_DARK:   0x6A4520,   // tile joints / shadow
  FLOOR_SHINE:  0xA07040,   // highlight on floor

  // Belt – industrial premium
  BELT_FRAME:   0x141420,   // near black frame
  BELT_SURF:    0x2E2E42,   // belt surface (dark steel)
  BELT_SHINE:   0x484860,   // subtle belt highlight
  BELT_STRIPE:  0x404058,   // moving stripe colour
  BELT_ROLLER:  0x1A1A2A,   // roller edge

  // HUD
  TOP_BAR:      0x0A0C1A,
  PILL_DARK:    0x16192E,
  PILL_BORDER:  0x2A3060,

  // Text (CSS strings for Phaser.GameObjects.Text)
  TEXT_LIGHT:   '#FFFFFF',
  TEXT_DIM:     '#AAAACC',
  TEXT_GOLD:    '#FFD700',
  TEXT_DARK:    '#1E1E2E',
  TEXT_CREAM:   '#FFF5E4',
  TEXT_AMBER:   '#F4A20A',
} as const;

// ─── Child UX – accessibility constants ───────────────────────────────────────
export const MIN_TOUCH_TARGET = 88;
export const MIN_FONT_SIZE    = 28;
export const MAX_POINTERS     = 3;

// ─── Audio ────────────────────────────────────────────────────────────────────
export const AUDIO = {
  MASTER_VOLUME: 0.70,
} as const;

// ─── Game layout ──────────────────────────────────────────────────────────────
export const LAYOUT = {
  BELT_TOP:    505,
  BELT_BOT:    625,
  BELT_CY:     565,    // vertical centre of belt
  LION_X:       88,
  LION_Y:      730,    // lion emoji centre y
  BUBBLE_X:    288,
  BUBBLE_Y:    378,    // bubble container centre y
  CARD_W:      104,
  CARD_H:      110,
  BELT_SPEED:   50,    // px / second (calm pace for 3-year-olds)
} as const;
