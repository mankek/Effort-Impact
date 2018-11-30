// Variables for chart creation
var margin = {top: 40, right: 65, bottom: 40, left: 40}
var width = 500
var height = 500


var x_scale = d3.scaleLinear()
    .domain([0, 16])
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .domain([0, 16])
    .range([height, 0]);


if (String(DL_flag) == "true"){
    var c_scale = d3.scaleSequential(d3.interpolateRdBu)
        .domain([0, 1]);
} else {
    var c_scale = d3.scaleSequential(d3.interpolateSinebow)
        .domain([0, 1]);
}


var xAxis = d3.axisBottom(x_scale);
var yAxis = d3.axisLeft(y_scale);
var cAxis = d3.axisRight(c_scale);
var legendWidth = 20;
var legendHeight = 10;

// Chart background creation

var svg = d3.select('#scatterplot')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'chart')
  .style("background-color", "white")
  .attr("transform", 'translate(' + 10 + ",0)")

// Chart creation

var chart = svg.append('g')
    .attr('width', width)
    .attr('height', height)
    .attr("transform", 'translate(' + (margin.left) + "," + (margin.top) + ")")
    .attr('class', 'quadrants')

// Adding quadrant squares

// Square 1 (green)

chart.append("rect")
    .attr("width", (width/2))
    .attr("height", (height/2))
    .attr("transform", 'translate(0,0)')
    .style("fill", "#e6ffe6")

//// Square 2 (yellow-top)

chart.append("rect")
    .attr("width", (width/2))
    .attr("height", (height/2))
    .attr("transform", 'translate(' + width/2 + "," + "0)")
    .style("fill", '#ffffe6')

//// Square 3 (red)

chart.append("rect")
    .attr("width", (width/2))
    .attr("height", (height/2))
    .attr("transform", 'translate(' + width/2 + "," + height/2 + ")")
    .style("fill", "#ffe6e6")

//// Square 4 (yellow-bottom)

chart.append("rect")
    .attr("width", (width/2))
    .attr("height", (height/2))
    .attr("transform", 'translate(0,' + (height/2) + ")")
    .style("fill", "#ffffe6")


// Adding data to chart

var g = chart.selectAll('g')
    .data(y_raw)
    .enter()
    .append("g")

g.append("rect")
    .attr("y", function (d) {
        return y_scale(d);
    })
    .attr("dy", function (d) {
        return d;
    })
    .attr("x", function (d, i) {
        return x_scale(x_raw[i]);
    })
    .attr("dx", function (d, i) {
        return x_raw[i];
    })
    .attr("width", 25)
    .attr("height", 25)
    .style("fill", function (d, i) {
        if (String(DL_flag) == "true"){
            return c_scale(colors[i]);
        } else{
            return c_scale(i/100)
        }
    })
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .attr("id", function (d, i) {
        return i;
    })
    .attr("class", "Data");

// Gridlines

function make_x_gridlines(){
    return d3.axisBottom(x_scale)
        .tickValues([0, 16])
}

function make_y_gridlines(){
    return d3.axisLeft(y_scale)
        .tickValues([0,16])
}

chart.append("g")
    .attr("class", "grid")
    .attr("transform", 'translate(0,' + height + ')')
    .call(make_x_gridlines()
        .tickSize(-height)
        .tickFormat("")
    )

chart.append("g")
    .attr("class", "grid")
    .attr("transform", 'translate(0,0)')
    .call(make_y_gridlines()
        .tickSize(-width)
        .tickFormat("")
    )

// Adding axes and axis labels

//svg.append('g')
//    .attr('transform', 'translate(0,' + height + ')')
//    .attr('class', 'main axis date')
//    .call(xAxis);

svg.append("text")
    .attr("transform", "translate(" + ((width + margin.left + margin.right)/2) + "," + (height + (2*margin.bottom/3) + (margin.top)) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Effort");

//svg.append('g')
//    .attr('transform', 'translate(0,0)')
//    .attr('class', 'main axis date')
//    .call(yAxis);

svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", (margin.left/10))
    .attr("x", -((height + margin.top + margin.bottom)/2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Impact");

//// Chart title

svg.append("text")
    .attr("transform", "translate(" + ((width + margin.left + margin.right)/2) + "," + (2*margin.top/3) + ")")
    .style("text-anchor", "middle")
    .style("text-anchor", "right")
    .style("font-size", "25px")
    .text(title)


// Color Legend

if (String(DL_flag) == "true"){
    var legendsvg = svg.selectAll(".legend")
        .data(c_scale.ticks(50).slice(1).reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (width + margin.left) + "," + ((legendHeight * i) + margin.top) + ")"; });

    legendsvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", c_scale)
        .attr("class", "ColorScale")
        .attr("color_val", function(d) {
            return d
        })

    svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", (margin.top + margin.bottom + height/3))
    .attr("y", 0 - (width + margin.right + legendWidth))
    .attr("dy", "0.35em")
    .style("font-size", "20px")
    .text("Deadline")
}








