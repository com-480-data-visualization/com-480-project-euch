function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// DOMContentLoaded already fired
		action();
	}
}

// represents an olympic result
class Result {
	constructor(age, height, weight, sport, event, event_sex, event_w_sex, year) {
		this.age = age;
		this.height = height;
		this.weight = weight;
		this.sport = sport;
		this.event = event;
		this.event_sex = event_sex;
		this.event_w_sex = event_w_sex;
		this.year = year;
	}
}

// store the results, add unique sports as option to the sports selection list
function createResultArray(resArray) {
	d3.csv("../data/athlete_events_red.csv", function(d) {

		// add eash row to resArray and return the sport feature only
		resArray.push(new Result(+d["Age"], +d["Height"], +d["Weight"], d.Sport, d.Event_w_sport, d.Event_sex, d.Event_w_sex, +d["Year"]));
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

// add the given list of sports as options to the given selection list (in d3), remove all previous options
function addSportOptions(sportSel, sports){
	sportSel.selectAll('option').remove();
	sportSel.selectAll('option')
		.data(['None'].concat(sports.sort()))
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

	SM = new Small_multiples(5);
	const ath0 = new Athlete(0, 0, 1, 18, 0.01, 0, '0', '0');

	svg = d3.select('#display');

	drawAthleteDescription(ath0, svg, 0, 0, lightGreen, darkGreen);

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
	


	//Buttons of filter
	
	//remove all elements of SM
	document.getElementById('remove_all')
		.addEventListener('click',() => {SM.removeAll();});
	

	//sorted by selector
	document.getElementById('sort_selector').addEventListener("change", () => {
		SM.sort(sort_selector.value,"");
	});


	//ascending selector
	document.getElementById('asc_selector').addEventListener("change", () => {
		SM.sort("",asc_selector.value == "ascending");
	});



	//add button, may write an error
	error = document.getElementById("error_message");
	document.getElementById('add_btn')
		.addEventListener('click',() => {
			const sport = sportSel.value;
			const event = eventSel.value;
			if(SM.isFull()){
				error.innerHTML = "The small multiples is Full. Please remove an element";
			} else if(sport == "None") {
				error.innerHTML = "Please select a sport to add in the small multiples.";
			} else {
				error.innerHTML = "";
				let ath = averageAthlete(1992, 2016, sport, event, resArray);
				SM.add(ath);
				drawAthleteDescription(ath, svg, 0, 0, lightGreen, darkGreen);
			}
			});


	// add svg text that describes the mean athlete in the selected sport and event
	button = document.getElementById('select_btn');
	button.addEventListener('click', () => {

		error.innerHTML = "";

		const sport = sportSel.value;
		const event = eventSel.value;

		let ath = averageAthlete(1992, 2016, sport, event, resArray)

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
	
		//const ath = new Athlete(2012, 2016, 1, 22, 200, 134, 'sport', 'event');
	
		if(ath.nb_samples == 0){
			ath = ath0
		}
		drawAthleteDescription(ath, svg, 0, 0, lightGreen, darkGreen);
	});
	


	//svg = d3.select('#display');

	//const ath = new Athlete(2012, 2016, 1, 22, 190, 90, 'sport', 'event');

	//drawAthleteDescription(ath, svg, 0, 0);


});