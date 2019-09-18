$(document).ready(function(){

    // svg element that holds chart
    var svg = d3.select("svg");

    // focused variable holds a reference to the most recently clicked square; used for deletion
    var focused = null;

    // Initially all info divs except Instructions are hidden
    $("#id_div").hide();
    $("#task_div").hide();
    $("#New").hide();
    $("#Update").hide();



    // Square Hover functions

    // defines on hover behavior for a square in the graph
    function hover_start(sqr){
        var index = $(sqr).attr("id") // square id corresponds to the position of it's task in results
        var table = document.getElementById("task_table")
        for (i in result[index]) { // task table is populated with square's task info
            var no_show = ["Task_ID", "Effort", "Impact", "Completed", "Unplaced", "Date_Completed"]
            if (no_show.includes(i) == false){
                var row = table.insertRow(-1)
                var cell1 = row.insertCell(0)
                var cell2 = row.insertCell(1)
                cell1.innerHTML = JSON.stringify(i)
                cell2.innerHTML = JSON.stringify(result[index][i])
            }
        }
        if ($("#New").css("display") == "none" && $("#Update").css("display") == "none" && $("#id_div").css("display") == "none"){
            $("#Instructions").hide();
            $("#task_div").show(); // if no forms are showing, shows task table
        }
    }

    // defines off hover behavior for a square in the graph
    function hover_end(){
        var table = document.getElementById("task_table")
        for (b = 0; b < (fields.length - 2); b++) { // contents of task table are deleted
            table.deleteRow(-1)
        }
        if ($("#Update").css('display') == "none" || $("#Update").css("visibility") == "hidden") {
            if ($("#New").css('display') == "none" || $("#New").css("visibility") == "hidden") {
                if ($("#id_div").css('display') == "none" || $("#id_div").css("visibility") == "hidden") {
                    $("#Instructions").show();
                    $("#task_div").hide(); // if no forms are open and id table isn't open, shows Instructions and hides task table
                }
            }
        }
    }

    // Color Scale Hover Functions

    // calculates the "time until deadline" value for each color in the deadline color scale
    function DeadlineScaleHTML(color_val){
        days_due = (Number(color_val/0.0027397260273973)) // matches equation used in backend to calculate time until due for tasks
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

    // returns value for colors in subject color scale
    function SubjectScaleHTML(color_val){
        color_val = Number(color_val) // converts scale value of color to number
        color_place = sj_colors.indexOf(color_val) // finds position of scale value in results subject color values list
        if (color_place == -1){
            sub_text = "No Subject yet" // if scale value isn't in list, that value isn't being used by a task yet
        }else {
            sub_text = result[color_place]["Subject"] // if scale value is in list, finds corresponding subject in results
        }
        return sub_text
    }

    // returns value for colors in department color scale
    function DepartmentScaleHTML(color_val){
        color_val = Number(color_val) // converts scale value of color to number
        color_place = dp_colors.indexOf(color_val) // finds position of scale value in results department color values list
        if (color_place == -1){
            sub_text = "No Department yet" // if scale value isn't in list, that value isn't being used by a task yet
        }else {
            sub_text = result[color_place]["Department"] // if scale value is in list, finds corresponding department in results
        }
        return sub_text
    }

    // defines on hover behavior for the rectangles in the color scales
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
        d3.select("body").append("div") // creates and adds object that appears on hovering with value info
            .attr("class", "tooltip colortip")
            .style("opacity", 0.9)
            .style("left", String(x_pos) + "px")
            .style("top", y_pos + "px")
            .html(html_value)
    }

    // Hover Events

    // attaches hover event to all task squares on the graph
    $("rect.Data").hover(function(){
        hover_start(this);
    },
    function(){
        hover_end();
    });

    // attaches hover event to color scale
    $(".ColorScale").hover(function(d, i){
        ColorHover(this)
    },
    function(){
        $("div.colortip").remove(); // removes the object with the value info
    });

    // color change on stored tasks
    $(".stored_task").hover(function(){
        this.style.backgroundColor = "PaleTurquoise"
    },
    function(){
        this.style.backgroundColor = "#e8f0fc"
    });


    // Task Square Click Event

    // attaches a click event to all task squares in chart
    g.selectAll("rect.Data")
        .on("click", function(d, i){
            if ($("#id_div").css('display') == "none" && $("#New").css("display") == "none") {
                $("#task_div").hide();
                $("#Instructions").hide();
                $("#Update").show(); // hides all other info divs and shows task change form
                $("#id").val(result[this.id]["Task_ID"]); // populates id field in change form
                focused = this; // clicked square becomes saved under focused variable (for use in deletion)
            }
        });

    // Stored Task Click Event

    // attaches a click event to all stored tasks
     $( "p[id|='Unplaced']").on("click", function(){
        if ($("#id_div").css('display') == "none" && $("#New").css("display") == "none") {
            $("p[id|='Unplaced']").css("color", "black")
            this.style.color = "red"
            $("#task_div").hide();
            $("#Instructions").hide();
            $("#Update").show(); // hides all other info divs and shows task change form
            $("#id").val(result[this.id]["Task_ID"]); // populates id field in change form
            focused = this;
        }
     })

    // Color Scale Click Functions

    // defines change to subject color scale
    function RendertoSubject(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "SJ"
        set_flagCookie("SJ")
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

    // defines change to department color scale
    function RendertoDepartment(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "DP"
        set_flagCookie("DP")
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

    // defines change to deadline scale
    function RendertoDeadline(){
        $(".legend").remove()
        $("div.colortip").remove()
        $(".axis_text").remove()
        scale_flag = "DL"
        set_flagCookie("DL")
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

    // defines click behavior for color scale - switching between color scales
    function ColorClick(){
        if (scale_flag == "DL"){
            if (fields.indexOf("Subject") != -1){
                RendertoSubject()
            } else if (fields.indexOf("Department") != -1){
                RendertoDepartment()
            }else{
                console.log("No other Scales")
            }
        }else if (scale_flag == "SJ"){
            if (fields.indexOf("Department") != -1){
                RendertoDepartment()
            } else if (fields.indexOf("Deadline") != -1){
                RendertoDeadline()
            }else{
                console.log("No other Scales")
            }
        }else if (scale_flag == "DP"){
            if (fields.indexOf("Deadline") != -1){
                RendertoDeadline()
            } else if (fields.indexOf("Subject") != -1){
                RendertoSubject()
            }else{
                console.log("No other Scales")
            }
        }
    }

    // Color Scale Click Event

    // attaches click event to color scale
    $(".ColorScale").on("click", function(){
        ColorClick();
    })

    // attaches id table click event
    $("#list").on("click", function(){
        if ($("#New").css("display") == "none" && $("#Update").css("display") == "none"){
            if ($("#id_div").css('display') == "none" || $("#id_div").css("visibility") == "hidden"){
                $("#Task_check").on("click", function(){ // if task radio button is clicked, id table displays Task
                    $("#Desc_check").prop("checked", false)
                    ID_table_hide()
                    ID_table_show("Task")
                })
                $("#Desc_check").on("click", function(){ // If description radio button is clicked, id table displays description
                    $("#Task_check").prop("checked", false)
                    ID_table_hide()
                    ID_table_show("Description")
                })
                $("#Task_check").click()
            } else { // if id table is already visible, id table is hidden
               ID_table_hide()
            }
        }
    })

    // attaches add new task button click event

    $("#add_new").on("click", function(){
        if ($("#id_div").css('display') == "none" && $("#Update").css("display") == "none") {
            Add_new();
        }
    })

    // attaches show instructions button click event
    $("#instr_show").on("click", function(){
        // hide change form
        $("#Update").hide();
        $("#task_div").hide();
        $("#id_div").hide();
        focused = null;
        $("p[id|='Unplaced']").css("color", "black")
        // hides id table
        $(".id_text").remove(); // removes id text from task squares
        var table = document.getElementById("id_table");
        for (b = 0; b < $("rect.Data").length; b++) { // contents of id table are deleted
            table.deleteRow(-1)
        }
        // hides new task form
        if ($("#New").css("display") != "none"){
            d3.selectAll(".Data:last-of-type").remove();
        }
        $("#New").hide();
        $("#Instructions").show();
    })

    // Button Press Functions

    // defines showing the id table
    function ID_table_show(field){
        var table = document.getElementById("id_table");
        for (b=0; b < $("rect.Data").length; b++){ // populates the id table with task info from all the tasks on the chart
            var cir = $("rect.Data")[b]
            var x_pos = Number(d3.select(cir).attr("x")) + 5;
            var y_pos = Number(d3.select(cir).attr("y"));
            d3.select(".quadrants").append("text") // creates and adds text to each square, showing it's id
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
        $("#task_div").hide();
        $("#id_div").show(); // hides all other info divs and shows the id table
    }

    // defines hiding the id table
    function ID_table_hide(){
        $(".id_text").remove(); // removes id text from task squares
        var table = document.getElementById("id_table");
        for (b = 0; b < $("rect.Data").length; b++) { // contents of id table are deleted
            table.deleteRow(-1)
        }
        $("#id_div").hide();
        $("#task_div").hide()
        $("#Instructions").show(); // all other info divs are hidden and instructions are shown
    }

    // Key Press Events

    $("body")
        .on('keydown', function (event){
            console.log(event.keyCode);
            if (event.keyCode === 46){ // If delete button is pressed, id for square in focused is sent to back-end for deletion
                if (focused === null){
                    alert("No task selected. Click a task to select.")
                } else{
                    $(focused).remove();
                    var table = document.getElementById("task_table");
                    for (b = 0; b < 5; b++) {
                        table.deleteRow(-1)
                    }
                    console.log($("#id").val())
                    $.ajax({
                        url: "/delete/" + filename,
                        data: { "Id": $("#id").val() },
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
            }
        });

    // Hides change form when 'Go back' button is pressed
    $("#HideUpdate").on("click", function() {
        $("#Update").hide();
        $("#task_div").hide();
        $("#id_div").hide();
        $("#Instructions").show();
        focused = null;
        $("p[id|='Unplaced']").css("color", "black")
    })

    // Hides new task form when 'Go back' button is pressed
    $("#HideNew").on("click", function() {
        $("#New").hide();
        $("#task_div").hide();
        $("#id_div").hide();
        $("#Instructions").show();
        d3.selectAll(".Data:last-of-type").remove();
    })


    // Drag Functions

    //vars for svg->div dragging
    var $helper = null // Square clone for dragging outside svg
    var $helperparent = $('body')

    // When dragging from chart to storage sends data to backend
    function drag_chart(drag_id, dest){
        var task = "Graph-" + drag_id
        console.log(task)
        $.ajax({
            url: "/move/" + filename,
            data: { "Data": task, "Dest": dest },
            success: function () {
                location.reload(true)
            },
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
        })
    }

    // Tracks when the mouse enters/leaves the Unplaced container
    var isOnUnplaced = false;
    $("#Unplaced").mouseenter(function(){isOnUnplaced=true;})
    $("#Unplaced").mouseleave(function(){isOnUnplaced=false;})

    // Tracks when the mouse enters/leaves the Completed container
    var isOnComplete = false;
    $("#Completed").mouseover(function(){isOnComplete=true;})
    $("#Completed").mouseleave(function(){isOnComplete=false;})


    // defines behavior when square drag starts
    function dragstarted(){
        hover_end(); // stops task square hover behavior when dragging
        $helper = $("<div></div>").appendTo($helperparent) // creates square clone for dragging outside graph
        $helper.css({
            "position": "absolute",
            "display": "none",
            "width": "25px",
            "height": "25px",
            "background-color": "lightgrey",
            "border": "2px solid grey"
        })
    };

    // defines behavior during square dragging
    function dragged(d, i){
        hover_end();

        mousepos = d3.mouse($helperparent[0])

        $helper.css({
            left: mousepos[0] + 10, // Square clone is positioned so that it doesn't interfere with mouseenter event
            top: mousepos[1] + 10
        });
        d3.select(this)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
            .attr("x", function(d, i) { // replaces squares x coordinate with coordinates of event
                if (d3.event.x > x_scale(16.25)){ // if coordinates go outside graph, they are limited to stay within graph
                    $helper.show() // if coordinates go outside graph, square clone is shown
                    return x_scale(16.25)
                }else if (d3.event.x < x_scale(0)) {
                    $helper.show()
                    return x_scale(0)
                }else {
                    $helper.hide()
                    return d3.event.x
                }
            })
            .attr("y", function(d, i) { // replaces squares y coordinate with coordinates of event
                if (d3.event.y < y_scale(16)) {
                    $helper.show()
                    return y_scale(16)
                }else if (d3.event.y > y_scale(0)) {
                    $helper.show()
                    return y_scale(0)
                }else {
                    $helper.hide()
                    return d3.event.y
                }
            })
            .attr("dx", function(d) {
                if (d3.event.x > x_scale(16.25)){
                    return 16.25
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
        if ($("#id_div").css("display") != "none"){ // if id table is up, id label is removed from square
            $(".id_text").remove();
        }
    };


    // defines behavior when square drag ends
    function dragend(d, i){
        if(isOnUnplaced===true){
            drag_chart(result[i]["Task_ID"], "Unplaced")
        } else if(isOnComplete===true){
            drag_chart(result[i]["Task_ID"], "Completed")
        }else{
            var circle = d3.select(this)
            $.ajax({ // sends new effort impact data to back-end
                url: "/update/" + filename,
                data: {"Effort": circle.attr('dx'),"Impact": circle.attr('dy'),"Id": result[i]["Task_ID"]},
                success: function () {
                    console.log("success!");
                },
                error: function (xhr, errorThrown){
                    console.log(xhr.responseText);
                    console.log(errorThrown);
                }
            });
            if ($("#id_div").css("display") != "none") { // if id table is up, id label is re-applied to square
                for (b=0; b < $("rect.Data").length; b++){
                    var cir = $("rect.Data")[b]
                    var x_pos = Number(d3.select(cir).attr("x")) + 5;
                    var y_pos = Number(d3.select(cir).attr("y"));
                    d3.select(".quadrants").append("text") // creates and adds text to each square, showing it's id
                        .attr("y", y_pos)
                        .attr("x", x_pos)
                        .attr("dy", "1em")
                        .attr("class", "id_text")
                        .style("font", "bold")
                        .text(d3.select(cir).attr("id"))
                }
            }
            console.log("Dragend!")
        }
        $helper.remove();
    }

    // Enables dropping of stored tasks
    function allowDrop(ev) {
      ev.preventDefault();
    }

    // Specifies data being dragged
    function drag(ev) {
      ev.dataTransfer.setData("text", ev.target.id);
    }

    // Moves dragged task to target div and sends info to backend
    function drop(ev) {
      ev.preventDefault();
      var data = ev.dataTransfer.getData("text");
      ev.target.appendChild(document.getElementById(data));
      $.ajax({
        url: "/move/" + filename,
        data: { "Data": data, "Dest": ev.target.id },
        success: function () {
            location.reload(true)
        },
        error: function (xhr, errorThrown){
            console.log(xhr.responseText);
            console.log(errorThrown);
        }
      })
    }

    // If dragging to chart, sends data to backend and reloads page
    function drop_chart(ev) {
        ev.preventDefault();
        var data = ev.dataTransfer.getData("text")
        $.ajax({
            url: "/move/" + filename,
            data: { "Data": data, "Dest": "Graph" },
            success: function () {
                location.reload(true)
            },
            error: function (xhr, errorThrown){
                console.log(xhr.responseText);
                console.log(errorThrown);
            }
          })
    }

    // Drag Event

    var dragHandler = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragend);

    // attaches square drag event to all data squares on graph
    dragHandler(svg.selectAll(".Data"));

    // attaches needed drag and drop events to the storage and graph containers
    var tasks = document.getElementsByClassName("stored_task")
    var containers = document.getElementsByClassName("container")
    var graph_con = document.getElementById("scatterplot")
    var unplaced_con = document.getElementById("Unplaced")
    var complete_con = document.getElementById("Completed")

    for (var i=0;i<tasks.length;i++){
        tasks[i].ondragstart = function(event){
            drag(event)
        }
    }

    for (var i=0;i<containers.length;i++){
        containers[i].ondragover = function(event){
            allowDrop(event)
        }
    }

    graph_con.ondrop = function(event){
        drop_chart(event)
    }

    unplaced_con.ondrop = function(event){
        drop(event)
    }

    complete_con.ondrop = function(event){
        drop(event);
    }


    // Double Click Functions

    // Adds a new task square to the graph at the (screen) origin (upper left corner)
    function Add_new(){
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
                    return $("rect.Data").siblings().length - 1;
                }
                return 0;
            })
            .attr("class", "Data")
            .style("fill", function (d, i) {
                if (scale_flag == "DL"){
                    return c1_scale(dl_colors[i]);
                } else if (scale_flag == "SJ"){
                    return c2_scale(sj_colors[i]);
                } else if (scale_flag == "DP"){
                    return c2_scale(dp_colors[i]);
                }else {
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
        $("#task_div").hide();
        $("#Update").hide();
        $("#New").show();
    }

    // Double Click Event

    // Attaches double-click event to chart
//    chart.on("dblclick", function(){
//        if ($("#id_div").css('display') == "none" && $("#Update").css("display") == "none") {
//            Add_new();
//        }
//    })

    // Attaches double-click event to unplaced container
    $("#Unplaced").on("dblclick", function(){
        if ($("#id_div").css('display') == "none" && $("#Update").css("display") == "none") {
            $("#Instructions").hide();
            $("#task_div").hide();
            $("#Update").hide();
            $("#New").show();
            $("#sheet").val("Unplaced")
        }
    })


    // Submit Event

    // Attaches an event to logout form that clears scale_flag cookie
    $("#logout").submit(function(){
        delete_flagCookie()
        return true
    })
});

