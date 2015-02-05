"use strict"

window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

  function preload() {

    game.load.tilemap('level', 'assets/testLevel.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.spritesheet('dog', 'assets/dogsheet.png', 128, 96);
    game.load.image('background', 'assets/background2.png');

  }

  var map;
  var tileset;
  var layer;
  var player;
  var facing = 'right';
  var moving = false
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
    player.body.setSize(80, 64, 25, 32);

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

    // Walking
    if (cursors.left.isDown) {
      if (!moving || facing === 'right') {
        player.animations.play('left');
      }
      facing = 'left';
      moving = true
      player.body.velocity.x = -150;

    } else if (cursors.right.isDown) {
      if (!moving || facing === 'left') {
        player.animations.play('right');
      }
      facing = 'right'
      moving = true
      player.body.velocity.x = 150;
    }
    else {
      if (moving) {
        player.animations.stop();
        standStill(player)
        moving = false;
      }
    }

    // Jumping
    if (jumpButton.isDown && player.body.onFloor() && game.time.now > jumpTimer) {
      player.body.velocity.y = -400;
      jumpTimer = game.time.now + 750;
    }
    if (!player.body.onFloor()) {
      if (player.body.velocity.y < -300) {
        player.frame = {
          right: 10,
          left: 13
        }[facing]
      } else if (player.body.velocity.y >= -300 && player.body.velocity.y < 25) {
        player.frame = {
          right: 12,
          left: 15
        }[facing]
      } else {
        player.frame = {
          right: 11,
          left: 14
        }[facing]
      }
    } else if (!moving) {
      standStill(player)
    }
  }

  function render () {

    //game.debug.text(game.time.physicsElapsed, 32, 32);
    //game.debug.body(player);
    game.debug.bodyInfo(player, 16, 24);

  }

  function standStill(player) {
    if (facing == 'left') {
      player.frame = 5;
    }
    else {
      player.frame = 0;
    }
  }
}
