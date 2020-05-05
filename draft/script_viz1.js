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


// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 50, left: 90},
	width = 700 - margin.right - margin.left;
	height = 360 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#chart1div")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")")



// create an average athlete that represents all athletes from a given sport, event and time window
function averageAthlete(start_year, end_year, sport, event, resArray){

	//reset chart
	svg.selectAll("g").remove();
	svg.selectAll("text").remove();

	data_f = resArray.filter(function(d){
		sameEvent = event === 'All' ? true : d.event === event;
		sameSport = d.sport === sport;
		btwYear = d.year >= start_year && d.year <= end_year;
		return sameEvent && sameSport && btwYear;
	});

	const mean_age = d3.mean(data_f, function(d) { return d.age; });
	const mean_weight = d3.mean(data_f, function(d) { return d.weight; });
	const mean_height = d3.mean(data_f, function(d) { return d.height; });
	const nb_samples = data_f.length;


	// Add X axis --> it is a date format
	var x = d3.scaleTime()
		.domain(d3.extent(data_f, function(d) { return d.year; }))
		.range([ 0, width ]);
	svg.append("g")
		.attr("transform", "translate(0," + (height+5)  + ")")
		.call(d3.axisBottom(x).tickSize(-height * 1.1))
		.select(".domain").remove()


	// Add Y axis
	var y = d3.scaleLinear()
		.domain([d3.min(data_f, function(d) {return d.height}),d3.max(data_f, function (d){return d.height})])
		.range([ height, 0 ]);
	svg.append("g")
		.attr("transform", "translate(-15,0)")
		.call(d3.axisLeft(y).tickSize(-width * 1.1))
		.select(".domain").remove()

	// Add X axis label:
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("x", width/2 + margin.left  )
		.attr("y", height + margin.bottom)
		.text("Year of event");

	// Y axis label:
	svg.append("text")
		.attr("text-anchor", "end")
		.attr("transform", "rotate(-90)")
		.attr("y", -margin.left + 20)
		.attr("x", -margin.top - height/2 +60)
		.text("Average Height")

	//compute avg per year
	let groupByYear = d3.nest()
		.key(function(d){return d.year; }) //NB: use "d.year", not "year"
		.rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
		.entries(data_f);

	// Customization
	svg.selectAll(".tick line").attr("stroke", "#C0C0C0")

	// Add dots
	svg.append('g')
		.selectAll("dot")
		.data(groupByYear)
		.enter()
		.append("circle")
		.attr("cx", function (d) { return x(d.key); } )
		.attr("cy", function (d) { return y(d.value); } )
		.attr("r", 4.5)
		.style("fill", "#8B0000")

	return new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);
}

// add the given list of sports as options to the given selection list (in d3), remove all previous options
function addSportOptions(sportSel, sports){
	sportSel.selectAll('option').remove();
	sportSel.selectAll('option')
		.data(['None'].concat(sports)) // add None field 
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
		.data(['None', 'All'].concat(events_unique)) // add None and All field
		.enter()
		.append('option')
		.text(function(d) {
			return d;
		})
		.attr("value", function(d) {
			return d;
		});
}


whenDocumentLoaded(() => {

	// create the results array
	resArray = [];
	createResultArray(resArray);

	const svg = d3.select("#display");

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


	// add svg text that describes the mean athletes in the selected sport and event
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
	});
});


