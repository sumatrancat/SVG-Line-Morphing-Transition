var mainContainer = getEl("#main-container");
var circularLine = getEl("#circular-line");
var straightLine = getEl(".straight-line");
var circularLinePath = getEl("#circular-line-path");
var controls = getEl(".controls");
var dots = getAll(".dot");
var images = getAll(".image-wrapper");
var imagesWrapper = getEl("#images-wrapper");

// convert nodelist into array
dots = [].slice.call(dots);

// static animation props - immutable
var staticAnimProps = {
	duration: .3,
	circularLinePathStart: 105,
	circularLinePathEnd: 0,
	translateVal: 80
}

// dynamic animation props - mutable
var dynamicAnimProps = {
	flipcircular: true,
	direction: "right",
	imageDirection: "x",
	straightLine: {
		pos: 0,
		origin: "right",
		width: 0
	},
	translateVal: 0,
	circularLinePos: 0,
	oldLinePos: 0,
	newLinePos: 0
}

// if the main container has vertical version class, then the image will transition vertically
if(mainContainer.classList.contains("vertical-version")) {
	dynamicAnimProps.imageDirection = "y";
}

// loop dots array
dots.forEach(function(dot, index, array){

	// store the array to variable
	var thisArray = array;

	dot.addEventListener("click", function(){

		// if the dot is active, don't do function
		if(!this.classList.contains("active")) {

			// move the circular line position to the clicked dot position
			dynamicAnimProps.circularLinePos = this.offsetLeft - 12;

			// active dot
			var activeDot = controls.querySelector(".active");

			// get the old and new position of the line
			dynamicAnimProps.oldLinePos = activeDot.offsetLeft;
			dynamicAnimProps.newLinePos = this.offsetLeft;
			
			// remove class active from old dot
			activeDot.classList.remove("active");
			// add active to the clicked dot
			this.classList.add("active");

			// define animation direction
			// if the selected dot has bigger index, then it's animation direction goes to the right
			if(getIndex(this, thisArray) > getIndex(activeDot, thisArray)){

				dynamicAnimProps.direction = "right";

				// get the width between the active dot and the clicked dot
				dynamicAnimProps.straightLine.width = dynamicAnimProps.newLinePos - dynamicAnimProps.oldLinePos + 2.5;
				dynamicAnimProps.straightLine.pos = dynamicAnimProps.oldLinePos + 5;
				dynamicAnimProps.flipcircular = false;
				dynamicAnimProps.straightLine.origin = "left";
				dynamicAnimProps.translateVal = staticAnimProps.translateVal;

			} else {

				dynamicAnimProps.direction = "left";

				dynamicAnimProps.straightLine.width = -(dynamicAnimProps.newLinePos - dynamicAnimProps.oldLinePos - 2.5);
				dynamicAnimProps.straightLine.pos = dynamicAnimProps.newLinePos + 5;
				dynamicAnimProps.flipcircular = true;
				dynamicAnimProps.straightLine.origin = "right";
				dynamicAnimProps.translateVal = -staticAnimProps.translateVal;

			}

			// animate the circular and line
			animateLine(staticAnimProps, dynamicAnimProps);
			// animate active image and selected image
			animateImages(getIndex(activeDot, thisArray), getIndex(this, thisArray), dynamicAnimProps.direction, dynamicAnimProps.translateVal);

		}


	});

});

// animate the circular and line
function animateLine(staticAnimProps, dynamicAnimProps){

	// define animation timeline
	var tl = new TimelineMax({
		onStart: function(){

			// the controls won't be available while the animation is playing
			controls.classList.add("disabled");

			// if the animation direction goes to left, the circular line is flip - so the line starts animation from right direction
			(dynamicAnimProps.flipcircular) ? circularLine.className = "flip" : undefined;

			// set straight line transform origin based on the animation direction
			// if the animation direction goes to right, line animation will start from the left and vice versa
			// set straight line width based on active-dot's position and clicked-dot's position
			// set the straight line position
			straightLine.style.cssText = `
				width: ${dynamicAnimProps.straightLine.width}px;
				left: ${dynamicAnimProps.straightLine.pos}px;
				transform-origin: ${dynamicAnimProps.straightLine.origin}`;

		},
		onComplete: function(){

			// controls is available after animation is done
			controls.classList.remove("disabled");

			// circular line is not flipped anymore
			circularLine.className = "";

			// set the straight line new position
			straightLine.style.left = dynamicAnimProps.newLinePos + "px";

		}

	});

	// tl.timeScale(0.1)

	// start timeline
	tl

		.to(circularLinePath, staticAnimProps.duration, {

			css: {
				// animation css stroke-dashoffset property
				// this will yield the circular loading effect
				"stroke-dashoffset": 105
			}

		})

		.to(straightLine, staticAnimProps.duration/2, {

			// animates the length of the line
			scaleX: 1,

			onComplete: function(){

				// straight line animation direction changes to the opposite
				this.target.style.transformOrigin = dynamicAnimProps.direction;

				// move circular line position to the clicked dot position
				circularLine.style.left = dynamicAnimProps.circularLinePos + "px";

			}

		}, 0.15)

		.to(straightLine, staticAnimProps.duration, {

			// animate the straight line length to zero
			scaleX: 0

		})

		.to(circularLinePath, staticAnimProps.duration, {

			onStart: function(){

				// if the animation direction goes to left, flip the circular line
				(dynamicAnimProps.flipcircular) ? circularLine.className = "" : circularLine.className = "flip";

			},

			delay: -staticAnimProps.duration,
			css: {
				// animate circular line to 0
				"stroke-dashoffset": 0
			}

		})

}

// animate images
function animateImages(oldIndex, newIndex, direction, translateVal){

	var tl = new TimelineMax({
		onComplete: function(){
			// remove transform property
			images[oldIndex].style.transform = "";
			images[newIndex].style.transform = "";
		}
	});

	tl

		// animate the active image
		.to(images[oldIndex], .3, {
			[dynamicAnimProps.imageDirection]: -translateVal,
			opacity: 0

		})

		// set the clicked image translateX position
		.set(images[newIndex], {
			[dynamicAnimProps.imageDirection]: translateVal,
		}, .15)

		// animate the cliced image
		.to(images[newIndex], .3, {
			[dynamicAnimProps.imageDirection]: 0,
			opacity: 1
		})

}

// utils
function getEl(el){
	return document.querySelector(el);
}

function getAll(all){
	return document.querySelectorAll(all);
}

function getIndex(el, arr){
	return arr.indexOf(el);
}