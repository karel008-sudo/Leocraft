import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * MenuScene – main menu after the intro.
 *
 * Two large, touch-friendly buttons:
 *  • "Nová hra" → starts GameScene with a fade transition
 *  • "Ukončit"  → shows a friendly overlay (web can't truly exit)
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.fadeIn(400);

    // ── Starfield background ───────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(COLORS.BACKGROUND).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    bg.fillStyle(0x2d2d5e, 0.35).fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT / 2);

    for (let i = 0; i < 45; i++) {
      const sx = Phaser.Math.Between(10, GAME_WIDTH  - 10);
      const sy = Phaser.Math.Between(10, GAME_HEIGHT - 10);
      bg.fillStyle(0xffffff, 0.2 + Math.random() * 0.45).fillCircle(sx, sy, 1 + Math.random() * 2);
    }

    // ── Title ──────────────────────────────────────────────────────────
    this.add
      .text(cx, 155, 'LEOCRAFT', {
        fontSize: '72px',
        color: COLORS.TEXT_GOLD,
        fontStyle: 'bold',
        stroke: '#9A7000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    // ── Lion mascot with idle bob ──────────────────────────────────────
    const lion = this.add
      .text(cx, 330, '🦁', { fontSize: '120px' })
      .setOrigin(0.5);

    this.tweens.add({
      targets: lion,
      y: 318,
      duration: 1100,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // ── Buttons ───────────────────────────────────────────────────────
    this.createButton(cx, 545, '🎮  Nová hra', COLORS.SUCCESS, 0x1e8449, () => {
      this.cameras.main.fadeOut(350, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start(SCENES.GAME);
      });
    });

    this.createButton(cx, 680, '👋  Ukončit', 0x2E4057, 0x1a2840, () => {
      this.showQuitOverlay();
    });

    // ── Version tag (dev only) ────────────────────────────────────────
    if (import.meta.env.DEV) {
      this.add.text(8, GAME_HEIGHT - 20, 'DEV v0.2.0', {
        fontSize: '16px',
        color: '#445566',
      });
    }
  }

  // ──────────────────────────────────────────────────────────────────────
  private createButton(
    x: number,
    y: number,
    label: string,
    color: number,
    pressColor: number,
    onTap: () => void,
  ): void {
    const W = 310;
    const H = 100;

    const bg = this.add
      .graphics()
      .fillStyle(color)
      .fillRoundedRect(x - W / 2, y - H / 2, W, H, 18)
      .setInteractive(
        new Phaser.Geom.Rectangle(x - W / 2, y - H / 2, W, H),
        Phaser.Geom.Rectangle.Contains,
      );

    const txt = this.add
      .text(x, y, label, {
        fontSize: '38px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerdown', () => {
      bg.clear().fillStyle(pressColor).fillRoundedRect(x - W / 2, y - H / 2, W, H, 18);
      txt.setScale(0.94);
    });

    bg.on('pointerup', () => {
      bg.clear().fillStyle(color).fillRoundedRect(x - W / 2, y - H / 2, W, H, 18);
      txt.setScale(1);
      onTap();
    });

    bg.on('pointerout', () => {
      bg.clear().fillStyle(color).fillRoundedRect(x - W / 2, y - H / 2, W, H, 18);
      txt.setScale(1);
    });
  }

  // ──────────────────────────────────────────────────────────────────────
  private showQuitOverlay(): void {
    const cx   = GAME_WIDTH  / 2;
    const cy   = GAME_HEIGHT / 2;
    const grp  = this.add.container(0, 0);

    // Dim overlay (blocks clicks on scene beneath)
    const dim = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72)
      .setInteractive();

    // Card
    const card = this.add.graphics();
    const cW = 340, cH = 280;
    card.fillStyle(0x2E4057).fillRoundedRect(cx - cW / 2, cy - cH / 2, cW, cH, 22);
    card.lineStyle(3, 0x4A6FA5).strokeRoundedRect(cx - cW / 2, cy - cH / 2, cW, cH, 22);

    const wave = this.add.text(cx, cy - 75, '👋', { fontSize: '70px' }).setOrigin(0.5);
    const msg  = this.add
      .text(cx, cy + 15, 'Brzy se vrátíme!', {
        fontSize: '28px',
        color: COLORS.TEXT_LIGHT,
        align: 'center',
      })
      .setOrigin(0.5);

    // Back button
    const btnBg = this.add.graphics();
    const bW = 190, bH = 58;
    btnBg
      .fillStyle(COLORS.SUCCESS)
      .fillRoundedRect(cx - bW / 2, cy + 82, bW, bH, 14)
      .setInteractive(
        new Phaser.Geom.Rectangle(cx - bW / 2, cy + 82, bW, bH),
        Phaser.Geom.Rectangle.Contains,
      );

    const btnTxt = this.add
      .text(cx, cy + 82 + bH / 2, 'Zpět', {
        fontSize: '30px',
        color: COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    grp.add([dim, card, wave, msg, btnBg, btnTxt]);
    grp.setAlpha(0);
    this.tweens.add({ targets: grp, alpha: 1, duration: 220 });

    btnBg.on('pointerup', () => {
      this.tweens.add({
        targets: grp,
        alpha: 0,
        duration: 180,
        onComplete: () => grp.destroy(),
      });
    });
  }
}
