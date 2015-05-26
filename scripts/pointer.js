//Dimensions property for lines is the offset of the position

var lineEntityID = null;
var lineIsRezzed = false;
var altHeld = false;
var lineCreated = false;
var position, positionOffset, prevPosition;
var nearLinePosition;
var strokes = [];
var STROKE_MOVE_AMOUNT = 0.05;
var DISTANCE_DRAW_THRESHOLD = .03;
var drawDistance = 0;

var userCanDraw = false;

var BUTTON_SIZE = 32;
var PADDING = 3;

var buttonOffColor = {red: 250, green: 10, blue: 10};
var buttonOnColor = {red: 10, green: 200, blue: 100};

HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
var screenSize = Controller.getViewportDimensions();

var drawButton = Overlays.addOverlay("image", {
  x: screenSize.x / 2 - BUTTON_SIZE * 2 + PADDING,
  y: screenSize.y - (BUTTON_SIZE + PADDING),
  width: BUTTON_SIZE,
  height: BUTTON_SIZE,
  imageURL: HIFI_PUBLIC_BUCKET + "images/pencil.png?v2",
  color: buttonOffColor,
  alpha: 1
});




var center = Vec3.sum(MyAvatar.position, Vec3.multiply(2.0, Quat.getFront(Camera.getOrientation())));
center.y += 0.5;
var whiteBoard = Entities.addEntity({
  type: "Box",
  position: center,
  dimensions: {x: 1, y: 1, z: .001},
  color: {red: 255, green: 255, blue: 255}
});

function calculateNearLinePosition(targetPosition) {
  var handPosition = MyAvatar.getRightPalmPosition();
  var along = Vec3.subtract(targetPosition, handPosition);
  along = Vec3.normalize(along);
  along = Vec3.multiply(along, 0.4);
  return Vec3.sum(handPosition, along);
}


function removeLine() {
  if (lineIsRezzed) {
    Entities.deleteEntity(lineEntityID);
    lineEntityID = null;
    lineIsRezzed = false;
  }
}


function createOrUpdateLine(event) {
  var pickRay = Camera.computePickRay(event.x, event.y);
  var intersection = Entities.findRayIntersection(pickRay, true); // accurate picking
  var props = Entities.getEntityProperties(intersection.entityID);

  if (intersection.intersects) {
    startPosition = intersection.intersection;
    nearLinePosition = calculateNearLinePosition(intersection.intersection);
    positionOffset= Vec3.subtract(startPosition, nearLinePosition);
    if (lineIsRezzed) {
      Entities.editEntity(lineEntityID, {
        position: nearLinePosition,
        dimensions: positionOffset,
        lifetime: 15 + props.lifespan // renew lifetime
      });
      if(userCanDraw){
        draw();
      }
    } else {
      lineIsRezzed = true;
      prevPosition = intersection.intersection;
      lineEntityID = Entities.addEntity({
        type: "Line",
        position: nearLinePosition,
        dimensions: positionOffset,
        color: {
          red: 255,
          green: 255,
          blue: 255
        },
        lifetime: 15 // if someone crashes while pointing, don't leave the line there forever.
      });
    }
  } else {
    removeLine();
  }
}

function draw(){

  //We only want to draw line if distance between starting and previous point is large enough
  drawDistance = Vec3.distance(startPosition, prevPosition);
  if( drawDistance < DISTANCE_DRAW_THRESHOLD){
    return;
  }
  //We need to move line a bit towards avatar to avoid zfighting of line
  var moveDir = Vec3.subtract(MyAvatar.position, startPosition);
  moveDir = Vec3.normalize(moveDir);
  moveDir = Vec3.multiply(moveDir, STROKE_MOVE_AMOUNT);
  var adjustedStartPosition = Vec3.sum(startPosition, moveDir);
  var adjustedPrevPosition = Vec3.sum(prevPosition, moveDir);

  var offset = Vec3.subtract(adjustedStartPosition, adjustedPrevPosition);
  strokes.push(Entities.addEntity({
    type: "Line",
    position: adjustedPrevPosition,
    dimensions: offset,
    color: {red: 200, green: 40, blue: 200},
    // lifetime: 20
  }));
  prevPosition = startPosition;
}

function mousePressEvent(event) {
  var clickedOverlay = Overlays.getOverlayAtPoint({
    x: event.x,
    y: event.y
  });
  if (clickedOverlay == drawButton) {
    userCanDraw = !userCanDraw;
    if(userCanDraw === true){
      Overlays.editOverlay(drawButton, {color: buttonOnColor});
    } else {
      Overlays.editOverlay(drawButton, {color: buttonOffColor});
    }
  } 

  if (!event.isLeftButton || altHeld) {
    return;
  }
  Controller.mouseMoveEvent.connect(mouseMoveEvent);
  createOrUpdateLine(event);
  lineCreated = true;
}


function mouseMoveEvent(event) {
  createOrUpdateLine(event);
}



function mouseReleaseEvent(event) {
  if (!lineCreated) {
    return;
  }
  Controller.mouseMoveEvent.disconnect(mouseMoveEvent);
  removeLine();
  lineCreated = false;
}

function keyPressEvent(event) {
  if (event.text == "ALT") {
    altHeld = true;
  }
}

function keyReleaseEvent(event) {
  if (event.text == "ALT") {
    altHeld = false;
  }

}

function cleanup(){
  Entities.deleteEntity(whiteBoard);
  for(var i =0; i < strokes.length; i++){
    Entities.deleteEntity(strokes[i]);
  }

  Overlays.deleteOverlay(drawButton);
}


Script.scriptEnding.connect(cleanup);
Controller.mousePressEvent.connect(mousePressEvent);
Controller.mouseReleaseEvent.connect(mouseReleaseEvent);

Controller.keyPressEvent.connect(keyPressEvent);
Controller.keyReleaseEvent.connect(keyReleaseEvent);