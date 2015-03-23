//
//  lavalamp.js
//  examples
//
//  Created by Eric Levin on March 23, 2015wwwwwww
//  Copyright 2015 High Fidelity, Inc.
//
//  Creates some spheres with lights attached, that move and stretch slowly 
//  with lights attached, simulating a lava lamp
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//




var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3.0, Quat.getFront(Camera.getOrientation())));

var totalTime = 0;

var BALL_SIZE = 0.07;
var NUM_BALLS = 3; 
var properties, newPosition, newDimensions, newProperties;
var relativeBallY;
var ball, light;
balls = [];
var base, top;
var baseSize = 0.5;
var baseHeight = center.y;
var topHeight = center.y + 1;
var midHeight = (baseHeight + topHeight)/2;
var wallColor = {red:20, green: 150, blue: 50};
for (var i = 0; i < NUM_BALLS; i++) {
  ball = Entities.addEntity(
        { type: "Sphere",
          position: { x: randFloat (center.x- baseSize/2, center.x + baseSize/2), 
                y: midHeight, 
                z: randFloat(center.z - baseSize/2, center.z + baseSize/2)},  
          dimensions: { x: BALL_SIZE, y: BALL_SIZE, z: BALL_SIZE }, 
          color: { red: 120, green: 20, blue: 130},
    });
  var velocity = {x: 0, y: .01, z: 0};


  light = Entities.addEntity({
    type : "Light",
    position: Entities.getEntityProperties(ball).position,
    dimensions: {x: 2, y: 2, z: 2},
    isSpotlight: false,
    color: {red: 120, green: 20, blue: 130},
    intensity: 5,
    quadraticAttenuation: 1
  });
  ball.light = light;
  ball.originalPosition = Entities.getEntityProperties(ball).position;
  balls.push(ball);
}

//add wall
base = Entities.addEntity(
{
  type: "Box",
  position: {x: center.x, y: baseHeight, z: center.z},
  dimensions: {x: baseSize, y: .01, z: baseSize},
  color: wallColor
});

top = Entities.addEntity(
{
  type: "Box",
  position: {x : center.x, y: topHeight, z: center.z},
  dimensions: { x: baseSize, y: 0.01, z:baseSize},
  color: wallColor
})

function update(deltaTime) { 
  ball = balls[0];
  totalTime += deltaTime;
  properties = Entities.getEntityProperties(ball);
  newPosition = properties.position;
  newDimensions = properties.dimensions
  newPosition.y = ball.originalPosition.y + .01;
  relativeBallY = Math.abs(newPosition.y - midHeight);
  newDimensions.y = map(relativeBallY, 0.5, 0, BALL_SIZE, BALL_SIZE * 2);
  newProperties = {
    position: newPosition,
    dimensions: newDimensions
  }
  Entities.editEntity(ball, newProperties);
  Entities.editEntity(ball.light, {position: newPosition});
}
 

function scriptEnding() {
  Entities.deleteEntity(base);
  Entities.deleteEntity(top);
  for (var i = 0; i < NUM_BALLS; i++) {
    Entities.deleteEntity(balls[i]);
  }
}

function randFloat ( low, high ) {
    return low + Math.random() * ( high - low );
}

function map(value, min1, max1, min2, max2) {
  return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
}

Script.scriptEnding.connect(scriptEnding);
Script.update.connect(update);
  