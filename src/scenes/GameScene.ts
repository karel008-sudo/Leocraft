import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, LAYOUT } from '../config/constants';
import { Animal } from '../game/animals';
import { Round, createRound } from '../game/roundLogic';

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
 *   0   – 140  ceiling / top bar
 *   140 – 500  store interior (shelves, lion area)
 *   278        "Najdi:" label
 *   375        comic-bubble centre
 *   500 – 620  conveyor belt (BELT_TOP … BELT_BOT)
 *   560        belt centre (BELT_CY)  ← animal cards ride here
 *   620 – 960  store floor
 *   730        lion emoji centre (LION_Y)
 *
 * The lion sits to the LEFT of the canvas (x ≈ 90).
 * Animals enter from the RIGHT and travel LEFT.
 * When a card crosses x = –CARD_W it loops back to GAME_WIDTH + CARD_W.
 */
export class GameScene extends Phaser.Scene {

  // ── Layout aliases ────────────────────────────────────────────────────
  private static readonly BT   = LAYOUT.BELT_TOP;
  private static readonly BB   = LAYOUT.BELT_BOT;
  private static readonly BCY  = LAYOUT.BELT_CY;
  private static readonly LX   = LAYOUT.LION_X;
  private static readonly LY   = LAYOUT.LION_Y;
  private static readonly BX   = LAYOUT.BUBBLE_X;
  private static readonly BY   = LAYOUT.BUBBLE_Y;
  private static readonly CW   = LAYOUT.CARD_W;
  private static readonly CH   = LAYOUT.CARD_H;
  private static readonly SPD  = LAYOUT.BELT_SPEED;
  private static readonly PERIOD = 80; // belt stripe period (px)

  // ── State ─────────────────────────────────────────────────────────────
  private currentRound!: Round;
  private roundActive  = false;
  private successCount = 0;
  private beltOffset   = 0;

  // ── Scene objects ─────────────────────────────────────────────────────
  private beltStripes!:      Phaser.GameObjects.Graphics;
  private lionText!:         Phaser.GameObjects.Text;
  private bubbleContainer!:  Phaser.GameObjects.Container;
  private bubbleAnimalEmoji!: Phaser.GameObjects.Text;
  private bubbleAnimalName!: Phaser.GameObjects.Text;
  private scoreText!:        Phaser.GameObjects.Text;
  private animalCards:       AnimalCard[] = [];

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
    this.buildBelt();
    this.buildLion();
    this.buildBubble();
    this.buildTopBar();
    this.buildScoreDisplay();

    this.cameras.main.fadeIn(350);
    this.time.delayedCall(500, () => this.startRound());
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
    const g = this.add.graphics().setDepth(0);

    // Sky-blue ceiling band
    g.fillStyle(0x87CEEB).fillRect(0, 0, GAME_WIDTH, 140);
    g.fillStyle(0x5BA3C9).fillRect(0, 128, GAME_WIDTH, 14);

    // Ceiling pendant lights
    for (let lx = 80; lx <= GAME_WIDTH; lx += 120) {
      g.fillStyle(0x2A2A3A).fillRect(lx - 2, 0, 4, 55);
      g.fillStyle(0xFFFF99, 0.28).fillEllipse(lx, 58, 44, 30);
      g.fillStyle(0xFFE055).fillEllipse(lx, 58, 26, 16);
    }

    // Main store wall (warm cream)
    g.fillStyle(0xFFF4E6).fillRect(0, 140, GAME_WIDTH, GameScene.BT - 140);

    // Lion side alcove (slightly different shade)
    g.fillStyle(0xF5E6CC).fillRect(0, 140, 165, GameScene.BT - 140);

    // Store shelves on right side (decorative)
    g.fillStyle(0xEEDDC8).fillRect(290, 160, 240, 310);
    for (let sy = 200; sy < 470; sy += 75) {
      g.fillStyle(0xCFB896).fillRect(298, sy, 224, 8);
    }

