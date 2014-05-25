var game = angular.module('game', []);

function extend(Child, Parent) {
    var F = function() { };
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
}

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
}

function getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var DAMAGE_TYPE_FIRE = 0,
    DAMAGE_TYPE_HOLE = 1;

function Damage (dtype) {
    this.type = dtype;
    this.reparePersent = 100;
    this.time = Date.now();
}

function Block () {
    this.energy = 0;
    this.people = 0;
    this.repareTime = 10000;
    this._lastUpdateTime = Date.now();
    this._maxEnergy = 10;

    this.damages = [];

    this.changeEnergy = function () {
        if (this.energy >= this._maxEnergy) {
            this.energy = 0;
        } else {
            this.energy += 1;
        }
    };

    this.addDamage = function (damage) {
        this.damages.push(damage);
    };

    this.getDamageByType = function (dtype) {
        for (var i = 0; i < this.damages.length; i++) {
            if (this.damages[i].type === dtype) {
                return this.damages[i];
            }
        }
        return undefined;
    };

    this.calculate = function () {
        var d = Date.now() - this._lastUpdateTime;
        if (this.people && this.damages.length) {
            this.damages[0].reparePersent -= d*100/this.repareTime;
            if (this.damages[0].reparePersent <= 0) {
                this.damages.shift();
            }
        }
    };
}

function Armament () {
    this._maxEnergy = 3;

    this.reloadPersent = 0;
    this._reloadTime = 5000;

    this.changeEnergy = function () {
        Armament.prototype.changeEnergy.call(this);
        this.reloadPersent = 0;
    };

    this.calculate = function () {
        Armament.prototype.calculate.call(this);

        if (this.reloadPersent < 100) {
            this.reloadPersent += (Date.now() - this._lastUpdateTime)*100/this._reloadTime;
            if (this.reloadPersent > 100) {
                this.reloadPersent = 100;
            }
        }

        this._lastUpdateTime = Date.now();
    };

    this.fire = function () {
        this.reloadPersent = 0;
    }
}
Armament.prototype = new Block();
//extend(Armament, Block);

function Shield () {
    this._maxEnergy = 2;
}
Shield.prototype = new Block();

function Oxygen () {
    this._maxEnergy = 1;
    this.oxygen = 100;
    this.lossPerSecond = 0.5;
    this.damagedBlocks = 0;
    this.damagedBlocksLossPerSecond = 0.5;

    this.calculate = function () {
        Oxygen.prototype.calculate.call(this);

        var d = Date.now() - this._lastUpdateTime;

        this.oxygen -= d*this.lossPerSecond/1000;
        this.oxygen -= d*this.damagedBlocksLossPerSecond*this.damagedBlocks/1000;

        this.oxygen += d*this.energy*this.lossPerSecond*1.5/1000;

        if (this.oxygen > 100) {
            this.oxygen = 100;
        }
        if (this.oxygen < 0) {
            this.oxygen = 0;
        }

        this._lastUpdateTime = Date.now();
    }
}
Oxygen.prototype = new Block();


game.controller('GameCtrl', function ($scope) {

    $scope.BLOCK_ARMAMENT = 0;
    $scope.BLOCK_SHIELD = 1;
    $scope.BLOCK_ENGINE = 2;
    $scope.BLOCK_OXYGEN = 3;

    $scope.player = {
        live: 100,
        oxygen: 100,
        maxEnergy: 5,
        lastEnergy: 5,
        blocks: [new Armament(), new Shield(), new Block(), new Oxygen()]
    };

    $scope.enemy = {
        live: 100,
        oxygen: 100,
        maxEnergy: 5,
        lastEnergy: 5,
        blocks: [new Armament(), new Block(), new Block(), new Oxygen()]
    };


    $scope.init = function () {
        $scope.createEnemy();
    };

    $scope.createEnemy = function () {
        for (var i = 0; i < $scope.enemy.blocks.length; i++) {
            $scope.enemy.blocks[i].energy = 1;
        }
    };

    $scope.changeEnergy = function (block, value) {
        $scope.player.blocks[block].energy += value;
        $scope.player.lastEnergy -= value;
    };

    $scope.changeEnergy2 = function (block) {
        $scope.player.blocks[block].changeEnergy();
    };


    $scope.fire = function () {
        //$scope.player.live -= 1;
        $scope._fire($scope.player, $scope.enemy, getRandomInt(0, 3));

    };

    $scope._fire = function (attacker, victim, block_id) {
        var damage = attacker.blocks[$scope.BLOCK_ARMAMENT].energy - victim.blocks[$scope.BLOCK_SHIELD].energy;
        if (damage < 0 ) {
            damage = 0;
        }
        attacker.blocks[$scope.BLOCK_ARMAMENT].fire();
        victim.live -= damage;

        if (Math.random() < 0.2) {
            attacker.blocks[block_id].addDamage(new Damage(getRandomInt(0, 1)));
        }
    };

    $scope.update = function () {
        var i, block;
        for (i = 0; i < $scope.player.blocks.length; i++) {
            block = $scope.player.blocks[i];
            block.calculate();
        }

        for (i = 0; i < $scope.enemy.blocks.length; i++) {
            block = $scope.enemy.blocks[i];
            block.calculate();
        }

        $scope.enemyAttack();
    };

    $scope.enemyAttack = function () {
        if ($scope.enemy.blocks[$scope.BLOCK_ARMAMENT].reloadPersent >= 100) {
            $scope._fire($scope.enemy, $scope.player, getRandomInt(0, 3));
        }
    };

    $scope.init();

    $scope.timerId = setInterval(function () {
        $scope.update();
        $scope.$apply();
    }, 1000);
});