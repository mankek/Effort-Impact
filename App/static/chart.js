// Variables for chart creation
var margin = {top: 30, right: 30, bottom: 30, left: 30}
var width = 650
var height = 650


var x_scale = d3.scaleLinear()
    .domain([0, 10])
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .domain([0, 16])
    .range([height, 0]);
var c_scale = d3.scaleSequential(d3.interpolateRdBu)
    .domain([0, 1]);

var xAxis = d3.axisBottom(x_scale);
var yAxis = d3.axisLeft(y_scale);
var cAxis = d3.axisRight(c_scale);
var legendWidth = 25;
var legendHeight = 20;

// Chart background creation

var svg = d3.select('#scatterplot')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .attr('class', 'chart')
  .style("background-color", "white")

// Chart creation

var chart = svg.append('g')
    .attr('width', width - (margin.left + margin.right))
    .attr('height', height - (margin.top + margin.bottom))
    .attr("transform", 'translate(' + (margin.left/2) + "," + (margin.top/2) + ")")
    .style("background-color", 'black')

// Adding data to chart

var g = chart.selectAll('g')
    .data(y_raw)
    .enter()
    .append("g")

g.append("circle")
    .attr("cy", function (d) {
        return y_scale(d);
    })
    .attr("y", function (d) {
        return d;
    })
    .attr("cx", function (d, i) {
        return x_scale(x_raw[i]);
    })
    .attr("x", function (d, i) {
        return x_raw[i];
    })
    .attr("r", 15)
    .style("fill", function (d, i) {
        return c_scale(colors[i]);
    })
    .attr("id", function (d, i) {
        return i;
    });

//var g = svg.append('g')
//  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
//  .attr('width', width+50)
//  .attr('height', height-20)
//  .attr('class', 'main')

// Gridlines

function make_x_gridlines(){
    return d3.axisBottom(x_scale)
        .tickValues([0, 5, 10])
}

function make_y_gridlines(){
    return d3.axisLeft(y_scale)
        .tickValues([0, 8, 16])
}

chart.append("g")
    .attr("class", "grid")
    .attr('transform', 'translate(' + margin.left + ',' + height + ')')
    .call(make_x_gridlines()
        .tickSize(-height + 22)
        .tickFormat("")
    )

chart.append("g")
    .attr("class", "grid")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(make_y_gridlines()
        .tickSize(-width + 13)
        .tickFormat("")
    )

// Adding axes and axis labels

//svg.append('g')
//    .attr('transform', 'translate(0,' + height + ')')
//    .attr('class', 'main axis date')
//    .call(xAxis);

svg.append("text")
    .attr("transform", "translate(" + (width/2) + "," + (height + margin.top + 15) + ")")
    .style("text-anchor", "middle")
    .style("font-size", "20px")
    .text("Impact");
//
////main.append('g')
////    .attr('transform', 'translate(0,0)')
////    .attr('class', 'main axis date')
////    .call(yAxis);
//
//svg.append("text")
//    .attr("transform", "rotate(-90)")
//    .attr("y", 0 - margin.left + 10)
//    .attr("x", 0 - (height/2))
//    .attr("dy", "1em")
//    .style("text-anchor", "middle")
//    .style("font-size", "20px")
//    .text("Effort");
//
//// Chart title
//
//svg.append("text")
//    .attr("transform", "translate(" + (width/2) + ",0)")
//    .style("text-anchor", "middle")
//    .style("text-anchor", "right")
//    .style("font-size", "25px")
//    .text("Effort-Impact Matrix")
//
//
//// Color Legend
//
//var legendsvg = svg.selectAll(".legend")
//    .data(c_scale.ticks(20).slice(1).reverse())
//    .enter().append("g")
//    .attr("transform", function(d, i) { return "translate(" + (width + 30) + "," + (20 + i * 20) + ")"; });
//
//legendsvg.append("rect")
//    .attr("width", legendWidth)
//    .attr("height", legendHeight)
//    .style("fill", c_scale);
//
//svg.append("text")
//    .attr("transform", "rotate(90)")
//    .attr("x", 0 + ((height/2) - 25))
//    .attr("y", 0 - (width + (margin.right + 20)))
//    .attr("dy", "0.35em")
//    .style("font-size", "20px")
//    .text("Deadline")





