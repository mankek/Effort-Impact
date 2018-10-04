$(document).ready(function(){
    var svg = d3.select("svg");
    var focused = null;

    // Hover event (show task info)

    $("circle").hover(function(){
        var index = $(this).attr("id")
        var table = document.getElementById("task_table")
        for (i in result[index]) {
            var row = table.insertRow(-1)
            var cell1 = row.insertCell(0)
            var cell2 = row.insertCell(1)
            cell1.innerHTML = JSON.stringify(i)
            cell2.innerHTML = JSON.stringify(result[index][i])
        }
        $("#task_table").show()
    },
    function(){
        $("#task_table").hide()
        var table = document.getElementById("task_table")
        for (b = 0; b < 5; b++) {
            table.deleteRow(-1)
        }
    });

    // Click/keypress events (update or delete circle)

    g.selectAll("circle")
        .on("click", function(d, i){
            $("#form2").show();
            $("#id").val(i);
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
                    var cir_id = '{ "Id": ' + focused.id + ' }';
                    $.ajax({
                        type: "POST",
                        url: "/delete",
                        data: cir_id,
                        contentType: "application/json;charset=UTF-8",
                        error: function (xhr, errorThrown){
                            console.log(xhr.responseText);
                            console.log(errorThrown);
                        }
                    })
                    $("#form2").hide();
                    focused = null;
                }
            } else if (d3.event.keyCode === 13){
                if ($("#id_table").css('display') == "none" || $("#id_table").css("visibility") == "hidden") {
                    var table = document.getElementById("id_table");
                    for (b=0; b < $("circle").length; b++){
                        var cir = $("circle")[b]
                        var x_pos = Number(d3.select(cir).attr("cx")) + 55;
                        var y_pos = d3.select(cir).attr("cy");
                        d3.select("body").append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0.9)
                            .style("left", String(x_pos) + "px")
                            .style("top", (y_pos) + "px")
                            .html(d3.select(cir).attr("id"))
                        var row_a = table.insertRow(-1)
                        var cell_a = row_a.insertCell(0)
                        var cell_b = row_a.insertCell(1)
                        cell_a.innerHTML = d3.select(cir).attr("id")
                        cell_b.innerHTML = JSON.stringify(result[b]["Task"])
                    };
                    $("#id_table").show();
                } else {
                    $("div.tooltip").remove();
                    var table = document.getElementById("id_table");
                    for (b = 0; b < $("circle").length; b++) {
                        table.deleteRow(-1)
                    }
                    $("#id_table").hide();
                }
            }
        });

    // Drag event

    var dragHandler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragend);

    function dragstarted(){
        $("#task_table").hide();
    };

    function dragged(d, i){
        d3.select(this)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .attr("cx", d3.event.x)
            .attr("cy", d3.event.y)
            .attr("x", x_scale.invert(d3.event.x).toFixed(1))
            .attr("y", y_scale.invert(d3.event.y).toFixed(1))
    };

    function dragend(d, i){
        var circle = d3.select(this)
        var new_loc = {
            Effort: circle.attr("y"),
            Impact: circle.attr("x"),
            Id: i
        };
        $.ajax({
            type: "POST",
            url: "/update",
            data: JSON.stringify(new_loc),
            contentType: "application/json;charset=UTF-8",
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
        });
        console.log("Dragend!")
    }
    dragHandler(svg.selectAll("circle"));

    // Double click event (add new circle)

    svg.on("dblclick", function(){
        var mouse = d3.mouse(this);
        g.selectAll("scatterplot")
            .data([mouse[1]])
            .enter().append("svg:circle")
            .attr('transform', 'translate(-' + margin.left + ',-' + margin.top + ')')
            .attr("cy", function (d) { return d; })
            .attr("y", function (d) {
                var c_y = d - margin.top
                document.getElementById("Effort").innerHTML = y_scale.invert(c_y).toFixed(1);
                return y_scale.invert(c_y); })
            .attr("cx", function () { return mouse[0] })
            .attr("x", function () {
                var c_x = mouse[0] - margin.left
                document.getElementById("Impact").innerHTML = x_scale.invert(c_x).toFixed(1);
                return x_scale.invert(c_x); })
            .attr("r", 15)
            .attr("id", function(){
                return $("circle").siblings().length - 1;
            })
            .style("fill", function () { return c_scale(1); })
            .on("click", function () {
                if (d3.event.ctrlKey){
                    d3.select(this).remove();
                    var table = document.getElementById("task_table")
                    for (b = 0; b < 5; b++) {
                        table.deleteRow(-1)
                    }
                }
            });
        $("#form2").hide();
        $("#form").show();
        $("#form").submit(function(){
            var eff_data = {
                Effort: $("#Effort").html(),
                Impact: $("#Impact").html(),
                };
            $.ajax({
                type: "POST",
                url: "/new",
                data: JSON.stringify(eff_data),
                contentType: "application/json;charset=UTF-8",
                error: function (xhr, errorThrown){
                    console.log(xhr.responseText);
                    console.log(errorThrown);
                }
            });
        })
    })
});