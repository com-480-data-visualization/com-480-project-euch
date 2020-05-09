function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// DOMContentLoaded already fired
		action();
	}
}

// represents an average athlete
class Athlete {
	constructor(start_year, end_year, nb_samples, age, height, weight, sport, event) {
	  this.start_year = start_year;
	  this.end_year = end_year;
	  this.nb_samples = nb_samples;
	  this.age = age;
	  this.height = height;
	  this.weight = weight;
	  this.sport = sport;
	  this.event = event;
	}
}

// represents an olympic result
class Result {
	constructor(age, height, weight, sport, event, year) {
		this.age = age;
		this.height = height;
		this.weight = weight;
		this.sport = sport;
		this.event = event;
		this.year = year;
	}
}

// store the results, add unique sports as option to the sports selection list
function createResultArray(resArray) {
	d3.csv("../data/athlete_events.csv", function(d) {

		// add eash row to resArray and return the sport feature only
		resArray.push(new Result(+d["Age"], +d["Height"], +d["Weight"], d.Sport, d.Event, +d["Year"]));
		//console.log(new Result(+d["Age"], +d["Height"], +d["Weight"], d.Sport, d.Event, +d["Year"]));
		
		return {
			sport: d.Sport,
		};
	}).then(function(data) {		
		// for each unique sport, create an option value in the sports selection list
		const sportSel =  d3.select('#sport_selector');
		sports_unique = d3.map(data, function(d){return d.sport;}).keys()		
		addSportOptions(sportSel, sports_unique);
	});
}

// create an average athlete that represents all athletes from a given sport, event and time window
function averageAthlete(start_year, end_year, sport, event, resArray){

	data_f = resArray.filter(function(d){
		sameEvent = event == 'All' ? true : d.event == event;
		sameSport = d.sport == sport;
		btwYear = d.year >= start_year && d.year <= end_year;
		return sameEvent && sameSport && btwYear;
	});

	const mean_age = d3.mean(data_f, function(d) { return d.age; });
	const mean_weight = d3.mean(data_f, function(d) { return d.weight; });
	const mean_height = d3.mean(data_f, function(d) { return d.height; });
	const nb_samples = data_f.length;

	return new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);
}

// add the given list of sports as options to the given selection list (in d3), remove all previous options
function addSportOptions(sportSel, sports){
	sportSel.selectAll('option').remove();
	sportSel.selectAll('option')
		.data(sports.sort())
		.enter()
		.append('option')
		.text(function(d) {
			return d;
		  })
		.attr("value", function(d) {
			return d;
		  });
}

// add the given list of event as options to the given selection list (in d3), remove all previous options
function updateEventOptions(eventSel, selectedSport){
	eventSel.selectAll('option').remove();
	const events = resArray.filter(function(d){
		return d.sport == selectedSport;
	});
	const events_unique = d3.map(events, function(d){return d.event;}).keys();
	eventSel.selectAll('option')
		.data(['All'].concat(events_unique.sort())) // add All field
		.enter()
		.append('option')
		.text(function(d) {
			return d;
		})
		.attr("value", function(d) {
			return d;
		});
}

// draw given athlete at the bottom of the given svg. xOffset and yOffset control its relative position and
// maxFigureHeight effects the scaling of the draws such that the draw with the maximum height is below this argument. 
function drawAthlete(athlete, svgContainer, maxFigureHeight, xOffset, yOffset, animDuration){

	// remove last athlete draw
	// svgContainer.selectAll('g').remove();

	const bmi = athlete.weight / Math.pow(athlete.height/100, 2);

	// BMI scaling
	const bmiScale = d3.scaleLinear()
  		.domain([minBMI, maxBMI])
		.range([22, 60]);


	// Height scaling
	const stdFigureHeight = 208;
	const scalingToMaxHeight = maxFigureHeight/stdFigureHeight;
	const minMaxScaling = minHeight/maxHeight;

	const heightScale = d3.scaleLinear()
		.domain([minHeight, maxHeight])
		.range([minMaxScaling, 1]);
		  

	// Age scaling	  
	const ageScale = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([lightGreen, darkGreen]);
		  

	// Drawing the ellipsis
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

	// Transform
	var athleteTransform = d3Transform()
   		.translate([
			   xOffset + parseInt(svgContainer.style("width"))/2, 
			   yOffset + parseInt(svgContainer.style("height"))])
		.scale(scalingToMaxHeight * heightScale(athlete.height));

	if (svgContainer.select(".athlete_drawing").empty()) {

		const gEllipsis = svgContainer.append('g').attr('class', 'athlete_drawing');

		gEllipsis.selectAll("ellipse")
			.data(ellipsesAthlete)
			.enter()
			.append("ellipse")
			.attr('class', (d,i) => { return d.class; })
			.attr("cx", (d,i) => { return d.cx; })
			.attr("cy", (d,i) => { return d.cy - legHeight/2 - 1; }) // so that the legs are at the bottom of the svg, -1 to be sure it is not cropped
			.attr("rx", (d,i) => { return d.rx/2; })
			.attr("ry", (d,i) => { return d.ry/2; })
			.attr('transform', (d,i) => { return "rotate(" + d.rotation + ")"})
			.attr('fill', ageScale(athlete.age));

		gEllipsis
			.attr('transform', athleteTransform);
	}
	else {

		svgContainer.select(".athlete_drawing")
			.transition()	
			.duration(animDuration)
			.attr('transform', athleteTransform);

		svgContainer.select('.athlete_drawing').selectAll('ellipse')
			.data(ellipsesAthlete)
			.transition() 
			.duration(animDuration)
			// code duplication... how not to?
			.attr('class', (d,i) => { return d.class; })
			.attr("cx", (d,i) => { return d.cx; })
			.attr("cy", (d,i) => { return d.cy - legHeight/2 - 1; })
			.attr("rx", (d,i) => { return d.rx/2; })
			.attr("ry", (d,i) => { return d.ry/2; })
			.attr('transform', (d,i) => { return "rotate(" + d.rotation + ")"})
			.attr('fill', ageScale(athlete.age));
	}
}

