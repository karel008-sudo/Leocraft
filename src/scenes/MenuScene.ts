import Phaser from 'phaser';
import { SCENES, GAME_WIDTH, GAME_HEIGHT, COLORS } from '../config/constants';

/**
 * MenuScene – premium main menu after the intro.
 *
 * Visual structure (top → bottom, portrait):
 *   • Deep indigo gradient background + nebula blobs + rich starfield
 *   • "LEOCRAFT"  title   y ≈ 130  (76 px, gold, stroke)
 *   • Warm spotlight ellipse below lion
 *   • 🦁 lion               y ≈ 340  (130 px, idle bob ±12 px)
 *   • 🎮 "Nová hra" button  y ≈ 560  (320×96, green gradient, rounded)
 *   • 👋 "Ukončit"  button  y ≈ 688  (320×96, dark blue-gray)
 *   • Version tag (DEV only, bottom-left, very dim)
 *
 * Button interactivity: transparent Rectangle hit-zone on top of Graphics,
 * to avoid Phaser Graphics hit-detection quirks.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.MENU });
  }

  create(): void {
    const cx = GAME_WIDTH / 2;

    this.cameras.main.fadeIn(450);

    // ── Deep indigo gradient background ──────────────────────────────────
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

    // ── Nebula glow blobs ─────────────────────────────────────────────────
    const nebula = this.add.graphics();
    nebula.fillStyle(0x6A0DAD, 0.07).fillEllipse(cx * 0.35, GAME_HEIGHT * 0.22, 320, 250);
    nebula.fillStyle(0x0AAFA8, 0.06).fillEllipse(cx * 1.70, GAME_HEIGHT * 0.38, 260, 210);
    nebula.fillStyle(0xF39C12, 0.04).fillEllipse(cx,        GAME_HEIGHT * 0.78, 380, 190);

    // ── Rich starfield ────────────────────────────────────────────────────
    const starGfx = this.add.graphics();
    for (let i = 0; i < 65; i++) {
      const sx = Phaser.Math.Between(6, GAME_WIDTH  - 6);
      const sy = Phaser.Math.Between(6, GAME_HEIGHT - 6);
      const sr = 0.5 + Math.random() * 2.5;
      const sa = 0.12 + Math.random() * 0.58;
      starGfx.fillStyle(0xffffff, sa).fillCircle(sx, sy, sr);
    }

    // ── Title ─────────────────────────────────────────────────────────────
    this.add
      .text(cx, 130, 'LEOCRAFT', {
        fontSize:        '76px',
        color:           COLORS.TEXT_GOLD,
        fontStyle:       'bold',
        stroke:          '#9A6000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // ── Warm amber "spotlight" on floor below lion ─────────────────────────
    const spotlight = this.add.graphics();
    spotlight.fillStyle(0xF4A20A, 0.13).fillEllipse(cx, 400, 220, 70);
    spotlight.fillStyle(0xFFD700, 0.06).fillEllipse(cx, 400, 300, 90);

    // ── Lion mascot ───────────────────────────────────────────────────────
    const lionBaseY = 330;
    const lion = this.add
      .text(cx, lionBaseY, '🦁', { fontSize: '130px' })
      .setOrigin(0.5);

    // Idle bob: ±12px, period ~1.1 s, Sine
    this.tweens.add({
      targets:  lion,
      y:        lionBaseY + 12,
      duration: 1100,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });
    // Spotlight pulses in sync
    this.tweens.add({
      targets:  spotlight,
      alpha:    0.6,
      duration: 1100,
      ease:     'Sine.easeInOut',
      yoyo:     true,
      repeat:   -1,
    });

    // ── Buttons ───────────────────────────────────────────────────────────
    this.createButton(
      cx, 560,
      '🎮  Nová hra',
      0x27AE60, 0x1E8449,   // green gradient top/press
      true,
      () => {
        this.cameras.main.fadeOut(350, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
          this.scene.start(SCENES.GAME);
        });
      },
    );

    this.createButton(
      cx, 688,
      '👋  Ukončit',
      0x1A2840, 0x101E30,   // dark blue-gray
      false,
      () => this.showQuitOverlay(),
    );

    // ── Version tag (DEV only) ────────────────────────────────────────────
    if (import.meta.env.DEV) {
      this.add
        .text(8, GAME_HEIGHT - 18, 'DEV v0.2.0', {
          fontSize: '15px',
          color:    '#333355',
        })
        .setAlpha(0.5);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  /**
   * Premium button: Graphics for visuals, transparent Rectangle for hit area.
   * @param isAccent  true → add a subtle inner highlight strip at top
   */
  private createButton(
    x:          number,
    y:          number,
    label:      string,
    color:      number,
    pressColor: number,
    isAccent:   boolean,
    onTap:      () => void,
  ): void {
    const W  = 320;
    const H  = 96;
    const R  = 22;
    const bx = x - W / 2;
    const by = y - H / 2;

    // Drop shadow (dark semi-transparent rectangle offset by 4px)
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.35).fillRoundedRect(bx + 4, by + 6, W, H, R);

    // Main button body
    const btnGfx = this.add.graphics();
    const drawBtn = (col: number) => {
      btnGfx.clear();
      // Simulate gradient: top half slightly lighter, bottom darker
      const topColor   = col;
      const botColor   = pressColor;
      const halfH      = Math.ceil(H / 2);
      // Top strip
      btnGfx.fillStyle(topColor, 1).fillRoundedRect(bx, by, W, H, R);
      // Bottom gradient overlay (darkens bottom half)
      btnGfx.fillStyle(botColor, 0.45).fillRoundedRect(bx, by + halfH, W, halfH, { tl: 0, tr: 0, bl: R, br: R });
      // Inner highlight strip at top (accent buttons only)
      if (isAccent) {
        btnGfx.fillStyle(0xffffff, 0.15).fillRoundedRect(bx + 10, by + 6, W - 20, 18, 8);
      }
    };

    drawBtn(color);

    // Label text
    const txt = this.add
      .text(x, y, label, {
        fontSize:  '38px',
        color:     COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Transparent hit-zone Rectangle – setInteractive on this, NOT on Graphics
    const hitZone = this.add
      .rectangle(x, y, W, H)
      .setInteractive({ useHandCursor: true });

    hitZone.on('pointerdown', () => {
      drawBtn(pressColor);
      txt.setScale(0.94);
      shadow.setAlpha(0.5);
    });

    hitZone.on('pointerup', () => {
      drawBtn(color);
      txt.setScale(1);
      shadow.setAlpha(1);
      onTap();
    });

    hitZone.on('pointerout', () => {
      drawBtn(color);
      txt.setScale(1);
      shadow.setAlpha(1);
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  private showQuitOverlay(): void {
    const cx  = GAME_WIDTH  / 2;
    const cy  = GAME_HEIGHT / 2;
    const grp = this.add.container(0, 0);

    // Semi-transparent dim layer (blocks interaction with scene beneath)
    const dim = this.add
      .rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setInteractive();

    // Card background
    const card = this.add.graphics();
    const cW = 360, cH = 300;
    const cX = cx - cW / 2;
    const cY = cy - cH / 2;
    // Dark card body
    card.fillStyle(0x1A2840, 1).fillRoundedRect(cX, cY, cW, cH, 24);
    // Subtle border
    card.lineStyle(2, 0x2A4080, 1).strokeRoundedRect(cX, cY, cW, cH, 24);
    // Inner top highlight
    card.fillStyle(0xffffff, 0.05).fillRoundedRect(cX + 8, cY + 8, cW - 16, 24, 10);

    const wave = this.add
      .text(cx, cy - 85, '👋', { fontSize: '72px' })
      .setOrigin(0.5);

    const msg = this.add
      .text(cx, cy + 10, 'Brzy se vrátíme!', {
        fontSize: '30px',
        color:    COLORS.TEXT_CREAM,
        align:    'center',
      })
      .setOrigin(0.5);

    // "Zpět" button — Graphics + Rectangle hit zone
    const bW = 200, bH = 62;
    const bX = cx - bW / 2;
    const bY = cy + 82;
    const btnGfx = this.add.graphics();
    btnGfx
      .fillStyle(COLORS.SUCCESS_DRK, 1)
      .fillRoundedRect(bX, bY, bW, bH, 16);
    btnGfx
      .fillStyle(0xffffff, 0.12)
      .fillRoundedRect(bX + 8, bY + 6, bW - 16, 16, 7);

    const btnTxt = this.add
      .text(cx, bY + bH / 2, 'Zpět', {
        fontSize:  '32px',
        color:     COLORS.TEXT_LIGHT,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    const btnHit = this.add
      .rectangle(cx, bY + bH / 2, bW, bH)
      .setInteractive({ useHandCursor: true });

    grp.add([dim, card, wave, msg, btnGfx, btnTxt, btnHit]);
    grp.setAlpha(0);
    this.tweens.add({ targets: grp, alpha: 1, duration: 220 });

    const closeOverlay = () => {
      this.tweens.add({
        targets:    grp,
        alpha:      0,
        duration:   180,
        onComplete: () => grp.destroy(),
      });
    };

    btnHit.on('pointerup',  closeOverlay);
    btnHit.on('pointerdown', () => {
      btnGfx.clear();
      btnGfx.fillStyle(COLORS.SUCCESS_DRK, 1).fillRoundedRect(bX, bY, bW, bH, 16);
      btnTxt.setScale(0.95);
    });
    btnHit.on('pointerout', () => {
      btnGfx.clear();
      btnGfx.fillStyle(COLORS.SUCCESS_DRK, 1).fillRoundedRect(bX, bY, bW, bH, 16);
      btnGfx.fillStyle(0xffffff, 0.12).fillRoundedRect(bX + 8, bY + 6, bW - 16, 16, 7);
      btnTxt.setScale(1);
    });
  }
}
