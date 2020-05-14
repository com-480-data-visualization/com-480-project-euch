function createButton(SM,svg,index){
	//creation of the button, inspired from:
	//https://bl.ocks.org/Lulkafe/95a63ddea80d4d02cc4ab8bedd48dfd8
	var size_button = 30, 
	x = 0,
	y = 0,
	rx = 4,
	ry = 4,
	crossStrokeWidth = 3;

    var crossStyle = {
        "stroke-width": crossStrokeWidth,
        "stroke": "black"
    },
    r = size_button / 2,
    ofs = size_button / 6,
    cross,
    g;

    g = svg.append("g").on("click", function(){SM.remove(index);});
    cross = g.append("g")

    g.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("rx", rx)
		.attr("ry", ry)
		.attr("width", size_button)
		.attr("height", size_button)
		.attr("fill-opacity", 0);
 

    cross.append("line")
    	.attr("x1", x + ofs)
        .attr("y1", y + ofs)
        .attr("x2", (x + size_button) - ofs)
        .attr("y2", (y + size_button) - ofs)
		.attr("stroke-width", crossStrokeWidth)
		.attr("stroke", "black");

    cross.append("line")
        .attr("x1", (x + size_button) - ofs)
        .attr("y1", y + ofs)
        .attr("x2", x + ofs)
        .attr("y2", (y + size_button) - ofs)
		.attr("stroke-width", crossStrokeWidth)
		.attr("stroke", "black");


}

//add some text below the drawing of the athlete 
function createTextAthlete(svg,athlete) {
	var sport = svg.append("g");

	sport.append("text")
		.attr("x",5)
		.attr("y",50)
		.text(athlete.sport)
		.attr("font-family","sans-serif")
		.attr("font-size",10);

	var event = svg.append("g");

	event.append("text")
		.attr("x",5)
		.attr("y",65)
		.text(athlete.event)
		.attr("font-family","sans-serif")
		.attr("font-size",10);

	event.append("text")
		.attr("x",5)
		.attr("y",80)
		.text("From "+athlete.start_year+" to "+athlete.end_year)
		.attr("font-family","sans-serif")
		.attr("font-size",10);
}


function addSex(athlete,svg){
	var sex = svg.append("g");

	//To add a sex to the class athlete...
	svg.append('image')
    .attr('xlink:href', '../res/male-svgrepo-com.svg')
    .attr('width', 30)
    .attr('height', 30)
    .attr('x', parseInt(svg.style("width")) - 35)
    .attr('y',5);
}

//Create a small multiple frame
function createSMFrame(SM,athlete,svg,index){
	//Add Sex of the athlete
	addSex(athlete,svg);

	//Create de button
	createButton(SM,svg,index);

	//Add some information about the athlete
	createTextAthlete(svg,athlete);

	//Add Athlete
	drawAthlete(athlete, svg, 150, 10, -20, 0);
}

// represents the small multiples
class Small_multiples {
	constructor(number_SM) {
		this.cursor = 0;
		this.number_SM = number_SM;
		this.athletes = [];
		this.sorted_by = "No sorting";
		this.ascending = true;
	}



	//add an athlete to the SM
	//if it is already full it is FIFO
	add(athlete){
		//add the element in the last position
		this.athletes.push(athlete);
		this.cursor = this.cursor + 1;

		//If it should be sorted, then keep it sorted
		if (!(this.sorted_by == "No sorting")){
			this.sort(this.sorted_by,this.ascending)
		}

		//Refresh the visualization
		this.refresh_SM();
	}

	//remove an athlete at a given index
	remove(index) {
		this.athletes.splice(index,1);
		this.cursor = this.cursor -1;
		this.refresh_SM();
	}

	//remove all elements
	removeAll() {
		this.athletes = [];
		this.cursor = 0;
		this.refresh_SM();
	}

	isFull(){
		return this.cursor == this.number_SM;
	}

	sort(sort_by, ascending) {

		if(sort_by == ""){
			sort_by = this.sorted_by;
			this.ascending = ascending;
		}

		if(ascending == ""){
			ascending = this.ascending;
			this.sorted_by = sort_by;
		}

		//Dynamic sort function
		function sortFunction(sorted_by,ascending) {
			return function compare(a,b){
				const to_compare_a = a[sorted_by];
				const to_compare_b = b[sorted_by];
				if(ascending){
					if (to_compare_a < to_compare_b) {
						return -1;
					}
					if (to_compare_b < to_compare_a) {
						return 1;
					}
				} else {
					if (to_compare_a > to_compare_b) {
						return -1;
					}
					if (to_compare_b > to_compare_a) {
						return 1;
					}
				}
				// a must be equal to b
				return 0;
				}
		}

		if (!(this.sorted_by == "No sorting")){
			this.athletes.sort(sortFunction(this.sorted_by,this.ascending));
			this.refresh_SM();
		} 
		
	}

	refresh_SM(){
		//display all element from the athletes array
		var i;
		for (i=0;i<this.number_SM;i++){
			let svg = d3.select("#elem_"+i);
			svg.selectAll("*").remove();
			if(i < this.cursor){
				createSMFrame(this,this.athletes[i],svg,i);
			}
		}
	}

}