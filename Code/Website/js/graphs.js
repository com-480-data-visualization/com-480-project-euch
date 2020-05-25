// set the dimensions and margins of the graph
let margin = {top: 15, right: 30, bottom: 50, left: 90},
    width = 700 - margin.right - margin.left;
height = 360 - margin.top - margin.bottom;

let chartHeight = 70;
let chartWidth = 750;


// append the svg object to the body of the page
let svgChartHeight = d3.select("#chart1")
    .append("svg")
    .attr("width", chartWidth + margin.left + margin.right)
    .attr("height", chartHeight + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")


let svgChartWeight = d3.select("#chart2")
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


var avgYears = [1896,2016]

gBrush.call(brush.move, avgYears.map(x));

let heightColor = 'hsl(11, 56%, 66%)';
let weightColor = 'hsl(274, 44%, 65%)';
let ageColor = 'hsl(94, 38%, 50%)';


function brushmoved() {
    let s = d3.event.selection;
    console.log(s)
    if (s == null) {
        var mousex = d3.mouse(this)[0]
        console.log(mousex)
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

function startChart(svg_, type) {
    // construct groupBy

    // Add Y axis
    let y
    let chartId
    let data
    let data_select

    var unit = "Kg";

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
            console.log("Hover")

            tooltip.transition()
                .duration(200)
                .style("opacity", .7);
            let keyText = d.key
            let valueText = d3.format(".1f")(d.value) + " " + unit

            tooltip.html(function(){
                return keyText + " <br> " + valueText
            })                .style("left", (d3.event.pageX - 15) + "px")
                .style("top", (d3.event.pageY - 35) + "px")
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

function constructCharts() {
    resetCharts()

    // require type -> 0 -> weight, 1->  height, 2-> age
    startChart(svgChartHeight, 1);
    startChart(svgChartWeight,  0);
    startChart(svgChartAge,  2);
}

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