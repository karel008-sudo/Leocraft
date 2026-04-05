import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, COLORS, MAX_POINTERS } from '../config/constants';
import { BootScene  } from '../scenes/BootScene';
import { LoadScene  } from '../scenes/LoadScene';
import { IntroScene } from '../scenes/IntroScene';
import { MenuScene  } from '../scenes/MenuScene';
import { GameScene  } from '../scenes/GameScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: COLORS.BACKGROUND,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: import.meta.env.DEV,
    },
  },

  input: {
    activePointers: MAX_POINTERS,
  },

  // Pipeline: Boot → Load → Intro → Menu → Game
  scene: [BootScene, LoadScene, IntroScene, MenuScene, GameScene],
};
