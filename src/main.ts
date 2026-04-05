import Phaser from 'phaser';
import { gameConfig } from './game/GameConfig';

// Boot the game once the page is fully loaded.
window.addEventListener('load', () => {
  new Phaser.Game(gameConfig);
});
