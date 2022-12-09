import Phaser from "../lib/phaser.js";

export default class Bird extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.setScale(0.5);
  }

  // preload() {
  //   this.load.spritesheet("birds", "assets/flyingbird.png", {
  //     frameWidth: 32,
  //     frameHeight: 38,
  //   });
  // }
}
