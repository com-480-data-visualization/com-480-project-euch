function createButton(SM,svg,index){
	//creation of the button, inspired from:
	//https://bl.ocks.org/Lulkafe/95a63ddea80d4d02cc4ab8bedd48dfd8
	var size_button = 25, 
	x = 3,
	y = 3,
	rx = 4,
	ry = 4,
	crossStrokeWidth = 1.5;

    var r = size_button / 2,
    ofs = size_button / 6,
    cross,
    g;

	g = svg.append("g")
		.on("click", function(){SM.remove(index);})
		.attr('class', 'cross');
	
    g.append("rect")
		.attr("x", x)
		.attr("y", y)
		.attr("rx", rx)
		.attr("ry", ry)
		.attr("width", size_button)
		.attr("height", size_button)
		.attr("fill-opacity", 0);
 

	g.append("line")
    	.attr("x1", x + ofs)
        .attr("y1", y + ofs)
        .attr("x2", (x + size_button) - ofs)
        .attr("y2", (y + size_button) - ofs)
		.attr("stroke", "black");


	g.append("line")
        .attr("x1", (x + size_button) - ofs)
        .attr("y1", y + ofs)
        .attr("x2", x + ofs)
        .attr("y2", (y + size_button) - ofs)
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

	const margin_text = 10;

	svg.append("text")
		.attr('class', 'sm_sport')
		.attr("x",margin_text)
		.attr("y",height - 26)
		.text(athlete.sport)
	
	svg.append("text")
		.attr('class', 'sm_event')
		.attr("x",margin_text)
		.attr("y",height-9)
		.text(event)

	svg.append("text")
		.attr('class', 'sm_year')
		.attr('text-anchor', 'middle')
		.attr("x",width/2)
		.attr("y",20)
		.text(athlete.start_year+" - "+athlete.end_year)

	const lineHeight = height - 48;

	svg.append('line')
		.attr('class', 'sm_textline')
		.attr('x1', margin_text)
		.attr('x2', width - margin_text)
		.attr('y1', lineHeight)
		.attr('y2', lineHeight)

	
	const feat_offset = 15
	const dist_from_line = 8

	age_text = svg.append('text')
		.attr('class', 'sm_feat')
		.attr('x', margin_text)
		.attr('y', lineHeight-dist_from_line)
	
	age_text.append('tspan')
		.text(athlete.age.toFixed(1))
		.attr('font-weight', 'bold')

	age_text.append('tspan')
		.text(' years')

	height_text = svg.append('text')
		.attr('class', 'sm_feat')
		.attr('x', margin_text)
		.attr('y', lineHeight-dist_from_line-feat_offset)

	height_text.append('tspan')
		.text(athlete.height.toFixed(1))
		.attr('font-weight', 'bold')

	height_text.append('tspan')
		.text(' cm')

	weight_text = svg.append('text')
		.attr('class', 'sm_feat')
		.attr('x', margin_text)
		.attr('y', lineHeight-dist_from_line-(2*feat_offset))

	weight_text.append('tspan')
		.text(athlete.weight.toFixed(1))
		.attr('font-weight', 'bold')

	weight_text.append('tspan')
		.text(' kg')
}


function addSex(svg,sex_athlete){
	let height = parseInt(svg.style("height"));
	let width  = parseInt(svg.style("width"));
	//To add a sex to the class athlete
	if(sex_athlete == "Mens"){
		var sex = svg.append("g");
		sex.append('image')
		    .attr('xlink:href', '../res/male-svgrepo-com.svg')
		    .attr('width', 23)
		    .attr('height', 23)
		    .attr('x', width - 34)
		    .attr('y', height - 36);
	} else if (sex_athlete == "Womens"){
		var sex = svg.append("g");
		sex.append('image')
		    .attr('xlink:href', '../res/female-svgrepo-com.svg')
		    .attr('width', 28)
		    .attr('height', 28)
		    .attr('x', width - 34)
		    .attr('y', height - 39);
	} else {
		var sex_f = svg.append("g");
		var sex_m = svg.append("g");
		
		sex_m.append('image')
		    .attr('xlink:href', '../res/male-svgrepo-com.svg')
		    .attr('width', 20)
		    .attr('height', 20)
		    .attr('x', width-33)
		    .attr('y', height - 41)
		    //6,parseInt(svg.style("height")) - 4
		sex_f.append('image')
		    .attr('xlink:href', '../res/female-svgrepo-com.svg')
		    .attr('width', 25)
		    .attr('height', 25)
		    .attr('x', width-33)
		    .attr('y', height - 32);
		    //5,parseInt(svg.style("height")) - 30

	}
}


