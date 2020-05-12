// draw given athlete at the bottom of the given svg. xOffset and yOffset control its relative position and
// maxFigureHeight effects the scaling of the draws such that the draw with the maximum height is below this argument. 
function drawAthlete(athlete, svgContainer, maxFigureHeight, xOffset, yOffset, animDuration){

	const bmi = athlete.weight / Math.pow(athlete.height/100, 2);

	// bmi scaling
	const bmiScale = d3.scaleLinear()
  		.domain([minBMI, maxBMI])
		.range([22, 60]);

	// height scaling
	const stdFigureHeight = 208;
	const scalingToMaxHeight = maxFigureHeight/stdFigureHeight;
	const minMaxScaling = minHeight/maxHeight;
	const heightScale = d3.scaleLinear()
		.domain([minHeight, maxHeight])
		.range([minMaxScaling, 1]);
		
	// age scaling	  
	const ageScale = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([lightGreen, darkGreen]);
		  
	// ellispis characteristics for fixed size athlete and given bmi
	const armWeightOffset = (bmiScale(bmi) - minWeight) / 3; // quite random

	const headSize = 40;
	const headYPos = -151;

	const bodyHeight = 87;
	const bodyYPos = -83

	const armLength = 61;
	const armWidth = 13;
	const armXPos = 40;
	const armYPos = -120;

	const legLength = 76;
	const legWidth = 14;
	const legAngle = 6;
	const legXPos = 14;
	const legHeight = Math.floor(Math.cos(legAngle) * legLength); 

	const ellipsesAthlete = [
		{'class': 'body', "cx":  0, "cy":  bodyYPos, "rx": bmiScale(bmi), "ry": bodyHeight, "rotation": 0}, // body
		{'class': 'head' ,"cx":  0, "cy":  headYPos, "rx": headSize, "ry": headSize, "rotation": 0}, // head
		{'class': 'rarm',"cx":  armXPos + armWeightOffset, "cy":  armYPos, "rx": armLength, "ry": armWidth, "rotation": 0}, // right arm
		{'class': 'larm',"cx":  -armXPos - armWeightOffset, "cy":  armYPos, "rx": armLength, "ry": armWidth, "rotation": 0}, // left arm
		{'class': 'rleg',"cx":  legXPos + armWeightOffset/2, "cy":  0, "rx": legWidth, "ry": legLength, "rotation": -legAngle}, // right leg
		{'class': 'lleg',"cx":  -legXPos - armWeightOffset/2, "cy":  0, "rx": legWidth, "ry": legLength, "rotation": legAngle}, // left leg
	];

	// transform that scale the athlete to the right size
	const athleteTransform = d3Transform()
   		.translate([
			   xOffset + parseInt(svgContainer.style("width"))/2, 
			   yOffset + parseInt(svgContainer.style("height"))])
		.scale(scalingToMaxHeight * heightScale(athlete.height));

	// if no athelte drawing, create one and append the transform
	if(svgContainer.select(".athlete_drawing").empty()) {
		svgContainer.append('g').attr('class', 'athlete_drawing')
			.attr('transform', athleteTransform);
	}

	const gEllipsis = svgContainer.select(".athlete_drawing");
	const u_ellipsis = gEllipsis.selectAll("ellipse").data(ellipsesAthlete);

	// append the ellipsis
	u_ellipsis.enter()
		.append("ellipse")
		.attr('class', (d,i) => { return d.class; })
		.attr("cx", (d,i) => { return d.cx; })
		.attr("cy", (d,i) => { return d.cy - legHeight/2 - 1; }) // so that the legs are at the bottom of the svg, -1 to be sure it is not cropped
		.attr("rx", (d,i) => { return d.rx/2; })
		.attr("ry", (d,i) => { return d.ry/2; })
		.attr('transform', (d,i) => { return "rotate(" + d.rotation + ")"})
		.attr('fill', ageScale(athlete.age))
	
	// animate the ellispis
	u_ellipsis.transition()
		.duration(animDuration)
		.attr("cx", (d,i) => { return d.cx; })
		.attr("cy", (d,i) => { return d.cy - legHeight/2 - 1; })
		.attr("rx", (d,i) => { return d.rx/2; })
		.attr("ry", (d,i) => { return d.ry/2; })
		.attr('fill', ageScale(athlete.age));

	// animate the scale transform
	gEllipsis.transition()
		.duration(animDuration)
		.attr('transform', athleteTransform);
	};