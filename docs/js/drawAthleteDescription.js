/** Either draw the full description of an athlete in the center of the SVG, or update the one that already exists in the container.
 * @param  {} athlete
 * @param  {} svgContainer
 * @param  {} xOffset relative x postition
 * @param  {} yOffset relative y position 
 */
function drawAthleteDescription(ath, svgContainer, xOffset, yOffset){

	let athlete = ath
	if(athlete.nb_samples == 0){
		athlete = ath0
	}

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
	const xFactor = 0.23;
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
		.attr("font-family", 'Arial, Helvetica, sans-serif')
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

	const weightPadding = 10; // padding between height groupe and weight group
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
			{"tick": 200, 'xshift':-18, 'yshift':3}
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
		'angle': weightAxisScale(athlete.weight)}
	];

	const u_athleteWeightLine = weightGroup.selectAll(".athleteWeightLine").data(athleteWeightLine);

	// append weight line
	u_athleteWeightLine.enter()
		.append('line')
		.attr('class', (d) => {return d.class})
		.attr('x1', (d) => {return d.x1})
		.attr('y1', (d) => {return d.y1})
		.attr('x2', (d) => {return arcCenterX - Math.cos(d.angle) * arrowLength})
		.attr('y2', (d) => {return arcCenterY - Math.sin(d.angle) * arrowLength})
		.attr('last_angle', d => d.angle)
		.style('stroke', 'black')
		.style('stroke-width', 2);
	
	// animate weight line
	u_athleteWeightLine.transition()
		.duration(slowAnim)
		.attrTween('y2', function(d) {				
			const self = this;
			const i = d3.interpolate(this.attributes.last_angle.value, d.angle);			
			return function(t) {
				return arcCenterY - Math.sin(i(t)) * arrowLength;
			};
		})
		.attrTween('x2', function(d) {				
			const self = this;
			const i = d3.interpolate(this.attributes.last_angle.value, d.angle);			
			return function(t) {
				return arcCenterX - Math.cos(i(t)) * arrowLength;
			};
		})
		.attr('last_angle', d => d.angle);

	// distance between the weight circle and the center of the label text
	const paddingFromCircle = 17
	const weightLabelTranslation = d3Transform()
		.translate([
			arcCenterX - Math.cos(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle),
			arcCenterY - Math.sin(weightAxisScale(athlete.weight)) * (radius + paddingFromCircle)]);

	const weightLabel = [{'class': 'label', 'content': athlete.weight.toFixed(1), 'angle' : weightAxisScale(athlete.weight)}];

	const u_weightLabel = weightGroup.selectAll(".label").data(weightLabel);

	// append weight label
	u_weightLabel.enter()
		.append('text')
		.attr('class', (d) => {return d.class})
		.text((d) => {return d.content + 'kg'})
		.attr('dominant_baseline', 'middle')
		.attr('text-anchor', 'middle')
		.attr("fill", "black")
		.attr("font-size", "11px")
		.attr('font-weight', 'bold')
		.attr('x', d => arcCenterX - Math.cos(d.angle) * (radius + paddingFromCircle) )
		.attr('y', d => arcCenterY - Math.sin(d.angle) * (radius + paddingFromCircle) )
		.attr('last_angle', d => d.angle)

	// animate weight label
	u_weightLabel.transition()
		.duration(slowAnim)
		.tween('text', function() {				
			const self = this;
			const currentValue = this.textContent.slice(0, -2);
			const i = d3.interpolate(currentValue, athlete.weight);
			return function(t) {
				self.textContent = i(t).toFixed(1) + 'kg';
			};
		})
		.attrTween('y', function(d) {				
			const self = this;
			const i = d3.interpolate(this.attributes.last_angle.value, d.angle);			
			return function(t) {
				return arcCenterY - Math.sin(i(t)) * (radius + paddingFromCircle);
			};
		})
		.attrTween('x', function(d) {				
			const self = this;
			const i = d3.interpolate(this.attributes.last_angle.value, d.angle);			
			return function(t) {
				return arcCenterX - Math.cos(i(t)) * (radius + paddingFromCircle);
			};
		})
		.attr('last_angle', d => d.angle);


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