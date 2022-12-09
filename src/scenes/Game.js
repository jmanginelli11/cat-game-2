import Phaser from "../lib/phaser.js";

import Bird from "../game/Bird.js";

import GameOver from "./GameOver.js";

export default class Game extends Phaser.Scene {
  scoreText;

  score = 0;

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  /** @type {Phaser.Physics.Arcade.Group} */
  birds;

  cam_speed = {
    base: 1,
    current: 1,
    max: 1,
  };

  constructor() {
    super("game");
  }

  preload() {
    this.load.image("background", "assets/bg_layer1.png");
    this.load.image("platform", "assets/tile.png");
    this.load.spritesheet("bird", "assets/flyingbird.png", {
      frameWidth: 32,
      frameHeight: 38,
    });

    this.load.spritesheet("cat", "assets/cat_orange-32x48.png", {
      frameWidth: 32,
      frameHeight: 46.77,
    });

    this.cursors = this.input.keyboard.createCursorKeys();

    this.load.audio("jump", "assets/cartoon-jump-6462.mp3");
    this.load.audio(
      "ping",
      "assets/short-success-sound-glockenspiel-treasure-video-game-6346.mp3"
    );
    this.load.audio("sad", "assets/negative_beeps-6008.mp3");
  }

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    this.platforms = this.physics.add.staticGroup();

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      const body = platform.body;
      body.updateFromGameObject();
    }

    this.player = this.physics.add.sprite(100, 450, "cat").setScale(2);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("cat", {
        start: 9,
        end: 11,
      }),
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "cat", frame: 8 }],
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("cat", { start: 3, end: 5 }),
    });

    this.physics.add.collider(this.platforms, this.player);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);
    console.log(this.time);

    // const bird = new Bird(this, 240, 320, "bird").setScale(1.5);
    // this.add.existing(bird);

    this.bird = this.physics.add.group({
      classType: Bird,
    });
    this.bird.get(240, 320, "bird").setScale(1);

    this.physics.add.collider(this.platforms, this.bird);

    this.physics.add.overlap(
      this.player,
      this.bird,
      this.collectBird,
      undefined,
      this
    );

    const style = { color: "#000", fontSize: 24 };
    this.scoreText = this.add
      .text(240, 10, "Score: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);

    // this.input.keyboard.once("keydown-SPACE", () => {
    //   this.scene.start("game");
    // });
  }

  update() {
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("right", true);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
      this.player.anims.play("turn");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    const touchingDown = this.player.body.touching.down;
    if (this.cursors.up.isDown && touchingDown) {
      this.player.setVelocityY(-300);
      this.sound.play("jump");
    }

    this.platforms.children.iterate((child) => {
      const platform = child;

      const scrollY = this.cameras.main.scrollY;

      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addBirdAbove(platform).setScale(1);
      }
    });
    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.physics.pause();
      this.player.setTint(0xff0000);
      this.player.anims.play("turn");
      // this.scene.start(GameOver);
    }
    // this.horizontalWrap(this.player);
    console.log(this.player.body.position.x);
  }
  addBirdAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;
    const bird = this.bird.get(sprite.x, y, "bird");

    bird.setActive(true);
    bird.setVisible(true);

    this.add.existing(bird);

    bird.body.setSize(bird.width, bird.height);

    this.physics.world.enable(bird);

    return bird;
  }

  collectBird(player, bird) {
    this.bird.killAndHide(bird);
    this.physics.world.disableBody(bird.body);
    this.sound.play("ping");
    this.score += 10;
    const value = `Score: ${this.score}`;
    this.scoreText.setText(value);
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];
    for (let i = 1; i < platforms.length; i++) {
      const platform = platforms[i];
      if (platform.y < bottomPlatform.y) {
        continue;
      }
      bottomPlatform = platform;
    }
    return bottomPlatform;
  }

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }
}
