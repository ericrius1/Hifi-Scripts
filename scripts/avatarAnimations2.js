var stepLeftAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_left_inPlace.fbx";
var stepRightAnimation = "https://hifi-public.s3.amazonaws.com/ozan/animations/fightclub_bot_anims/side_step_right_inPlace.fbx";
var walkAnimation = "https://hifi-public.s3.amazonaws.com/ozan/support/FightClubBotTest1/Animations/standard_walk.fbx";

var HORIZONTAL_DMOVE_THRESHOLD = .01;
var MOVE_THRESHOLD = 0.01;
var previousPosition = MyAvatar.position;
var dPosition;

var currentAnimation = stepRightAnimation;
var numFrames = 24;

var direction;

var sideStepProps = {
	numFrames: 31,
	frameIncrementFactor: 1
}

var walkProps = {
	numFrames: 36,
	frameIncrementFactor: 0.5
}
var currentFrame = 0;
var nextFrame;
var frameIncrement;

// MyAvatar.startAnimation(walkAnimation, 24, 1, true, false);


function update() {
    dPosition = Vec3.subtract(MyAvatar.position, previousPosition);
	//convert to localFrame
	dPosition = Vec3.multiplyQbyV(Quat.inverse(MyAvatar.orientation), dPosition);


	if( Vec3.length(dPosition) < MOVE_THRESHOLD) {
		//If we're barely moving just return;
		return;
	}

	if (Math.abs(dPosition.x) > Math.abs(dPosition.z)) {
		// if we're moving more side to side then forward, sidestep
		sideStep();
	} else {
		walk();
	}

	previousPosition = MyAvatar.position;
}

function walk() {
	MyAvatar.startAnimation(walkAnimation, 6, 1, false, false, currentFrame, nextFrame);


	direction = dPosition.z > 0 ? -1 : 1
	frameIncrement = direction * walkProps.frameIncrementFactor;
	currentFrame = currentFrame + frameIncrement
	nextFrame = currentFrame + frameIncrement;
	if(currentFrame > walkProps.numFrames) {
		currentFrame = 0;
		nextFrame  = frameIncrement;
	}
	currentAnimation = walkAnimation;


}

function sideStep() {
	MyAvatar.startAnimation(stepRightAnimation, 6, 1, false, false, currentFrame, nextFrame);

	direction = dPosition.x > 0 ? 1 : -1;
	frameIncrement = direction * sideStepProps.frameIncrementFactor;
	currentFrame = currentFrame + frameIncrement;
	nextFrame = currentFrame + frameIncrement;
	if(currentFrame > sideStepProps.numFrames) {
		currentFrame = 0;
		nextFrame = frameIncrement;
	}
	if ( currentFrame < 0 ) {
		currentFrame = sideStepProps.numFrames;
		sideStepProps.numFrames - frameIncrement;
	}


}

function cleanup() {
	if(currentAnimation){
	  MyAvatar.stopAnimation(currentAnimation)	
	}
}


Script.scriptEnding.connect(cleanup);
Script.update.connect(update);