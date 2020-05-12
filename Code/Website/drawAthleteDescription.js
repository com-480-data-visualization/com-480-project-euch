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