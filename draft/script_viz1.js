function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		// DOMContentLoaded already fired
		action();
	}
}

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


function createDataObject(start_year, end_year, sport, event, svg) {
	d3.csv("../data/athlete_events.csv", function(d) {
		return {
			id : +d.ID,
			name : d.Name,
			sex : d.Sex,
			age : +d["Age"],
			height : +d["Height"],
			weight : +d["Weight"],
			sex : d.Sex,
			team : d.Team,
			noc : d.NOC,
			year: +d["Year"],
			season: d.Season,
			city : d.City,
			sport: d.Sport,
			event: d.Event,
			medal: d.Medal
		};
	}).then(function(data) {
		data_f = data.filter(function(d){
			return d.year >= start_year && d.year <= end_year && d.sport == sport;
		});

		if(event != 'All'){
			data_f = data.filter(function(d){
				return d.event == event;
			});
		}

		const mean_age = d3.mean(data_f, function(d) { return d.age; });
		const mean_weight = d3.mean(data_f, function(d) { return d.weight; });
		const mean_height = d3.mean(data_f, function(d) { return d.height; });
		const nb_samples = data_f.length;

		const ath = new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);
		console.log(ath);

		d3.select("#sport_disp")
		.text("Sport : " + ath.sport);

		d3.select("#event_disp")
		.text("Event : " + ath.event);

		d3.select("#years_disp")
		.text("From years : " + ath.start_year + " - " + ath.end_year);

		d3.select("#age_disp")
		.text("Mean age : " + ath.age);

	  });
}

whenDocumentLoaded(() => {

	const svg = d3.select("#display").append("svg");

	d3.select("#nRadius").on("input", function() {
		update(+this.value);
	  });

	button = document.getElementById('btn');
	button.addEventListener('click', () => {
		const sport_sel = document.getElementById('sport_selector');
		const sport = sport_sel.options[sport_sel.selectedIndex].value;
		const event_sel = document.getElementById('event_selector')
		const event = event_sel.options[event_sel.selectedIndex].value;
		createDataObject(1992, 2016, sport, event, svg)

	});
});