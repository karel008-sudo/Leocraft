import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, LAYOUT } from '../config/constants';
import { Animal } from '../game/animals';
import { Round, createRound } from '../game/roundLogic';
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
 * GameScene – the main shopping-centre conveyor-belt game.
 *
 * Layout (y-coordinates, portrait 540×960):
 *
 *   0   – 148  ceiling / top bar
 *   148 – 505  store interior (shelves, lion area)
 *   378        speech-bubble centre (BUBBLE_Y)
 *   505 – 625  conveyor belt (BELT_TOP … BELT_BOT)
 *   565        belt centre (BELT_CY) ← animal cards ride here
 *   625 – 960  store floor
 *   730        lion emoji centre (LION_Y)
 *
 * The lion sits to the LEFT of the canvas (x ≈ 88).
 * Animals enter from the RIGHT and travel LEFT.
 */
export class GameScene extends Phaser.Scene {

  // ── Layout aliases ────────────────────────────────────────────────────
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

  // ── State ─────────────────────────────────────────────────────────────
  private currentRound!: Round;
  private roundActive   = false;
  private successCount  = 0;
  private beltOffset    = 0;

  // ── Scene objects ─────────────────────────────────────────────────────
  private beltStripes!:       Phaser.GameObjects.Graphics;
  private lionText!:          Phaser.GameObjects.Text;
  private bubbleContainer!:   Phaser.GameObjects.Container;
  private bubbleAnimalEmoji!: Phaser.GameObjects.Text;
  private bubbleAnimalName!:  Phaser.GameObjects.Text;
  private scoreText!:         Phaser.GameObjects.Text;
  private muteIcon!:          Phaser.GameObjects.Text;
  private muteIconPill!:      Phaser.GameObjects.Graphics;
  private animalCards:        AnimalCard[] = [];

