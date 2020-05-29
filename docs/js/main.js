/**
 * Call the action argument when DOM has been succesfully loaded
 * @param  {} action
 */
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// DOMContentLoaded already fired
		action();
	}
}
/**
 * Change color of ascending and descending buttons when they are pressed
 * @param  {} asc if ascending button is the one that has been pressed
 */
function change_asc_desc_selected(asc){		
	if(d3.select('#sort_selector').node().value != 'none'){
		let current = asc ? '#asc' : '#des';
		let other = asc ? '#des' : '#asc';
		const currentButton =  d3.select(current);
		const otherButton = d3.select(other);
		currentButton.classed('selected', true)
		otherButton.classed('selected', false)
	}
}

/**
 * Represent an olympic result, is used to store the entries of the dataset
 */
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
/**
 * Read the dataset, stores all the results in an array.
 * Create a map that associated event to their related sport.
 * Initialize the search bar auto-complete data.
 * @param  {} resArray stores the results
 * @param  {} sportsArray stores the diffent sports
 * @param  {} eventsMapc stores the event-sport relations
 */
function createResultArray(resArray, sportsArray, eventsMap) {
	d3.csv("data/athlete_events_red.csv", function(d) {

		// add each row to resArray and return the sport feature only
		let res = new Result(+d["Age"], +d["Height"], +d["Weight"], d.Sport, d.Event_w_sport, d.Event_sex, d.Event_w_sex, +d["Year"])
		resArray.push(res);
		//console.log(res);
		
		return {
			sport: d.Sport,
			event: d.Event_w_sport,
		};
	}).then(function(data) {		
		// for each unique sport, create an option value in the sports selection list
		const sportSel =  d3.select('#sport_selector');
		sports_unique = d3.map(data, d => d.sport).keys();
		sports_unique.forEach(sport => {			
			sportsArray.push(sport)
			data_this_sport = data.filter(row => row.sport === sport)
			events_unique = d3.map(data_this_sport, d => d.event).keys();
			events_unique.forEach(e => {
				eventsMap.set(e, sport);
			});	
		});	
		addSportOptions(sportSel, sports_unique);
	}).then(d => autocomplete(document.getElementById("search_bar"), sportsArray.concat(Array.from(eventsMap.keys()))));
}

/**
 * Update the sports dropdown menu
 * @param  {} sportSel dropdown menu container
 * @param  {} sports sports array
 */
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

/**
 * Update the events dropdown menu
 * @param  {} eventSel dropdown menu container
 * @param  {} selectedSport the selected sport, for which to displays its associated events
 */
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

/**
 * This function is responsible for constructing the average player and constructing the graphs over time
 * associated with him (weight, height, age)
 * @param sport that was selected
 * @param event that was selected
 * @returns {Athlete} the avg athlete
 */
function displayResults(sport, event) {
	// years used for avg computations are extracted from the selector in graphs.js
	start_year = avgYears[0]
	end_year = avgYears[1]

	prepareData(start_year, end_year,  sport, event, resArray)  // create data:_f data _all_years
	let ath = averageAthlete(start_year, end_year, sport, event, resArray)

	if(currSport !== "None") {
        constructCharts();
    } else  {
        resetCharts()
        initCharts()
    }

	return ath
}

/**
 * Updates vizualization using current sports and event selected
 */
function updateViz() {
	if(!loaded) return


	if(currSport !== undefined) {
		let ath = displayResults(currSport, currEvent)
		drawAthleteDescription(ath, svg, 0, 0, lightGreen, darkGreen)
	}

}

// Constants that define limits in the athlete description drawing
const minAge = 10; //10 actually
const maxAge = 45; //97 actually
const minWeight = 25; 
const maxWeight = 200; //214 actually
const minHeight = 127;
const maxHeight = 220; // 227 actually
const minBMI = 15; // 8 actually (wtf?)
const maxBMI = 35; //60 actually


