// set the dimensions and margins of the graph
let margin = {top: 15, right: 30, bottom: 50, left: 90},
    width = 700 - margin.right - margin.left;
height = 360 - margin.top - margin.bottom;

let chartHeight = 70;
let chartWidth = 750;

// append the svg objects to the body of the page
let svgChartHeight = d3.select("#chart2")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


let svgChartWeight = d3.select("#chart1")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


let svgChartAge = d3.select("#chart3")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")

let svgChartX = d3.select("#chartx");


//global x axis
let x = d3.scaleLinear()
    //.domain(d3.extent(data_f, function(d) { return d.year; }))
    .domain([1896, 2016])
    .range([ 0, chartWidth ])
    .nice();

let inverseX = d3.scaleLinear()
    .domain([0, 750])
    .range([1890, 2020])

let xAxis;
let handleRadius = 18

// x axis for all charts and brush
var svgx = svgChartX.append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", 37),
    g = svgx.append("g")
        .attr("transform",
            "translate(" + margin.left + ",10)")
const brush = d3.brushX()
    .extent([[0, -handleRadius +2], [chartWidth,  handleRadius * 2 + 2]])
    .on("start brush end", brushmoved);


//Initialize brush
var gBrush =
    g.attr("class", "brush")
    .call(brush)

var handle = gBrush.selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("fill", "#ADD8E6")
    .attr("fill-opacity", 1)
    .attr("stroke", "#000")
    .attr("stroke-width", 0)
    .attr("cursor", "ew-resize")
    .attr("d", d3.arc()
        .innerRadius(0)
        .outerRadius(handleRadius + 2)
        .startAngle(0)
        .endAngle(function(d, i) { return i ? Math.PI : -Math.PI; }))
    .attr("display" , "none");

//Set of years by default
var avgYears = [1896,2016]

gBrush.call(brush.move, avgYears.map(x));

let heightColor = 'hsl(11, 56%, 66%)';
let weightColor = 'hsl(274, 44%, 65%)';
let ageColor = 'hsl(94, 38%, 50%)';

let packingWidth = 800
let packingHeight = 780


//Method called when the brushed is moved
function brushmoved() {
    let s = d3.event.selection;
    if (s == null) {
        var mousex = d3.mouse(this)[0]
        if(mousex > 0 && mousex < 750) {
            gBrush.call(brush.move, [mousex, mousex+.001]);
        } else {
            handle.attr("display", "none")
        }
    } else {
        avgYears = s.map(inverseX).map(Math.round)
        updateViz()
        handle.attr("display", null)
            .attr("transform", function(d, i) { return "translate(" + s[i] + ", 8 )"; });
    }
}

//call function so graphs are displayed empty
function initCharts() {
// Y axis label:
    svgChartWeight.append("text")
        .attr('class', 'chart_label')
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 40)
        .attr("x", -margin.top - chartHeight/2 + 43)
        .text("Weight [kg]")
        .attr("font-family", 'Arial, Helvetica, sans-serif')
		.attr("font-size", "12px")
		.attr("fill", "black")
    

    svgChartHeight.append("text")
        .attr('class', 'chart_label')
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 40)
        .attr("x", -margin.top - chartHeight/2 + 43)
        .text("Height [cm]")
        .attr("font-family", 'Arial, Helvetica, sans-serif')
		.attr("font-size", "12px")
		.attr("fill", "black")

    svgChartAge.append("text")
        .attr('class', 'chart_label')
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 40)
        .attr("x", -margin.top - chartHeight/2 + 43)
        .text("Age [years]")
        .attr("font-family", 'Arial, Helvetica, sans-serif')
		.attr("font-size", "12px")
		.attr("fill", "black")

    // x axis on the last div
    xAxis = g.call(d3.axisBottom(x).tickSize(5).tickFormat(d3.format("d")))

    let y = d3.scalePoint()
        .range([chartHeight, 0])

    // initial y axis
    svgChartWeight.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));

    svgChartWeight.select(".domain")
        .attr("stroke",weightColor)
        .attr("stroke-width","2")
        .attr("opacity","1");


    svgChartHeight.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));

    svgChartHeight.select(".domain")
        .attr("stroke",heightColor)
        .attr("stroke-width","2")
        .attr("opacity","1");


    svgChartAge.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));

    svgChartAge.select(".domain")
        .attr("stroke",ageColor)
        .attr("stroke-width","2")
        .attr("opacity","1");

}

initCharts()

