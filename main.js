// main.js

// 1. Game configuration
const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 800, // Base width; Phaser will scale to fit parent
  height: 600, // Base height; Phaser will scale to fit parent
  backgroundColor: 0x87ceeb, // Light sky-blue background
  scale: {
    mode: Phaser.Scale.FIT, // Scale the game to fit the parent container
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center both horizontally & vertically
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [PreloadScene, MainScene],
};

// 2. PreloadScene: load any assets (tilesets, background, etc.)
class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Placeholder for a background image or tileset:
    // (Replace these with your actual assets later)
    this.load.image("skyline", "assets/skyline.png");
    this.load.image("tileset", "assets/tileset.png");
    this.load.spritesheet("tenant", "assets/tenant.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Show loading progress (optional)
    const progressBar = this.add.graphics();
    this.load.on("progress", (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        0,
        this.game.config.height / 2,
        this.game.config.width * value,
        50,
      );
    });
    this.load.on("complete", () => {
      progressBar.destroy();
    });
  }

  create() {
    // Once assets are loaded, start the main game
    this.scene.start("MainScene");
  }
}

// 3. MainScene: initial game setup
class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    // 3.1 Add a static background (skyline + park)
    //    (Assumes 'skyline' is a wide PNG that fits the screen)
    this.background = this.add.image(
      this.scale.width / 2,
      this.scale.height / 2,
      "skyline",
    );
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    // 3.2 Create a simple tilemap for the “ground floor”
    //    (For now, we'll just draw a grid to illustrate, without a real tileset.)
    const gridSize = 32;
    const rows = Math.ceil(this.scale.height / gridSize);
    const cols = Math.ceil(this.scale.width / gridSize);

    // Draw grid lines (for debugging / layout)
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0xcccccc, 0.5);
    for (let i = 0; i <= cols; i++) {
      graphics.moveTo(i * gridSize, 0);
      graphics.lineTo(i * gridSize, this.scale.height);
    }
    for (let j = 0; j <= rows; j++) {
      graphics.moveTo(0, j * gridSize);
      graphics.lineTo(this.scale.width, j * gridSize);
    }
    graphics.strokePath();

    // 3.3 Placeholder NPC to show that sprites can move around
    this.tenant = this.physics.add.sprite(
      gridSize * 2 + gridSize / 2,
      gridSize * 2 + gridSize / 2,
      "tenant",
      0,
    );
    this.tenant.setCollideWorldBounds(true);
    this.tenant.setScale(1.5);

    // Create a simple walking animation for the tenant
    this.anims.create({
      key: "walk",
      frames: this.anims.generateFrameNumbers("tenant", { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });
    this.tenant.play("walk");

    // 3.4 Basic camera controls (drag + zoom)
    this.cameras.main.setBounds(0, 0, this.scale.width, this.scale.height);
    this.input.on(
      "pointermove",
      function (pointer) {
        if (pointer.isDown) {
          this.cameras.main.scrollX -=
            (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
          this.cameras.main.scrollY -=
            (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
        }
      },
      this,
    );
    this.input.on(
      "wheel",
      function (pointer, gameObjects, deltaX, deltaY, deltaZ) {
        const newZoom = Phaser.Math.Clamp(
          this.cameras.main.zoom - deltaY * 0.001,
          0.5,
          2,
        );
        this.cameras.main.setZoom(newZoom);
      },
      this,
    );

    // 3.5 Example of making the grid interactive (click to “build” a placeholder tile)
    this.input.on("pointerdown", (pointer) => {
      const worldPoint = pointer.positionToCamera(this.cameras.main);
      const tileX = Math.floor(worldPoint.x / gridSize);
      const tileY = Math.floor(worldPoint.y / gridSize);

      // Draw a simple colored rectangle at that grid cell to simulate “placing” a room
      const rect = this.add.rectangle(
        tileX * gridSize + gridSize / 2,
        tileY * gridSize + gridSize / 2,
        gridSize - 2,
        gridSize - 2,
        0x555555,
      );
      rect.setStrokeStyle(1, 0x000000);
    });

    // 3.6 HUD: Simple overlay showing money, stars, etc.
    this.money = 10000;
    this.stars = 1;
    this.hudText = this.add
      .text(10, 10, `Money: $${this.money}\nStars: ${this.stars}`, {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#ffffff",
        backgroundColor: "#00000080",
        padding: { x: 8, y: 4 },
      })
      .setScrollFactor(0); // Keeps HUD fixed to the camera

    // 3.7 Example: decrement money every 5 seconds
    this.time.addEvent({
      delay: 5000,
      callback: () => {
        this.money -= 100;
        this.hudText.setText(`Money: $${this.money}\nStars: ${this.stars}`);
      },
      loop: true,
    });
  }

  update(time, delta) {
    // 4. Game loop logic goes here (NPC pathfinding, elevator updates, etc.)

    // For demo, move tenant in a simple pattern
    if (!this.tenant.moveDirection) {
      this.tenant.moveDirection = "right";
    }
    if (this.tenant.moveDirection === "right") {
      this.tenant.x += 50 * (delta / 1000);
      if (this.tenant.x > this.scale.width - 32) {
        this.tenant.moveDirection = "down";
      }
    } else if (this.tenant.moveDirection === "down") {
      this.tenant.y += 50 * (delta / 1000);
      if (this.tenant.y > this.scale.height - 32) {
        this.tenant.moveDirection = "left";
      }
    } else if (this.tenant.moveDirection === "left") {
      this.tenant.x -= 50 * (delta / 1000);
      if (this.tenant.x < 32) {
        this.tenant.moveDirection = "up";
      }
    } else if (this.tenant.moveDirection === "up") {
      this.tenant.y -= 50 * (delta / 1000);
      if (this.tenant.y < 32) {
        this.tenant.moveDirection = "right";
      }
    }
  }
}

// 5. Launch the game
window.addEventListener("load", () => {
  new Phaser.Game(config);
});
