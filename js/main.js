"use strict"

window.onload = function() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update, render: render });

  function preload() {

    game.load.tilemap('level', 'assets/testLevel.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tiles.png');
    game.load.spritesheet('dog', 'assets/dogsheet.png', 128, 96);
    game.load.spritesheet('fireball', 'assets/fireball.png', 64, 48);
    game.load.image('robot', 'assets/robot.png');
    game.load.image('background', 'assets/background.png');

  }

  var map;
  var tileset;
  var healthText, upText, sideText, downText, spaceText;
  var layer;
  var player;
  var playerData = {};
  var actionSet = 0;
  var enemies;
  var fireballs;
  var cursors;
  var spaceBar;
  var bg;

  var actionIndexes = {up: 0, side: 0, down: 0, space: 0};
  var actionTiming = [[3000, 5000], [2000, 10000]];
  var enemyLocations = [[15,90], [30, 90], [35, 90]];
  var actionShuffle = ['up', 'side', 'down', 'space'];

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

    // Player
    playerData.facing = 'right';
    playerData.moving = false;
    playerData.health = 100;
    playerData.jumpTimer = 0;
    playerData.healthTimer = 0;
    playerData.fireTimer = 0;
    playerData.memoryTimer = game.time.now + randInt(3000, 5000);
    playerData.sideAction = actions.side[0];
    playerData.upAction = none;
    playerData.downAction = actions.down[0];
    playerData.spaceAction = actions.space[0];
    player = game.add.sprite(20, 3000, 'dog');
    game.physics.enable(player, Phaser.Physics.ARCADE);

    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(80, 64, 25, 32);

    player.animations.add('right', [0, 1, 2, 3], 10, true);
    player.animations.add('left', [6, 7, 8, 9], 10, true);
    player.animations.add('rightRun', [20, 21, 22, 23, 24], 10, true);
    player.animations.add('leftRun', [25, 26, 27, 28, 29], 10, true);

    game.camera.follow(player);

    // Enemies
    enemies = game.add.group();

    var tileXY;
    var tile;
    var enemy;
    for (var i=0; i<enemyLocations.length; i++) {
      tileXY = enemyLocations[i];
      tile = map.getTile(tileXY[0], tileXY[1], 'Level', true)
      enemy = enemies.create(tile.worldX, tile.worldY, 'robot');
      game.physics.enable(enemy, Phaser.Physics.ARCADE);
      enemy.body.bounce.y = 0.2;
      enemy.body.collideWorldBounds = true
      enemy.body.setSize(52, 58, 7, 10);
      // Random movement pattern for each enemy
      var enemyVelocity = randInt(40, 60);
      var enemyDelay = randInt(0, 800)
      var enemyDuration = randInt(4000, 5000)
      enemy.body.velocity.x = -enemyVelocity;
      game.add.tween(enemy.body.velocity).to( {x: enemyVelocity}, enemyDuration, Phaser.Easing.Back.InOut, true, enemyDelay, false)
    }

    // Projectiles
    fireballs = game.add.group();
    fireballs.enableBody = true;
    fireballs.physicsBodyType = Phaser.Physics.ARCADE;
    fireballs.createMultiple(25, 'fireball');
    fireballs.setAll('checkWorldBounds', true);
    fireballs.setAll('outOfBoundsKill', true);

    healthText = game.add.text(720, 570, 'Health: ' + parseInt(playerData.health), { fontSize: '34px', fill: '#fff'});
    upText = game.add.text(10, 10, '↑: ' + playerData.upAction.name, { fontSize: '34px', fill: '#FFF'});
    sideText = game.add.text(184, 10, '⇄: ' + playerData.sideAction.name, { fontSize: '34px', fill: '#FFF'});
    downText = game.add.text(358, 10, '↓: ' + playerData.downAction.name, { fontSize: '34px', fill: '#FFF'});
    spaceText = game.add.text(532, 10, '[space]: ' + playerData.spaceAction.name, { fontSize: '34px', fill: '#FFF'});

    [healthText, upText, sideText, downText, spaceText].forEach(function(text, idx) {
      text.anchor.set(0)
      text.fixedToCamera = true;
      text.stroke = '#141414';
      text.strokeThickness = 4;
    });

    healthText.anchor.set(0.5)
    cursors = game.input.keyboard.createCursorKeys();
    spaceBar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

  }

  function update() {

    var side = playerData.sideAction;
    var up = playerData.upAction;
    var space = playerData.spaceAction;
    var actionsRemaining;

    game.physics.arcade.collide(player, layer);
    game.physics.arcade.collide(enemies, layer);
    game.physics.arcade.collide(enemies, enemies);
    game.physics.arcade.overlap(player, enemies, enemyContact, null, this);
    game.physics.arcade.overlap(fireballs, enemies, enemyHit, null, this);


    // Side action
    side.action.apply(side, side.args);

    // Up action
    up.action.apply(up, up.args);

    // Space action
    space.action.apply(space, space.args);

    if (game.time.now > playerData.memoryTimer) {
      var randIdx = randInt(0, actionShuffle.length-1);
      var changing = playerData.upAction === none ? 'up' : actionShuffle[randIdx];
      console.log(changing);
      actionShuffle.splice(randIdx, 1);
      if (actionShuffle.length === 0) {
        actionShuffle = ['up', 'side', 'down', 'space'];
      }
      var updateActionFunc = {
        up: updateUpAction,
        side: updateSideAction,
        down: updateDownAction,
        space: updateSpaceAction
      }[changing];
      updateActionFunc();
      playerData.memoryTimer = game.time.now + randInt (2000, 4000);
    }
  }

  var updateUpAction = function() {
    playerData.upAction = actions.up[randInt(0, actions.up.length-1)];
    upText.text = '↑: ' + playerData.upAction.name;
  }

  var updateSideAction = function() {
    playerData.sideAction = actions.side[randInt(0, actions.side.length-1)];
    sideText.text =  '⇄: ' + playerData.sideAction.name;
  }

  var updateDownAction = function() {
    playerData.downAction = actions.down[randInt(0, actions.down.length-1)];
    '↓: ' + playerData.downAction.name;
  }

  var updateSpaceAction = function() {
    playerData.spaceAction = actions.space[randInt(0, actions.space.length-1)];
    '[space]: ' + playerData.spaceAction.name;
  }

  function render () {
    //game.debug.text(game.time.physicsElapsed, 32, 32);
    //game.debug.body(player);
    //game.debug.bodyInfo(player, 16, 24);
    //enemies.forEach(function(enemy) { game.debug.body(enemy); });

  }

  function restart () {
    player.reset(20, 3000);
    updateHealth(100);
  }

  function standStill(player) {
    if (playerData.facing == 'left') {
      player.frame = 5;
    }
    else {
      player.frame = 0;
    }
  }

  function updateHealth(newHealth) {
      playerData.health = newHealth;
      healthText.text = 'Health: ' + playerData.health;
  }

  function enemyContact(player, enemy) {
    if (game.time.now > playerData.healthTimer) {
      player.body.velocity.y = -200;
      updateHealth(playerData.health - 10);
      if (playerData.health <= 0) {
        restart();
      }
      playerData.healthTimer = game.time.now + 1200;
    }
  }

  function enemyHit(fireball, enemy) {
    fireball.kill();
    enemy.kill();
  }

  function randInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  var PlayerAction = function(name, action) {
    this.name = name;
    this.action = action;
    this.args = [];
  }

  var none = new PlayerAction('None', function() {}, []);

  var jump = new PlayerAction('Jump', function(velocity) {
    if (cursors.up.isDown && player.body.onFloor() && game.time.now > playerData.jumpTimer) {
      player.body.velocity.y = -420;
      playerData.jumpTimer = game.time.now + 750;
    }
    if (!player.body.onFloor()) {
      if (player.body.velocity.y < -200) {
        player.frame = {
          right: 10,
          left: 13
        }[playerData.facing]
      } else if (player.body.velocity.y >= -200 && player.body.velocity.y < 25) {
        player.frame = {
          right: 12,
          left: 15
        }[playerData.facing]
      } else {
        player.frame = {
          right: 11,
          left: 14
        }[playerData.facing]
      }
    } else if (!playerData.moving) {
      standStill(player)
    }
  }, [420]);

  /*
   * Walk at normal speed.
   */
  var walk = new PlayerAction('Walk', function() {
    player.body.acceleration.x = 0;
    if (cursors.left.isDown) {
      if (!playerData.moving || playerData.facing === 'right') {
        player.animations.play('left');
      }
      playerData.facing = 'left';
      playerData.moving = true
      player.body.velocity.x = -150;

    } else if (cursors.right.isDown) {
      if (!playerData.moving || playerData.facing === 'left') {
        player.animations.play('right');
      }
      playerData.facing = 'right'
      playerData.moving = true
      player.body.velocity.x = 150;
    }
    else {
      if (playerData.moving) {
        player.body.velocity.x = 0;
        player.animations.stop();
        standStill(player)
        playerData.moving = false;
      }
    }
  }, [])

  var run = new PlayerAction('Run', function() {
    if (cursors.left.isDown) {
      if (!playerData.moving || playerData.facing === 'right') {
        player.animations.play('leftRun');
      }
      playerData.facing = 'left';
      playerData.moving = true
      player.body.acceleration.x = -500;
      if (player.body.velocity.x <= -400) {
        player.body.velocity.x = -500;
      }

    } else if (cursors.right.isDown) {
      if (!playerData.moving || playerData.facing === 'left') {
        player.animations.play('rightRun');
      }
      playerData.facing = 'right'
      playerData.moving = true
      player.body.acceleration.x = 500;
      if (player.body.velocity.x >= 400) {
        player.body.velocity.x = 500;
      }
    }
    else {
      if (playerData.moving) {
        player.body.velocity.x = 0;
        player.body.acceleration.x = 0;
        player.animations.stop();
        standStill(player)
        playerData.moving = false;
      }
    }
  }, [])

  var fire = new PlayerAction('Fire', function() {
    if (spaceBar.isDown && game.time.now > playerData.fireTimer) {
      var fireball = fireballs.getFirstDead();
      fireball.body.allowGravity = false;
      if (playerData.facing === 'right') {
        fireball.reset(player.body.x + 64, player.body.y - 5);
        fireball.frame = 0;
        fireball.body.velocity.x = 500;
      } else {
        fireball.reset(player.body.x - 64, player.body.y - 5);
        fireball.frame = 1;
        fireball.body.velocity.x = -500;
      }
      fireball.body.velocity.y = 30;
      playerData.fireTimer = game.time.now + 1000;
    }

  });

  var actions = {
    up: [jump],
    side: [walk,run],
    down: [none],
    space:[none,fire]
  }
}
