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
/** Either draw a new athlete at the bottom of an SVG container or update the one that already exists with animation.
 * @param  {} athlete 
 * @param  {} svgContainer
 * @param  {} maxFigureHeight the maximum drawing height in the SVG
 * @param  {} xOffset control the relative x position of the drawing
 * @param  {} yOffset control the relative x position of the drawing
 * @param  {} animDuration control the animation duration if there is already an athlete
 */
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

	// if no athlete drawing, create one and append the transform
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
	
	// animate the ellispis if they already exist
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

/** Either draw the full description of an athlete in the center of the SVG, or update the one that already exists in the container.
 * @param  {} athlete
 * @param  {} svgContainer
 * @param  {} xOffset relative x postition
 * @param  {} yOffset relative y position 
 */
function drawAthleteDescription(athlete, svgContainer, xOffset, yOffset){

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

	// constants for the animation duration
	const slowAnim = 1500; const midAnim = 900; const fastAnim = 600;

	// controls the space of the drawing in the SVG
	const xFactor = 0.28;
	const xLeft = xFactor * svgWidth;
	const xRight = (1 - xFactor) * svgWidth;
	const axisBottom = 0.8 * svgHeight;
	const axisTop = 0.3 * svgHeight;

	// ******************************************* HEIGHT *******************************************

	const heightAxisScale = d3.scaleLinear()
		.domain([0, maxHeight])	
		.range([axisBottom, axisTop]);
	
	// height axis
	const axisGenerator = d3.axisLeft(heightAxisScale);
	axisGenerator.ticks(4);
	axisGenerator.tickValues([50,100,150,200]);

	// height line at the top of the athlete
	const athleteHeightLine = [
		{'class' : 'athleteHeightLine',
		 "x1":  xLeft, "y1":  heightAxisScale(athlete.height), 
		 "x2": xRight, "y2": heightAxisScale(athlete.height)}
	];

	// label on top of the height line
	const heightLabel = [
		{'y': heightAxisScale(athlete.height) - 3, 'content': athlete.height.toFixed(1) + 'cm'}
	];

	let prevHeight = -1;

	// if no description yet, append the height axis
	if (svgContainer.select("#heightGroup").empty()) {

		svgContainer.append("g")
			.attr('id', 'heightGroup')
			.append("g")
			.attr("transform", d3Transform().translate([xLeft, 0])) 
			.call(axisGenerator);	

	} else {
		prevHeight = svgContainer.select("#heightGroup").select(".label").text().slice(0, -2);
	}

	// control which of the athlete, the line or the label moves first
	const up = prevHeight < athlete.height;
	const labelDuration= up ? fastAnim : slowAnim;
	const lineDuration = midAnim;
	const athleteDuration = up ? slowAnim : fastAnim;

	const heightGroup = svgContainer.select("#heightGroup");

	const u_athleteHeightLine = heightGroup.selectAll(".athleteHeightLine").data(athleteHeightLine);

	// append the height line
	u_athleteHeightLine.enter()
		.append('line')
		.attr('class',(d,i) => {return d.class;})
		.attr('x1', (d,i) => {return d.x1})
		.attr('y1', (d,i) => {return d.y1})
		.attr('x2', (d,i) => {return d.x2})
		.attr('y2', (d,i) => {return d.y2})
		.style('stroke', 'black')
		.style('stroke_width', 1);
	
	// animate the height line
	u_athleteHeightLine.transition()
		.duration(lineDuration)
		.attr('y1', (d,i) => {return d.y1})
		.attr('y2', (d,i) => {return d.y2});
	
	const u_heightLabel = heightGroup.selectAll(".label").data(heightLabel);

	// append the height label
	u_heightLabel.enter()	
		.append('text')
		.attr('class', 'label')
		.attr('x', xRight)
		.attr('y', (d) => d.y)
		.attr('text-anchor', 'end')
		.text((d) => d.content)
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr("fill", "black")
		.attr('font-weight', 'bold');

	// animate the height label
	u_heightLabel.transition()
		.duration(labelDuration)
		.attr('y', (d) => d.y)
		.tween('text', function() {				
			const self = this;
			const currentValue = this.textContent.slice(0, -2);
			const i = d3.interpolate(currentValue, athlete.height);
			return function(t) {
				self.textContent = i(t).toFixed(1) + 'cm';
			};
		});

	// draw the athlete
	drawAthlete(athlete, svgContainer, axisBottom-axisTop, 0, axisBottom - svgHeight, athleteDuration);

	// ******************************************* WEIGHT *******************************************

	const weightPadding = 20; // padding between height groupe and weight group
	const radius = 0.8 * (xRight - xLeft) / 2; // radius of the weight axis
	const arcCenterX = 0.5 * svgWidth; 
	const arcCenterY = axisTop - weightPadding;

	const weightAxisScale = d3.scaleLinear()
		.domain([0, maxWeight])
		.range([0, Math.PI]);

	// if no description yet, append the weight axis 
	if (svgContainer.select("#weightGroup").empty()) {

		const weightGroup = svgContainer.append("g").attr('id', 'weightGroup')

		var arcTranslation = d3Transform().translate([arcCenterX, arcCenterY])
	 
		// half circle with a stroke 
		var arc = d3.arc()
			.innerRadius(radius-0.1) // so that it looks like a stroke
			.outerRadius(radius)
			.startAngle(-Math.PI/2)
			.endAngle(Math.PI/2)
 
		weightGroup.append("path")
			.attr("d", arc)
			.attr("fill", 'black')
			.attr("fill-opacity", 0)
			.attr("transform", arcTranslation)
			.style('stroke', 'black')
			.style('stroke-width', 1);
		
		// ticks label, shifted manually so that it looks nice
		const ticksArc = [
			{"tick": 0, 'xshift':1, 'yshift':3},
			{"tick": 50, 'xshift':1, 'yshift':8},
			{"tick": 100, 'xshift':-9, 'yshift':9},
			{"tick": 150, 'xshift':-17, 'yshift':8},
			{"tick": 200, 'xshift':-18, 'yshift':3},
		];
 
		const ticksArcLength = radius * 0.1;
	
		// append the ticks
		weightGroup.selectAll("line")
			.data(ticksArc)
			.enter()
			.append('line')
			.attr('x1', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * radius})
			.attr('y1', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * radius})
			.attr('x2', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * (radius-ticksArcLength)})
			.attr('y2', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * (radius-ticksArcLength)})
			.style('stroke', 'black')
			.style('stroke-width', 1);	
	
		// append the ticks label
		weightGroup.selectAll("text")
			.data(ticksArc)
			.enter()
			.append('text')
			.attr('x', (d,i) => {return arcCenterX - Math.cos(weightAxisScale(d.tick)) * (radius-ticksArcLength) + d.xshift})
			.attr('y', (d,i) => {return arcCenterY - Math.sin(weightAxisScale(d.tick)) * (radius-ticksArcLength) + d.yshift})
			.text((d,i) => {return d.tick})
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "black")

		// append the middle circle
		weightGroup.append('circle')
			.attr('cx', arcCenterX)
			.attr('cy', arcCenterY)
			.attr('r', 2)
			.attr('fill', 'black');
	}

	const weightGroup = svgContainer.select('#weightGroup');

	// athlete weight line
	const arrowLength = radius * 1;
	const athleteWeightLine = [
		{'class': 'athleteWeightLine',
		'x1': arcCenterX, 
		'y1': arcCenterY, 
		'x2': arcCenterX - Math.cos(weightAxisScale(athlete.weight)) * arrowLength, 
		'y2': arcCenterY - Math.sin(weightAxisScale(athlete.weight)) * arrowLength}
	];

	const u_athleteWeightLine = weightGroup.selectAll(".athleteWeightLine").data(athleteWeightLine);

	// append weight line
	u_athleteWeightLine.enter()
		.append('line')
		.attr('class', (d) => {return d.class})
		.attr('x1', (d) => {return d.x1})
		.attr('y1', (d) => {return d.y1})
		.attr('x2', (d) => {return d.x2})
		.attr('y2', (d) => {return d.y2})
		.style('stroke', 'black')
		.style('stroke-width', 2);
	
	// animate weight line
	u_athleteWeightLine.transition()
		.duration(slowAnim)
		.attr('x2', (d) => {return d.x2})
		.attr('y2', (d) => {return d.y2})

	// distance between the weight circle and the center of the label text
	const paddingFromCircle = 12
	const weightLabelTranslation = d3Transform()
		.translate([
			arcCenterX - Math.cos(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle),
			arcCenterY - Math.sin(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle)]);

	const weightLabel = [{'class': 'label', 'content': athlete.weight.toFixed(1)}];

	const u_weightLabel = weightGroup.selectAll(".label").data(weightLabel);

	// append weight label
	u_weightLabel.enter()
		.append('text')
		.attr('class', (d) => {return d.class})
		.text((d) => {return d.content + 'kg'})
		.attr('dominant_baseline', 'middle')
		.attr('text-anchor', 'middle')
		.attr("fill", "black")
		.attr("font-family", "sans-serif")
		.attr("font-size", "11px")
		.attr('font-weight', 'bold')
		.attr('transform', weightLabelTranslation);

	// animate weight label
	u_weightLabel.transition()
		.duration(slowAnim)
		.attr('transform', weightLabelTranslation)
		.tween('text', function() {				
			const self = this;
			const currentValue = this.textContent.slice(0, -2);
			const i = d3.interpolate(currentValue, athlete.weight);
			return function(t) {
				self.textContent = i(t).toFixed(1) + 'kg';
			};
		});


	// ******************************************* AGE *******************************************
	
	const ageBarHeight = 15;
	const agePadding = 15

	const ageAxisScale = d3.scaleLinear()
		.domain([minAge, maxAge])
		.range([xLeft, xRight]);

	// if no description yet, append the age rectangle with gradient
	if (svgContainer.select("#ageGroup").empty()) {

		const ageGroup = svgContainer.append("g").attr('id', 'ageGroup')

		ageGroup.append('rect')
			.attr('x', xLeft)
			.attr('y', axisBottom + agePadding)
			.attr('width', xRight - xLeft)
			.attr('height', ageBarHeight)
			.style('fill', 'url(#gradient)');

		const ticksAgeAxis = [
			{'value': minAge, 'aligned': 'end', 'xPadding': -3},
			{'value': maxAge, 'aligned': 'start', 'xPadding': 3}
		];

		ageGroup.selectAll('text')
			.data(ticksAgeAxis)
			.enter()
			.append('text')
			.attr('x', (d,i) => {return ageAxisScale(d.value) + d.xPadding})
			.attr('y', axisBottom + agePadding + 0.7 * ageBarHeight)
			.text((d,i) => {return d.value})
			.attr('text-anchor', (d,i) => {return d.aligned})
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px")
			.attr("fill", "black")
	}

	const ageGroup = svgContainer.select("#ageGroup");

	const athleteAgeLine = [{'class': 'athleteAgeLine', 'x': ageAxisScale(athlete.age)}];

	u_athleteAgeLine = ageGroup.selectAll('.athleteAgeLine').data(athleteAgeLine)

	// append age line
	u_athleteAgeLine.enter()
		.append('line')
		.attr('class', (d) => {return d.class;})
		.attr('x1', (d) => {return d.x;})
		.attr('y1', axisBottom + agePadding)
		.attr('x2', (d) => {return d.x;})
		.attr('y2', axisBottom + agePadding + ageBarHeight)
		.attr('stroke', 'black')
		.attr('stroke-width', 2);
	
	// animate age line
	u_athleteAgeLine.transition()
		.duration(slowAnim)
		.attr('x2', (d) => {return d.x;})
		.attr('x1', (d) => {return d.x;})

	const ageLabel = [{'class': 'label', 'content': athlete.age.toFixed(1)}];

	const u_ageLabel = ageGroup.selectAll(".label").data(ageLabel);

	// append age label
	u_ageLabel.enter()
		.append('text')
		.attr('class', (d) => {return d.class;})
		.attr('x', ageAxisScale(athlete.age))
		.attr('y', axisBottom + agePadding + ageBarHeight + 14)
		.text((d) => {return d.content + ' years'})
		.attr("font-family", "sans-serif")
		.attr('text-anchor', 'middle')
		.attr("font-size", "11px")
		.attr("fill", "black")
		.attr('font-weight', 'bold');

	// animate age label
	u_ageLabel.transition()
		.duration(slowAnim)
		.attr('x', ageAxisScale(athlete.age))
		.tween('text', function() {				
			const self = this;
			const currentValue = this.textContent.slice(0, -6);
			const i = d3.interpolate(currentValue, athlete.age);
			return function(t) {
				self.textContent = i(t).toFixed(1) + ' years';
			};
		});
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
const heightBrown = d3.color('hsl(11, 56%, 66%)');
const weightPurple = d3.color('hsl(274, 44%, 65%)');

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