// set the dimensions and margins of the graph
var margin = {top: 15, right: 30, bottom: 50, left: 90},
	width = 700 - margin.right - margin.left;
	height = 360 - margin.top - margin.bottom;

var chartHeight = 100;
var chartWidth = 600;

// append the svg object to the body of the page
var svgChart1 = d3.select("#chart1")
	.append("svg")
	.attr("width", chartWidth + margin.left + margin.right)
	.attr("height", chartHeight + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")")

var svgChart2 = d3.select("#chart2")
	.append("svg")
	.attr("width", chartWidth + margin.left + margin.right)
	.attr("height", chartHeight + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")")

var svgChart3 = d3.select("#chart3")
	.append("svg")
	.attr("width", chartWidth + margin.left + margin.right)
	.attr("height", chartHeight + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")")


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

	//reset chart
	svgChart1.selectAll("g").remove();
	svgChart1.selectAll("text").remove();
	svgChart1.selectAll("path").remove();

	svgChart2.selectAll("g").remove();
	svgChart2.selectAll("text").remove();
	svgChart2.selectAll("path").remove();

	svgChart3.selectAll("g").remove();
	svgChart3.selectAll("text").remove();
	svgChart3.selectAll("path").remove();


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

	//compute avg per year
	let heightGroupByYear = d3.nest()
		.key(function(d){return d.year; }) //NB: use "d.year", not "year"
		.rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
		.entries(data_f);

	let weightGroupByYear = d3.nest()
		.key(function(d){return d.year; }) //NB: use "d.year", not "year"
		.rollup(function(v) { return d3.mean(v, function(d) { return d.weight; }); })
		.entries(data_f);

	let ageGroupByYear = d3.nest()
		.key(function(d){return d.year; }) //NB: use "d.year", not "year"
		.rollup(function(v) { return d3.mean(v, function(d) { return d.age; }); })
		.entries(data_f);

	//sort containers for graphs
	heightGroupByYear.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	}).forEach(d => console.log(d.key + " : " + d.value));
	weightGroupByYear.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	}).forEach(d => console.log(d.key + " : " + d.value));
	ageGroupByYear.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	}).forEach(d => console.log(d.key + " : " + d.value));


	// require type -> 0 -> weight, 1->  height, 2-> age
	startChart(svgChart1, heightGroupByYear, 1);
	startChart(svgChart2, weightGroupByYear, 0);
	startChart(svgChart3, ageGroupByYear, 2);


	return new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);
}


function startChart(svg_, data, type) {
	// Add X axis --> it is a date format

	var x = d3.scaleLinear()
		.domain(d3.extent(data_f, function(d) { return d.year; }))
		.range([ 0, width ])
	svg_.append("g")
		.attr("transform", "translate(0," + (chartHeight)  + ")")
		.call(d3.axisBottom(x).tickSize(-chartHeight).tickFormat(d3.format("d")))
		.select(".domain").remove()

	// Add Y axis
	var y;


	var lineColor;
	switch(type) {
		case 0:
			// weight
			lineColor = "#CC0000"
			// Y axis label:
			svg_.append("text")
				.attr("text-anchor", "end")
				.attr("transform", "rotate(-90)")
				.attr("y", -margin.left + 20)
				.attr("x", -margin.top - chartHeight/2 +60)
				.text("Average Weight")
			y = d3.scaleLinear()
				.domain([d3.min(data_f, function(d) {return d.weight}),d3.max(data_f, function (d){return d.weight})])
				.range([ chartHeight, 0 ]);


			break;
		case 1:
			//height
			lineColor = "#0000CC";
			y = d3.scaleLinear()
				.domain([d3.min(data_f, function(d) {return d.height}),d3.max(data_f, function (d){return d.height})])
				.range([ chartHeight, 0 ]);


			// Y axis label:
			svg_.append("text")
				.attr("text-anchor", "end")
				.attr("transform", "rotate(-90)")
				.attr("y", -margin.left + 20)
				.attr("x", -margin.top - chartHeight/2 +60)
				.text("Average Height")

			break;
		case 2:
			//age
			lineColor = "#00CC00";
			y = d3.scaleLinear()
				.domain([d3.min(data_f, function(d) {return d.age}),d3.max(data_f, function (d){return d.age})])
				.range([ chartHeight, 0 ]);

			// Y axis label:
			svg_.append("text")
				.attr("text-anchor", "end")
				.attr("transform", "rotate(-90)")
				.attr("y", -margin.left + 20)
				.attr("x", -margin.top - chartHeight/2 +60)
				.text("Average Age")

			break;
	}


	svg_.append("g")
		.attr("transform", "translate(-15,0)")
		.call(d3.axisLeft(y).tickSize(-chartWidth * 1.02).tickFormat(d3.format("d")));

	// Customization
	svg_.selectAll(".tick line").attr("stroke", "#C0C0C0")

	// Add the line
	svg_.append("path")
		.datum(data)
		.attr("fill", "none")
		.attr("stroke", lineColor)
		.attr("stroke-width", 3)
		.attr("d", d3.line()
			.x(function(d) { return x(d.key) })
			.y(function(d) { return y(d.value) })
		)

	// Add the points
	svg_
		.append('g')
		.selectAll("dot")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d) { return x(d.key) } )
		.attr("cy", function(d) { return y(d.value) } )
		.attr("r", 3)
		.attr("fill", "#000000");



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

