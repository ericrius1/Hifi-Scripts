(function() {
    this.entityID = null;
    this.lampOn = false;
    this.numGlobs = 3;
    this.globSize = 0.02;
    this.globs = [];
    this.lampRadius = .133;
    var self = this;

    
    this.toggleLamp = function(){
      if(!this.lampOn){
        this.turnLampOn();
      } 
      else if(this.lampOn){
        this.turnLampOff();
      }

      this.lampOn = !this.lampOn;
    }

    this.turnLampOn = function() {
      //create blobs
      print("BLOBS");
      this.lampPosition = Entities.getEntityProperties(this.entityID).position;
      var globProperties = {
        type: 'Sphere',
        position: this.lampPosition,
        color: {red: 100, blue : 20, green: 100},
        dimensions: {x : this.globSize, y: this.globSize, z: this.globSize },
        collisionsWillMove: true,
        velocity: {x : 0, y: 0.1, z: 0}
      };

      for( var i = 0; i < this.numGlobs; i++){
        globProperties.position.x += randFloat(-.01, .01);
        globProperties.position.y += randFloat(-.01, .01);
        globProperties.position.z += randFloat(-.01, .01);
        var glob = Entities.addEntity(globProperties);
        this.globs.push(glob);
      }

    }

    this.turnLampOff = function() {
      for( var i = 0; i < this.globs.length; i++){
        Entities.deleteEntity(this.globs[i]);
      }


    }

    this.clickReleaseOnEntity = function(entityID, mouseEvent) {
        this.entityID = entityID;
        if(mouseEvent.isLeftButton) {
          this.toggleLamp();
        }
     
    };

    this.update = function(deltaTime){
      if(!self.lampOn){
        return;
      }

    }

    this.scriptEnding = function(){
      for( var i = 0; i < this.globs.length; i++){
        Entities.deleteEntity(this.globs[i]);
      }

    }

  function randFloat ( low, high ) {
    return low + Math.random() * ( high - low );
  }
  Script.update.connect(this.update);
  Script.scriptEnding.connect(this.scriptEnding);

})