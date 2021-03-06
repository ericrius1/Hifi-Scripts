//  handControllerGrab.js
//  examples
//
//  Created by Eric Levin on  9/2/15
//  Copyright 2015 High Fidelity, Inc.
//
//  Grab's physically moveable entities with the hydra- works for either near or far objects. User can also grab a far away object and drag it towards them by pressing the "4" button on either the left or ride controller.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


Script.include("https://hifi-public.s3.amazonaws.com/scripts/libraries/utils.js");

var RIGHT_HAND_CLICK = Controller.findAction("RIGHT_HAND_CLICK");
var rightTriggerAction = RIGHT_HAND_CLICK;

var GRAB_USER_DATA_KEY = "grabKey";

var LEFT_HAND_CLICK = Controller.findAction("LEFT_HAND_CLICK");
var leftTriggerAction = LEFT_HAND_CLICK;

var LIFETIME = 10;
var POINTER_CHECK_TIME = 5000;
var EXTRA_TIME = 5;

var DISTANCE_SCALE_FACTOR = 5;

var ZERO_VEC = {
    x: 0,
    y: 0,
    z: 0
}

var SPRING_TIMESCALE = 0.1;

var LINE_LENGTH = 500;
var THICK_LINE_WIDTH = 7;
var THIN_LINE_WIDTH = 2;

var NO_INTERSECT_COLOR = {
    red: 10,
    green: 10,
    blue: 255
};
var INTERSECT_COLOR = {
    red: 250,
    green: 10,
    blue: 10
};

var GRAB_RADIUS = 1.5;

var SHOW_LINE_THRESHOLD = 0.2;
var DISTANCE_HOLD_THRESHOLD = 0.8;

var right4Action = 18;
var left4Action = 17;

var MAX_ANGULAR_VELOCITY = 50;

var RIGHT = 1;
var LEFT = 0;
var rightController = new controller(RIGHT, rightTriggerAction, right4Action, "right");
var leftController = new controller(LEFT, leftTriggerAction, left4Action, "left");


//Need to wait before calling these methods for some reason...
Script.setTimeout(function() {
    rightController.checkPointer();
    leftController.checkPointer();
}, 100)

function controller(side, triggerAction, pullAction, hand) {
    this.hand = hand;
    if (hand === "right") {
        this.getHandPosition = MyAvatar.getRightPalmPosition;
        this.getHandRotation = MyAvatar.getRightPalmRotation;
    } else {
        this.getHandPosition = MyAvatar.getLeftPalmPosition;
        this.getHandRotation = MyAvatar.getLeftPalmRotation;
    }
    this.triggerAction = triggerAction;
    this.pullAction = pullAction;
    this.actionID = null;
    this.triggerValue = 0;
    this.prevTriggerValue = 0;
    this.palm = 2 * side;
    this.tip = 2 * side + 1;
    this.pointer = Entities.addEntity({
        type: "Line",
        name: "pointer",
        color: NO_INTERSECT_COLOR,
        dimensions: {
            x: 1000,
            y: 1000,
            z: 1000
        },
        visible: false,
        lifetime: LIFETIME
    });

}


controller.prototype.updateLine = function() {
    var handPosition = Controller.getSpatialControlPosition(this.palm);
    var direction = Controller.getSpatialControlNormal(this.tip);


    //move origin a bit away from hand so nothing gets in way
    var origin = Vec3.sum(handPosition, direction);
    var color;
    if (this.checkForIntersections(origin, direction)) {
        color = INTERSECT_COLOR;
    } else if(!this.grabbedEntity) {
        color = NO_INTERSECT_COLOR
    
    }
    Entities.editEntity(this.pointer, {
        position: handPosition,
        linePoints: [
            ZERO_VEC,
            Vec3.multiply(direction, LINE_LENGTH)
        ],
        color: color
    });
}


controller.prototype.checkPointer = function() {
    var self = this;
    Script.setTimeout(function() {
        var props = Entities.getEntityProperties(self.pointer);
        var currentLife = LIFETIME + EXTRA_TIME + props.age;
        //dimensions are set to .1, .1, .1 when lifetime expires
        Entities.editEntity(self.pointer, {
            lifetime: currentLife
        });
        self.checkPointer();
    }, POINTER_CHECK_TIME);
}

