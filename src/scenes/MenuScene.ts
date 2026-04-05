import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS, MIN_TOUCH_TARGET } from '../config/constants';

/**
 * MenuScene – main menu.
 * Designed for children aged 3+: one large, obvious CTA button,
 * no walls of text, cheerful but calm visuals.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    // ── Title ──────────────────────────────────────────────────────────
    this.add
      .text(cx, 180, 'Leocraft', {
        fontSize: '72px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Placeholder character / mascot emoji
    this.add
      .text(cx, 320, '🦁', { fontSize: '96px' })
      .setOrigin(0.5);

    // ── Single big play button ─────────────────────────────────────────
    this.createPlayButton(cx, GAME_HEIGHT / 2 + 80);

    // Dev overlay
    if (import.meta.env.DEV) {
      this.add.text(8, GAME_HEIGHT - 20, 'DEV  v0.1.0', {
        fontSize: '16px',
        color: '#555577',
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  private createPlayButton(x: number, y: number): void {
    const btnW = 280;
    const btnH = MIN_TOUCH_TARGET * 1.5; // ~132 px – very easy to tap

    const bg = this.add
      .rectangle(x, y, btnW, btnH, COLORS.SUCCESS)
      .setInteractive({ useHandCursor: true });

    const label = this.add
      .text(x, y, 'HRÁT! ▶', {
        fontSize: '44px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Tactile feedback for children
    bg.on('pointerdown', () => {
      bg.setFillStyle(0x1e8449);
      label.setScale(0.93);
    });

    bg.on('pointerup', () => {
      bg.setFillStyle(COLORS.SUCCESS);
      label.setScale(1);
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.GAME);
      });
    });

    bg.on('pointerout', () => {
      bg.setFillStyle(COLORS.SUCCESS);
      label.setScale(1);
    });
  }
}