// Colors 
const ageGreen = d3.color('hsl(94, 38%, 50%)');
const brownHeight = d3.color('hsl(11, 56%, 66%)');
const purpleWeight = d3.color('hsl(274, 44%, 65%)');

const lightGreen = d3.color('hsl(94, 100%, 90%)');
const darkGreen = d3.color('hsl(94, 100%, 10%)');

let start_year = 1896
let end_year = 2016

let currSport
let currEvent = "All"

let loaded = false

// default athlete
let ath0;

var currClassify

// ********************************To be executed after DOM loading ********************************

whenDocumentLoaded(() => {

	loaded = true

	// default athlete to be drawn if no data
	ath0 = new Athlete(0, 0, 1, minAge, 0.04, 0, '0', '0')

	// create the small multiple grid
	SM = new Small_multiples(5);
	SM.refresh_SM();

	// draw the athlete description with default athlete
	athlete_desc_svg = d3.select('#display');
	drawAthleteDescription(ath0, athlete_desc_svg, 0, 0, lightGreen, darkGreen);

	// fetch the data
	resArray = [];
	sportsArray = [];
	eventsMap = new Map();
	createResultArray(resArray, sportsArray, eventsMap);

	
	// initialize the selection buttons values
	const sportSelD3 = d3.select('#sport_selector');
	const sportSel = document.getElementById('sport_selector');
	const eventSelD3 = d3.select('#event_selector');
	const eventSel = document.getElementById('event_selector');


	// sport selection change listener
	sportSel.addEventListener("change", () => {
		currSport = sportSel.value;
		updateEventOptions(eventSelD3, currSport);
		currEvent = eventSel.value
		SM.unselectAll();
		let ath = displayResults(currSport, currEvent)
		drawAthleteDescription(ath, athlete_desc_svg, 0, 0, lightGreen, darkGreen);	
	});

	// event selection change listener
	eventSel.addEventListener("change", () => {
		currSport = sportSel.value;
		currEvent = eventSel.value;
		let ath = displayResults(currSport, currEvent)
		drawAthleteDescription(ath, athlete_desc_svg, 0, 0, lightGreen, darkGreen);
		SM.unselectAll();

	});
	
	// remove all button listener
	document.getElementById('remove_all')
		.addEventListener('click',() => {
						SM.removeAll();});
	

	// sort button listener
	document.getElementById('sort_selector').addEventListener("change", () => {
		if(sort_selector.value == 'none'){
			d3.select('#asc').classed('selected', false)
			d3.select('#des').classed('selected', false)
		}
		else if (!d3.select('#des').classed('selected') ){
			d3.select('#asc').classed('selected', true)
		}
		SM.sort(sort_selector.value,"");
	});

	// ascending button listener
	document.getElementById('asc').addEventListener("click", () => {
			SM.sort("",true);
		});

	// descending button listener
	document.getElementById('des').addEventListener("click", () => {
			SM.sort("",false);
		});	

	// search bar listener
	document.getElementById('search_bar').addEventListener("keyup", function(e) {
		if(e.keyCode === 13){
			const search_value = this.value;			
			
			if (sportsArray.includes(search_value)) {
				sportSel.value = search_value;
				sportSel.dispatchEvent(new Event('change'));
			} else if (Array.from(eventsMap.keys()).includes(search_value)) {
				sportSel.value = eventsMap.get(search_value);
				updateEventOptions(eventSelD3, sportSel.value)
				eventSel.value = search_value;
				eventSel.dispatchEvent(new Event('change'));
			}
		}
	});

	// change color of bubble chart
	function changeCircleClassification() {
		let radioValue = d3.select('input[name="classify"]:checked').node().value
		resetCircleGraph()
	
		switch(radioValue) {
			case "height" :
				circleGraph(1)
				break;
			case "weight" :
				circleGraph(0)
				break;
			case "age" :
				circleGraph(2)
				break;
		}
	}

	// bubble chart button listener
	d3.select("#graph_config").on("change", changeCircleClassification )

	// initialize bubble chart
	changeCircleClassification()

});