  // ──────────────────────────────────────────────────────────────────────
  constructor() {
    super({ key: SCENES.GAME });
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────

  create(): void {
    this.roundActive  = false;
    this.successCount = 0;
    this.beltOffset   = 0;
    this.animalCards  = [];

    this.buildBackground();
    this.buildCeilingLights();
    this.buildBelt();
    this.buildLion();
    this.buildBubble();
    this.buildTopBar();

    this.cameras.main.fadeIn(400);
    this.input.once('pointerdown', () => audioManager.unlock());
    this.time.delayedCall(600, () => this.startRound());
  }

  update(_time: number, delta: number): void {
    if (!this.roundActive) return;

    // Animate belt stripes moving left
    this.beltOffset = (this.beltOffset + GameScene.SPD * delta / 1000) % GameScene.PERIOD;
    this.redrawBeltStripes();

    // Move animal cards left; loop when off-screen
    for (const card of this.animalCards) {
      card.container.x -= GameScene.SPD * delta / 1000;
      if (card.container.x < -GameScene.CW) {
        card.container.x = GAME_WIDTH + GameScene.CW;
      }
    }
  }

  // ── Background ────────────────────────────────────────────────────────

  private buildBackground(): void {
    const { BT, BB } = GameScene;
    const g = this.add.graphics().setDepth(0);

    // 1. CEILING (y=0 to 148): vGradient 16 steps
    vGradient(g, 0, 0, GAME_WIDTH, 148, COLORS.CEILING_TOP, COLORS.CEILING_BOT, 16);
    // Dark trim line at y=145
    g.fillStyle(0x6A3A00, 0.70).fillRect(0, 145, GAME_WIDTH, 1);

    // 2. STORE WALLS (y=148 to BT)
    const wallH = BT - 148;
    // Right section (x=168 to 540)
    vGradient(g, 168, 148, GAME_WIDTH - 168, wallH, 0xFFF5E8, 0xF0E0C8, 10);
    // Left alcove (x=0 to 168)
    vGradient(g, 0, 148, 168, wallH, 0xFFECD8, 0xEDD8B8, 10);
    // Thin vertical divider at x=168
    g.fillStyle(0xD4B894, 0.50).fillRect(168, 148, 1, wallH);

    // 3. DISPLAY CASE (right section, y=162 to BT-10, x=180 to 528)
    const caseX = 180, caseY = 162, caseW = 348, caseH = BT - 10 - 162;
    // White/cream rounded rect background
    g.fillStyle(0xFFFAF2, 1.0).fillRoundedRect(caseX, caseY, caseW, caseH, 10);
    // Light border
    g.lineStyle(1.5, 0xDCC8A8, 0.80).strokeRoundedRect(caseX, caseY, caseW, caseH, 10);

    // 3 shelf rows
    const productColors = [
      0x2EC4B6, 0xFFD700, 0xE63946, 0x45B7D1, 0xFFA07A, 0x98D8C8,
      0xFFD93D, 0xC3B1E1, 0xFF6B6B, 0x4ECDC4, 0xF7DC6F, 0x82E0AA,
    ];
    const shelfRowH = (caseH - 16) / 3;
    let ci = 0;
    for (let row = 0; row < 3; row++) {
      const shelfBotY = caseY + (row + 1) * shelfRowH + 8;
      const shelfTopY = caseY + row * shelfRowH + 8;
      const usableH   = shelfBotY - shelfTopY - 8; // space above shelf board

      // 10 products per shelf
      for (let col = 0; col < 10; col++) {
        const ph    = 20 + ((col * 7 + row * 3) % 17); // varied height 20-36
        const pw    = 22;
        const px    = caseX + 10 + col * (pw + 4);
        const py    = shelfBotY - 8 - ph; // sit on shelf board
        if (px + pw <= caseX + caseW - 6) {
          g.fillStyle(productColors[ci % productColors.length], 1)
           .fillRoundedRect(px, py, pw, Math.min(ph, usableH), 3);
          ci++;
        }
      }

      // Shelf board
      g.fillStyle(0xC8A87A, 1).fillRect(caseX + 4, shelfBotY - 8, caseW - 8, 8);
    }

    // 4. FLOOR (y=BB to 960)
    vGradient(g, 0, BB, GAME_WIDTH, GAME_HEIGHT - BB, COLORS.FLOOR_SHINE, COLORS.FLOOR_DARK, 12);
    // Highlight strip at belt bottom
    g.fillStyle(0xC08848, 0.22).fillRect(0, BB, GAME_WIDTH, 10);
    // Floor tile grid
    g.lineStyle(1, 0x5A3810, 0.30);
    for (let tx = 0; tx < GAME_WIDTH; tx += 54) {
      g.lineBetween(tx, BB, tx, GAME_HEIGHT);
    }
    for (let ty = BB; ty < GAME_HEIGHT; ty += 54) {
      g.lineBetween(0, ty, GAME_WIDTH, ty);
    }
  }

  // ── Ceiling lights ────────────────────────────────────────────────────

  private buildCeilingLights(): void {
    const lightXs = [62, 182, 302, 422];

    // Static lamp geometry (rod + housing + bulb)
    const lampG = this.add.graphics().setDepth(1);

    // Glow layer (animated)
    const glowG = this.add.graphics().setDepth(1);

    for (const lx of lightXs) {
      // Dark rod
      lampG.fillStyle(0x1A1A28, 1).fillRect(lx - 2, 0, 4, 52);
      // Housing ellipse
      lampG.fillStyle(0x222230, 1).fillEllipse(lx, 58, 32, 16);
      // Bulb — warm tiny ellipse
      lampG.fillStyle(0xFFE090, 1).fillEllipse(lx, 60, 14, 8);

      // Glow: 3 layered ellipses at decreasing alpha
      glowG.fillStyle(0xFFCC60, 0.22).fillEllipse(lx, 60, 48, 26);
      glowG.fillStyle(0xFFCC60, 0.10).fillEllipse(lx, 66, 72, 40);
      glowG.fillStyle(0xFFCC60, 0.05).fillEllipse(lx, 74, 100, 58);

      // Light cone: very faint warm triangle pointing down
      lampG.fillStyle(0xFFCC60, 0.035);
      lampG.fillTriangle(lx - 2, 64, lx - 55, 145, lx + 55, 145);
    }

    // Tween glow alpha 1.0 → 0.65 in sine pattern
    this.tweens.add({
      targets:  glowG,
      alpha:    0.65,
      duration: 2800,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });
  }

  // ── Belt ──────────────────────────────────────────────────────────────

  private buildBelt(): void {
    const { BT, BB, BCY } = GameScene;
    const H = BB - BT;

    const g = this.add.graphics().setDepth(2);

    // Frame
    g.fillStyle(COLORS.BELT_FRAME).fillRect(0, BT, GAME_WIDTH, H);

    // Belt surface: top half gradient + bottom half gradient
    vGradient(g, 0, BT,       GAME_WIDTH, H / 2, 0x282840, 0x404060, 8);
    vGradient(g, 0, BT + H/2, GAME_WIDTH, H / 2, 0x404060, 0x282840, 8);

    // Top rail: gradient + shine line
    vGradient(g, 0, BT, GAME_WIDTH, 14, 0x383850, COLORS.BELT_FRAME, 6);
    g.fillStyle(COLORS.BELT_SHINE, 0.50).fillRect(0, BT + 2, GAME_WIDTH, 3);

    // Bottom rail
    g.fillStyle(0x1A1A28, 1).fillRect(0, BB - 14, GAME_WIDTH, 14);

    // Left roller
    g.fillStyle(COLORS.BELT_ROLLER, 1).fillEllipse(4, BCY, 28, H - 22);
    g.fillStyle(0x404060, 0.50).fillEllipse(4, BCY - 6, 18, 20); // shine

    // Metallic center shine
    g.fillStyle(0xFFFFFF, 0.04).fillRect(0, BCY - 3, GAME_WIDTH, 6);

    // Animated stripes layer
    this.beltStripes = this.add.graphics().setDepth(3);
    this.redrawBeltStripes();
  }

  private redrawBeltStripes(): void {
    const g  = this.beltStripes;
    const BT = GameScene.BT;
    const BB = GameScene.BB;

    g.clear();
    g.lineStyle(4, COLORS.BELT_STRIPE, 0.55);

    for (
      let sx = -this.beltOffset;
      sx < GAME_WIDTH + GameScene.PERIOD;
      sx += GameScene.PERIOD
    ) {
      g.lineBetween(sx,      BT + 16, sx - 22, BB - 16);
      g.lineBetween(sx + 40, BT + 16, sx + 18, BB - 16);
    }
  }

  // ── Lion ──────────────────────────────────────────────────────────────

  private buildLion(): void {
    const { LX, LY } = GameScene;
    const g = this.add.graphics().setDepth(4);

    // Warm spotlight glow behind lion
    circleGlow(g, LX, LY - 55, COLORS.GOLD, 55, 125, 7, 0.09);

    // Drop shadow ellipse
    g.fillStyle(0x000000, 0.22).fillEllipse(LX, LY + 22, 70, 14);

    // Counter/desk body
    vGradient(g, LX - 42, LY + 14, 84, 72, 0x9A7040, 0x6A4820, 6);

    // Counter top slab
    g.fillStyle(0xB48050, 1).fillRoundedRect(LX - 46, LY + 11, 92, 16, 5);

    // Counter top highlight
    g.fillStyle(0xC09060, 0.38).fillRoundedRect(LX - 42, LY + 12, 80, 5, 3);

    // Counter nameplate
    g.fillStyle(0x1B1F3B, 0.80).fillRoundedRect(LX - 30, LY + 20, 60, 16, 4);

    // Lion emoji
    this.lionText = this.add
      .text(LX, LY - 62, '🦁', { fontSize: '108px' })
      .setOrigin(0.5)
      .setDepth(5);

    // "LEO" label on nameplate
    this.add
      .text(LX, LY + 28, 'LEO', {
        fontSize:  '13px',
        color:     '#FFD700',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  /** Animate the lion to react to a correct (happy) or wrong (shake) answer. */
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

  // ── Speech Bubble ─────────────────────────────────────────────────────

  private buildBubble(): void {
    const { BX, BY } = GameScene;
    this.bubbleContainer = this.add.container(BX, BY).setDepth(7);

    const g = this.add.graphics();

    // Shadow
    g.fillStyle(0x000000, 0.20)
     .fillRoundedRect(-96, -77, 208, 172, 22);

    // Main body
    g.fillStyle(0xFFFFFF, 1)
     .fillRoundedRect(-104, -88, 208, 172, 22);

    // Subtle warm tint bottom half
    g.fillStyle(0xFFF5E8, 0.25)
     .fillRoundedRect(-104, 0, 208, 84, { tl: 0, tr: 0, bl: 22, br: 22 });

    // "NAJDI:" header badge
    g.fillStyle(0x2EC4B6, 1)
     .fillRoundedRect(-98, -82, 196, 38, { tl: 18, tr: 18, bl: 0, br: 0 });

    // Border glow
    g.lineStyle(2.5, 0x2EC4B6, 0.55)
     .strokeRoundedRect(-104, -88, 208, 172, 22);

    // Tail
    g.fillStyle(0xFFFFFF, 1)
     .fillTriangle(-64, 78, -92, 118, -34, 78);
    g.lineStyle(2.5, 0x2EC4B6, 0.40)
     .lineBetween(-64, 78, -92, 118)
     .lineBetween(-92, 118, -34, 78);

    // "NAJDI:" header text
    const headerText = this.add
      .text(0, -63, 'NAJDI:', {
        fontSize:      '18px',
        color:         '#FFFFFF',
        fontStyle:     'bold',
        letterSpacing: 3,
      })
      .setOrigin(0.5);

    // Animal emoji (updated each round)
    this.bubbleAnimalEmoji = this.add
      .text(0, -16, '', { fontSize: '68px' })
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

    this.bubbleContainer.add([
      g,
      headerText,
      this.bubbleAnimalEmoji,
      pillBg,
      this.bubbleAnimalName,
    ]);
  }

  private updateBubble(animal: Animal): void {
    this.bubbleAnimalEmoji.setText(animal.emoji);
    this.bubbleAnimalName.setText(animal.name);

    // Pop animation: scale from 0.82 to 1, alpha 0 → 1
    this.bubbleContainer.setScale(0.82).setAlpha(0);
    this.tweens.add({
      targets:  this.bubbleContainer,
      scaleX:   1,
      scaleY:   1,
      alpha:    1,
      duration: 300,
      ease:     'Back.easeOut',
    });
  }

  // ── Top Bar (includes score + mute) ───────────────────────────────────

  private buildTopBar(): void {
    // Gradient fade bar
    const bar = this.add.graphics().setDepth(20);
    for (let i = 0; i <= 10; i++) {
      bar.fillStyle(COLORS.TOP_BAR, 0.90 * (1 - i / 10))
         .fillRect(0, i * 8, GAME_WIDTH, 9);
    }

    // Back pill background
    bar.fillStyle(COLORS.PILL_DARK, 0.88).fillRoundedRect(6, 10, 54, 56, 14);
    bar.lineStyle(1.5, COLORS.PILL_BORDER, 0.50).strokeRoundedRect(6, 10, 54, 56, 14);

    // LEOCRAFT title
    this.add
      .text(240, 38, 'LEOCRAFT', {
        fontSize:          '28px',
        color:             COLORS.TEXT_GOLD,
        fontStyle:         'bold',
        stroke:            '#7A5000',
        strokeThickness:   3,
      })
      .setOrigin(0.5)
      .setDepth(22);

    // Score pill background
    bar.fillStyle(COLORS.PILL_DARK, 0.88).fillRoundedRect(GAME_WIDTH - 108, 10, 100, 56, 14);
    bar.lineStyle(1.5, COLORS.PILL_BORDER, 0.50).strokeRoundedRect(GAME_WIDTH - 108, 10, 100, 56, 14);

    // Score text
    this.scoreText = this.add
      .text(GAME_WIDTH - 58, 38, '⭐ 0', {
        fontSize:  '26px',
        color:     COLORS.TEXT_GOLD,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(22);

    // Mute pill
    this.muteIconPill = this.add.graphics().setDepth(21);
    this.muteIconPill.fillStyle(COLORS.PILL_DARK, 0.88)
      .fillRoundedRect(GAME_WIDTH - 226, 10, 52, 56, 14);
    this.muteIconPill.lineStyle(1.5, COLORS.PILL_BORDER, 0.50)
      .strokeRoundedRect(GAME_WIDTH - 226, 10, 52, 56, 14);

    // Mute icon text
    this.muteIcon = this.add
      .text(GAME_WIDTH - 200, 38, '🔊', { fontSize: '24px' })
      .setOrigin(0.5)
      .setDepth(22);

    // Mute hit zone
    const muteZone = this.add
      .rectangle(GAME_WIDTH - 200, 38, 52, 56)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });

    muteZone.on('pointerup', () => {
      const muted = audioManager.toggleMute();
      this.muteIcon.setText(muted ? '🔇' : '🔊');
      this.muteIconPill.setAlpha(muted ? 0.40 : 1.0);
    });

    // Back button text
    this.add
      .text(33, 38, '←', {
        fontSize: '34px',
        color:    COLORS.TEXT_LIGHT,
      })
      .setOrigin(0.5)
      .setDepth(22);

    // Back button hit zone
    const backZone = this.add
      .rectangle(33, 38, 54, 56)
      .setDepth(23)
      .setInteractive({ useHandCursor: true });

    backZone.on('pointerup', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    });
  }

  private refreshScore(): void {
    this.scoreText.setText('⭐ ' + this.successCount);
    this.tweens.add({
      targets:  this.scoreText,
      scaleX:   1.4,
      scaleY:   1.4,
      duration: 130,
      ease:     'Power2',
      yoyo:     true,
    });
  }

  // ── Round logic ───────────────────────────────────────────────────────

  private startRound(): void {
    const prevId = this.currentRound?.target?.id;
    this.currentRound = createRound(prevId);
    this.roundActive  = true;

    this.clearCards();
    this.updateBubble(this.currentRound.target);
    this.spawnCards(this.currentRound);
  }

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

  // ── Card factory ──────────────────────────────────────────────────────

  private createCard(x: number, y: number, animal: Animal, cardIndex: number): AnimalCard {
    const { CW, CH } = GameScene;
    const hw = CW / 2;
    const hh = CH / 2;

    const container = this.add.container(x, y).setDepth(6);
    container.setSize(CW + 16, CH + 16);

    // 1. Shadow
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.26).fillEllipse(4, hh + 5, CW - 8, 14);

    // 2. Card background
    const bg = this.add.graphics();
    this.drawCardBg(bg, animal);

    // 3. Emoji
    const emoji = this.add
      .text(0, -10, animal.emoji, { fontSize: '52px' })
      .setOrigin(0.5);

    // 4. Name pill background
    const pillBg = this.add.graphics();
    pillBg.fillStyle(0x000000, 0.30).fillRoundedRect(-40, hh - 34, 80, 26, 13);

    // 5. Name text
    const nameTxt = this.add
      .text(0, hh - 21, animal.name, {
        fontSize:  '18px',
        color:     '#FFFFFF',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([shadow, bg, emoji, pillBg, nameTxt]);

    // Interaction
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onCardTap({ container, animal, bg }));

    // Entrance animation with stagger delay
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
    // Base fill
    bg.fillStyle(animal.color, 1).fillRoundedRect(-hw, -hh, CW, CH, 20);
    // Top half sheen
    bg.fillStyle(0xFFFFFF, 0.28).fillRoundedRect(-hw, -hh, CW, CH / 2, { tl: 20, tr: 20, bl: 0, br: 0 });
    // Inner gloss highlight
    bg.fillStyle(0xFFFFFF, 0.16).fillRoundedRect(-hw + 7, -hh + 7, CW - 14, 24, 10);
    // Border
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
    this.successCount++;
    audioManager.playSuccess();

    // Gold highlight on card
    const { CW, CH } = GameScene;
    const hw = CW / 2;
    const hh = CH / 2;
    card.bg.clear();
    card.bg.fillStyle(0xFFD700, 1).fillRoundedRect(-hw, -hh, CW, CH, 20);
    card.bg.fillStyle(0xFFFFFF, 0.28).fillRoundedRect(-hw, -hh, CW, CH / 2, { tl: 20, tr: 20, bl: 0, br: 0 });
    card.bg.lineStyle(4, 0xFFA500, 1).strokeRoundedRect(-hw, -hh, CW, CH, 20);

    // Card bounce
    this.tweens.add({
      targets:  card.container,
      scaleX:   1.20,
      scaleY:   1.20,
      duration: 130,
      ease:     'Power2',
      yoyo:     true,
      repeat:   1,
    });

    // Confetti explosion
    this.spawnConfetti(card.container.x, card.container.y);

    // Lion celebrates
    this.lionReact(true);

    // Score update
    this.refreshScore();

    // Short pause then next round
    this.time.delayedCall(1700, () => this.startRound());
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

    // Lion shakes head
    this.lionReact(false);
  }

  // ── Confetti effect ───────────────────────────────────────────────────

  private spawnConfetti(cx: number, cy: number): void {
    const confettiColors = [
      0xFFD700, 0xFF6B6B, 0x2EC4B6, 0x87CEEB, 0x90EE90,
      0xFFA500, 0xFF69B4, 0x9370DB, 0xFFD700, 0xFF6B6B,
      0x2EC4B6, 0x87CEEB, 0x90EE90, 0xFFA500,
    ];

    // 14 colored circles
    for (let i = 0; i < 14; i++) {
      const size  = 6 + Math.random() * 8;
      const angle = (i / 14) * Math.PI * 2;
      const dist  = 60 + Math.random() * 70;

      const circle = this.add
        .circle(cx, cy, size, confettiColors[i])
        .setDepth(50);

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

    // 6 star emoji bursts
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
