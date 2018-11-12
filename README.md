This project is focused on the creation of an application (Python-Flask) to alter an Excel File containing information on tasks (fields: Effort, Impact, 
Deadline, Subject, Notes); The other primary goal is to allow for display of this data in an interactive graph (D3).

Using the Application

This application comes with a virtual environment, EI_env, that provides all the dependencies needed. Once cloned
and with the virtual environment running, the application can be run one of two ways:

* Navigate into the application directory and run:
    py -3 app.py

OR

* Navigate into the application, set and run it as a flask app:
    set FLASK_APP=app.py
    flask run

The home page indicates that a task sheet must be selected from the Task Sheet folder; this folder is located
in the application directory and may be empty; any new sheets created automatically go into this folder.
It is recommended that new sheets be made using the application rather than externally in Excel, to ensure that it is
parsed properly by the program.

Actions

Adding a new task to the graph:

    Double click anywhere in the graph, the circle and form for it will appear. Once the form is submitted, the circle
    will jump to the corner of the graph (left 0, top 0) and, from there, can be dragged anywhere in the graph.

Updating/Deleting a Task:

    Circles can be dragged anywhere in the graph and there coordinates will automatically update and they will remain there.
    To change task information, click on a circle and a field will appear that allows you to choose the field you want
    to update and the value you wish to update it with. If you click the "Click me to change the Deadline!" button, the
    input changes to allow you to choose a date and the Field to Be Changed field is automatically populated.
    Pressing the Ctrl button while having the update form open will delete the selected circle.

See All Tasks:

    Pressing the Enter button will show a table of all tasks (Task names only) and the id of the circle corresponding
    to the task, with the circles having their respective ids displayed next to them on the graph. Pressing the Enter
    button a second time will hide the id tags and table.

Hovering:

    When hovering on circles, their task info is displayed. When hovering on the color scale, the corresponding time
    until due date is displayed for that color block.