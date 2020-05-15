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
/*


*/

function prepareData(start_year, end_year, sport, event, resArray) {
	console.log("Start year : " + start_year)
	console.log("End year : " + end_year)

	data_f = resArray.filter(function(d){
		sameEvent = event == 'All' ? true : d.event == event;
		sameSport = d.sport == sport;
		btwYear = d.year >= start_year && d.year <= end_year;
		return sameEvent && sameSport && btwYear;
	});
}

// create an average athlete that represents all athletes from a given sport, event and time window
function averageAthlete(start_year, end_year, sport, event, resArray){

	const mean_age = d3.mean(data_f, function(d) { return d.age; });
	const mean_weight = d3.mean(data_f, function(d) { return d.weight; });
	const mean_height = d3.mean(data_f, function(d) { return d.height; });
	const nb_samples = data_f.length;

	return new Athlete(start_year, end_year, nb_samples, mean_age, mean_height, mean_weight, sport, event);

	/*
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
	})
		//.forEach(x => console.log(x))
	weightGroupByYear.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	})
		//.forEach(x => console.log(x))
	ageGroupByYear.sort(function(x, y){
		return d3.ascending(x.key, y.key);
	})


	// require type -> 0 -> weight, 1->  height, 2-> age
	startChart(svgChartHeight, heightGroupByYear, 1);
	startChart(svgChartWeight, weightGroupByYear, 0);
	startChart(svgChartAge, ageGroupByYear, 2);
*/

}