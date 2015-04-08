var controllerID, controllerActive;
var originalTargetPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(1.2, Quat.getFront(Camera.getOrientation())));
originalTargetPosition.y = MyAvatar.position.y;
var dPosition;
var stickProperties, spring, springLength, targetVelocity;
var HOLD_POSITION_OFFSET = {x: 0, y: 0, z: -0.5};
var originalSwordPosition = {x: originalTargetPosition.x + 0.5, y: originalTargetPosition.y, z: originalTargetPosition.z};
var SWORD_ORIENTATION = Quat.fromPitchYawRollDegrees(0, 0, 0);
var SPRING_FORCE = 15.0;
var SWORD_DIMENSIONS = {x: .1, y: .04, z: .53};
var MIN_MSEC_BETWEEN_SWORD_SOUNDS = 500;
var MIN_VELOCITY_FOR_SOUND_IMPACT = 0.25
var hitSound = SoundCache.getSound("https://hifi-public.s3.amazonaws.com/eric/sounds/sword.wav");
var targetProperties, swordProperties, dVelocity;

var lastSoundTime = 0;
var currentTime;

var target = Entities.addEntity({
  type: "Box",
  position: originalTargetPosition,
  dimensions: {x: .1, y: 0.1, z: 0.1},
  color: {red: 200, green: 20, blue: 200},
  rotation: MyAvatar.orientation,
  ignoreCollisions: false,
  collisionsWillMove: true,
  damping: 0.3
});

var swordWorldOrientation;
var sword = Entities.addEntity({
  type: "Model",
  modelURL: "https://hifi-public.s3.amazonaws.com/eric/models/sword2.fbx",
  position: originalSwordPosition,
  dimensions: SWORD_DIMENSIONS,
  rotation: MyAvatar.orientation,
  color: {red: 200, blue: 10, green: 10},
  damping: 0
});

var swordCollisionBox = Entities.addEntity({
  type: "Box",
  position: originalSwordPosition,
  dimensions: SWORD_DIMENSIONS,
  color: {red: 200, blue: 10, green: 10},
  rotation: MyAvatar.orientation,
  ignoreCollisions: false,
  collisionsWillMove: true,
  // visible: false
})

initControls();

function initControls(){
  controllerID = 3; //right handed
  var palmPosition = Controller.getSpatialControlPosition(controllerID);
  controllerActive = (Vec3.length(palmPosition) > 0);
}

Script.setTimeout(function(){
  target = Entities.identifyEntity(target);
  swordCollisionBox = Entities.identifyEntity(swordCollisionBox);  
}, 500);

function cleanUp(){
  Entities.deleteEntity(target);
  Entities.deleteEntity(sword);
  Entities.deleteEntity(swordCollisionBox);
}


function onCollision(entity1, entity2, collision){
  if(entity1.id === swordCollisionBox.id || entity2.id === swordCollisionBox.id){
    var currentTime = new Date().getTime();
    if( (currentTime - lastSoundTime) > MIN_MSEC_BETWEEN_SWORD_SOUNDS){
        var props1 = Entities.getEntityProperties(entity1); 
      var props2 = Entities.getEntityProperties(entity2);
      swordProperties = Entities.getEntityProperties(swordCollisionBox);
      dVelocity = Vec3.length(Vec3.subtract(props1.velocity, props2.velocity));
      if(dVelocity > MIN_VELOCITY_FOR_SOUND_IMPACT){
        Audio.playSound(hitSound, {position:MyAvatar.position, volume: 1.0});
      }
      lastSoundTime = new Date().getTime();
    } 

  }
}

function onKeyPress(event){
  if(event.text === 'f'){
    Entities.editEntity(target, {position: originalTargetPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y: 0, z: 0}, angularVelocity: {x: 0, y: 0, z:0}});
    Entities.editEntity(sword, {position: originalSwordPosition, rotation: MyAvatar.orientation, velocity: {x: 0, y:0, z: 0}, angularVelocity: {x: 0, y: 0, z: 0}});
  }
}

function update(deltaTime){
  if(!controllerActive){
    return;
  }
  holdPosition = Vec3.sum(MyAvatar.getRightPalmPosition(), Vec3.multiplyQbyV(MyAvatar.orientation, HOLD_POSITION_OFFSET));
  targetProperties = Entities.getEntityProperties(target);

  spring = Vec3.subtract(originalTargetPosition, targetProperties.position);
  springLength = Vec3.length(spring);
  spring = Vec3.normalize(spring);
  targetVelocity = Vec3.sum(targetProperties.velocity, Vec3.multiply(springLength * SPRING_FORCE * deltaTime, spring));
  swordWorldOrientation = Quat.multiply(Quat.multiply(MyAvatar.orientation, Controller.getSpatialControlRawRotation(controllerID)), SWORD_ORIENTATION);
  Entities.editEntity(sword, {position: holdPosition, rotation: swordWorldOrientation, velocity: Controller.getSpatialControlVelocity(controllerID) });
  Entities.editEntity(swordCollisionBox, {position: holdPosition, rotation: swordWorldOrientation, velocity: Controller.getSpatialControlVelocity(controllerID) });
  Entities.editEntity(target, {velocity: targetVelocity});
}

Controller.keyPressEvent.connect(onKeyPress);

Entities.entityCollisionWithEntity.connect(onCollision);

Script.scriptEnding.connect(cleanUp);
Script.update.connect(update);