    // Colourful shelf items (small rectangles)
    const shelfCols = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8, 0xFFD93D, 0xC3B1E1, 0xFFB3BA];
    let ci = 0;
    for (let sy = 210; sy < 470; sy += 75) {
      for (let sx = 305; sx < 510; sx += 30) {
        g.fillStyle(shelfCols[ci % shelfCols.length]).fillRect(sx, sy - 26, 20, 26);
        ci++;
      }
    }

    // Floor (warm wood)
    g.fillStyle(0x8B6914).fillRect(0, GameScene.BB, GAME_WIDTH, GAME_HEIGHT - GameScene.BB);
    // Floor tile grid
    g.lineStyle(1, 0x7A5C10, 0.5);
    for (let tx = 0; tx < GAME_WIDTH; tx += 54) {
      g.lineBetween(tx, GameScene.BB, tx, GAME_HEIGHT);
    }
    for (let ty = GameScene.BB; ty < GAME_HEIGHT; ty += 54) {
      g.lineBetween(0, ty, GAME_WIDTH, ty);
    }

    // Store sign at top centre
    g.fillStyle(0x1E3050).fillRoundedRect(GAME_WIDTH / 2 - 120, 8, 240, 44, 8);
  }

  // ── Belt ──────────────────────────────────────────────────────────────

  private buildBelt(): void {
    const { BT, BB, BCY } = GameScene;
    const H = BB - BT;

    // Static belt structure
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(0x2D2D2D).fillRect(0, BT, GAME_WIDTH, H);          // frame
    g.fillStyle(0x5A5A5A).fillRect(0, BT + 12, GAME_WIDTH, H - 24); // surface
    g.fillStyle(0x3A3A3A).fillRect(0, BT, GAME_WIDTH, 12);          // top rail
    g.fillStyle(0x3A3A3A).fillRect(0, BB - 12, GAME_WIDTH, 12);     // bottom rail

    // Left roller
    g.fillStyle(0x222222).fillEllipse(0, BCY, 28, H - 22);

    // Animated stripes layer
    this.beltStripes = this.add.graphics().setDepth(2);
    this.redrawBeltStripes();
  }

  private redrawBeltStripes(): void {
    const g   = this.beltStripes;
    const top = GameScene.BT + 14;
    const bot = GameScene.BB - 14;

    g.clear();
    g.lineStyle(3, 0x888888, 0.6);

    for (
      let sx = -this.beltOffset;
      sx < GAME_WIDTH + GameScene.PERIOD;
      sx += GameScene.PERIOD
    ) {
      // Diagonal stripe (belt motion: right→left)
      g.lineBetween(sx,      top, sx - 18, bot);
      g.lineBetween(sx + 40, top, sx + 22, bot);
    }
  }

  // ── Lion ──────────────────────────────────────────────────────────────

  private buildLion(): void {
    // Simple counter backdrop for the lion (like a checkout post)
    const post = this.add.graphics().setDepth(3);
    post.fillStyle(0x5C4A2A).fillRoundedRect(GameScene.LX - 36, GameScene.LY - 10, 72, 80, 10);
    post.fillStyle(0x7A6238).fillRoundedRect(GameScene.LX - 40, GameScene.LY - 18, 80, 22, 6);

    // Lion emoji — big, instantly recognisable
    this.lionText = this.add
      .text(GameScene.LX, GameScene.LY - 55, '🦁', { fontSize: '96px' })
      .setOrigin(0.5)
      .setDepth(4);
  }

  /** Animate the lion to react to a correct (happy) or wrong (shake) answer. */
  private lionReact(correct: boolean): void {
    if (correct) {
      // Happy jump
      this.tweens.add({
        targets: this.lionText,
        y: GameScene.LY - 75,
        duration: 180,
        ease: 'Power2',
        yoyo: true,
        repeat: 1,
      });
    } else {
      // Gentle shake
      const origX = GameScene.LX;
      this.tweens.add({
        targets: this.lionText,
        x: origX + 10,
        duration: 55,
        ease: 'Linear',
        yoyo: true,
        repeat: 3,
        onComplete: () => { this.lionText.x = origX; },
      });
    }
  }

  // ── Comic bubble ──────────────────────────────────────────────────────

  private buildBubble(): void {
    this.bubbleContainer = this.add.container(GameScene.BX, GameScene.BY).setDepth(5);

    // Bubble graphic: white rounded rect + speech-bubble tail
    const g = this.add.graphics();
    // Fill first (so tail blends in)
    g.fillStyle(0xFFFFFF).fillRoundedRect(-100, -82, 200, 164, 22);
    // Tail pointing down-left toward lion
    g.fillStyle(0xFFFFFF).fillTriangle(-58, 76, -85, 112, -30, 76);
    // Outline
    g.lineStyle(4, 0x2E2E3E).strokeRoundedRect(-100, -82, 200, 164, 22);
    g.lineBetween(-58, 76, -85, 112);
    g.lineBetween(-85, 112, -30, 76);

    this.bubbleAnimalEmoji = this.add
      .text(0, -22, '', { fontSize: '60px' })
      .setOrigin(0.5);

    this.bubbleAnimalName = this.add
      .text(0, 52, '', {
        fontSize: '26px',
        color: COLORS.TEXT_DARK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.bubbleContainer.add([g, this.bubbleAnimalEmoji, this.bubbleAnimalName]);

    // "Najdi:" label above bubble
    this.add
      .text(GameScene.BX, LAYOUT.LABEL_Y, 'Najdi:', {
        fontSize: '30px',
        color: '#2E4057',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private updateBubble(animal: Animal): void {
    this.bubbleAnimalEmoji.setText(animal.emoji);
    this.bubbleAnimalName.setText(animal.name);

    // Pulse animation to draw attention
    this.tweens.add({
      targets: this.bubbleContainer,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: 180,
      ease: 'Power2',
      yoyo: true,
    });
  }

  // ── HUD ───────────────────────────────────────────────────────────────

  private buildTopBar(): void {
    // Semi-transparent bar over ceiling
    const bar = this.add.graphics().setDepth(10);
    bar.fillStyle(0x000000, 0.30).fillRect(0, 0, GAME_WIDTH, 80);

    // Back button
    const btn = this.add
      .text(44, 40, '←', { fontSize: '40px', color: COLORS.TEXT_LIGHT })
      .setOrigin(0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => btn.setAlpha(0.5));
    btn.on('pointerout',  () => btn.setAlpha(1));
    btn.on('pointerup',   () => {
      btn.setAlpha(1);
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    });

    // Game title in top bar
    this.add
      .text(GAME_WIDTH / 2, 40, 'Leocraft', {
        fontSize: '34px',
        color: COLORS.TEXT_GOLD,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(11);
  }

  private buildScoreDisplay(): void {
    this.scoreText = this.add
      .text(GAME_WIDTH - 16, 40, '⭐ 0', {
        fontSize: '30px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(1, 0.5)
      .setDepth(11);
  }

  private refreshScore(): void {
    this.scoreText.setText(`⭐ ${this.successCount}`);
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.35,
      scaleY: 1.35,
      duration: 140,
      ease: 'Power2',
      yoyo: true,
    });
  }

  // ── Round logic ───────────────────────────────────────────────────────

  private startRound(): void {
    const prevId = this.currentRound?.target?.id;
    this.currentRound = createRound(prevId);
    this.roundActive  = true;

    this.clearCards();
    this.updateBubble(this.currentRound.target);
    this.spawnCards();
  }

  private clearCards(): void {
    this.animalCards.forEach(c => c.container.destroy());
    this.animalCards = [];
  }

  private spawnCards(): void {
    const spacing = 132;
    const startX  = 200; // first card; cards flow rightward off-screen

    this.currentRound.beltAnimals.forEach((animal, i) => {
      const x    = startX + i * spacing;
      const card = this.createCard(x, GameScene.BCY - 4, animal);
      this.animalCards.push(card);
    });
  }

  // ── Card factory ──────────────────────────────────────────────────────

  private createCard(x: number, y: number, animal: Animal): AnimalCard {
    const container = this.add.container(x, y).setDepth(4);

    // Card background (rounded rect via Graphics)
    const bg = this.add.graphics();
    this.drawCardBg(bg, animal.color, animal.accentColor, 3);

    // Emoji
    const emoji = this.add
      .text(0, -10, animal.emoji, { fontSize: '46px' })
      .setOrigin(0.5);

    // Name label
    const name = this.add
      .text(0, 34, animal.name, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    container.add([bg, emoji, name]);

    // Hit area sized for child fingers
    container.setSize(GameScene.CW + 12, GameScene.CH + 12);
    container.setInteractive({ useHandCursor: true });
    container.on('pointerdown', () => this.onCardTap({ container, animal, bg }));

    // Fade-in entrance
    container.setAlpha(0);
    this.tweens.add({ targets: container, alpha: 1, duration: 280 });

    return { container, animal, bg };
  }

  private drawCardBg(
    g: Phaser.GameObjects.Graphics,
    fillColor: number,
    borderColor: number,
    borderWidth: number,
  ): void {
    const hw = GameScene.CW / 2;
    const hh = GameScene.CH / 2;
    g.clear();
    g.fillStyle(fillColor).fillRoundedRect(-hw, -hh, GameScene.CW, GameScene.CH, 14);
    g.lineStyle(borderWidth, borderColor).strokeRoundedRect(-hw, -hh, GameScene.CW, GameScene.CH, 14);
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

    // Gold highlight on card
    const hw = GameScene.CW / 2;
    const hh = GameScene.CH / 2;
    card.bg.clear();
    card.bg.fillStyle(0xFFD700).fillRoundedRect(-hw, -hh, GameScene.CW, GameScene.CH, 14);
    card.bg.lineStyle(4, 0xFFA500).strokeRoundedRect(-hw, -hh, GameScene.CW, GameScene.CH, 14);

    // Card bounce
    this.tweens.add({
      targets: card.container,
      scaleX: 1.22,
      scaleY: 1.22,
      duration: 140,
      ease: 'Power2',
      yoyo: true,
      repeat: 1,
    });

    // Star explosion around card
    this.spawnStarBurst(card.container.x, card.container.y);

    // Lion celebrates
    this.lionReact(true);

    // Score update
    this.refreshScore();

    // Short pause then next round
    this.time.delayedCall(1600, () => this.startRound());
  }

  private handleWrong(card: AnimalCard): void {
    // Brief shake + dim — no harsh penalty
    const origX = card.container.x;

    this.tweens.add({
      targets: card.container,
      x: origX + 10,
      duration: 55,
      ease: 'Linear',
      yoyo: true,
      repeat: 3,
      onComplete: () => { card.container.x = origX; },
    });

    this.tweens.add({
      targets: card.container,
      alpha: 0.45,
      duration: 80,
      yoyo: true,
      repeat: 1,
    });

    // Lion shakes head (gentle)
    this.lionReact(false);
  }

  // ── Effects ───────────────────────────────────────────────────────────

  private spawnStarBurst(cx: number, cy: number): void {
    const glyphs = ['⭐', '✨', '🌟', '⭐', '✨', '🌟', '⭐', '✨', '🌟', '⭐'];

    glyphs.forEach((g, i) => {
      const angle  = (i / glyphs.length) * Math.PI * 2;
      const radius = 75 + Math.random() * 55;

      const star = this.add
        .text(cx, cy, g, { fontSize: '28px' })
        .setOrigin(0.5)
        .setDepth(50);

      this.tweens.add({
        targets:  star,
        x:        cx + Math.cos(angle) * radius,
        y:        cy + Math.sin(angle) * radius,
        scaleX:   0.15,
        scaleY:   0.15,
        alpha:    0,
        duration: 650 + Math.random() * 300,
        ease:     'Power2',
        onComplete: () => star.destroy(),
      });
    });
  }
}
