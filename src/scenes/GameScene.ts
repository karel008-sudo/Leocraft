import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, LAYOUT } from '../config/constants';
import { Animal } from '../game/animals';
import { Round, createRound } from '../game/roundLogic';
import { ProgressionManager, WorldConfig, WorldTheme } from '../game/progression/ProgressionManager';
import { vGradient, circleGlow } from '../utils/draw';
import { audioManager } from '../audio/AudioManager';

// ─── Internal type ────────────────────────────────────────────────────────────

interface AnimalCard {
  container: Phaser.GameObjects.Container;
  animal:    Animal;
  bg:        Phaser.GameObjects.Graphics;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

/**
 * GameScene – three-world conveyor-belt game.
 *
 * Worlds: Circus → Supermarket → Home
 * Each world requires 5 correct answers to advance.
 * Leo the lion guides the player through all three environments.
 *
 * Layout (portrait 540×960):
 *   0   – 148  ceiling / environment top
 *   148 – 505  interior walls (shelves, window, decorations)
 *   378        speech-bubble centre (BUBBLE_Y)
 *   505 – 625  conveyor belt (BELT_TOP … BELT_BOT)
 *   565        belt centre (BELT_CY) ← animal cards ride here
 *   625 – 960  floor
 *   730        lion emoji centre (LION_Y)
 */
export class GameScene extends Phaser.Scene {

  // ── Layout aliases ─────────────────────────────────────────────────────
  private static readonly BT     = LAYOUT.BELT_TOP;   // 505
  private static readonly BB     = LAYOUT.BELT_BOT;   // 625
  private static readonly BCY    = LAYOUT.BELT_CY;    // 565
  private static readonly LX     = LAYOUT.LION_X;     // 88
  private static readonly LY     = LAYOUT.LION_Y;     // 730
  private static readonly BX     = LAYOUT.BUBBLE_X;   // 288
  private static readonly BY     = LAYOUT.BUBBLE_Y;   // 378
  private static readonly CW     = LAYOUT.CARD_W;     // 104
  private static readonly CH     = LAYOUT.CARD_H;     // 110
  private static readonly SPD    = LAYOUT.BELT_SPEED; // 50
  private static readonly PERIOD = 80;                // belt stripe period (px)

  // ── Progression ────────────────────────────────────────────────────────
  private progression  = new ProgressionManager();
  private totalStars   = 0;

  // ── Round state ────────────────────────────────────────────────────────
  private currentRound!:  Round;
  private roundActive   = false;
  private beltOffset    = 0;
  private transitioning = false;

  // ── Environment objects (destroyed / rebuilt on world switch) ──────────
  private envObjects: Phaser.GameObjects.GameObject[] = [];

  // ── Persistent belt objects (part of envObjects but also referenced) ───
  private beltStripes!:  Phaser.GameObjects.Graphics;
  private beltStaticG!:  Phaser.GameObjects.Graphics;

  // ── Persistent HUD / scene objects ─────────────────────────────────────
  private lionText!:          Phaser.GameObjects.Text;
  private bubbleContainer!:   Phaser.GameObjects.Container;
  private bubbleAnimalEmoji!: Phaser.GameObjects.Text;
  private bubbleAnimalName!:  Phaser.GameObjects.Text;
  private bubbleBadgeG!:      Phaser.GameObjects.Graphics;
  private scoreText!:         Phaser.GameObjects.Text;
  private muteIcon!:          Phaser.GameObjects.Text;
  private muteIconPill!:      Phaser.GameObjects.Graphics;
  private progressDotsG!:     Phaser.GameObjects.Graphics;
  private worldIconText!:     Phaser.GameObjects.Text;
  private animalCards:        AnimalCard[] = [];