controller.prototype.checkForIntersections = function(origin, direction) {
    var pickRay = {
        origin: origin,
        direction: direction
    };

    var intersection = Entities.findRayIntersection(pickRay, true);
    if (intersection.intersects && intersection.properties.collisionsWillMove === 1) {
        if (!this.grabbedEntity) {
            this.grab(intersection.entityID);
        }
        return true;
    }
    return false;
}

controller.prototype.grab = function(entityID) {
    print("GRAB")
    this.grabbedEntity = entityID;
    var props = Entities.getEntityProperties(this.grabbedEntity);
    this.initialPosition = props.position;
    this.initialRotation = props.rotation;
    this.previousHandPosition = this.getHandPosition();
    this.previousHandRotation = this.getHandRotation();


    this.actionID = Entities.addAction("spring", this.grabbedEntity, {
        targetPosition: this.initialPosition,
        linearTimeScale: SPRING_TIMESCALE,
    });

}

controller.prototype.move = function() {
    var entityProps = Entities.getEntityProperties(this.grabbedEntity);

    // var handRotation = this.getHandRotation();
    var handRotation = Controller.getSpatialControlRawRotation(this.tip);
    // var handPosition = this.getHandPosition();
    var handPosition = Controller.getSpatialControlPosition(this.palm);
    var dHandPosition = Vec3.subtract(handPosition, this.previousHandPosition);
    var entityPosition = entityProps.position;
    var avatarToEntityDistance = Vec3.distance(MyAvatar.position, entityPosition);
    var scaledDistance = Math.pow(avatarToEntityDistance, 1);
    var scaleFactor = scaledDistance * DISTANCE_SCALE_FACTOR; // scaleFactor = Math.pow(scaleFactor, 1.5);
    var dHandPosition =  Vec3.multiply(dHandPosition, scaleFactor);
    var newEntityPosition = Vec3.sum(entityPosition, dHandPosition);

    
    var transformedAngularVelocity = Controller.getSpatialControlRawAngularVelocity(this.tip);
    transformedAngularVelocity = Vec3.multiplyQbyV(MyAvatar.orientation, transformedAngularVelocity);
    var angularVelocityLength = Vec3.length(transformedAngularVelocity);
    if(angularVelocityLength > MAX_ANGULAR_VELOCITY ){
      print('TRANSFORMED ANGULAR VELOCITY ' + angularVelocityLength); 
    } else {
        Entities.editEntity(this.grabbedEntity, {
            angularVelocity: transformedAngularVelocity,
        }); 
    }


    // Entities.updateAction(this.grabbedEntity, this.actionID, {
    //     targetPosition: newEntityPosition,
    // });

    this.previousHandPosition = handPosition;
    this.previousHandRotation = handRotation;
}

controller.prototype.showPointer = function() {
    Entities.editEntity(this.pointer, {
        visible: true
    });

}

controller.prototype.hidePointer = function() {
    Entities.editEntity(this.pointer, {
        visible: false
    });
}


controller.prototype.letGo = function() {
    if (this.grabbedEntity && this.actionID) {
        Entities.deleteAction(this.grabbedEntity, this.actionID);
    }
    this.grabbedEntity = null;
    this.actionID = null;
}

controller.prototype.update = function() {
    this.triggerValue = Controller.getActionValue(this.triggerAction);
    if (this.triggerValue > SHOW_LINE_THRESHOLD && this.prevTriggerValue < SHOW_LINE_THRESHOLD) {
        //First check if an object is within close range and then run the close grabbing logic

        this.showPointer();
        this.shouldDisplayLine = true;

    } else if (this.triggerValue < SHOW_LINE_THRESHOLD && this.prevTriggerValue > SHOW_LINE_THRESHOLD) {
        this.hidePointer();
        this.letGo();
        this.shouldDisplayLine = false;
    }

    if (this.shouldDisplayLine) {
        this.updateLine();
    }
    if (this.triggerValue > DISTANCE_HOLD_THRESHOLD && this.grabbedEntity) {
        this.move();
    }


    this.prevTriggerValue = this.triggerValue;
}



controller.prototype.cleanup = function() {
    Entities.deleteEntity(this.pointer);
    if (this.grabbedEntity) {
        Entities.deleteAction(this.grabbedEntity, this.actionID);
    }
}

function update() {
    rightController.update();
    leftController.update();
}


function cleanup() {
    rightController.cleanup();
    leftController.cleanup();
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update)