function drawAthleteDescription(athlete, svgContainer, xOffset, yOffset){
	svgContainer.selectAll('#ageAxisGroup').remove();
	svgContainer.selectAll('#labelsGroup').remove();

	svgHeight = parseInt(svgContainer.style("height"));
	svgWidth = parseInt(svgContainer.style("width"));

	// create gradient for age axis
	if(svgContainer.select('defs').empty()){
		var svgDefs = svgContainer.append('defs');
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
	//const weightAxisGroup = svgContainer.append("g").attr('id', 'weightAxisGroup');
	const ageAxisGroup = svgContainer.append("g").attr('id', 'ageAxisGroup');
	const labelsGroup = svgContainer.append("g").attr('id', 'labelsGroup');

	const slowAnim = 1500; const midAnim = 900; const fastAnim = 600;


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
		
	const athleteHeightLine = [
		{'class' : 'athleteHeightLine', "x1":  xLeft, "y1":  heightAxisScale(athlete.height), "x2": xRight, "y2": heightAxisScale(athlete.height)} // athlete height line
	];

	const heightLabel = [
		{'y': heightAxisScale(athlete.height) - 3, 'content': athlete.height.toFixed(1) + 'cm'}
	];

	let prevHeight = -1;

	if (svgContainer.select("#heightGroup").empty()) {

		svgContainer.append("g")
			.attr('id', 'heightGroup')
			.append("g")
		.attr("transform", d3Transform().translate([xLeft, 0])) 
		.call(axisGenerator);	

	} else {
		prevHeight = svgContainer.select("#heightGroup").select(".label").text().slice(0, -2);
	}

	const up = prevHeight < athlete.height;
	
	const labelDuration= up ? fastAnim : slowAnim;
	const lineDuration = midAnim;
	const athleteDuration = up ? slowAnim : fastAnim;

	const heightGroup = svgContainer.select("#heightGroup");

	const u_heightLabel = heightGroup.selectAll(".label")
		.data(heightLabel);

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

	u_heightLabel.transition()
		.duration(labelDuration)
		.attr('y', (d) => d.y)
		// use of tweeing for the height label, can't interpolate automatically
		.tween('text', function() {				
			const self = this;
			const currentValue = this.textContent.slice(0, -2);
			const i = d3.interpolate(currentValue, athlete.height);
			return function(t) {
				self.textContent = i(t).toFixed(1) + 'cm';
			};
		});

	const u_athleteHeightLine = heightGroup.selectAll(".athleteHeightLine")
		.data(athleteHeightLine);

	u_athleteHeightLine.enter()
		.append('line')
		.attr('class',(d,i) => {return d.class;})
		.attr('x1', (d,i) => {return d.x1})
		.attr('y1', (d,i) => {return d.y1})
		.attr('x2', (d,i) => {return d.x2})
		.attr('y2', (d,i) => {return d.y2})
		.style('stroke', 'black')
		.style('stroke_width', 1);
	
	u_athleteHeightLine.transition()
		.duration(lineDuration)
		.attr('y1', (d,i) => {return d.y1})
		.attr('y2', (d,i) => {return d.y2});
	
	athDraw = drawAthlete(athlete, svgContainer, axisBottom-axisTop, 0, axisBottom - svgHeight, athleteDuration);

	// ****************************** weight axis ******************************
	const verticalPadding = 20;
	const radius = 0.8 * (xRight - xLeft) / 2;
	const arcCenterX = 0.5 * svgWidth;
	const arcCenterY = axisTop - verticalPadding;

	const weightAxisScale = d3.scaleLinear()
		.domain([0, maxWeight])
		.range([0, Math.PI]);

	if (svgContainer.select("#weightGroup").empty()) {

		const weightGroup = svgContainer.append("g")
			.attr('id', 'weightGroup')

		var arcTranslation = d3Transform()
			.translate([arcCenterX, arcCenterY])
	 
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
	
		const ticksArc = [
			{"tick": 0, 'xshift':1, 'yshift':3},
			{"tick": 50, 'xshift':1, 'yshift':8},
			{"tick": 100, 'xshift':-9, 'yshift':9},
			{"tick": 150, 'xshift':-17, 'yshift':8},
			{"tick": 200, 'xshift':-18, 'yshift':3},
		];
 
		const ticksArcLength = radius * 0.1;
	
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

		weightGroup.append('circle')
			.attr('cx', arcCenterX)
			.attr('cy', arcCenterY)
			.attr('r', 2)
			.attr('fill', 'black');
	}

	const weightGroup = svgContainer.select('#weightGroup');

	const arrowLength = radius * 1;
	const athleteWeightLine = [
		{'class': 'athleteWeightLine',
		'x1': arcCenterX, 
		'y1': arcCenterY, 
		'x2': arcCenterX - Math.cos(weightAxisScale(athlete.weight)) * arrowLength, 
		'y2': arcCenterY - Math.sin(weightAxisScale(athlete.weight)) * arrowLength}
	];

	const u_athleteWeightLine = weightGroup.selectAll(".athleteWeightLine")
		.data(athleteWeightLine);

	u_athleteWeightLine.enter()
		.append('line')
		.attr('class', (d) => {return d.class})
		.attr('x1', (d) => {return d.x1})
		.attr('y1', (d) => {return d.y1})
		.attr('x2', (d) => {return d.x2})
		.attr('y2', (d) => {return d.y2})
		.style('stroke', 'black')
		.style('stroke-width', 2);
	
	u_athleteWeightLine.transition()
		.duration(slowAnim)
		.attr('x2', (d) => {return d.x2})
		.attr('y2', (d) => {return d.y2})

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

	const weightLabel = [
			{'class': 'label', 'content': athlete.weight.toFixed(1)}
	];

	const u_weightLabel = weightGroup.selectAll(".label")
		.data(weightLabel);

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

}


//******************** SMALL MULTIPLES******************** 

function createButton(SM,svg,index){
	//creation of the button, inspired from:
	//https://bl.ocks.org/Lulkafe/95a63ddea80d4d02cc4ab8bedd48dfd8
	var size_button = 30, 
	x = 0,
	y = 0,
	rx = 4,
	ry = 4,
	crossStrokeWidth = 3;

    var crossStyle = {
        "stroke-width": crossStrokeWidth,
        "stroke": "black"
    },
    r = size_button / 2,
    ofs = size_button / 6,
    cross,
    g;

    g = svg.append("g").on("click", function(){SM.remove(index);});
    cross = g.append("g")

    g.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("rx", rx)
		.attr("ry", ry)
		.attr("width", size_button)
		.attr("height", size_button)
		.attr("fill-opacity", 0);
 

    cross.append("line")
    	.attr("x1", x + ofs)
        .attr("y1", y + ofs)
        .attr("x2", (x + size_button) - ofs)
        .attr("y2", (y + size_button) - ofs)
		.attr("stroke-width", crossStrokeWidth)
		.attr("stroke", "black");

    cross.append("line")
        .attr("x1", (x + size_button) - ofs)
        .attr("y1", y + ofs)
        .attr("x2", x + ofs)
        .attr("y2", (y + size_button) - ofs)
		.attr("stroke-width", crossStrokeWidth)
		.attr("stroke", "black");


}

//add some text below the drawing of the athlete 
function createTextAthlete(svg,athlete) {
	var sport = svg.append("g");

	sport.append("text")
		.attr("x",5)
		.attr("y",50)
		.text(athlete.sport)
		.attr("font-family","sans-serif")
		.attr("font-size",10);

	var event = svg.append("g");

	event.append("text")
		.attr("x",5)
		.attr("y",70)
		.text(athlete.event)
		.attr("font-family","sans-serif")
		.attr("font-size",10);
}


//Create a small multiple frame
function createSMFrame(SM,athlete,svg,index){
	//Create de button
	createButton(SM,svg,index);

	//Add some information about the athlete
	createTextAthlete(svg,athlete);

	//Add Athlete
	drawAthlete(athlete, svg, 150, 10, -20, 0);
}

// represents the small multiples
class Small_multiples {
	constructor(number_SM) {
		this.cursor = 0;
		this.number_SM = number_SM;
		this.athletes = [];

	}

	//add an athlete to the SM
	//if it is already full it is FIFO
	add(athlete){
		//add the element in the first position
		this.athletes.unshift(athlete);

		if(this.cursor == this.number_SM){
			//it means the array is full, so last element is popped
			this.athletes.pop();
		} else {
			this.cursor = this.cursor + 1;
		}

		//Refresh the visualization
		this.refresh_SM();
	}

	//remove an athlete at a given index
	remove(index) {
		this.athletes.splice(index,1);
		this.cursor = this.cursor -1;
		this.refresh_SM();
	}

	refresh_SM(){
		//display all element from the athletes array
		var i;
		for (i=0;i<this.number_SM;i++){
			let svg = d3.select("#elem_"+i);
			svg.selectAll("*").remove();
			if(i < this.cursor){
				createSMFrame(this,this.athletes[i],svg,i);
			}
		}
	}

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

	SM = new Small_multiples(8);

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
		SM.add(ath)
	});
	


	//svg = d3.select('#display');

	//const ath = new Athlete(2012, 2016, 1, 22, 190, 90, 'sport', 'event');

	//drawAthleteDescription(ath, svg, 0, 0);


});


