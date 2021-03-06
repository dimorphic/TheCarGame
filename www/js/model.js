var createModel;
createModel = function () {
    'use strict';

    var model = {};

    model.SYNC_RATE = 4000;
    model.MAX_GEARS = 6;
    model.STEERING_SAMPLING_RATE = 15;
    model.MOVING_RATE = 15;
    model.UNIT_OF_MOVEMENT = 3; //pixels per 15ms
    model.GAS_PEDAL_SAMPLING_RATE = 15;
    model.CHECKPOINT_CHECK_RATE = 100;

    function Car(name, keys, engine, maxspeed, carNumber) {
        this.name = name;
        this.carNumber = carNumber;
        this.keys = keys;
        this.speed = 0;
        this.fuelTank = new FuelTank(100);
        this.engine = engine;
        this.steering = new Steering(0.1);
        this.maxspeed = maxspeed;
        this.currentPresumedSpeed = 0;
        this.gearbox = new Gearbox(model.MAX_GEARS);
        this.isRemote = false;
    }

    Car.prototype.accelerate = function () {
        if (this.engine.revs < this.engine.maxRevs) {
            this.engine.giveRevs(this.gearbox);
        } else if (this.gearbox.currentGear > 0 && this.gearbox.currentGear < this.gearbox.maxGears) {
            this.gearbox.currentGear = this.gearbox.currentGear + 1;
            this.engine.revs = this.engine.revs - (this.engine.maxRevs * 0.5);
        }
    };

    Car.prototype.break = function () {
        this.engine.revsDown();
        if (this.gearbox.currentGear > 0) {
            this.gearbox.currentGear = 1;
        }
        this.currentPresumedSpeed = 0;
    };

    Car.prototype.setCurrentSpeed = function () {
        this.currentPresumedSpeed = Math.round((this.maxspeed / this.gearbox.maxGears) * this.gearbox.currentGear * (this.engine.revs / this.engine.maxRevs));
    };

    Car.prototype.changeUp = function () {
        this.engine.revs = this.engine.revs - (this.engine.maxRevs * 0.5);
        this.gearbox.currentGear = this.gearbox.currentGear + 1;
    };

    function FuelTank(tankSize, isFuelConsumed) {
        this.fuelLeft = tankSize;
        this.tankSize = tankSize;
        this.isFuelConsumed = isFuelConsumed || true;
    }

    FuelTank.prototype.consumeFuel = function (consumedAmount) {
        if (this.isFuelConsumed) {
            if (this.fuelLeft > 0) {
                this.fuelLeft = this.fuelLeft - consumedAmount;
            }
        }
    };

    FuelTank.prototype.refuel = function (amountToPutIn) {
        if (this.fuelLeft < this.tankSize) {
            this.fuelLeft = this.fuelLeft + amountToPutIn;
        }

        if (this.fuelLeft > this.tankSize) {
            this.fuelLeft = this.tankSize;
        }
    };

    function Gearbox(maxGears) {
        this.maxGears = maxGears;
        this.currentGear = 0; //= neutral.
    }

    function Engine(enginetype, maxRevs, revMap) {
        this.engineType = enginetype;
        this.maxRevs = maxRevs;
        this.revMap = revMap;
        this.revs = 0;
    }

    Engine.prototype.giveRevs = function (gearbox) {
        this.revs = this.revs + (((this.revMap - (this.revMap * ((gearbox.currentGear - 1) / gearbox.maxGears))) / 100) * this.maxRevs);
    };

    Engine.prototype.revsDown = function () {
        this.revs = 0;
    };

    function Steering(turn) {
        this.maxAngle = 5;
        this.turn = turn;
        this.angle = 0; //+ or - maxAngle, 0 is straight.
    }

    Steering.prototype.turnLeft = function () {
        if (this.angle > -(this.maxAngle) &&
                this.angle <= this.maxAngle) {
            this.angle -= this.turn;
        }
    };

    Steering.prototype.turnRight = function () {
        if (this.angle < this.maxAngle &&
                this.angle >= -(this.maxAngle)) {
            this.angle += this.turn;
        }
    };

    Steering.prototype.center = function () {
        this.angle = 0;
    };

    model.Steering = Steering;
    model.Car = Car;
    model.Engine = Engine;

    return model;
};

var model = createModel();