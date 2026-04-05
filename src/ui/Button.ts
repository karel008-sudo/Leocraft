import Phaser from 'phaser';
import { MIN_TOUCH_TARGET, COLORS } from '../config/constants';

export interface ButtonConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  label: string;
  width?: number;
  height?: number;
  color?: number;
  fontSize?: string;
  onClick: () => void;
}

/**
 * Button – reusable, touch-friendly button for children aged 3+.
 *
 * Default size is well above the 88 px minimum touch target.
 * Provides press-scale feedback so children feel the tap registered.
 */
export class Button extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;

  constructor(config: ButtonConfig) {
    super(config.scene, config.x, config.y);

    const w = config.width ?? 240;
    const h = Math.max(config.height ?? MIN_TOUCH_TARGET * 1.2, MIN_TOUCH_TARGET);
    const color = config.color ?? COLORS.PRIMARY;

    this.bg = new Phaser.GameObjects.Rectangle(config.scene, 0, 0, w, h, color);
    this.bg.setInteractive({ useHandCursor: true });

    this.label = new Phaser.GameObjects.Text(config.scene, 0, 0, config.label, {
      fontSize: config.fontSize ?? '32px',
      color: COLORS.TEXT_LIGHT,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add([this.bg, this.label]);
    config.scene.add.existing(this);

    // ── Touch feedback ────────────────────────────────────────────────
    this.bg.on('pointerdown', () => this.setScale(0.93));
    this.bg.on('pointerout', () => this.setScale(1));
    this.bg.on('pointerup', () => {
      this.setScale(1);
      config.onClick();
    });
  }

  /** Change the button label at runtime. */
  setText(text: string): this {
    this.label.setText(text);
    return this;
  }

  /** Enable / disable the button without hiding it. */
  setEnabled(enabled: boolean): this {
    if (enabled) {
      this.bg.setInteractive({ useHandCursor: true });
      this.setAlpha(1);
    } else {
      this.bg.removeInteractive();
      this.setAlpha(0.4);
    }
    return this;
  }
}
