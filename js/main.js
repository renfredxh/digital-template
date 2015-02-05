window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

  function preload() {

    game.load.tilemap('level', 'assets/testLevel.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.spritesheet('dog', 'assets/dogsheet.png', 128, 96);
    game.load.spritesheet('droid', 'assets/droid.png', 32, 32);
    game.load.image('starSmall', 'assets/star.png');
    game.load.image('starBig', 'assets/star2.png');
    game.load.image('background', 'assets/background2.png');

  }

  var map;
  var tileset;
  var layer;
  var player;
  var facing = 'right';
  var jumpTimer = 0;
  var cursors;
  var jumpButton;
  var bg;

  function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.stage.backgroundColor = '#000000';

    bg = game.add.tileSprite(0, 0, 800, 600, 'background');
    bg.fixedToCamera = true;

    map = game.add.tilemap('level');

    map.addTilesetImage('tiles');

    map.setCollisionByExclusion([]);

    layer = map.createLayer('Level');

    //  Un-comment this on to see the collision tiles
    // layer.debug = true;

    layer.resizeWorld();

    game.physics.arcade.gravity.y = 980;

    player = game.add.sprite(20, 3000, 'dog');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(96, 64, 25, 32);

    player.animations.add('right', [0, 1, 2, 3], 10, true);
    player.animations.add('left', [6, 7, 8, 9], 10, true);
    player.animations.add('turn', [4], 20, true);

    game.camera.follow(player);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  function update() {

    game.physics.arcade.collide(player, layer);

    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
      player.body.velocity.x = -150;

      if (facing != 'left') {
        player.animations.play('left');
        facing = 'left';
      }
    } else if (cursors.right.isDown) {
      player.body.velocity.x = 150;

      if (facing != 'right') {
        player.animations.play('right');
        facing = 'right';
      }
    }
    else {
      if (facing != 'idle') {
        player.animations.stop();

        if (facing == 'left') {
          player.frame = 5;
        }
        else {
          player.frame = 0;
        }

        facing = 'idle';
      }
    }

    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
      player.body.velocity.y = -400;
      jumpTimer = game.time.now + 750;
    }
  }

  function render () {

    //game.debug.text(game.time.physicsElapsed, 32, 32);
    //game.debug.body(player);
    //game.debug.bodyInfo(player, 16, 24);

  }
}
