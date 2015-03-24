(function() {
    this.entityID = null;
    this.lampOn = false;
    this.numGlobs = 1;
    this.globSize = 0.02;
    this.globs = [];
    this.lampRadius = .043;
    var self = this;
    this.colliders = [];
    this.chanceOfVelocityBoost = 0.01;
    this.lampHeight = .5;
    this.wallSpace = 0.03;

    
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
      this.lampPosition = Entities.getEntityProperties(this.entityID).position;
      var globProperties = {
        type: 'Sphere',
        position: this.lampPosition,
        color: {red: 100, blue : 20, green: 100},
        dimensions: {x : this.globSize, y: this.globSize, z: this.globSize },
        collisionsWillMove: true,
        velocity: {x : 0, y: 0.1, z: 0},
        damping: 0
      };


      //create blobs
      for( var i = 0; i < this.numGlobs; i++){
        globProperties.position.x += randFloat(-.01, .01);
        globProperties.position.y += randFloat(-.01, .01);
        globProperties.position.z += randFloat(-.01, .01);
        var glob = Entities.addEntity(globProperties);
        this.globs.push(glob);
      }

      this.createColliders();


    }


    this.createColliders = function(){
      //create a top and bottom
      var colliderWidth = 0.03;
      var isVisible = false;
      var color = {red: 200, green: 10, blue: 10};
      var topProperties = {
        type: 'Box',
        position: Vec3.sum(this.lampPosition, {x: 0, y: .15, z: 0}),
        dimensions: {x: this.lampRadius * 2, y: colliderWidth, z: this.lampRadius * 2},
        color: color,
        visible: isVisible
      }
      var collider = Entities.addEntity(topProperties);
      this.colliders.push(collider);
      
      var bottomProperties = {
        type: 'Box',
        position: Vec3.sum(this.lampPosition, {x: 0, y: -.04, z: 0}),
        dimensions: {x: this.lampRadius * 2, y: colliderWidth, z: this.lampRadius * 2},
        color: color,
        visible: isVisible
      }
      collider = Entities.addEntity(bottomProperties);
      this.colliders.push(collider);
      
      //SIDE WALLS
       var wall = Entities.addEntity(
        { type: "Box",
          position: Vec3.sum(this.lampPosition, { x:this.wallSpace, y: 0, z: 0 }), 
          dimensions: { x: colliderWidth, y: this.lampHeight, z: this.wallSpace * 2 }, 
          color: { red: 0, green: 255, blue: 0 },
          ignoreCollisions: false,
          visible: isVisible,
        });
        this.colliders.push(wall);

       wall = Entities.addEntity(
        { type: "Box",
          position: Vec3.subtract(this.lampPosition, { x: this.wallSpace, y: 0, z: 0 }), 
          dimensions: { x: colliderWidth, y: this.lampHeight, z: this.wallSpace * 2 }, 
          color: { red: 0, green: 255, blue: 0 },
          ignoreCollisions: false,
          visible: isVisible,
        });
       this.colliders.push(wall);
       wall = Entities.addEntity(
        { type: "Box",
          position: Vec3.subtract(this.lampPosition, { x: 0, y: 0, z: this.wallSpace}), 
          dimensions: { x: this.wallSpace * 2, y: this.lampHeight, z: colliderWidth }, 
          color: { red: 0, green: 255, blue: 0 },
          ignoreCollisions: false,
          visible: isVisible,
         }); 
        this.colliders.push(wall);

      wall = Entities.addEntity(
        { type: "Box",
          position: Vec3.sum(this.lampPosition, { x: 0, y: 0, z: this.wallSpace}), 
          dimensions: { x: this.wallSpace * 2, y: this.lampHeight, z: colliderWidth }, 
          color: { red: 0, green: 255, blue: 0 },
          ignoreCollisions: false,
          visible: isVisible,
        });
      this.colliders.push(wall);
    }

    this.turnLampOff = function() {
      this.cleanUp();
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

      for(var i = 0; i < self.globs.length; i++){
        var glob = self.globs[0];
        var velocity = Entities.getEntityProperties(glob).velocity;

        //Physics engine deactivates objects moving below 0.05 m/s after ~2 sec, 
        //so give those objects a boost before that happens
        if(Vec3.length(velocity) < 0.05){
          // var newVelocity = Vec3.multiply(2, velocity);
          var direction = velocity.y > 0 ? 1 : -1;
          Entities.editEntity(glob, {velocity: {x: 0, y: .1 * direction, z: 0}});
        }
      }


    }

    this.scriptEnding = function(){
      this.cleanUp();
    }

    this.cleanUp = function(){
      for( var i = 0; i < this.globs.length; i++){
        Entities.deleteEntity(this.globs[i]);
      }
      for(var i = 0; i < this.colliders.length; i++){
        Entities.deleteEntity(this.colliders[i]);
      }
    }

  function randFloat ( low, high ) {
    return low + Math.random() * ( high - low );
  }
  Script.update.connect(this.update);
  Script.scriptEnding.connect(this.scriptEnding);

})