//Intialize the charts
function startChart(svg_, type) {
    // construct groupBy

    // Add Y axis
    let y
    let chartId
    let data
    let data_select

    var unit = "kg";

    var lineColor;
    switch(type) {
        case 0:
            // weight
            // all years
            let weightGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.weight; }); })
                .entries(data_all_years);

            weightGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })
            data = weightGroupByYear

            //selection
            let weightGroupByYearSelect = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.weight; }); })
                .entries(data_f);

            weightGroupByYearSelect.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })
            data_select = weightGroupByYearSelect

            chartId = "#chart2"
            lineColor = weightColor;

            const weightGroupByYearValues = weightGroupByYear.map(d => d.value) // y-values in the chart

            y = d3.scaleLinear()
                .domain([
                    Math.floor(d3.min(weightGroupByYearValues) / 10) * 10,
                    Math.ceil(d3.max(weightGroupByYearValues) / 10) * 10])
                .range([ chartHeight, 0 ]);

            break;
        case 1:
            //height
            let heightGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
                .entries(data_all_years);

            heightGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })

            data = heightGroupByYear

            //selection
            let heightGroupByYearSelect = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
                .entries(data_f);

            heightGroupByYearSelect.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })
            data_select = heightGroupByYearSelect

            chartId = "#chart1"
            lineColor = heightColor;
            const heightGroupByYearValues = heightGroupByYear.map(d => d.value) // y-values in the chart
            y = d3.scaleLinear()
                .domain([
                    Math.floor(d3.min(heightGroupByYearValues) / 10) * 10,
                    Math.ceil(d3.max(heightGroupByYearValues) / 10) * 10])
                .range([ chartHeight, 0 ]);


            //update unti for tooltip text
            unit = "cm";
            break;
        case 2:
            //age
            chartId = "#chart3"

            let ageGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.age; }); })
                .entries(data_all_years);

            ageGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })

            data = ageGroupByYear

            //selection
            let ageGroupByYearSelect = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.age; }); })
                .entries(data_f);

            ageGroupByYearSelect.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })
            data_select = ageGroupByYearSelect

            lineColor = ageColor;

            const ageGroupByYearValues = ageGroupByYear.map(d => d.value) // y-values in the chart
            y = d3.scaleLinear()
                .domain([
                    Math.floor(d3.min(ageGroupByYearValues) / 10) * 10,
                    Math.ceil(d3.max(ageGroupByYearValues) / 10) * 10])
                .range([ chartHeight, 0 ]);

            unit = "ys"
            break;
    }

    // y axis on all charts
    svg_.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickValues(y.domain()).tickFormat(d3.format("d")));

    svg_.select(".domain")
        .attr("stroke",lineColor)
        .attr("stroke-width","2")
        .attr("opacity","1");


    // Add the line
    svg_.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "Black")
        .attr("stroke-width", 3)
        .attr("stroke-opacity", 0.3)
        .attr("d", d3.line()
            .x(function(d) { return x(d.key) })
            .y(function(d) { return y(d.value) })
        )
    svg_.append("path")
        .datum(data_select)
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(function(d) { return x(d.key) })
            .y(function(d) { return y(d.value) })
        )

    // Add the points
    svg_
        .append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.key) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 3)
        .attr("fill", "Black")
        .attr("fill-opacity", 0.3)
        .on("mouseover", function(d) {
            d3.select(this).transition()
                .duration('50')
                .attr('fill-opacity', '1')

            tooltip.transition()
                .duration(200)
                .style("opacity", .7);
            let yeartext = d.key
            let valuetext = d3.format(".1f")(d.value) + " " + unit
            tooltip.html(function(){
                return yeartext + " <br> " + valuetext
            })
                .style("left", (d3.event.pageX - 15) + "px")
                .style("top", (d3.event.pageY - 35) + "px")
                .style("background", "#D3D3D3")

        ;})


        .on('mouseout', function (d) {
            d3.select(this).transition()
                 .duration('50')
                 .attr('fill-opacity', '0.3')

            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg_
        .append('g')
        .selectAll("dot")
        .data(data_select)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.key) } )
        .attr("cy", function(d) { return y(d.value) } )
        .attr("r", 3)
        .attr("fill", "White")
        .attr("stroke", lineColor)
        //hover functions
        .on('mouseover', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('fill', lineColor);

            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            let keyText = d.key
            let valueText = d3.format(".1f")(d.value) + " " + unit

            tooltip.html(function(){
                return keyText + " <br> " + valueText
            })
                .style("left", (d3.event.pageX - 20) + "px")
                .style("top", (d3.event.pageY - 40) + "px")
                .style("background", lineColor)

        })
        .on('mouseout', function (d, i) {
            d3.select(this).transition()
                .duration('50')
                .attr('fill', "White")
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
}

//Constructs the 3 charts after the data preparation
function constructCharts() {
    resetCharts()

    // require type -> 0 -> weight, 1->  height, 2-> age
    startChart(svgChartHeight, 1);
    startChart(svgChartWeight,  0);
    startChart(svgChartAge,  2);
}


// Reset the 3 charts
function resetCharts()  {
    //reset chart
    svgChartWeight.selectAll("g").remove();
    svgChartWeight.selectAll("path").remove();


    svgChartHeight.selectAll("g").remove();
    svgChartHeight.selectAll("path").remove();

    svgChartAge.selectAll("g").remove();
    svgChartAge.selectAll("path").remove();

    d3.selectAll(".tooltip").remove();

}

//Reset the circle packing chart
function resetCircleGraph() {
    d3.select("#circle_graph_svg").selectAll("g").remove();
    d3.selectAll(".circleTooltip").remove();

}


// Code used for the circle packing
//It was mainly taken from examples on the internet
function circleGraph(type) {
    var svg = d3.select("#circle_graph_svg")

    let svgHeight = parseInt(svg.style("height"));
	let svgWidth = parseInt(svg.style("width"));


    let tooltip = d3.select("#circlePacking")
        .append("div")
        .style("opacity", 0)
        .attr("class", "circleTooltip")
        .style("background-color", "#D3D3D3")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "2px")

    var mouseover = function(d) {
        d3.select(this)
            .style("stroke-width", 4)
            .style("fill-opacity", 1)
        tooltip
            .style("opacity", .9)

    }
    var mouseleave = function(d) {
        d3.select(this)
            .style("stroke-width", 1)
            .style("fill-opacity", 0.8)

        tooltip
            .style("opacity", 0)
    }
    var mousemove = function(d) {
        let sport_text = d.key
        var value_text = ""
        switch(type) {
            case 0 :
                //weight
                value_text =  d3.format(".1f")(d.value) + " kg"
                break;
            case 1:
                //height
                value_text =  d3.format(".1f")(d.value) + " cm"
                break;
            case 2 :
                //age
                value_text =  d3.format(".1f")(d.value) + " years"
                break
        }
        tooltip
            .html(function(){
                return sport_text + " <br> " + value_text
            })
            .style("font-size", "16px")
            .style("left", (d3.event.pageX + 25) + "px")
            .style("top", (d3.event.pageY - 35) + "px")
    }



    d3.csv("data/athlete_events_red.csv", function(d) {
        return {
            age : +d["Age"],
            height : +d["Height"],
            weight : +d["Weight"],
            sport : d.Sport,
            year : +d["Year"]
        }

    }).then(function(data) {

        let groupBySport;

        switch(type) {
            case 0 :
                groupBySport = d3.nest()
                    .key(function(d){return d.sport; })
                    .rollup(function(v) { return d3.mean(v, function(d) { return d.weight; }); })
                    .entries(data);
                break;
            case 1 :
                groupBySport = d3.nest()
                    .key(function(d){return d.sport; })
                    .rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
                    .entries(data);
                break;
            case 2 :
                groupBySport = d3.nest()
                    .key(function(d){return d.sport; })
                    .rollup(function(v) { return d3.mean(v, function(d) { return d.age; }); })
                    .entries(data);
                break;

        }

        let groupBySportKeys = groupBySport.map(d => d.key)
        let groupBySportValue = groupBySport.map(d => d.value)

        /*groupBySport = groupBySport.sort(function(x, y){
            return d3.ascending(x.value, y.value);
        })*/

        let color = d3.scaleOrdinal()
            .domain(groupBySportKeys)
            .range(d3.schemeSet3)
        // Size scale
        var size = d3.scalePow()
            .domain([d3.min(groupBySportValue), d3.max(groupBySportValue)])
            .range([5,40])


        var node = svg.append("g")
            .selectAll("circle")
            .data(groupBySport)
            .enter()
            .append("circle")
            .attr("class", "node")
            .attr("r", function(d){ return size(d.value)})
            .attr("cx", svgWidth / 2)
            .attr("cy", svgHeight / 2)
            .style("fill", function(d){ return color(d.key)})
            .style("fill-opacity", 0.8)
            .attr("stroke", "black")
            .style("stroke-width", 1)
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave)
            .on("mousemove", mousemove)
            .call(d3.drag() // call specific function when circle is dragged
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended));


        var simulation = d3.forceSimulation()
            .force("forceX", d3.forceX().strength(.1).x(svgWidth * .5))
            .force("forceY", d3.forceY().strength(.1).y(svgHeight * .5))
            .force("center", d3.forceCenter().x(svgWidth * .5).y(svgHeight * .5))
            .force("charge", d3.forceManyBody().strength(-25));
        // Apply these forces to the nodes and update their positions.
        // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
        simulation
            .nodes(groupBySport)
            .force("collide", d3.forceCollide().strength(.1).radius(function(d){ return size(d.value) + 3; }).iterations(10))
            .on("tick", function(d){
                node
                    .attr("cx", function(d){
                        if(d.x < 0) return 0
                        if(d.x > svgWidth) return svgWidth
                        return d.x
                    })
                    .attr("cy", function(d){ if(d.y < 0) return 0
                        if(d.y > svgHeight) return svgHeight
                        return d.y
                    })
            });

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(.03).restart();
            d.fx = d.x;
            d.fy = d.y;
        }
        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }
        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0.005);
            d.fx = null;
            d.fy = null;
        }

    })




}