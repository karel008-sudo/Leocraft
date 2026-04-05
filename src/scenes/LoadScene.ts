import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * LoadScene – displays a progress bar while loading all game assets.
 * Add asset load calls in preload() as the game grows.
 */
export class LoadScene extends Phaser.Scene {
  private progressBar!: Phaser.GameObjects.Rectangle;

  constructor() {
    super({ key: SCENES.LOAD });
  }

  preload(): void {
    this.createLoadingUI();

    this.load.on('progress', (value: number) => {
      this.progressBar.setDisplaySize(
        Math.max(4, (GAME_WIDTH - 80) * value),
        24,
      );
    });

    // ── Asset loading goes here ─────────────────────────────────────────
    // this.load.image('bunny', 'assets/images/bunny.png');
    // this.load.audio('pop',   'assets/audio/pop.mp3');
  }

  create(): void {
    this.scene.start(SCENES.INTRO);
  }

  // ──────────────────────────────────────────────────────────────────────
  private createLoadingUI(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const barW = GAME_WIDTH - 80;

    this.add
      .text(cx, cy - 80, 'Leocraft', {
        fontSize: '56px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    this.add
      .text(cx, cy - 10, 'Načítám…', {
        fontSize: '28px',
        color: COLORS.TEXT_DIM,
      })
      .setOrigin(0.5);

    // Background track
    this.add.rectangle(cx, cy + 60, barW, 24, 0x2c3e50);

    // Animated fill – starts empty, grows in preload progress handler
    this.progressBar = this.add
      .rectangle(cx - barW / 2, cy + 60, 0, 24, COLORS.PRIMARY)
      .setOrigin(0, 0.5);
  }
}
