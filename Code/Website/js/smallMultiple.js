function createButton(SM,svg,index){
	//creation of the button, inspired from:
	//https://bl.ocks.org/Lulkafe/95a63ddea80d4d02cc4ab8bedd48dfd8
	var size_button = 20, 
	x = 0,
	y = 0,
	rx = 4,
	ry = 4,
	crossStrokeWidth = 1.5;

    var crossStyle = {
        "stroke-width": crossStrokeWidth,
        "stroke": "grey"
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
	let width = parseInt(svg.style("width"))
	let height = parseInt(svg.style("height"))

	let event = "";
	if(athlete.event == "All"){
		addSex(svg,athlete.event);
		event = athlete.event;
	} else {
		var index_split = athlete.event.indexOf(" ");  
		addSex(svg,athlete.event.substr(0, index_split)); 
		event = athlete.event.substr(index_split + 1);
	}

	var sport = svg.append("g");

	const margin_text = 40;
	if(athlete.sport == "Archery"){
		var icon_sport = svg.append("g");
		icon_sport.append('image')
		    .attr('xlink:href', '../res/olympic_icons/'+athlete.sport+'.svg')
		    .attr('width', 50)
		    .attr('height', 50)
		    .attr('x', 0)
		    .attr('y', parseInt(svg.style("height")) - 50);
		sport.append("text")	
			.attr("x",margin_text+20)
			.attr("y",height - 20)
			.text(event)
			.attr("font-family","sans-serif")
			.attr("font-size",10);

	} else {
	sport.append("text")
		.attr("x",margin_text)
		.attr("y",height - 20)
		.text(athlete.sport+", "+event)
		.attr("font-family","sans-serif")
		.attr("font-size",10);
	}
	var year = svg.append("g");

	year.append("text")
		.attr("x",margin_text)
		.attr("y",height-5)
		.text("From "+athlete.start_year+" to "+athlete.end_year)
		.attr("font-family","sans-serif")
		.attr("font-size",10);
}


function addSex(svg,sex_athlete){
	let height = parseInt(svg.style("height"));
	let width  = parseInt(svg.style("width"));
	//To add a sex to the class athlete
	if(sex_athlete == "Mens"){
		var sex = svg.append("g");
		sex.append('image')
		    .attr('xlink:href', '../res/male-svgrepo-com.svg')
		    .attr('width', 20)
		    .attr('height', 20)
		    .attr('x', width - 25)
		    .attr('y', height - 25);
	} else if (sex_athlete == "Womens"){
		var sex = svg.append("g");
		sex.append('image')
		    .attr('xlink:href', '../res/female-svgrepo-com.svg')
		    .attr('width', 25)
		    .attr('height', 25)
		    .attr('x', width - 25)
		    .attr('y', height - 30);
	} else {
		var sex_f = svg.append("g");
		var sex_m = svg.append("g");
		
		sex_m.append('image')
		    .attr('xlink:href', '../res/male-svgrepo-com.svg')
		    .attr('width', 20)
		    .attr('height', 20)
		    .attr('x', width-25)
		    .attr('y', height - 40)
		    //6,parseInt(svg.style("height")) - 4
		sex_f.append('image')
		    .attr('xlink:href', '../res/female-svgrepo-com.svg')
		    .attr('width', 25)
		    .attr('height', 25)
		    .attr('x', width-26)
		    .attr('y', height - 30);
		    //5,parseInt(svg.style("height")) - 30

	}
}


//Select an athlete and display it
function selectAthlete(SM,athlete,rect_svg,index){
	description_svg = d3.select("#display");
	const sportSel = document.getElementById('sport_selector');
	const eventSel = document.getElementById('event_selector');
	if(rect_svg.attr("fill-opacity") == 0){
		SM.unselectAll();
		sportSel.value = athlete.sport;
		sportSel.dispatchEvent(new Event('change'));
		eventSel.value = athlete.event;
		eventSel.dispatchEvent(new Event('change'));
		rect_svg.attr("fill-opacity",0.1);
		SM.setSelectedElement(index);
	} else {
		sportSel.value = "None";
		sportSel.dispatchEvent(new Event('change'));
		eventSel.value = "All";
		eventSel.dispatchEvent(new Event('change'));
		rect_svg.attr("fill-opacity",0);
	}
}

//Create a small multiple frame
function createSMFrame(SM,athlete,svg,index,isSelected){

	//Add some information about the athlete
	createTextAthlete(svg,athlete);

	//Add Athlete
	let width = parseInt(svg.style("width"))
	let height = parseInt(svg.style("height"))
	drawAthlete(athlete, svg, height*0.9, 0, -40, 0);

	var rect_svg = svg.append("rect")
		.attr('id','SM_select'+index)
		.attr("width", "100%")
		.attr("height", "100%")
		.attr("fill","blue")
	
	if(isSelected){
		rect_svg.attr("fill-opacity",0.1);
	} else {
		rect_svg.attr("fill-opacity",0);
	}
	
	rect_svg.on("click", function(){selectAthlete(SM,athlete,rect_svg,index);})

	//Create de button

	createButton(SM,svg,index);
}

// represents the small multiples
class Small_multiples {
	constructor(number_SM) {
		this.cursor = 0;
		this.number_SM = number_SM;
		this.athletes = [];
		this.sorted_by = "No sorting";
		this.ascending = true;
		this.selected_element = -1;
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

	setSelectedElement(index){
		this.selected_element = index;
	}

	unselectAll(){
		var i;
		for (i=0;i<this.cursor;i++){
			d3.select("#SM_select"+i).attr("fill-opacity",0);
		}
		this.selected_element = -1;
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
			let indices = this.athletes.map((val, ind) => {return {"val":val,"ind":ind};});
           	indices.sort((a, b) => {return sortFunction(this.sorted_by,this.ascending)(a["val"],b["val"]);});
           	var i;
           	console.log(indices)
           	for(i=0; i<this.cursor; i++){
           		console.log(indices[i]);
           		if(indices[i]["ind"] == this.selected_element){
           			this.selected_element = i;
           			break;
           		}
           	}
			this.athletes = indices.map(e => e["val"]);
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
				let isSelected = this.selected_element == i;
				createSMFrame(this,this.athletes[i],svg,i,isSelected);
			}
		}
	}

}