function drawAthleteDescription(athlete, svgContainer, xOffset, yOffset){
	//svgContainer.selectAll('#heightAxisGroup').remove();
	svgContainer.selectAll('#weightAxisGroup').remove();
	svgContainer.selectAll('#ageAxisGroup').remove();
	svgContainer.selectAll('#labelsGroup').remove();

	svgHeight = parseInt(svg.style("height"));
	svgWidth = parseInt(svg.style("width"));

	// create gradient for age axis
	if(svgContainer.select('defs').empty()){
		var svgDefs = svg.append('defs');
		var gradient = svgDefs.append('linearGradient')
			.attr('id', 'gradient');
	
		gradient.append("stop")
				.attr("offset", "0%")
				.attr("stop-color", lightGreen);
	
		gradient.append("stop")
				.attr("offset", "100%")
				.attr("stop-color", darkGreen);
	
	}
	
	// create groups for differents axis
	const weightAxisGroup = svgContainer.append("g").attr('id', 'weightAxisGroup');
	const ageAxisGroup = svgContainer.append("g").attr('id', 'ageAxisGroup');
	const labelsGroup = svgContainer.append("g").attr('id', 'labelsGroup');

	// limits of the drawing of the athlete
	const xFactor = 0.28;
	const xLeft = xFactor * svgWidth;
	const xRight = (1 - xFactor) * svgWidth;
	const axisBottom = 0.8 * svgHeight;
	const axisTop = 0.3 * svgHeight;

	// ****************************** height axis ******************************

	const heightAxisScale = d3.scaleLinear()
		.domain([0, maxHeight])	
		.range([axisBottom, axisTop]);
	
	let axisGenerator = d3.axisLeft(heightAxisScale);
	axisGenerator.ticks(4);
	axisGenerator.tickValues([50,100,150,200]);
		
	const linesHeightAxis = [
		//{"x1":  xLeft, "y1":  axisBottom, "x2": xRight, "y2": axisBottom}, // height axis bottom
		//{"x1":  xLeft, "y1":  axisBottom, "x2": xLeft, "y2": axisTop}, // height axis left
		{'class' : 'athleteHeightLine', "x1":  xLeft, "y1":  heightAxisScale(athlete.height), "x2": xRight, "y2": heightAxisScale(athlete.height)} // athlete height line
	];

	let updateHeight = true;

	if (svgContainer.select("#heightAxisGroup").selectAll('line').empty()) {

		const heightAxisGroup = svgContainer.append("g").attr('id', 'heightAxisGroup');

		heightAxisGroup.selectAll("line")
			.data(linesHeightAxis)
			.enter()
			.append('line')
			.attr('class',(d,i) => {return d.class} )
			.attr('x1', (d,i) => {return d.x1})
			.attr('y1', (d,i) => {return d.y1})
			.attr('x2', (d,i) => {return d.x2})
			.attr('y2', (d,i) => {return d.y2})
			.style('stroke', 'black')
			.style('stroke_width', 1);	

		heightAxisGroup.append("text")
			.attr('class', 'label')
			.attr('x', xRight)
			.attr('y', heightAxisScale(athlete.height) - 3)
			.attr('text-anchor', 'end')
			.text(athlete.height.toFixed(1) + 'cm')
			.attr("font-family", "sans-serif")
			.attr("font-size", "11px")
			.attr("fill", "black")
			.attr('font-weight', 'bold');

		// only works if drawn last in the group... (?) 
		const heightAxisTransform = d3Transform()
			.translate([xLeft, 0])	
		heightAxisGroup
			.append("g")
			.attr("transform", heightAxisTransform) 
			.call(axisGenerator);

		updateHeight = false;
	}
	let athleteDuration = 0;

	if (updateHeight) {

		const prevHeight = svgContainer.select("#heightAxisGroup").select(".label").text().slice(0, -2);
		const up = prevHeight < athlete.height;
		console.log(prevHeight);
		
		const labelDuration= up ? 300 : 1500;
		const lineDuration = 900;
		athleteDuration = up ? 1500 : 300;

		const heightAxisGroup = svgContainer.select("#heightAxisGroup");
		heightAxisGroup.selectAll("line")
			.data(linesHeightAxis)
			.transition()
			.duration(lineDuration)
			.attr('y1', (d,i) => {return d.y1})
			.attr('y2', (d,i) => {return d.y2})

		heightAxisGroup.select(".label")
			.transition()
			.duration(labelDuration)
			.attr('y', heightAxisScale(athlete.height) - 3)
			// use of tweeing for the height label, can't interpolate automatically
			.tween('text', function() {				
				const self = this;
				const currentValue = this.textContent.slice(0, -2);
				const i = d3.interpolate(currentValue, athlete.height);
				return function(t) {
					self.textContent = i(t).toFixed(1) + 'cm';
				};
			});
	}

	const athDraw = drawAthlete(athlete, svgContainer, axisBottom-axisTop, 0, axisBottom - svgHeight, athleteDuration);


	// ****************************** weight axis ******************************
	const verticalPadding = 20;
	const radius = 0.8 * (xRight - xLeft) / 2;
	const arcCenterX = 0.5 * svgWidth;
	const arcCenterY = axisTop - verticalPadding;

	var arcTranslation = d3Transform()
   		.translate([arcCenterX, arcCenterY])
	
	var arc = d3.arc()
		.innerRadius(radius-0.1) // so that it looks like a stroke
		.outerRadius(radius)
		.startAngle(-Math.PI/2)
		.endAngle(Math.PI/2)

	weightAxisGroup.append("path")
		.attr("d", arc)
		.attr("fill", 'black')
		.attr("fill-opacity", 0)
		.attr("transform", arcTranslation)
		.style('stroke', 'black')
		.style('stroke-width', 1);

	const weightAxisScale = d3.scaleLinear()
		.domain([0, maxWeight])
		.range([0, Math.PI]);

	const ticksArc = [
		{"tick": 0, 'xshift':1, 'yshift':3},
		{"tick": 50, 'xshift':1, 'yshift':8},
		{"tick": 100, 'xshift':-9, 'yshift':9},
		{"tick": 150, 'xshift':-17, 'yshift':8},
		{"tick": 200, 'xshift':-18, 'yshift':3},
	];

	const ticksArcLength = radius * 0.1;

	weightAxisGroup.selectAll("line")
		.data(ticksArc)
		.enter()
		.append('line')
		.attr('x1', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * radius})
		.attr('y1', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * radius})
		.attr('x2', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * (radius-ticksArcLength)})
		.attr('y2', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * (radius-ticksArcLength)})
		.style('stroke', 'black')
		.style('stroke-width', 1);	

	weightAxisGroup.selectAll("text")
		.data(ticksArc)
		.enter()
		.append('text')
		.attr('x', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * (radius-ticksArcLength) + d.xshift})
		.attr('y', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * (radius-ticksArcLength) + d.yshift})
		.text((d,i) => {return d.tick})
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", "black")

	const arrowLength = radius * 1;

	weightAxisGroup.append('line')
		.attr('x1', arcCenterX)
		.attr('y1', arcCenterY)
		.attr('x2', arcCenterX - Math.cos(weightAxisScale(athlete.weight)) * arrowLength)
		.attr('y2', arcCenterY - Math.sin(weightAxisScale(athlete.weight)) * arrowLength)
		.style('stroke', 'black')
		.style('stroke-width', 2);	

	weightAxisGroup.append('circle')
		.attr('cx', arcCenterX)
		.attr('cy', arcCenterY)
		.attr('r', 2)
		.attr('fill', 'black');



	// ****************************** age axis ******************************
	
	const ageBarHeight = 15;

	ageAxisGroup.append('rect')
		.attr('x', xLeft)
		.attr('y', axisBottom + verticalPadding)
		.attr('width', xRight - xLeft)
		.attr('height', ageBarHeight)
		.style('fill', 'url(#gradient)');

	const ageAxisScale = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([xLeft, xRight]);

	const labelsAgeAxis = [
		{'value': minAge, 'aligned': 'end', 'xPadding': -3},
		{'value': maxAge, 'aligned': 'start', 'xPadding': 3}
	];

	ageAxisGroup.selectAll('text')
		.data(labelsAgeAxis)
		.enter()
		.append('text')
		.attr('x', (d,i) => {return ageAxisScale(d.value) + d.xPadding})
		.attr('y', axisBottom + verticalPadding + 0.7 * ageBarHeight)
		.text((d,i) => {return d.value})
		.attr('text-anchor', (d,i) => {return d.aligned})
		.attr("font-family", "sans-serif")
		.attr("font-size", "10px")
		.attr("fill", "black")


	ageAxisGroup.append('line')
		.attr('x1', ageAxisScale(athlete.age))
		.attr('y1', axisBottom + verticalPadding)
		.attr('x2', ageAxisScale(athlete.age))
		.attr('y2', axisBottom + verticalPadding + ageBarHeight)
		.attr('stroke', 'black')
		.attr('stroke-width', 2);

	ageAxisGroup.append('text')
		.attr('x', ageAxisScale(athlete.age))
		.attr('y', axisBottom + verticalPadding + ageBarHeight + 14)
		.text(athlete.age.toFixed(1) + ' years')
		.attr("font-family", "sans-serif")
		.attr('text-anchor', 'middle')
		.attr("font-size", "11px")
		.attr("fill", "black")
		.attr('font-weight', 'bold');
		



	// ****************************** athlete mensuration labels ******************************



	// weight label, use a padding from the circle to place the text correctly
	const paddingFromCircle = 12

	const weightLabelTranslation = d3Transform()
		.translate([
			arcCenterX 
			- Math.cos(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle)
			,
			arcCenterY 
			- Math.sin(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle)
		]);

	labelsGroup.append('text')
		.attr('dominant_baseline', 'middle')
		.attr('text-anchor', 'middle')
		.text(athlete.weight.toFixed(1) + 'kg')
		.attr("fill", "black")
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr('font-weight', 'bold')
		.attr('transform', weightLabelTranslation);
}

