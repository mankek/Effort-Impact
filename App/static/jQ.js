$(document).ready(function(){
    var svg = d3.select("svg");
    var focused = null;

    $("#id_check").hide();
    $("#table").hide();


    // Hover event (show task info or color scale info)

    function hover_start(sqr){
        var index = $(sqr).attr("id")
        var table = document.getElementById("task_table")
        for (i in result[index]) {
            var row = table.insertRow(-1)
            var cell1 = row.insertCell(0)
            var cell2 = row.insertCell(1)
            cell1.innerHTML = JSON.stringify(i)
            cell2.innerHTML = JSON.stringify(result[index][i])
        }
        $("#Instructions").hide();
        if ($("#New").css("display") == "none" && $("#Update").css("display") == "none"){
            $("#table").show();
            $("#task_table").show()
        }
    }

    function hover_end(){
         $("#task_table").hide()
        var table = document.getElementById("task_table")
        for (b = 0; b < (fields.length - 2); b++) {
            table.deleteRow(-1)
        }
        if ($("#Update").css('display') == "none" || $("#Update").css("visibility") == "hidden") {
            if ($("#New").css('display') == "none" || $("#New").css("visibility") == "hidden") {
                if ($("#id_div").css('display') == "none" || $("#id_div").css("visibility") == "hidden") {
                    $("#Instructions").show();
                    $("#table").hide();
                }
            }
        }
    }

    $("rect.Data").hover(function(){
        hover_start(this);
    },
    function(){
        hover_end();
    });

    function DeadlineScaleHTML(color_val){
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

    function SubjectScaleHTML(color_val){
        color_val = Number(color_val)
        color_place = sj_colors.indexOf(color_val)
        if (color_place == -1){
            sub_text = "No Subject yet"
        }else {
            sub_text = result[color_place]["Subject"]
        }
        return sub_text
    }

    function DepartmentScaleHTML(color_val){
        color_val = Number(color_val)
        color_place = dp_colors.indexOf(color_val)
        if (color_place == -1){
            sub_text = "No Department yet"
        }else {
            sub_text = result[color_place]["Department"]
        }
        return sub_text
    }

    function ColorHover(this_sqr){
        var x_pos = Number($(this_sqr).position()["left"]) + 55
        var y_pos = $(this_sqr).position()["top"]
        var color_val = $(this_sqr).attr("color_val")
        if (scale_flag == "DL"){
            var html_value = DeadlineScaleHTML(color_val)
        } else if (scale_flag == "SJ"){
            var html_value = SubjectScaleHTML(color_val)
        } else if (scale_flag == "DP"){
            var html_value = DepartmentScaleHTML(color_val)
        }
        d3.select("body").append("div")
            .attr("class", "tooltip colortip")
            .style("opacity", 0.9)
            .style("left", String(x_pos) + "px")
            .style("top", y_pos + "px")
            .html(html_value)
    }


    $(".ColorScale").hover(function(d, i){
        ColorHover(this)
    },
    function(){
        $("div.colortip").remove();
    });

    // Click/keypress events (update or delete circle)

    g.selectAll("rect.Data")
        .on("click", function(d, i){
            $("#table").hide();
            $("#Instructions").hide();
            $("#Update").show();
            $("#id").val(this.id);

            focused = this;
        });

    function RendertoSubject(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "SJ"
        sj_or_dp_legend()
        render_graph(scale_flag)
        $(".ColorScale").hover(function(d, i){
            ColorHover(this)
        },
        function(){
            $("div.colortip").remove();
        });
        $(".ColorScale").on("click", function(){
            ColorClick();
        })
    }

    function RendertoDepartment(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "DP"
        sj_or_dp_legend()
        render_graph(scale_flag)
        $(".ColorScale").hover(function(d, i){
            ColorHover(this)
        },
        function(){
            $("div.colortip").remove();
        });
        $(".ColorScale").on("click", function(){
            ColorClick();
        })
    }

    function RendertoDeadline(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "DL"
        dl_legend()
        render_graph(scale_flag)
        $(".ColorScale").hover(function(d, i){
            ColorHover(this)
        },
        function(){
            $("div.colortip").remove();
        });
        $(".ColorScale").on("click", function(){
            ColorClick();
        })
    }

    function ColorClick(){
        if (scale_flag == "DL"){
            if (fields.includes("Subject")){
                RendertoSubject()
            } else if (fields.includes("Department")){
                RendertoDepartment()
            }else{
                console.log("No other Scales")
            }
        }else if (scale_flag == "SJ"){
            if (fields.includes("Department")){
                RendertoDepartment()
            } else if (fields.includes("Deadline")){
                RendertoDeadline()
            }else{
                console.log("No other Scales")
            }
        }else if (scale_flag == "DP"){
            if (fields.includes("Deadline")){
                RendertoDeadline()
            } else if (fields.includes("Subject")){
                RendertoSubject()
            }else{
                console.log("No other Scales")
            }
        }
    }

    $(".ColorScale").on("click", function(){
        ColorClick();
    })

    function ID_table_hide(){
        $(".id_text").remove();
        var table = document.getElementById("id_table");
        for (b = 0; b < $("rect.Data").length; b++) {
            table.deleteRow(-1)
        }
        $("#id_div").hide();
        $("#table").hide()
        $("#Instructions").show();
    }

    function ID_table_show(field){
        var table = document.getElementById("id_table");
        for (b=0; b < $("rect.Data").length; b++){
            var cir = $("rect.Data")[b]
            var x_pos = Number(d3.select(cir).attr("x")) + 5;
            var y_pos = Number(d3.select(cir).attr("y"));
            d3.select(".quadrants").append("text")
                .attr("y", y_pos)
                .attr("x", x_pos)
                .attr("dy", "1em")
                .attr("class", "id_text")
                .style("font", "bold")
                .text(d3.select(cir).attr("id"))
            var row_a = table.insertRow(-1)
            var cell_a = row_a.insertCell(0)
            var cell_b = row_a.insertCell(1)
            cell_a.innerHTML = d3.select(cir).attr("id")
            cell_b.innerHTML = JSON.stringify(result[b][field])
        }
        $("#Instructions").hide();
        $("#table").show();
        $("#id_div").show();
    }


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
                        url: "/delete/" + filename,
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
            } else if (d3.event.keyCode === 13 && $("#New").css("display") == "none"){
                if ($("#id_div").css('display') == "none" || $("#id_div").css("visibility") == "hidden") {
                    $("rect.Data").off()
                    $("#id_check").show()
                    $("#Task_check").on("click", function(){
                        $("#Desc_check").prop("checked", false)
                        ID_table_hide()
                        ID_table_show("Task")
                    })
                    $("#Desc_check").on("click", function(){
                        $("#Task_check").prop("checked", false)
                        ID_table_hide()
                        ID_table_show("Description")
                    })
                    $("#Task_check").click()
                } else {
                   ID_table_hide()
                   $("#id_check").hide();
                   $("rect.Data").hover(function(){
                        hover_start(this);
                    },
                    function(){
                        hover_end();
                    });
                }
            }
        });

    // Hide Forms

    $("#HideUpdate").on("click", function() {
        $("#Update").hide();
        $("#table").hide();
        $("#Instructions").show();
        focused = null;
    })

    $("#HideNew").on("click", function() {
        $("#New").hide();
        $("#table").hide();
        $("#Instructions").show();
        d3.selectAll(".Data:last-of-type").remove();
    })

    // Drag event

    var dragHandler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragend);

    function dragstarted(){
        hover_end();
    };

    function dragged(d, i){
        hover_end();
        d3.select(this)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .attr("x", function(d) {
                if (d3.event.x > x_scale(16)){
                    return x_scale(16)
                }else if (d3.event.x < x_scale(0)) {
                    return x_scale(0)
                }else {
                    return d3.event.x
                }
            })
            .attr("y", function(d) {
                if (d3.event.y < y_scale(16)) {
                    return y_scale(16)
                }else if (d3.event.y > y_scale(0)) {
                    return y_scale(0)
                }else {
                    return d3.event.y
                }
            })
            .attr("dx", function(d) {
                if (d3.event.x > x_scale(16)){
                    return 16
                }else if (d3.event.x < x_scale(0)) {
                    return 0
                }else {
                    return x_scale.invert(d3.event.x).toFixed(1)
                }
            })
            .attr("dy", function(d) {
                if (d3.event.y < y_scale(16)) {
                    return 16
                }else if (d3.event.y > y_scale(0)) {
                    return 0
                }else {
                    return y_scale.invert(d3.event.y).toFixed(1)
                }
            })
        if ($("#id_div").css("display") == "block"){
            $("div.tooltip").remove();
        }
    };

    function dragend(d, i){
        var circle = d3.select(this)
        $.ajax({
            url: "/update/" + filename,
            data: {"Effort": circle.attr('dx'),"Impact": circle.attr('dy'),"Id": i},
            success: function () {
                console.log("success!");
            },
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
        });
        if ($("#id_div").css("display") == "block") {
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
            }
        }
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
            .attr("y", function (d) {
                return d; })
            .attr("dy", function (d) {
                var c_y = 0
                return y_scale.invert(c_y); })
            .attr("x", function () { return 0 })
            .attr("dx", function () {
                var c_x = 0
                return x_scale.invert(c_x); })
            .attr("width", 25)
            .attr("height", 25)
            .attr("id", function(){
                if($("rect.Data").siblings().length) {
                    console.log($("rect.Data").siblings().length)
                    return $("rect.Data").siblings().length - 1;
                }
                return 0;
            })
            .attr("class", "Data")
            .style("fill", function (d, i) {
                if (fields.includes("Deadline")){
                    return c1_scale(dl_colors[i]);
                } else if (!fields.includes("Deadline") && fields.includes("Subject")){
                    return c2_scale(sj_colors[i]);
                } else {
                    console.log("no color scale")
                    return c2_scale(i/10);
                }
            })
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
        $("#table").hide();
        $("#Update").hide();
        $("#New").show();
    })
});