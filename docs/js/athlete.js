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
let data_f, data_all_years;
function prepareData(start_year, end_year, sport, event, resArray) {
	//console.log("Start year : " + start_year)
	//console.log("End year : " + end_year)

	data_all_years = resArray.filter(function(d){
		const sameEvent = event === 'All' ? true : d.event === event;
		const sameSport = d.sport === sport;
		const btwYear = d.year >= 1896 && d.year <= 2020;
		const validData = d.age === +d.age && d.weight === +d.weight && d.height === +d.height
		return sameEvent && sameSport && btwYear && validData;
	});

	data_f = data_all_years.filter(function(d){
		const btwYear = d.year >= start_year && d.year <= end_year;
		return btwYear;
	});

}


// create an average athlete that represents all athletes from a given sport, event and time window
function averageAthlete(start_year, end_year, sport, event){


	const mean_age = d3.mean(data_f, function(d) { return d.age; });
	const mean_weight = d3.mean(data_f, function(d) { return d.weight; });
	const mean_height = d3.mean(data_f, function(d) { return d.height; });
	const nb_samples = data_f.length; //counter

	return new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);

}