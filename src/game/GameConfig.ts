import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, MAX_POINTERS } from '../config/constants';
import { BootScene } from '../scenes/BootScene';
import { LoadScene } from '../scenes/LoadScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BACKGROUND,

  // ── Scaling: fit inside the viewport, centred ──────────────────────────
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  // ── Physics: lightweight arcade, no gravity needed for now ────────────
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: import.meta.env.DEV,
    },
  },

  // ── Multi-touch for kids who tap with several fingers ─────────────────
  input: {
    activePointers: MAX_POINTERS,
  },

  // ── Scene pipeline ─────────────────────────────────────────────────────
  scene: [BootScene, LoadScene, MenuScene, GameScene],
};
