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
function drawAthlete(athlete, svgContainer, maxFigureHeight, xOffset, yOffset){

	// remove last athlete draw
	svgContainer.selectAll('g').remove();

	// to be tuned, control the scales
	const minAge = 10;
	const maxAge = 97;
	const minWeight = 25;
	const maxWeight = 214;
	const minHeight = 127;
	const maxHeight = 226;
	const minBMI = 8;
	const maxBMI = 64

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
	const lightGreen = d3.color('hsl(94, 60%, 70%)');
	const darkGreen = d3.color('hsl(94, 60%, 30%)');
	
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


	const ellipses = [
		{"cx":  0, "cy":  bodyYPos, "rx": bmiScale(bmi), "ry": bodyHeight, "rotation": 0}, // body
		{"cx":  0, "cy":  headYPos, "rx": headSize, "ry": headSize, "rotation": 0}, // head
		{"cx":  armXPos + armWeightOffset, "cy":  armYPos, "rx": armLength, "ry": armWidth, "rotation": 0}, // right arm
		{"cx":  -armXPos - armWeightOffset, "cy":  armYPos, "rx": armLength, "ry": armWidth, "rotation": 0}, // left arm
		{"cx":  legXPos + armWeightOffset/2, "cy":  0, "rx": legWidth, "ry": legLength, "rotation": -legAngle}, // right leg
		{"cx":  -legXPos - armWeightOffset/2, "cy":  0, "rx": legWidth, "ry": legLength, "rotation": legAngle}, // left leg
	];

	const gEllipsis = svgContainer.append('g');
	
	const ellipsis = gEllipsis.selectAll("ellipse")
		.data(ellipses)
		.enter()
		.append("ellipse")
    	.attr("cx", (d,i) => { return d.cx; })
    	.attr("cy", (d,i) => { return d.cy - legHeight/2 - 1; }) // so that the legs are at the bottom of the svg, -1 to be sure it is not cropped
    	.attr("rx", (d,i) => { return d.rx/2; })
		.attr("ry", (d,i) => { return d.ry/2; })
		.attr('transform', (d,i) => { return "rotate(" + d.rotation + ")"})
		.attr('fill', ageScale(athlete.age));


	// Transforms
	const xTranslation = xOffset + parseInt(svgContainer.style("width"))/2;
	const yTranslation = yOffset + parseInt(svgContainer.style("height"));
	const translation = "translate(" + xTranslation + ',' + yTranslation + ")";

	const scalingFactor = scalingToMaxHeight * heightScale(athlete.height)	
	const scaling = 'scale(' + scalingFactor + ')';

	gEllipsis
		.attr('transform', (d,i) => { return translation + ' ' + scaling });
		

}


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

		drawAthlete(ath, svg3d, 200, 0, 0)
		
	});
});