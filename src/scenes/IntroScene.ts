import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT } from '../config/constants';

/**
 * IntroScene – animated splash screen shown once on startup.
 *
 * Sequence:
 *  0 ms   – dark starfield background appears instantly
 *  0 ms   – 🦁 lion scales in with bounce
 *  700 ms – "LEOCRAFT" title rises into position
 *  1 000 ms – subtitle fades in
 *  1 300 ms – sparkle stars orbit the title
 *  2 900 ms – camera fades to black → MenuScene
 */
export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.INTRO });
  }

  create(): void {
    const cx = GAME_WIDTH  / 2;
    const cy = GAME_HEIGHT / 2;

    // ── Starfield background ───────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Subtle upper glow
    bg.fillStyle(0x2d2d5e, 0.4).fillRect(0, 0, GAME_WIDTH, cy);

    // Scattered background stars
    for (let i = 0; i < 50; i++) {
      const sx = Phaser.Math.Between(10, GAME_WIDTH  - 10);
      const sy = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      const sr = 1 + Math.random() * 2;
      const sa = 0.25 + Math.random() * 0.55;
      bg.fillStyle(0xffffff, sa).fillCircle(sx, sy, sr);
    }

    // ── Lion mascot ───────────────────────────────────────────────────
    const lion = this.add
      .text(cx, cy - 90, '🦁', { fontSize: '110px' })
      .setOrigin(0.5)
      .setScale(0)
      .setAlpha(0);

    // ── Title ─────────────────────────────────────────────────────────
    const title = this.add
      .text(cx, cy + 120, 'LEOCRAFT', {
        fontSize: '68px',
        color: '#FFD700',
        fontStyle: 'bold',
        stroke: '#9A7000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ── Subtitle ──────────────────────────────────────────────────────
    const subtitle = this.add
      .text(cx, cy + 210, 'Zábava pro nejmenší', {
        fontSize: '28px',
        color: '#aaaacc',
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // ─────────────────────────────────────────────────────────────────
    // Animation timeline
    // ─────────────────────────────────────────────────────────────────

    // Lion bounces in
    this.tweens.add({
      targets: lion,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 550,
      ease: 'Back.easeOut',
    });

    // Lion slight hop after appearing
    this.time.delayedCall(600, () => {
      this.tweens.add({
        targets: lion,
        y: cy - 110,
        duration: 250,
        ease: 'Power2',
        yoyo: true,
      });
    });

    // Title rises up and fades in
    this.time.delayedCall(700, () => {
      this.tweens.add({
        targets: title,
        y: cy + 80,
        alpha: 1,
        duration: 500,
        ease: 'Power2.easeOut',
      });
    });

    // Subtitle fades in
    this.time.delayedCall(1050, () => {
      this.tweens.add({
        targets: subtitle,
        alpha: 1,
        duration: 400,
      });
    });

    // Stars burst around title
    this.time.delayedCall(1300, () => {
      this.spawnOrbitStars(cx, cy + 80);
    });

    // Gentle idle bob on lion
    this.time.delayedCall(1100, () => {
      this.tweens.add({
        targets: lion,
        y: cy - 100,
        duration: 900,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1,
      });
    });

    // Fade out → MenuScene
    this.time.delayedCall(2900, () => {
      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  private spawnOrbitStars(cx: number, cy: number): void {
    const glyphs = ['✨', '⭐', '🌟', '✨', '⭐', '🌟', '✨', '⭐'];

    glyphs.forEach((glyph, i) => {
      const angle = (i / glyphs.length) * Math.PI * 2;
      const dist  = 130 + Math.random() * 30;
      const star  = this.add
        .text(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, glyph, {
          fontSize: '30px',
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0);

      this.tweens.add({
        targets: star,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 350,
        delay: i * 70,
        ease: 'Back.easeOut',
      });

      // Gentle pulse after appearing
      this.time.delayedCall(350 + i * 70, () => {
        this.tweens.add({
          targets: star,
          scaleX: 1.25,
          scaleY: 1.25,
          duration: 500,
          ease: 'Sine.easeInOut',
          yoyo: true,
          repeat: -1,
        });
      });
    });
  }
}
