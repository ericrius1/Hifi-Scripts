HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";
// Script.include(HIFI_PUBLIC_BUCKET + 'scripts/utilities.js')
Script.include('utilities.js');

var NUM_ROWS = 10;
var NUM_COLUMNS = NUM_ROWS;
var BOX_SIZE = 1;
var center = Vec3.sum(MyAvatar.position, Vec3.multiply(BOX_SIZE * 10, Quat.getFront(Camera.getOrientation())));

var grid = [];
var entities = [];


createGrid();



function update(deleteTime) {
  //We want to cache positions of all the boxes once every update, unecessary to do this n^2 times
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      var cell = grid[rowIndex][columnIndex];
      cell.props = Entities.getEntityProperties(cell.entity);
    }
  }



}

function cleanup() {
  for (var rowIndex = 0; rowIndex < grid.length; rowIndex++) {
    for (var columnIndex = 0; columnIndex < grid[rowIndex].length; columnIndex++) {
      Entities.deleteEntity(grid[rowIndex][columnIndex].entity);

    }
  }
}



function createGrid() {
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      if (!grid[rowIndex]) {
        grid[rowIndex] = [];
      }
      var basePosition = Vec3.sum(center, {
        x: rowIndex * BOX_SIZE,
        y: -2,
        z: columnIndex * BOX_SIZE
      });
      var entity = Entities.addEntity({
        type: 'Box',
        position: basePosition,
        dimensions: {
          x: BOX_SIZE,
          y: BOX_SIZE,
          z: BOX_SIZE
        },
        color: hslToRgb({
          hue: 0.6,
          sat: 0.5,
          light: randFloat(0.5, 0.6)
        })
      });
      grid[rowIndex].push({
        entity: entity,
        basePosition: basePosition,
        neighbors: []
      })
    }
  }

  //Set up neighbors
  for (var rowIndex = 0; rowIndex < NUM_ROWS; rowIndex++) {
    for (var columnIndex = 0; columnIndex < NUM_COLUMNS; columnIndex++) {
      if (rowIndex < NUM_ROWS - 1) {
        //Bottom Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex + 1, columnIndex]);
      }
      if (rowIndex > 0) {
        //Top Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex - 1][columnIndex])
      }
      if (columnIndex < NUM_COLUMNS - 1) {
        // Right Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex, columnIndex + 1])
      }
      if (columnIndex > 0) {
        //Left Neighbor
        grid[rowIndex][columnIndex].neighbors.push([rowIndex, columnIndex - 1]);
      }

    }

  }
}

Script.update.connect(update);
Script.scriptEnding.connect(cleanup)