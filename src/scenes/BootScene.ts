import Phaser from 'phaser';
import { SCENES } from '../config/constants';

/**
 * BootScene – first scene that runs.
 * Loads only the minimal assets required for the loading screen,
 * then immediately transitions to LoadScene.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: SCENES.BOOT });
  }

  preload(): void {
    // TODO: load a tiny splash/logo image here once assets are available
    // this.load.image('logo', 'assets/images/logo.png');
  }

  create(): void {
    this.scene.start(SCENES.LOAD);
  }
}
