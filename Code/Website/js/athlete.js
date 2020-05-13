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

// set the dimensions and margins of the graph
var margin = {top: 15, right: 30, bottom: 50, left: 90},
	width = 700 - margin.right - margin.left;
	height = 360 - margin.top - margin.bottom;

var chartHeight = 50;
var chartWidth = 400;

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