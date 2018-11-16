$(document).ready(function(){
    var svg = d3.select("svg");
    var focused = null;


    // Hover event (show task info or color scale info)

    $("rect.Data").hover(function(){
        var index = $(this).attr("id")
        var table = document.getElementById("task_table")
        for (i in result[index]) {
            var row = table.insertRow(-1)
            var cell1 = row.insertCell(0)
            var cell2 = row.insertCell(1)
            cell1.innerHTML = JSON.stringify(i)
            cell2.innerHTML = JSON.stringify(result[index][i])
        }
        $("#Instructions").hide();
        $("#task_table").show()
    },
    function(){
        $("#task_table").hide()
        var table = document.getElementById("task_table")
        for (b = 0; b < 5; b++) {
            table.deleteRow(-1)
        }
        if ($("#Update").css('display') == "none" || $("#Update").css("visibility") == "hidden") {
            if ($("#New").css('display') == "none" || $("#New").css("visibility") == "hidden") {
                if ($("#id_table").css('display') == "none" || $("#id_table").css("visibility") == "hidden") {
                    $("#Instructions").show();
                }
            }
        }
    });

    function ColorScaleHTML(color_val){
        days_due = (Number(color_val/0.0027397260273973))
        if (days_due > 365){
            years_due = Math.floor(days_due/365)
            remaining_days = Math.round(days_due % 365)
            return String(years_due) + " years and " + String(remaining_days) + " days until due"
        } else if(days_due < 1){
            hours_due = Math.round(days_due * 24)
            return String(hours_due) + " hours until due"
        } else{
            return String(Math.round(days_due)) + " days until due"
        }
    }

    $(".ColorScale").hover(function(){
        var x_pos = Number($(this).position()["left"]) + 55
        var y_pos = $(this).position()["top"]
        var color_val = $(this).attr("color_val")
        var html_value = ColorScaleHTML(color_val)
        d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0.9)
            .style("left", String(x_pos) + "px")
            .style("top", y_pos + "px")
            .html(html_value)
    },
    function(){
        $("div.tooltip").remove();
        console.log("done")
    });

    // Click/keypress events (update or delete circle)

    g.selectAll("rect.Data")
        .on("click", function(d, i){
            $("#Instructions").hide();
            $("#Update").show();
            $("#id").val(this.id);
            focused = this;
        });

    d3.select("body")
        .on('keydown', function (){
            console.log(d3.event.keyCode);
            if (d3.event.keyCode === 17){
                if (focused == null){
                    alert("No task selected. Click a task to select.")
                } else{
                    console.log(focused)
                    d3.select(focused).remove();
                    var table = document.getElementById("task_table");
                    for (b = 0; b < 5; b++) {
                        table.deleteRow(-1)
                    }
                    $.ajax({
                        url: "/delete",
                        data: { "Id": focused.id },
                        success: function () {
                            console.log("success!");
                        },
                        error: function (xhr, errorThrown){
                            console.log(xhr.responseText);
                            console.log(errorThrown);
                        }
                    })
                    $("#Update").hide();
                    $("#Instructions").show();
                    focused = null;
                }
            } else if (d3.event.keyCode === 13){
                if ($("#id_table").css('display') == "none" || $("#id_table").css("visibility") == "hidden") {
                    var table = document.getElementById("id_table");
                    for (b=0; b < $("rect.Data").length; b++){
                        var cir = $("rect.Data")[b]
                        var x_pos = Number(d3.select(cir).attr("x")) + 60;
                        var y_pos = Number(d3.select(cir).attr("y")) + 30;
                        d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0.9)
                            .style("left", String(x_pos) + "px")
                            .style("top", String(y_pos) + "px")
                            .html(d3.select(cir).attr("id"))
                        var row_a = table.insertRow(-1)
                        var cell_a = row_a.insertCell(0)
                        var cell_b = row_a.insertCell(1)
                        cell_a.innerHTML = d3.select(cir).attr("id")
                        cell_b.innerHTML = JSON.stringify(result[b]["Description"])
                    };
                    $("#Instructions").hide();
                    $("#id_table").show();
                } else {
                    $("div.tooltip").remove();
                    var table = document.getElementById("id_table");
                    for (b = 0; b < $("rect.Data").length; b++) {
                        table.deleteRow(-1)
                    }
                    $("#id_table").hide();
                    $("#Instructions").show();
                }
            }
        });

    // Hide Forms

    $("#HideUpdate").on("click", function() {
        $("#Update").hide();
        $("#Instructions").show();
        focused = null;
    })

    $("#HideNew").on("click", function() {
        $("#New").hide();
        $("#Instructions").show();
        d3.selectAll(".Data:last-of-type").remove();
    })

    // Drag event

    var dragHandler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragend);

    function dragstarted(){
        $("#task_table").hide();
    };

    function dragged(d, i){
        $("#task_table").hide();
        d3.select(this)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .attr("x", d3.event.x)
            .attr("y", d3.event.y)
            .attr("dx", x_scale.invert(d3.event.x).toFixed(1))
            .attr("dy", y_scale.invert(d3.event.y).toFixed(1))
    };

    function dragend(d, i){
        var circle = d3.select(this)
        $.ajax({
            url: "/update",
            data: {"Effort": circle.attr('dx'),"Impact": circle.attr('dy'),"Id": i},
            success: function () {
                console.log("success!");
            },
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
        });
        console.log("Dragend!")
    }
    dragHandler(svg.selectAll(".Data"));

    // Double click event (add new circle)

    chart.on("dblclick", function(){
        var mouse = d3.mouse(this);
        g.selectAll("chart")
            .data([0])
            .enter()
            .append("svg:rect")
            .attr("y", function (d) { return d; })
            .attr("dy", function (d) {
                var c_y = 0 - margin.top
                return y_scale.invert(c_y); })
            .attr("x", function () { return 0 })
            .attr("dx", function () {
                var c_x = 0 - margin.left
                return x_scale.invert(c_x); })
            .attr("width", 25)
            .attr("height", 25)
            .attr("id", function(){
                return $("rect.Data").siblings().length - 1;
            })
            .attr("class", "Data")
            .style("fill", function () { return c_scale(1); })
            .style("stroke", "grey")
            .style("stroke-width", 2)
            .on("click", function () {
                if (d3.event.ctrlKey){
                    d3.select(this).remove();
                    var table = document.getElementById("task_table")
                    for (b = 0; b < 5; b++) {
                        table.deleteRow(-1)
                    }
                }
            });
        $("#Instructions").hide();
        $("#Update").hide();
        $("#New").show();
    })
});