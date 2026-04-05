import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * IntroScene – premium animated splash screen shown once on startup.
 *
 * Sequence:
 *  0 ms    – deep indigo gradient background + nebula glows + starfield
 *  0 ms    – 🦁 lion scales in with Back.easeOut bounce
 *  700 ms  – "LEOCRAFT" title rises from below with Back.easeOut
 *  1 050 ms – subtitle fades in
 *  1 300 ms – 10 sparkle stars burst out in orbit at 140px radius (staggered)
 *  1 100 ms – lion idle bob begins (±10px, Sine)
 *  3 500 ms – camera fades to black → MenuScene
 *  Tap anywhere → skip immediately to MENU
 */
export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
  }

  create(): void {
    const cx = GAME_WIDTH  / 2;
    const cy = GAME_HEIGHT / 2;

    // ── Deep indigo gradient background ──────────────────────────────────
    // Simulated via layered horizontal strips (top: 0x1B1F3B → bottom: 0x0D0F1E)
    const bg = this.add.graphics();
    const stripes = 24;
    for (let i = 0; i < stripes; i++) {
      const t   = i / (stripes - 1);
      const r   = Math.round(Phaser.Math.Linear(0x1B, 0x0D, t));
      const g   = Math.round(Phaser.Math.Linear(0x1F, 0x0F, t));
      const b   = Math.round(Phaser.Math.Linear(0x3B, 0x1E, t));
      const col = (r << 16) | (g << 8) | b;
      const sy  = (i / stripes) * GAME_HEIGHT;
      const sh  = Math.ceil(GAME_HEIGHT / stripes) + 1;
      bg.fillStyle(col, 1).fillRect(0, sy, GAME_WIDTH, sh);
    }

    // ── Nebula glow blobs (large semi-transparent ellipses) ───────────────
    const nebula = this.add.graphics();
    // Purple blob – upper-left quadrant
    nebula.fillStyle(0x6A0DAD, 0.07).fillEllipse(cx * 0.4, cy * 0.55, 340, 260);
    // Teal blob – right side
    nebula.fillStyle(0x0AAFA8, 0.06).fillEllipse(cx * 1.65, cy * 0.80, 280, 220);
    // Warm amber blob – lower-center
    nebula.fillStyle(0xF39C12, 0.04).fillEllipse(cx, cy * 1.55, 360, 200);

    // ── Rich starfield: varied sizes, brightness, subtle twinkle ─────────
    const starGfx = this.add.graphics();
    const starData: Array<{ x: number; y: number; r: number; alpha: number }> = [];

    for (let i = 0; i < 70; i++) {
      const sx = Phaser.Math.Between(6, GAME_WIDTH  - 6);
      const sy = Phaser.Math.Between(6, GAME_HEIGHT - 6);
      const sr = 0.5 + Math.random() * 2.5;          // 0.5–3 px radius
      const sa = 0.15 + Math.random() * 0.65;
      starData.push({ x: sx, y: sy, r: sr, alpha: sa });
      starGfx.fillStyle(0xffffff, sa).fillCircle(sx, sy, sr);
    }

    // Twinkle a random subset of small stars
    starData.forEach((s, idx) => {
      if (s.r < 1.4 && idx % 3 === 0) {
        // Create an invisible rect we use purely as a tween target for alpha
        const proxy = this.add.rectangle(s.x, s.y, 1, 1, 0xffffff, 0).setAlpha(s.alpha);
        this.tweens.add({
          targets: proxy,
          alpha: s.alpha * 0.2,
          duration: 600 + Math.random() * 900,
          delay:    Math.random() * 1200,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
          onUpdate: () => {
            // Re-draw that star at the tweened alpha
            starGfx.fillStyle(0xffffff, proxy.alpha).fillCircle(s.x, s.y, s.r);
          },
        });
      }
    });

    // ── Golden circular glow behind lion ──────────────────────────────────
    const lionY = cy - 90;
    const glow  = this.add.graphics();
    glow.fillStyle(COLORS.GOLD, 0.07).fillCircle(cx, lionY, 110);
    glow.fillStyle(COLORS.GOLD, 0.04).fillCircle(cx, lionY, 150);

    // ── Lion mascot ───────────────────────────────────────────────────────
    const lion = this.add
      .text(cx, lionY, '🦁', { fontSize: '120px' })
      .setOrigin(0.5)
      .setScale(0)
      .setAlpha(0);

    // ── "LEOCRAFT" title ──────────────────────────────────────────────────
    const titleStartY = cy + 160;
    const titleEndY   = cy + 100;
    const title = this.add
      .text(cx, titleStartY, 'LEOCRAFT', {
        fontSize:        '70px',
        color:           COLORS.TEXT_GOLD,
        fontStyle:       'bold',
        stroke:          '#9A6000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ── Subtitle ──────────────────────────────────────────────────────────
    const subtitle = this.add
      .text(cx, titleEndY + 62, 'Vzdělávací hra pro nejmenší', {
        fontSize: '24px',
        color:    COLORS.TEXT_CREAM,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ── Tap-to-skip hint ─────────────────────────────────────────────────
    const skipHint = this.add
      .text(cx, GAME_HEIGHT - 36, 'Klepni pro přeskočení', {
        fontSize: '18px',
        color:    '#8888AA',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Fade in the skip hint after a short delay
    this.time.delayedCall(800, () => {
      this.tweens.add({ targets: skipHint, alpha: 0.55, duration: 500 });
    });

    // ── Skip on tap anywhere ──────────────────────────────────────────────
    let skipped = false;
    const skipToMenu = () => {
      if (skipped) return;
      skipped = true;
      this.cameras.main.fadeOut(400, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    };

    this.input.on('pointerdown', skipToMenu);

    // ─────────────────────────────────────────────────────────────────────
    // Animation timeline
    // ─────────────────────────────────────────────────────────────────────

    // Lion bounces in immediately
    this.tweens.add({
      targets:  lion,
      scaleX:   1,
      scaleY:   1,
      alpha:    1,
      duration: 580,
      ease:     'Back.easeOut',
    });

    // Lion quick hop after appearing
    this.time.delayedCall(620, () => {
      this.tweens.add({
        targets:  lion,
        y:        lionY - 18,
        duration: 220,
        ease:     'Power2.easeOut',
        yoyo:     true,
      });
    });

    // Title rises from below with Back.easeOut
    this.time.delayedCall(700, () => {
      this.tweens.add({
        targets:  title,
        y:        titleEndY,
        alpha:    1,
        duration: 520,
        ease:     'Back.easeOut',
      });
    });

    // Subtitle fades in
    this.time.delayedCall(1050, () => {
      this.tweens.add({ targets: subtitle, alpha: 1, duration: 420 });
    });

    // Orbit star burst
    this.time.delayedCall(1300, () => {
      this.spawnOrbitStars(cx, titleEndY);
    });

    // Lion idle bob (starts after entry animation settles)
    this.time.delayedCall(1100, () => {
      this.tweens.add({
        targets:  lion,
        y:        lionY + 10,
        duration: 1050,
        ease:     'Sine.easeInOut',
        yoyo:     true,
        repeat:   -1,
      });
      // Also gently pulse the glow
      this.tweens.add({
        targets:  glow,
        alpha:    0.5,
        duration: 1050,
        ease:     'Sine.easeInOut',
        yoyo:     true,
        repeat:   -1,
      });
    });

    // Auto-advance to MenuScene after ~3.5 s total
    this.time.delayedCall(3500, () => {
      skipToMenu();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  /** Spawn 10 sparkle-stars in orbit around the title, staggered. */
  private spawnOrbitStars(cx: number, cy: number): void {
    const glyphs = ['✨', '⭐', '🌟', '✨', '⭐', '🌟', '✨', '⭐', '🌟', '✨'];
    const count  = glyphs.length;

    glyphs.forEach((glyph, i) => {
      const angle  = (i / count) * Math.PI * 2;
      const radius = 140;
      const tx     = cx + Math.cos(angle) * radius;
      const ty     = cy + Math.sin(angle) * radius;

      const star = this.add
        .text(tx, ty, glyph, { fontSize: '28px' })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0);

      this.tweens.add({
        targets:  star,
        alpha:    1,
        scaleX:   1,
        scaleY:   1,
        duration: 360,
        delay:    i * 80,
        ease:     'Back.easeOut',
      });

      // Gentle scale pulse after appearing
      this.time.delayedCall(360 + i * 80 + 50, () => {
        this.tweens.add({
          targets:  star,
          scaleX:   1.3,
          scaleY:   1.3,
          duration: 540 + Math.random() * 200,
          ease:     'Sine.easeInOut',
          yoyo:     true,
          repeat:   -1,
        });
      });
    });
  }
}