  // ──────────────────────────────────────────────────────────────────────
  constructor() {
    super({ key: SCENES.GAME });
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  create(): void {
    this.progression  = new ProgressionManager();
    this.totalStars   = 0;
    this.roundActive  = false;
    this.beltOffset   = 0;
    this.transitioning = false;
    this.animalCards  = [];
    this.envObjects   = [];

    this.buildEnvironment();
    this.buildLion();
    this.buildBubble();
    this.buildTopBar();
    this.buildProgressDots();

    this.cameras.main.fadeIn(400);
    this.input.once('pointerdown', () => audioManager.unlock());
    this.time.delayedCall(700, () => this.startRound());
  }

  update(_time: number, delta: number): void {
    if (!this.roundActive) return;

    this.beltOffset = (this.beltOffset + GameScene.SPD * delta / 1000) % GameScene.PERIOD;
    this.redrawBeltStripes();

    for (const card of this.animalCards) {
      card.container.x -= GameScene.SPD * delta / 1000;
      if (card.container.x < -GameScene.CW) {
        card.container.x = GAME_WIDTH + GameScene.CW;
      }
    }
  }

  // ── Environment builder (dispatches to world-specific builders) ────────

  private buildEnvironment(): void {
    this.envObjects.forEach(o => o.destroy());
    this.envObjects = [];

    const world = this.progression.world;
    switch (world.id) {
      case 'circus':      this.buildCircusEnvironment();      break;
      case 'supermarket': this.buildSupermarketEnvironment(); break;
      case 'home':        this.buildHomeEnvironment();        break;
    }
    this.buildBeltStyling(world.theme);
    this.buildLionPlatform(world.theme);
  }

  // ── Circus Environment ────────────────────────────────────────────────

  private buildCircusEnvironment(): void {
    const { BT, BB } = GameScene;
    const g = this.add.graphics().setDepth(0);
    this.envObjects.push(g);

    // --- Ceiling (y=0 to 165): deep crimson ---
    vGradient(g, 0, 0, GAME_WIDTH, 165, 0x4A0808, 0xA01820, 14);

    // Diagonal cream stripes overlay (circus tent look)
    for (let si = 0; si < 15; si++) {
      const sx = si * 36;
      const tilt = 38;
      const sw   = 30;
      g.fillStyle(0xFFEECC, 0.13);
      g.fillTriangle(sx, 0,        sx + sw, 0,         sx + sw - tilt, 165);
      g.fillTriangle(sx, 0,        sx - tilt, 165,      sx + sw - tilt, 165);
    }

    // Gold trim line at y=162
    g.fillStyle(0xC8A000, 1).fillRect(0, 162, GAME_WIDTH, 4);

    // --- Ceiling lights: coloured festival bulbs ---
    const glowG = this.add.graphics().setDepth(1);
    this.envObjects.push(glowG);

    const bulbColors = [0xFF2020, 0xFFDD00, 0x2080FF, 0x20CC40, 0xFF8020, 0xFF2080];
    // String line
    g.lineStyle(1.5, 0x666666, 0.4).lineBetween(0, 52, GAME_WIDTH, 52);
    for (let bi = 0; bi < 12; bi++) {
      const bx    = 15 + bi * 45;
      const color = bulbColors[bi % bulbColors.length];
      g.fillStyle(color, 1).fillEllipse(bx, 60, 14, 10);
      glowG.fillStyle(color, 0.22).fillEllipse(bx, 60, 32, 22);
    }

    this.tweens.add({
      targets:  glowG,
      alpha:    0.50,
      duration: 1600,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });

    // --- Walls (y=165 to BT=505): warm cream ---
    const wallH = BT - 165;
    vGradient(g, 0, 165, GAME_WIDTH, wallH, 0xFFF4E8, 0xF0DCC0, 10);

    // Left curtain
    g.fillStyle(0x5A0808, 1).fillRect(0, 165, 52, wallH);
    g.fillStyle(0x7A1010, 0.7).fillRect(48, 165, 4, wallH);
    // Right curtain
    g.fillStyle(0x5A0808, 1).fillRect(GAME_WIDTH - 52, 165, 52, wallH);
    g.fillStyle(0x7A1010, 0.7).fillRect(GAME_WIDTH - 52, 165, 4, wallH);

    // Bunting triangles along ceiling edge
    const buntingColors = [0xC41E3A, 0xFFD700, 0x2080E0, 0x20C040];
    for (let ti = 0; ti < 18; ti++) {
      const tx = ti * 30;
      g.fillStyle(buntingColors[ti % buntingColors.length], 1);
      g.fillTriangle(tx, 163, tx + 28, 163, tx + 14, 185);
    }

    // Decorative circus poster panels on right wall
    const posterColors = [0xC41E3A, 0x1A4A8A, 0x206A30];
    for (let pi = 0; pi < 3; pi++) {
      const py = 185 + pi * 95;
      g.fillStyle(posterColors[pi], 1).fillRoundedRect(200, py, 308, 80, 8);
      g.lineStyle(2, 0xFFD700, 0.6).strokeRoundedRect(200, py, 308, 80, 8);
      // Three simplified gold star circles
      for (let si2 = 0; si2 < 3; si2++) {
        g.fillStyle(0xFFD700, 0.80).fillCircle(250 + si2 * 80, py + 40, 9);
      }
    }

    // Gold star scattered accents
    const starPositions = [[60, 220], [130, 320], [80, 420], [145, 180], [70, 360]];
    for (const [sx2, sy] of starPositions) {
      g.fillStyle(0xFFD700, 0.60).fillCircle(sx2, sy, 8);
    }

    // --- Floor (y=BB to 960): warm wood ---
    vGradient(g, 0, BB, GAME_WIDTH, GAME_HEIGHT - BB, 0x9B5C28, 0x5C2E0C, 12);

    // Circular ring hints (performance ring theme)
    g.lineStyle(3, 0xC48030, 0.20).strokeEllipse(GAME_WIDTH / 2, 800, 400, 120);
    g.lineStyle(2, 0xC48030, 0.12).strokeEllipse(GAME_WIDTH / 2, 800, 320, 90);
  }

  // ── Supermarket Environment ────────────────────────────────────────────

  private buildSupermarketEnvironment(): void {
    const { BT, BB } = GameScene;
    const g = this.add.graphics().setDepth(0);
    this.envObjects.push(g);

    // --- Ceiling (y=0 to 148): blue-white ---
    vGradient(g, 0, 0, GAME_WIDTH, 148, 0x2255A0, 0xC8E0FF, 14);
    g.fillStyle(0x1A3A7A, 1).fillRect(0, 143, GAME_WIDTH, 5);

    // --- Fluorescent light tubes ---
    const glowG = this.add.graphics().setDepth(1);
    this.envObjects.push(glowG);

    const lightXs = [50, 182, 324, 462];
    for (const lx of lightXs) {
      g.fillStyle(0xEEF8FF, 1).fillRoundedRect(lx - 48, 52, 96, 10, 4);
      glowG.fillStyle(0xDDEEFF, 0.18).fillEllipse(lx, 70, 120, 52);
    }

    this.tweens.add({
      targets:  glowG,
      alpha:    0.60,
      duration: 3000,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });

    // --- Walls (y=148 to BT=505) ---
    const wallH = BT - 148;
    // Left section (x=0-170): slightly warmer white
    vGradient(g, 0, 148, 170, wallH, 0xFFF5EE, 0xEEE8DD, 8);
    // Right section: clean white-blue
    vGradient(g, 170, 148, GAME_WIDTH - 170, wallH, 0xF5F9FF, 0xE4F0FF, 8);
    // Divider line at x=170
    g.fillStyle(0xCCCCCC, 0.50).fillRect(170, 148, 1, wallH);

    // Produce display case (x=182, y=160 to BT-10)
    const caseX = 182, caseY = 160, caseW = 350, caseH = BT - 10 - 160;
    g.fillStyle(0xFFFDF8, 1).fillRoundedRect(caseX, caseY, caseW, caseH, 12);
    g.lineStyle(1.5, 0xDDCCB0, 0.60).strokeRoundedRect(caseX, caseY, caseW, caseH, 12);

    // Green fresh-produce banner header
    g.fillStyle(0x20A040, 1).fillRoundedRect(caseX, caseY, caseW, 34, { tl: 12, tr: 12, bl: 0, br: 0 });
    // Leaf decoration on banner (small circles)
    for (let li = 0; li < 5; li++) {
      g.fillStyle(0x40CC60, 0.70).fillCircle(caseX + 20 + li * 68, caseY + 17, 7);
    }

    // 3 shelf rows with coloured produce items
    const produceColors = [
      0xE63946, 0xFF8C00, 0x2EC4B6, 0xFFD700, 0x4CAF50, 0xFF6B6B,
      0x9B59B6, 0xF39C12, 0x1ABC9C, 0xE91E63, 0x8BC34A, 0xFF5722,
    ];
    const shelfRowH = (caseH - 50) / 3;
    let ci = 0;
    for (let row = 0; row < 3; row++) {
      const rowTopY = caseY + 34 + row * shelfRowH;
      const rowBotY = rowTopY + shelfRowH;
      // Produce items
      for (let col = 0; col < 10; col++) {
        const ph = 20 + ((col * 7 + row * 3) % 17);
        const pw = 24;
        const px = caseX + 8 + col * (pw + 3);
        const py = rowBotY - 10 - ph;
        if (px + pw <= caseX + caseW - 6) {
          g.fillStyle(produceColors[ci % produceColors.length], 1)
           .fillRoundedRect(px, py, pw, ph, 4);
          ci++;
        }
      }
      // Shelf board
      g.fillStyle(0xD4B894, 1).fillRect(caseX + 4, rowBotY - 10, caseW - 8, 10);
    }

    // --- Floor (y=BB to 960): gray tiles ---
    vGradient(g, 0, BB, GAME_WIDTH, GAME_HEIGHT - BB, 0xDCDCE8, 0xB8B8CC, 10);
    // Tile grid every 52px
    g.lineStyle(1, 0x9898AA, 0.30);
    for (let tx = 0; tx < GAME_WIDTH; tx += 52) {
      g.lineBetween(tx, BB, tx, GAME_HEIGHT);
    }
    for (let ty = BB; ty < GAME_HEIGHT; ty += 52) {
      g.lineBetween(0, ty, GAME_WIDTH, ty);
    }
    // Highlight strip at belt bottom
    g.fillStyle(0xE8E8F0, 0.15).fillRect(0, BB, GAME_WIDTH, 10);
  }

  // ── Home Environment ──────────────────────────────────────────────────

  private buildHomeEnvironment(): void {
    const { BT, BB } = GameScene;
    const g = this.add.graphics().setDepth(0);
    this.envObjects.push(g);

    // --- Ceiling (y=0 to 148): warm linen ---
    vGradient(g, 0, 0, GAME_WIDTH, 148, 0xF8ECD8, 0xFFF5E8, 8);
    g.fillStyle(0xD4B890, 0.40).fillRect(0, 143, GAME_WIDTH, 5);

    // --- Pendant lamps ---
    const glowG = this.add.graphics().setDepth(1);
    this.envObjects.push(glowG);

    const pendantXs = [160, 390];
    for (const lx of pendantXs) {
      // Dark rod
      g.fillStyle(0x3A2810, 1).fillRect(lx - 2, 0, 4, 52);
      // Housing
      g.fillStyle(0x4A3018, 1).fillEllipse(lx, 58, 28, 18);
      // Warm bulb
      g.fillStyle(0xFFEE80, 1).fillEllipse(lx, 62, 14, 10);
      // Glow layers
      glowG.fillStyle(0xFFCC50, 0.20).fillEllipse(lx, 65, 56, 36);
      glowG.fillStyle(0xFFCC50, 0.10).fillEllipse(lx, 72, 90, 60);
      glowG.fillStyle(0xFFCC50, 0.05).fillEllipse(lx, 84, 130, 88);
    }

    this.tweens.add({
      targets:  glowG,
      alpha:    0.60,
      duration: 2500,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });

    // --- Walls (y=148 to BT=505): warm linen ---
    const wallH = BT - 148;
    // Left section
    vGradient(g, 0, 148, 170, wallH, 0xFFF0DC, 0xEEE0C4, 6);
    // Right section
    vGradient(g, 170, 148, GAME_WIDTH - 170, wallH, 0xFAF0E6, 0xEEDDC8, 8);
    // Divider
    g.fillStyle(0xD4C0A0, 0.40).fillRect(170, 148, 1, wallH);

    // --- Window (x=182-530, y=162-322) ---
    const winX = 182, winY = 162, winW = 348, winH = 160;
    // Sky inside
    vGradient(g, winX + 8, winY + 8, winW - 16, winH - 16, 0x88CCFF, 0xCCEEFF, 6);
    // Window frame
    g.lineStyle(8, 0x8B6040, 1).strokeRoundedRect(winX, winY, winW, winH, 8);
    // Clouds
    g.fillStyle(0xFFFFFF, 0.90).fillEllipse(winX + 80, winY + 55, 100, 36);
    g.fillStyle(0xFFFFFF, 0.90).fillEllipse(winX + 230, winY + 72, 80, 28);
    // Cross bars
    g.fillStyle(0x8B6040, 1).fillRect(winX + winW / 2 - 4, winY, 8, winH);
    g.fillStyle(0x8B6040, 1).fillRect(winX, winY + winH / 2 - 4, winW, 8);

    // --- Picture frame below window ---
    g.lineStyle(6, 0x8B6040, 1).strokeRoundedRect(winX + 38, winY + winH + 16, 120, 90, 6);
    // Abstract art inside
    g.fillStyle(0x4A90D9, 0.60).fillEllipse(winX + 68, winY + winH + 52, 40, 30);
    g.fillStyle(0xF4A20A, 0.70).fillEllipse(winX + 108, winY + winH + 72, 36, 26);
    g.fillStyle(0x2EC4B6, 0.55).fillEllipse(winX + 130, winY + winH + 44, 28, 22);

    // --- Bookshelf (x=380-530, y=330-490) ---
    const bsX = 380, bsY = 330, bsW = 148, bsH = 160;
    g.fillStyle(0x8B6040, 0.70).fillRoundedRect(bsX, bsY, bsW, bsH, 4);
    // 3 shelf boards
    const shelfYs = [bsY + 50, bsY + 100, bsY + 150];
    for (const sy of shelfYs) {
      g.fillStyle(0xC09060, 1).fillRect(bsX, sy, bsW, 8);
    }
    // Books (colorful thin rects standing up)
    const bookColors = [0xE63946, 0x4CAF50, 0x2196F3, 0xFF9800, 0x9C27B0, 0xF44336, 0x00BCD4, 0x8BC34A];
    let bx = bsX + 6;
    for (let bi2 = 0; bi2 < 8; bi2++) {
      const bw2 = 12 + (bi2 % 3) * 4;
      const bh2 = 32 + (bi2 % 4) * 5;
      const by2 = shelfYs[bi2 % 3] - bh2 + 2;
      g.fillStyle(bookColors[bi2 % bookColors.length], 1).fillRect(bx, by2, bw2, bh2);
      bx += bw2 + 2;
      if (bx > bsX + bsW - 16) bx = bsX + 6;
    }

    // --- Floor (y=BB to 960): warm hardwood ---
    vGradient(g, 0, BB, GAME_WIDTH, GAME_HEIGHT - BB, 0xC8A070, 0x8B6030, 12);
    // Wood plank lines every 90px
    g.lineStyle(1, 0x6A4020, 0.30);
    for (let ty = BB; ty < GAME_HEIGHT; ty += 90) {
      g.lineBetween(0, ty, GAME_WIDTH, ty);
    }
    // Subtle diagonal grain
    g.lineStyle(1, 0x6A4020, 0.08);
    for (let gx = -GAME_HEIGHT; gx < GAME_WIDTH + GAME_HEIGHT; gx += 60) {
      g.lineBetween(gx, BB, gx + GAME_HEIGHT, GAME_HEIGHT);
    }
    // Highlight strip at belt bottom
    g.fillStyle(0xD4A870, 0.18).fillRect(0, BB, GAME_WIDTH, 10);
  }

  // ── Belt styling (per-world colors) ───────────────────────────────────

  private buildBeltStyling(theme: WorldTheme): void {
    const { BT, BB, BCY } = GameScene;
    const H = BB - BT;

    const g = this.add.graphics().setDepth(2);
    this.envObjects.push(g);
    this.beltStaticG = g;

    // Main frame
    g.fillStyle(theme.beltFrame, 1).fillRect(0, BT, GAME_WIDTH, H);

    // Belt surface: top half gradient + bottom half gradient
    vGradient(g, 0, BT + 13, GAME_WIDTH, (H - 26) / 2, theme.beltShine, theme.beltSurf, 4);
    vGradient(g, 0, BT + 13 + (H - 26) / 2, GAME_WIDTH, (H - 26) / 2, theme.beltSurf, theme.beltFrame, 4);

    // Top rail shine + cap
    g.fillStyle(theme.beltShine, 0.45).fillRect(0, BT, GAME_WIDTH, 3);
    g.fillStyle(theme.beltFrame, 1).fillRect(0, BT, GAME_WIDTH, 13);

    // Bottom rail
    g.fillStyle(theme.beltFrame, 1).fillRect(0, BB - 13, GAME_WIDTH, 13);

    // Left roller
    g.fillStyle(theme.beltFrame, 1).fillEllipse(5, BCY, 28, H - 22);
    g.fillStyle(theme.beltShine, 0.35).fillEllipse(3, BCY, 16, H - 26);

    // Metallic center shine
    g.fillStyle(0xFFFFFF, 0.03).fillRect(0, BCY - 3, GAME_WIDTH, 6);

    // Drop shadow under belt
    for (let i = 0; i < 5; i++) {
      g.fillStyle(0x000000, 0.07 * (1 - i / 5)).fillRect(0, BB + i, GAME_WIDTH, 1);
    }

    // Animated stripes
    this.beltStripes = this.add.graphics().setDepth(3);
    this.envObjects.push(this.beltStripes);
    this.redrawBeltStripes();
  }

  // ── Lion platform (world-themed counter/stage) ─────────────────────────

  private buildLionPlatform(theme: WorldTheme): void {
    const { LX, LY } = GameScene;
    const g = this.add.graphics().setDepth(4);
    this.envObjects.push(g);

    // Warm spotlight behind lion
    circleGlow(g, LX, LY - 55, theme.accentColor, 55, 125, 7, 0.09);

    // Drop shadow
    g.fillStyle(0x000000, 0.22).fillEllipse(LX, LY + 22, 70, 14);

    // Counter body
    vGradient(g, LX - 42, LY + 14, 84, 72, theme.beltShine, theme.beltFrame, 6);

    // Counter top slab
    g.fillStyle(theme.beltShine, 1).fillRoundedRect(LX - 46, LY + 11, 92, 16, 5);

    // Counter top highlight
    g.fillStyle(0xFFFFFF, 0.25).fillRoundedRect(LX - 42, LY + 12, 80, 5, 3);

    // Counter nameplate
    g.fillStyle(0x1B1F3B, 0.80).fillRoundedRect(LX - 30, LY + 20, 60, 16, 4);
  }

  // ── Belt stripes (animated, redrawn each frame) ────────────────────────

  private redrawBeltStripes(): void {
    if (!this.beltStripes) return;
    const g   = this.beltStripes;
    const top = GameScene.BT + 15;
    const bot = GameScene.BB - 15;

    g.clear();
    const stripeColor = this.progression.world.theme.beltStripe;
    g.lineStyle(4, stripeColor, 0.55);

    for (
      let sx = -this.beltOffset;
      sx < GAME_WIDTH + GameScene.PERIOD;
      sx += GameScene.PERIOD
    ) {
      g.lineBetween(sx,      top, sx - 22, bot);
      g.lineBetween(sx + 40, top, sx + 18, bot);
    }
  }

  // ── Leo the Lion (persistent) ─────────────────────────────────────────

  private buildLion(): void {
    const { LX, LY } = GameScene;

    this.lionText = this.add
      .text(LX, LY - 62, '🦁', { fontSize: '108px' })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(LX, LY + 28, 'LEO', {
        fontSize:  '13px',
        color:     '#FFD700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private lionReact(correct: boolean): void {
    const { LX, LY } = GameScene;
    if (correct) {
      this.tweens.add({
        targets:  this.lionText,
        y:        LY - 80,
        duration: 170,
        ease:     'Power2',
        yoyo:     true,
        repeat:   1,
      });
    } else {
      this.tweens.add({
        targets:    this.lionText,
        x:          LX + 10,
        duration:   50,
        ease:       'Linear',
        yoyo:       true,
        repeat:     3,
        onComplete: () => { this.lionText.x = LX; },
      });
    }
  }

  // ── Speech Bubble (persistent) ────────────────────────────────────────

  private buildBubble(): void {
    const { BX, BY } = GameScene;
    this.bubbleContainer = this.add.container(BX, BY).setDepth(7);

    const g = this.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.20).fillRoundedRect(-96, -77, 208, 172, 22);
    // White body
    g.fillStyle(0xFFFFFF, 1).fillRoundedRect(-104, -88, 208, 172, 22);
    // Warm bottom tint
    g.fillStyle(0xFFF5E8, 0.25).fillRoundedRect(-104, 0, 208, 84, { tl: 0, tr: 0, bl: 22, br: 22 });

    // Badge (color updated per world)
    this.bubbleBadgeG = this.add.graphics();
    const world = this.progression.world;
    this.bubbleBadgeG.fillStyle(world.badgeColor, 1)
      .fillRoundedRect(-98, -82, 196, 38, { tl: 18, tr: 18, bl: 0, br: 0 });
    this.bubbleBadgeG.lineStyle(2.5, world.badgeColor, 0.55)
      .strokeRoundedRect(-104, -88, 208, 172, 22);

    // Tail
    g.fillStyle(0xFFFFFF, 1).fillTriangle(-64, 78, -92, 118, -34, 78);
    g.lineStyle(2.5, world.badgeColor, 0.40)
      .lineBetween(-64, 78, -92, 118)
      .lineBetween(-92, 118, -34, 78);

    // "NAJDI:" header
    const badgeLabel = this.add
      .text(0, -63, 'NAJDI:', {
        fontSize:  '18px',
        color:     '#FFFFFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Animal emoji (updated each round)
    this.bubbleAnimalEmoji = this.add
      .text(0, -14, '', { fontSize: '68px' })
      .setOrigin(0.5);

    // Name pill background
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x1A1A3A, 0.28).fillRoundedRect(-48, 42, 96, 28, 14);

    // Animal name (updated each round)
    this.bubbleAnimalName = this.add
      .text(0, 56, '', {
        fontSize:  '22px',
        color:     COLORS.TEXT_DARK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.bubbleContainer.add([g, this.bubbleBadgeG, badgeLabel, this.bubbleAnimalEmoji, pillBg, this.bubbleAnimalName]);
  }

  private updateBubble(animal: Animal): void {
    this.bubbleAnimalEmoji.setText(animal.emoji);
    this.bubbleAnimalName.setText(animal.name);

    this.bubbleContainer.setScale(0.82).setAlpha(0);
    this.tweens.add({
      targets:    this.bubbleContainer,
      scaleX:     1,
      scaleY:     1,
      alpha:      1,
      duration:   300,
      ease:       'Back.easeOut',
      onComplete: () => this.spawnCards(this.currentRound),
    });
  }

  private updateBubbleBadge(badgeColor: number): void {
    this.bubbleBadgeG.clear();
    this.bubbleBadgeG.fillStyle(badgeColor, 1)
      .fillRoundedRect(-98, -82, 196, 38, { tl: 18, tr: 18, bl: 0, br: 0 });
    this.bubbleBadgeG.lineStyle(2.5, badgeColor, 0.55)
      .strokeRoundedRect(-104, -88, 208, 172, 22);
  }

  // ── Top HUD bar (persistent) ──────────────────────────────────────────

  private buildTopBar(): void {
    // Gradient fade background
    const hud = this.add.graphics().setDepth(20);
    for (let i = 0; i < 12; i++) {
      const a = 0.90 * (1 - i / 12);
      hud.fillStyle(COLORS.TOP_BAR, a).fillRect(0, i * 7, GAME_WIDTH, 8);
    }

    // Back pill
    const backPillG = this.add.graphics().setDepth(21);
    backPillG.fillStyle(COLORS.PILL_DARK, 0.88).fillRoundedRect(6, 10, 54, 56, 14);
    backPillG.lineStyle(1.5, COLORS.PILL_BORDER, 0.50).strokeRoundedRect(6, 10, 54, 56, 14);

    this.add.text(33, 38, '←', {
      fontSize: '32px',
      color:    COLORS.TEXT_LIGHT,
    }).setOrigin(0.5).setDepth(22);

    const backHit = this.add.rectangle(33, 38, 54, 56)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });
    backHit.on('pointerup', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start(SCENES.MENU));
    });

    // World icon pill
    const worldPillG = this.add.graphics().setDepth(21);
    worldPillG.fillStyle(COLORS.PILL_DARK, 0.88).fillRoundedRect(68, 10, 54, 56, 14);
    worldPillG.lineStyle(1.5, COLORS.PILL_BORDER, 0.50).strokeRoundedRect(68, 10, 54, 56, 14);

    this.worldIconText = this.add
      .text(95, 38, this.progression.world.icon, { fontSize: '28px' })
      .setOrigin(0.5)
      .setDepth(22);

    // Title
    this.add.text(GAME_WIDTH / 2, 38, 'LEOCRAFT', {
      fontSize:        '26px',
      color:           COLORS.TEXT_GOLD,
      fontStyle:       'bold',
      stroke:          '#7A5000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(22);

    // Mute pill
    this.muteIconPill = this.add.graphics().setDepth(21);
    this.muteIconPill.fillStyle(COLORS.PILL_DARK, 0.88)
      .fillRoundedRect(GAME_WIDTH - 226, 10, 52, 56, 14);
    this.muteIconPill.lineStyle(1.5, COLORS.PILL_BORDER, 0.50)
      .strokeRoundedRect(GAME_WIDTH - 226, 10, 52, 56, 14);

    this.muteIcon = this.add
      .text(GAME_WIDTH - 200, 38, '🔊', { fontSize: '24px' })
      .setOrigin(0.5)
      .setDepth(22);

    const muteHit = this.add.rectangle(GAME_WIDTH - 200, 38, 52, 56)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });
    muteHit.on('pointerup', () => {
      const muted = audioManager.toggleMute();
      this.muteIcon.setText(muted ? '🔇' : '🔊');
      this.muteIconPill.setAlpha(muted ? 0.40 : 1.0);
    });

    // Score pill
    const scorePillG = this.add.graphics().setDepth(21);
    scorePillG.fillStyle(COLORS.PILL_DARK, 0.88)
      .fillRoundedRect(GAME_WIDTH - 108, 10, 100, 56, 14);
    scorePillG.lineStyle(1.5, COLORS.PILL_BORDER, 0.50)
      .strokeRoundedRect(GAME_WIDTH - 108, 10, 100, 56, 14);

    this.scoreText = this.add
      .text(GAME_WIDTH - 58, 38, '⭐ 0', {
        fontSize:  '26px',
        color:     COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(22);
  }

  private refreshScore(): void {
    this.scoreText.setText('⭐ ' + this.totalStars);
    this.tweens.add({
      targets:  this.scoreText,
      scaleX:   1.4,
      scaleY:   1.4,
      duration: 130,
      ease:     'Power2',
      yoyo:     true,
    });
  }

  // ── Progress dots (persistent, updated each round) ────────────────────

  private buildProgressDots(): void {
    this.progressDotsG = this.add.graphics().setDepth(6);
    this.refreshProgressDots();
  }

  private refreshProgressDots(): void {
    const g      = this.progressDotsG;
    const world  = this.progression.world;
    const filled = this.progression.score;
    const total  = world.targetScore;
    const dotR   = 9;
    const gap    = 8;
    const totalW = total * (dotR * 2 + gap) - gap;
    const sx     = GameScene.BX - totalW / 2 + dotR;
    const dy     = 485;

    g.clear();
    for (let i = 0; i < total; i++) {
      const dx = sx + i * (dotR * 2 + gap);
      if (i < filled) {
        g.fillStyle(world.theme.accentColor, 1).fillCircle(dx, dy, dotR);
        g.lineStyle(2, 0xFFFFFF, 0.50).strokeCircle(dx, dy, dotR);
      } else {
        g.lineStyle(2, 0xFFFFFF, 0.35).strokeCircle(dx, dy, dotR);
      }
    }
  }

  // ── Round flow ────────────────────────────────────────────────────────

  private startRound(): void {
    if (this.transitioning) return;
    const prevId = this.currentRound?.target?.id;
    this.currentRound = createRound(this.progression.world.items, prevId);
    this.roundActive  = true;
    this.clearCards();
    this.updateBubble(this.currentRound.target);
  }

  // ── Cards ─────────────────────────────────────────────────────────────

  private clearCards(): void {
    this.animalCards.forEach(c => c.container.destroy());
    this.animalCards = [];
  }

  private spawnCards(round: Round): void {
    const startX  = 205;
    const spacing = 136;

    round.beltAnimals.forEach((animal, i) => {
      const x    = startX + i * spacing;
      const card = this.createCard(x, GameScene.BCY - 4, animal, i);
      this.animalCards.push(card);
    });
  }

  private createCard(x: number, y: number, animal: Animal, cardIndex: number): AnimalCard {
    const { CW, CH } = GameScene;
    const hh = CH / 2;

    const container = this.add.container(x, y).setDepth(6);
    container.setSize(CW + 16, CH + 16);

    // Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.26).fillEllipse(4, hh + 5, CW - 8, 14);

    // Card background
    const bg = this.add.graphics();
    this.drawCardBg(bg, animal);

    // Emoji
    const emoji = this.add
      .text(0, -10, animal.emoji, { fontSize: '52px' })
      .setOrigin(0.5);

    // Name pill background
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x000000, 0.30).fillRoundedRect(-40, hh - 34, 80, 26, 13);

    // Name text
    const nameTxt = this.add
      .text(0, hh - 21, animal.name, {
        fontSize:  '18px',
        color:     '#FFFFFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([shadow, bg, emoji, pillBg, nameTxt]);

    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onCardTap({ container, animal, bg }));

    // Entrance animation with stagger
    container.setAlpha(0).setScale(0.80);
    this.tweens.add({
      targets:  container,
      alpha:    1,
      scaleX:   1,
      scaleY:   1,
      duration: 380,
      ease:     'Back.easeOut',
      delay:    cardIndex * 45,
    });

    return { container, animal, bg };
  }

  private drawCardBg(bg: Phaser.GameObjects.Graphics, animal: Animal): void {
    const { CW, CH } = GameScene;
    const hw = CW / 2;
    const hh = CH / 2;

    bg.clear();
    bg.fillStyle(animal.color, 1).fillRoundedRect(-hw, -hh, CW, CH, 20);
    bg.fillStyle(0xFFFFFF, 0.28).fillRoundedRect(-hw, -hh, CW, CH / 2, { tl: 20, tr: 20, bl: 0, br: 0 });
    bg.fillStyle(0xFFFFFF, 0.16).fillRoundedRect(-hw + 7, -hh + 7, CW - 14, 24, 10);
    bg.lineStyle(3, animal.accentColor, 1).strokeRoundedRect(-hw, -hh, CW, CH, 20);
  }

  // ── Interaction ───────────────────────────────────────────────────────

  private onCardTap(card: AnimalCard): void {
    if (!this.roundActive) return;
    if (card.animal.id === this.currentRound.target.id) {
      this.handleCorrect(card);
    } else {
      this.handleWrong(card);
    }
  }

  private handleCorrect(card: AnimalCard): void {
    this.roundActive = false;
    this.totalStars++;
    audioManager.playSuccess();

    // Gold highlight on card
    const { CW, CH } = GameScene;
    const hw = CW / 2;
    const hh = CH / 2;
    card.bg.clear();
    card.bg.fillStyle(0xFFD700, 1).fillRoundedRect(-hw, -hh, CW, CH, 20);
    card.bg.fillStyle(0xFFFFFF, 0.28).fillRoundedRect(-hw, -hh, CW, CH / 2, { tl: 20, tr: 20, bl: 0, br: 0 });
    card.bg.lineStyle(4, 0xFFA500, 1).strokeRoundedRect(-hw, -hh, CW, CH, 20);

    // Bounce
    this.tweens.add({
      targets:  card.container,
      scaleX:   1.20,
      scaleY:   1.20,
      duration: 130,
      ease:     'Power2',
      yoyo:     true,
      repeat:   1,
    });

    this.spawnConfetti(card.container.x, card.container.y);
    this.lionReact(true);

    const phaseComplete = this.progression.scorePoint();
    this.refreshProgressDots();
    this.refreshScore();

    if (phaseComplete) {
      if (this.progression.hasNextWorld) {
        this.time.delayedCall(1400, () => this.triggerWorldTransition());
      } else {
        this.time.delayedCall(1400, () => this.triggerGameComplete());
      }
    } else {
      this.time.delayedCall(1600, () => this.startRound());
    }
  }

  private handleWrong(card: AnimalCard): void {
    audioManager.playWrong();

    // Red flash overlay
    const { CW, CH } = GameScene;
    const flash = this.add.graphics();
    flash.fillStyle(0xFF4444, 0.45).fillRoundedRect(-CW / 2, -CH / 2, CW, CH, 20);
    card.container.add(flash);
    this.tweens.add({
      targets:    flash,
      alpha:      0,
      duration:   280,
      onComplete: () => flash.destroy(),
    });

    // Shake
    const origX = card.container.x;
    this.tweens.add({
      targets:    card.container,
      x:          origX + 10,
      duration:   50,
      ease:       'Linear',
      yoyo:       true,
      repeat:     3,
      onComplete: () => { card.container.x = origX; },
    });

    // Alpha pulse
    this.tweens.add({
      targets:  card.container,
      alpha:    0.5,
      duration: 70,
      yoyo:     true,
      repeat:   1,
    });

    this.lionReact(false);
  }

  // ── World transition ──────────────────────────────────────────────────

  private triggerWorldTransition(): void {
    this.roundActive   = false;
    this.transitioning = true;
    this.clearCards();

    const nextWorld = this.progression.advance();
    if (!nextWorld) return;

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Overlay container at top depth
    const overlay = this.add.container(0, 0).setDepth(80);
    const darkBg  = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000).setAlpha(0);
    overlay.add(darkBg);

    this.tweens.add({
      targets:  darkBg,
      alpha:    0.92,
      duration: 500,
      ease:     'Power2',
      onComplete: () => {
        // Switch environment while dark overlay is visible
        this.buildEnvironment();
        this.updateBubbleBadge(nextWorld.badgeColor);
        this.worldIconText.setText(nextWorld.icon);
        this.refreshProgressDots();

        // Transition card
        const card = this.createTransitionCard(overlay, nextWorld);
        card.setScale(0).setAlpha(0);
        this.tweens.add({
          targets:  card,
          scaleX:   1,
          scaleY:   1,
          alpha:    1,
          duration: 420,
          ease:     'Back.easeOut',
        });

        // After 1.8s, fade out overlay
        this.time.delayedCall(1800, () => {
          this.tweens.add({
            targets:  [darkBg, card],
            alpha:    0,
            duration: 500,
            ease:     'Power2',
            onComplete: () => {
              overlay.destroy();
              this.transitioning = false;
              this.beltOffset    = 0;
              this.startRound();
            },
          });
        });
      },
    });
  }

  private createTransitionCard(
    overlay: Phaser.GameObjects.Container,
    world:   WorldConfig,
  ): Phaser.GameObjects.Container {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const card = this.add.container(cx, cy);

    // Card background
    const cardBg = this.add.graphics();
    cardBg.fillStyle(0xFFFFFF, 1).fillRoundedRect(-160, -140, 320, 280, 28);
    cardBg.lineStyle(6, world.theme.accentColor, 1).strokeRoundedRect(-160, -140, 320, 280, 28);

    // Decorative star ring
    const starsG = this.add.graphics();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r     = 165;
      starsG.fillStyle(world.theme.accentColor, 0.35 + Math.random() * 0.25)
        .fillCircle(Math.cos(angle) * r, Math.sin(angle) * r, 7 + Math.random() * 5);
    }

    // World icon (large)
    const iconTxt = this.add
      .text(0, -52, world.icon, { fontSize: '100px' })
      .setOrigin(0.5);

    // World name
    const nameTxt = this.add
      .text(0, 58, world.name, {
        fontSize:  '40px',
        color:     '#1E1E3E',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle message
    const messages: Record<string, string> = {
      supermarket: '🛒 Jedeme nakupovat!',
      home:        '🏠 Jedeme domů!',
    };
    const msg    = messages[world.id] ?? '';
    const msgTxt = this.add
      .text(0, 108, msg, {
        fontSize: '24px',
        color:    '#666688',
      })
      .setOrigin(0.5);

    card.add([starsG, cardBg, iconTxt, nameTxt, msgTxt]);
    overlay.add(card);
    return card;
  }

  // ── End of game celebration ────────────────────────────────────────────

  private triggerGameComplete(): void {
    this.roundActive   = false;
    this.transitioning = true;
    this.clearCards();

    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add.container(0, 0).setDepth(80);
    const darkBg  = this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x1B1F3B).setAlpha(0);
    overlay.add(darkBg);

    this.tweens.add({
      targets:  darkBg,
      alpha:    0.96,
      duration: 600,
      onComplete: () => {
        const card = this.add.container(cx, cy);

        const bg = this.add.graphics();
        bg.fillStyle(0xFFFFFF, 1).fillRoundedRect(-190, -220, 380, 440, 32);
        bg.lineStyle(6, 0xFFD700, 1).strokeRoundedRect(-190, -220, 380, 440, 32);

        const trophyTxt = this.add
          .text(0, -140, '🏆', { fontSize: '80px' })
          .setOrigin(0.5);

        const congrats = this.add
          .text(0, -50, 'Výborně!', {
            fontSize:  '46px',
            color:     '#1E1E3E',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        const worldIcons = this.add
          .text(0, 24, '🎪  🛒  🏠', { fontSize: '40px' })
          .setOrigin(0.5);

        const subTxt = this.add
          .text(0, 90, 'Prošel jsi celou hru!', {
            fontSize: '24px',
            color:    '#666688',
          })
          .setOrigin(0.5);

        const starsLine = this.add
          .text(0, 132, `⭐ ${this.totalStars} hvězdiček`, {
            fontSize:  '22px',
            color:     '#F4A20A',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        // Play again button
        const btnBg = this.add.graphics();
        btnBg.fillStyle(COLORS.SUCCESS, 1).fillRoundedRect(-100, 158, 200, 60, 16);
        btnBg.setInteractive(
          new Phaser.Geom.Rectangle(-100, 158, 200, 60),
          Phaser.Geom.Rectangle.Contains,
        );

        const btnTxt = this.add
          .text(0, 188, '🔄 Hrát znovu', {
            fontSize:  '24px',
            color:     '#FFFFFF',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);

        btnBg.on('pointerup', () => {
          this.cameras.main.fadeOut(400, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart());
        });

        card.add([bg, trophyTxt, congrats, worldIcons, subTxt, starsLine, btnBg, btnTxt]);
        overlay.add(card);

        card.setScale(0).setAlpha(0);
        this.tweens.add({
          targets:  card,
          scaleX:   1,
          scaleY:   1,
          alpha:    1,
          duration: 500,
          ease:     'Back.easeOut',
        });

        // Staggered confetti celebration
        for (let i = 0; i < 20; i++) {
          this.time.delayedCall(i * 80, () => {
            this.spawnConfetti(
              Phaser.Math.Between(80, GAME_WIDTH - 80),
              Phaser.Math.Between(200, GAME_HEIGHT - 200),
            );
          });
        }
      },
    });
  }

  // ── Confetti ──────────────────────────────────────────────────────────

  private spawnConfetti(cx: number, cy: number): void {
    const confettiColors = [
      0xFFD700, 0xFF6B6B, 0x2EC4B6, 0x87CEEB, 0x90EE90,
      0xFFA500, 0xFF69B4, 0x9370DB, 0xFFD700, 0xFF6B6B,
      0x2EC4B6, 0x87CEEB, 0x90EE90, 0xFFA500,
    ];

    for (let i = 0; i < 14; i++) {
      const size  = 6 + Math.random() * 8;
      const angle = (i / 14) * Math.PI * 2;
      const dist  = 60 + Math.random() * 70;

      const circle = this.add.circle(cx, cy, size, confettiColors[i]).setDepth(50);
      this.tweens.add({
        targets:    circle,
        x:          cx + Math.cos(angle) * dist,
        y:          cy + Math.sin(angle) * dist,
        alpha:      0,
        scaleX:     0.15,
        scaleY:     0.15,
        duration:   650 + Math.random() * 350,
        ease:       'Power2',
        onComplete: () => circle.destroy(),
      });
    }

    const glyphs = ['⭐', '✨', '🌟', '⭐', '✨', '🌟'];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dist  = 80 + Math.random() * 45;

      const star = this.add
        .text(cx, cy, glyphs[i], { fontSize: '28px' })
        .setOrigin(0.5)
        .setDepth(50);

      this.tweens.add({
        targets:    star,
        x:          cx + Math.cos(angle) * dist,
        y:          cy + Math.sin(angle) * dist,
        alpha:      0,
        scaleX:     0.2,
        scaleY:     0.2,
        duration:   750 + Math.random() * 200,
        ease:       'Power2',
        onComplete: () => star.destroy(),
      });
    }
  }
}