const minAge = 18; //10 actually
const maxAge = 35; //97 actually
const minWeight = 25; 
const maxWeight = 200; //214 actually
const minHeight = 127;
const maxHeight = 220; // 227 actually
const minBMI = 15; // 8 actually (wtf?)
const maxBMI = 40; //60 actually

const ageGreen = d3.color('hsl(94, 38%, 50%)');
const brownHeight = d3.color('hsl(11, 56%, 66%)');
const purpleWeight = d3.color('hsl(274, 44%, 65%)');

const lightGreen = d3.color('hsl(94, 38%, 70%)');
const darkGreen = d3.color('hsl(94, 38%, 30%)');

whenDocumentLoaded(() => {

	
 
	// create the results array	
	resArray = [];

	
	createResultArray(resArray);

	// find selectors, both in d3 or basic JS selection
	const sportSelD3 = d3.select('#sport_selector');
	const sportSel = document.getElementById('sport_selector');
	const eventSelD3 = d3.select('#event_selector');
	const eventSel = document.getElementById('event_selector');


	// update events selection list given change in sports selection list
	sportSel.addEventListener("change", () => {
		const selectedSport = sportSel.value
		updateEventOptions(eventSelD3, selectedSport);
	});
	

	// add svg text that describes the mean athlete in the selected sport and event
	button = document.getElementById('btn');
	button.addEventListener('click', () => {

		const sport = sportSel.value;
		const event = eventSel.value;

		const ath = averageAthlete(1992, 2016, sport, event, resArray)

		d3.select("#sport_disp")
		.text("Sport : " + ath.sport);

		d3.select("#event_disp")
		.text("Event : " + ath.event);

		d3.select("#years_disp")
		.text("From years : " + ath.start_year + " - " + ath.end_year);

		d3.select("#samples_disp")
		.text("Number of samples : " + ath.nb_samples);

		d3.select("#age_disp")
		.text("Mean age : " + ath.age);

		d3.select("#height_disp")
		.text("Mean height : " + ath.height);

		d3.select("#weight_disp")
		.text("Mean weight : " + ath.weight);

		const svg3d = d3.select('#display');

		//drawAthlete(ath, svg3d, 200, 0, 0)
	
		svg = d3.select('#display');
	
		//const ath = new Athlete(2012, 2016, 1, 22, 200, 134, 'sport', 'event');
	
		drawAthleteDescription(ath, svg, 0, 0, lightGreen, darkGreen);
		
	});
	


	//svg = d3.select('#display');

	//const ath = new Athlete(2012, 2016, 1, 22, 190, 90, 'sport', 'event');

	//drawAthleteDescription(ath, svg, 0, 0);


});