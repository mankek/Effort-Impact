// Variables for chart creation
var margin = {top: 40, right: 65, bottom: 40, left: 40}
var width = 700
var height = 500


var x_scale = d3.scaleLinear()
    .domain([-0.05, 16.9])
    .range([0, width]);
var y_scale = d3.scaleLinear()
    .domain([-0.85, 16.05])
    .range([height, 0]);

var c1_scale = d3.scaleSequential(d3.interpolateRdBu)
    .domain([0, 1]);
var c2_scale = d3.scaleSequential(d3.interpolateSinebow)
    .domain([0, 1]);

if (fields.includes("Deadline")){
    scale_flag = "DL"
} else if (!fields.includes("Deadline") && fields.includes("Subject")){
    scale_flag = "SJ"
} else if (!fields.includes("Deadline") && !fields.includes("Subject") && fields.includes("Department")){
    scale_flag = "DP"
} else {
    scale_flag = "None"
}

if ( fields.includes("Deadline") ){
    var cAxis = d3.axisRight(c1_scale)
} else {
    var cAxis = d3.axisRight(c2_scale);
}

var chart_margins = (margin.left + margin.right)/2

var xAxis = d3.axisBottom(x_scale);
var yAxis = d3.axisLeft(y_scale);
var legendWidth = 20;

// Chart background creation

var svg = d3.select('#scatterplot')
  .append('svg')
//  .attr('width', width + margin.left + margin.right)
//  .attr('height', height + margin.top + margin.bottom)
  .attr("preserveAspectRatio", "xMidYMid")
//  .attr("viewBox", " 0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
  .attr("viewBox", -chart_margins + " " + -margin.top + " 930 900")
  .attr('class', 'chart')
  .style("background-color", "white")
//  .attr("transform", "translate(" + (margin.left + margin.right)/2 + "," + margin.top + ")")

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
        if (scale_flag == "DL"){
            return c1_scale(dl_colors[i]);
        } else if (scale_flag == "SJ"){
            return c2_scale(sj_colors[i]);
        } else if (scale_flag == "DP"){
            return c2_scale(dp_colors[i]);
        } else if (scale_flag == "None"){
            return c2_scale(i/10);
        }
    })
    .style("stroke", "grey")
    .style("stroke-width", 2)
    .attr("id", function (d, i) {
        return i;
    })
    .attr("class", "Data");


function render_graph(scale_flag_in){
    g.select("rect.Data")
        .style("fill", function (d, i) {
            if (scale_flag_in == "DL"){
                return c1_scale(dl_colors[i]);
            } else if (scale_flag_in == "SJ"){
                return c2_scale(sj_colors[i]);
            } else if (scale_flag_in == "DP"){
                return c2_scale(dp_colors[i]);
            } else if (scale_flag_in == "None"){
                return c2_scale(i/10);
            }
        })
}


if(chart.selectAll(".Data").empty()) {
    console.log("empty")
    var g = chart.selectAll("g")
        .data([0])
        .enter()
        .append("g")
}

// Gridlines

function make_x_gridlines(){
    return d3.axisBottom(x_scale)
        .tickValues([-0.05, 16.9])
}

function make_y_gridlines(){
    return d3.axisLeft(y_scale)
        .tickValues([-0.85,16.05])
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
    .style("font-size", "25px")
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
    .style("font-size", "25px")
    .text("Impact");

//// Chart title

svg.append("text")
    .attr("transform", "translate(" + ((width + margin.left + margin.right)/2) + "," + (2*margin.top/3) + ")")
    .style("text-anchor", "middle")
    .style("text-anchor", "right")
    .style("font-size", "35px")
    .text(title)


// Color Legend

// deadline legend

function dl_legend() {
    var legendsvg = svg.selectAll(".legend")
        .data(c1_scale.ticks(50).slice(1).reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (width + margin.left) + "," + ((10 * i) + margin.top) + ")"; })
        .attr("class", "legend")

    legendsvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", 10)
        .style("fill", c1_scale)
        .attr("class", "ColorScale")
        .attr("color_val", function(d) {
            return d
        })

    svg.append("text")
    .attr("transform", "rotate(90)")
    .attr("x", (margin.top + margin.bottom + height/3))
    .attr("y", 0 - (width + margin.right + legendWidth))
    .attr("dy", "0.35em")
    .attr("class", "axis_text")
    .style("font-size", "25px")
    .text("Deadline")
}

// subject legend

function sj_or_dp_legend(){
    var legendsvg = svg.selectAll(".legend")
        .data(c2_scale.ticks(20).slice(1).reverse())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (width + margin.left) + "," + ((25 * i) + margin.top) + ")"; })
        .attr("class", "legend")

    legendsvg.append("rect")
        .attr("width", legendWidth)
        .attr("height", 25)
        .style("fill", c2_scale)
        .attr("class", "ColorScale")
        .attr("color_val", function(d) {
            return d
        })

    if (scale_flag == "SJ"){
        svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("x", (margin.top + margin.bottom + height/3))
        .attr("y", 0 - (width + margin.right + legendWidth))
        .attr("dy", "0.35em")
        .attr("class", "axis_text")
        .style("font-size", "25px")
        .text("Subject")
    } else if (scale_flag == "DP"){
        svg.append("text")
        .attr("transform", "rotate(90)")
        .attr("x", (margin.top + margin.bottom + height/3))
        .attr("y", 0 - (width + margin.right + legendWidth))
        .attr("dy", "0.35em")
        .attr("class", "axis_text")
        .style("font-size", "25px")
        .text("Department")
    }
}


if (scale_flag == "DL") {
    dl_legend()
} else if (scale_flag == "SJ" || scale_flag == "DP") {
    sj_or_dp_legend()
}










