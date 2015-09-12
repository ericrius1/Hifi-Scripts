//  rollDetector.js
//  part of bowling
//
//  Script Type: Entity
//
//  Created by James B. Pollack @imgntn -- 09/11/2015
//  Copyright 2015 High Fidelity, Inc.
//
//  When the ball enters this area, it's been rolled through to the end of the lane
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
        // Script.include("../../utilities.js");
        // Script.include("../../libraries/utils.js");


        Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/utilities.js");
        Script.include("https://raw.githubusercontent.com/highfidelity/hifi/master/examples/libraries/utils.js");

        var _t;

        RollDetector = function() {
            _t = this;
            print("RollDetector
                constructor ");
            };
            var properties;
            var checkPositionInterval;
            this.preload = function(entityID) {
                //  print('bubble preload')
                _t.entityID = entityID;
                properties = Entities.getEntityProperties(entityID);
                // _t.loadShader(entityID);
                Script.update.connect(_t.internalUpdate);
            };

            this.internalUpdate = function() {
                // we want the position at unload but for some reason it keeps getting set to 0,0,0 -- so i just exclude that location.  sorry origin bubbles.
                var tmpProperties = Entities.getEntityProperties(_t.entityID);
                if (tmpProperties.position.x !== 0 && tmpProperties.position.y !== 0 && tmpProperties.position.z !== 0) {
                    properties = tmpProperties;
                }
            }

            this.collisionWithEntity = function(myID, otherID, collision) {
                //if i am hit by a bowling ball
                //write something to my user data about being done, check that from the 
            };

            this.unload = function(entityID) {
                Script.update.disconnect(this.internalUpdate);


            };


        })