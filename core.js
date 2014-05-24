var game = angular.module('game', []);

function extend(Child, Parent) {
    var F = function() { }
    F.prototype = Parent.prototype
    Child.prototype = new F()
    Child.prototype.constructor = Child
    Child.superclass = Parent.prototype
}

if (!Date.now) {
    Date.now = function() { return new Date().getTime(); };
}

function Block () {
    this.energy = 0;
    this.people = 0;
    this._lastUpdateTime = Date.now();

    this.calculate = function () {};
}

function Armament () {
    this.reloadPersent = 100;
    this._reloadTime = 5000;

    this.calculate = function () {
        this.reloadPersent += (Date.now() - this._lastUpdateTime)*100/this._reloadTime;
        this._lastUpdateTime = Date.now();
    };

    this.fire = function () {
        this.reloadPersent = 0;
    }
}
Armament.prototype = new Block()
extend(Armament, Block);

game.controller('GameCtrl', function ($scope) {

    $scope.BLOCK_ARMAMENT = 0;
    $scope.BLOCK_SHIELD = 1;
    $scope.BLOCK_ENGINE = 2;

    $scope.maxEnergy = 5;
    $scope.lastEnergy = 5;
    $scope.blocks = [new Armament(), new Block(), new Block(), new Block()];

    $scope.init = function () {

    }

    $scope.changeEnergy = function (block, value) {
        $scope.blocks[block].energy += value;
        $scope.lastEnergy -= value;
    };


    $scope.fire = function () {
        $scope.blocks[$scope.BLOCK_ARMAMENT].fire();
    }


    $scope.timerId = setInterval(function () {
        for (var i = 0; i < $scope.blocks.length; i++) {
            var block = $scope.blocks[i];
            block.calculate();
        }
    }, 1000);
});