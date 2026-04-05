import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * GameScene – placeholder for the main gameplay loop.
 *
 * Replace the contents of create() / update() once the game design is finalised.
 * The tap-feedback and scene-transition patterns below are production-ready stubs
 * you can build on directly.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.GAME });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // ── Top bar ────────────────────────────────────────────────────────
    this.add
      .rectangle(cx, 44, GAME_WIDTH, 88, 0x16213e)
      .setDepth(10);

    this.add
      .text(cx, 44, 'Leocraft', {
        fontSize: '36px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.createBackButton();

    // ── Placeholder gameplay area ──────────────────────────────────────
    this.add
      .rectangle(cx, cy + 20, GAME_WIDTH - 40, GAME_HEIGHT - 180, 0x162032)
      .setStrokeStyle(3, COLORS.PRIMARY);

    this.add
      .text(cx, cy - 60, '🎮', { fontSize: '72px' })
      .setOrigin(0.5);

    this.add
      .text(cx, cy + 40, 'Tady bude hra!\nKlepni kamkoliv…', {
        fontSize: '30px',
        color: COLORS.TEXT_DIM,
        align: 'center',
      })
      .setOrigin(0.5);

    // ── Touch interaction (placeholder) ───────────────────────────────
    // Tap anywhere in the scene to produce visual feedback.
    // Replace this with real game logic once design is confirmed.
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.spawnTapFeedback(pointer.x, pointer.y);
    });
  }

  update(): void {
    // Game logic goes here.
  }

  // ──────────────────────────────────────────────────────────────────────
  private spawnTapFeedback(x: number, y: number): void {
    const circle = this.add.circle(x, y, 28, COLORS.ACCENT, 0.85);
    this.tweens.add({
      targets: circle,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 450,
      ease: 'Power2',
      onComplete: () => circle.destroy(),
    });
  }

  private createBackButton(): void {
    const btn = this.add
      .text(44, 44, '←', {
        fontSize: '44px',
        color: COLORS.TEXT_LIGHT,
      })
      .setOrigin(0.5)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });

    btn.on('pointerdown', () => btn.setAlpha(0.5));
    btn.on('pointerout', () => btn.setAlpha(1));
    btn.on('pointerup', () => {
      btn.setAlpha(1);
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.MENU);
      });
    });
  }
}
