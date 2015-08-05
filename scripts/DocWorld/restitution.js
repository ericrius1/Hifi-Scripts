RestitutionExample = function(entityPosition, panelPosition) {
	this.updateInterval = 6000;
	this.startingEntityPosition = entityPosition;
	this.values = [1.0, 0.8, 0.5, 0.0];
    this.currentValuesIndex = 0;

	this.box = Entities.addEntity({
		type: 'Sphere',
		dimensions: {
			x: 0.5,
			y: 0.5,
			z: 0.5
		},
		color: {
			red: 200,
			green: 20,
			blue: 200
		},
		collisionsWillMove: true,
		damping: 0.0
	});

	this.panel = Entities.addEntity({
		type: "Text",
		position: panelPosition,
		dimensions: {
			x: 0.65,
			y: 0.6,
			z: 0.01
		},
		backgroundColor: {
			red: 255,
			green: 255,
			blue: 255
		},
		textColor: {
			red: 0,
			green: 255,
			blue: 0
		},
		lineHeight: 0.14
	});

}

RestitutionExample.prototype.play = function() {
	var self = this;
	var currentValue =  self.values[self.currentValuesIndex++]
	if(self.currentValuesIndex === self.values.length) {
		self.currentValuesIndex = 0;
	}
	Entities.editEntity(self.box, {
	    position: self.startingEntityPosition,
		gravity: {
			x: 0,
			y: -10,
			z: 0
		},
		velocity: {
			x: 0, 
			y: -1,
			z: 0
		},
		restitution: currentValue,
	});
	Entities.editEntity(self.panel, {
		text: "Restitution \n" + currentValue
	});
	Script.setTimeout(function() {
		self.play();
	}, self.updateInterval)
}

RestitutionExample.prototype.cleanup = function() {
	Entities.deleteEntity(this.box);
	Entities.deleteEntity(this.panel);
}