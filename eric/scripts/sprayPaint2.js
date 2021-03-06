var scriptURL = "https://hifi-public.s3.amazonaws.com/scripts/entityScripts/sprayPaintCan.js";
// var scriptURL = "https://hifi-public.s3.amazonaws.com/eric/scripts/sprayPaintCan.js?=v2" + Math.random()
// var scriptURL = "file:///Users/ericlevin/myhifistuff/eric/scripts/sprayPaintCan.js?=v2" + Math.random()
// var modelURL = "http://hifi-public.s3.amazonaws.com/ryan/paintcan2.fbx";
var modelURL = "https://hifi-public.s3.amazonaws.com/eric/models/paintcan.fbx";
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(1, Quat.getFront(Camera.getOrientation())));

var sprayCan = Entities.addEntity({
 type: "Model",
 name: "spraycan"
 modelURL: modelURL,
 position: center,
 dimensions: {
     x: 0.07,
     y: 0.17,
     z: 0.07
 },
 collisionsWillMove: true,
 shapeType: 'box',
 script: scriptURL,
 gravity: {x: 0, y: -1, z: 0}
});

// var whiteboard = Entities.addEntity({
//     type: "Box",
//     position: center,
//     dimensions: {
//         x: 2,
//         y: 1.5,
//         z: .01
//     },
//     rotation: orientationOf(Vec3.subtract(MyAvatar.position, center)),
//     color: {
//         red: 250,
//         green: 250,
//         blue: 250
//     },
//     // visible: false
// });

function cleanup() {
    // Entities.deleteEntity(sprayCan);
    // Entities.deleteEntity(whiteboard);
}


Script.scriptEnding.connect(cleanup);


function orientationOf(vector) {
    var Y_AXIS = {
        x: 0,
        y: 1,
        z: 0
    };
    var X_AXIS = {
        x: 1,
        y: 0,
        z: 0
    };

    var theta = 0.0;

    var RAD_TO_DEG = 180.0 / Math.PI;
    var direction, yaw, pitch;
    direction = Vec3.normalize(vector);
    yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
    pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
    return Quat.multiply(yaw, pitch);
}
