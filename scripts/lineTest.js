
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getFront(Camera.getOrientation())));
var p1 = {x: 0, y: 0, z: 0};
var p2 = {x: 1, y: 0, z: 0};
var p3 = {x: 1, y: 1, z: 0};
var lineColor = {red: 200, green: 70, blue: 50};
//Lets modify line entity so we hardcode 10 points and make line from that
var line = Entities.addEntity({
  type: 'Line',
  position: center,
  linePoints: [p1, p2, p3],
  color: lineColor,
  dimensions: {x: 10, y: 10, z: 10},
  lineWidth: 10
});



function update(){
  var pos = Entities.getEntityProperties(line).position;
  Entities.editEntity(line, {position: Vec3.sum(pos, {x: .01, y:0, z:0})});
}


function cleanup(){
  Entities.deleteEntity(line);
}

Script.scriptEnding.connect(cleanup);
Script.update.connect(update);