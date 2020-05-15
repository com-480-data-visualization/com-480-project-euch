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
let handleRadius = 17

// x axis for all charts and brush
var svg = svgChartX.append("svg")
        .attr("width", chartWidth + margin.left + margin.right)
        .attr("height", 37),
    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + ",0)")
const brush = d3.brushX()
    .extent([[-5, handleRadius -  18], [chartWidth + 5, handleRadius + 18]])
    .on("start brush end", brushmoved);


var gBrush =
    g.attr("class", "brush")
    .call(brush)



var handle = gBrush.selectAll(".handle--custom")
    .data([{type: "w"}, {type: "e"}])
    .enter().append("path")
    .attr("class", "handle--custom")
    .attr("fill", "#666")
    .attr("fill-opacity", 0.8)
    .attr("stroke", "#000")
    .attr("stroke-width", 1.5)
    .attr("cursor", "ew-resize")
    .attr("d", d3.arc()
        .innerRadius(10)
        .outerRadius(handleRadius)
        .startAngle(0)
        .endAngle(function(d, i) { return i ? Math.PI : -Math.PI; }))
    .attr("display" , "none");


var avgYears = [1896,2016]

gBrush.call(brush.move, avgYears.map(x));

function brushmoved() {
    let s = d3.event.selection;
    if (s == null) {
    } else {
        avgYears = s.map(inverseX).map(Math.round)
        handle.attr("display", null)
            .attr("transform", function(d, i) { return "translate(" + s[i] + ", 16 )"; });
    }
}

//call function so graphs are displayed empty
function initCharts() {
// Y axis label:
    svgChartWeight.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - chartHeight/2 + 50)
        .text("Avg Weight")

    svgChartHeight.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - chartHeight/2 + 50)
        .text("Avg Height")

    svgChartAge.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top - chartHeight/2 + 50)
        .text("Avg Age")

    // x axis on the last div
    xAxis = g.call(d3.axisBottom(x).tickSize(5).tickFormat(d3.format("d")))

    let y = d3.scalePoint()
        .range([chartHeight, 0])

    // initial y axis
    svgChartWeight.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));

    svgChartHeight.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));

    svgChartAge.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickFormat(d3.format("d")));
}

initCharts()

function startChart(svg_, type) {
    // construct groupBy

    // Add Y axis
    let y;
    let chartId ;
    let data;

    var lineColor;
    switch(type) {
        case 0:
            // weight
            let weightGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.weight; }); })
                .entries(data_f);

            weightGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })

            data = weightGroupByYear

            chartId = "#chart2"
            lineColor ='hsl(274, 44%, 65%)';

            y = d3.scaleLinear()
                .domain([d3.min(data_f, function(d) {return d.weight}),d3.max(data_f, function (d){return d.weight})])
                .range([ chartHeight, 0 ]);


            break;
        case 1:
            //height
            let heightGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.height; }); })
                .entries(data_f);

            heightGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })

            data = heightGroupByYear

            chartId = "#chart1"
            lineColor = 'hsl(11, 56%, 66%)';
            y = d3.scaleLinear()
                .domain([d3.min(data_f, function(d) {return d.height}),d3.max(data_f, function (d){return d.height})])
                .range([ chartHeight, 0 ]);


            break;
        case 2:
            //age
            chartId = "#chart3"

            let ageGroupByYear = d3.nest()
                .key(function(d){return d.year; }) //NB: use "d.year", not "year"
                .rollup(function(v) { return d3.mean(v, function(d) { return d.age; }); })
                .entries(data_f);

            ageGroupByYear.sort(function(x, y){
                return d3.ascending(x.key, y.key);
            })

            data = ageGroupByYear

            lineColor = 'hsl(94, 38%, 50%)';
            y = d3.scaleLinear()
                .domain([d3.min(data_f, function(d) {return d.age}),d3.max(data_f, function (d){return d.age})])
                .range([ chartHeight, 0 ]);

            break;
    }

    // y axis on all charts
    svg_.append("g")
        .attr("transform", "translate(-15,0)")
        .call(d3.axisLeft(y).tickSize(5).tickValues(y.domain()).tickFormat(d3.format("d")));


    // Add the line
    svg_.append("path")
        .datum(data)
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
        .attr("fill", "#000000");

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
}