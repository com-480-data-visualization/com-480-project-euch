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
		.attr("y",70)
		.text(athlete.event)
		.attr("font-family","sans-serif")
		.attr("font-size",10);
}


//Create a small multiple frame
function createSMFrame(SM,athlete,svg,index){
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

	}

	//add an athlete to the SM
	//if it is already full it is FIFO
	add(athlete){
		//add the element in the first position
		this.athletes.unshift(athlete);

		if(this.cursor == this.number_SM){
			//it means the array is full, so last element is popped
			this.athletes.pop();
		} else {
			this.cursor = this.cursor + 1;
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