//Select an athlete and display it
function selectAthlete(SM,athlete,rect_svg,index){
	description_svg = d3.select("#display");
	const sportSel = document.getElementById('sport_selector');
	const eventSel = document.getElementById('event_selector');
	if(rect_svg.classed('sm_not_selected')){
		SM.unselectAll();
		//Change the brush position
		let avgYears = [athlete.start_year,athlete.end_year]; 
		gBrush.call(brush.move, avgYears.map(x));

		sportSel.value = athlete.sport;
		sportSel.dispatchEvent(new Event('change'));
		eventSel.value = athlete.event;
		eventSel.dispatchEvent(new Event('change'));
		rect_svg.classed('sm_is_selected', true);
		rect_svg.classed('sm_not_selected', false);
		SM.setSelectedElement(index);
	} else {

		let avgYears = [1896,2016]; 
		gBrush.call(brush.move, avgYears.map(x));

		sportSel.value = "None";
		sportSel.dispatchEvent(new Event('change'));
		eventSel.value = "All";
		eventSel.dispatchEvent(new Event('change'));
		rect_svg.classed('sm_is_selected', false);
		rect_svg.classed('sm_not_selected', true);
	}
}

//Create a small multiple frame
function createSMFrame(SM,athlete,svg,index,isSelected){

	//Add some information about the athlete
	createTextAthlete(svg,athlete);

	//Add Athlete
	let width = parseInt(svg.style("width"));
	let height = parseInt(svg.style("height"));
	drawAthlete(athlete, svg, height*0.82, 0, -55, 0);

	var rect_svg = svg.append("rect")
		.attr('id','SM_select'+index)
		.attr("width", "100%")
		.attr("height", "100%")
	
	if(isSelected){
		rect_svg.classed("sm_is_selected", true);
		rect_svg.classed("sm_not_selected", false);
	} else {
		rect_svg.classed("sm_is_selected", false);
		rect_svg.classed("sm_not_selected", true);
	}
	
	rect_svg.on("click", function(){selectAthlete(SM,athlete,rect_svg,index);})

	//Create de button

	createButton(SM,svg,index);
}


function createAddFrame(SM,svg){
	var plus = svg.append("g");
	let width = parseInt(svg.style("width"));
	let height = parseInt(svg.style("height"));

	//Make it clickable
	plus.on("click", function(){
		const sport = document.getElementById('sport_selector').value;
		const event = document.getElementById('event_selector').value;

		if(sport == "None") {
			//do nothing
		} else {
		prepareData(avgYears[0], avgYears[1], sport, event, resArray)
		let ath = averageAthlete(avgYears[0], avgYears[1], sport, event);
		if(ath.nb_samples == 0){
			//do nothing
		}else{
			SM.add(ath);	
		}
		
	}
	});

	//append plus image
	plus.append('image')
		.attr('id', 'plus')
		.attr('xlink:href', '../res/add-svgrepo-com.svg')
		.attr('width', 70)
		.attr('height', 70)
		.attr('x', width/2 - 35)
		.attr('y', height/2 - 35)

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
		if(this.cursor == index){
			this.unselectAll()
		}
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
			d3.select("#SM_select"+i).classed("sm_not_selected",true);
			d3.select("#SM_select"+i).classed("sm_is_selected",false)
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
			let div = document.getElementById("elem_"+i+"_div");
			svg.selectAll("*").remove();
			if(i < this.cursor){
				div.style.visibility = "visible";
				let isSelected = this.selected_element == i;
				createSMFrame(this,this.athletes[i],svg,i,isSelected);
			} else if (i == this.cursor) {
				div.style.visibility = "visible";
				createAddFrame(this,svg);
			} else {
				div.style.visibility = "hidden";
			}
		}
	}

}
