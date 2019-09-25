This repository contains the source-code for an application that allows for the creation of Effort-Impact graphs 
with user provided tasks. The application allows the user to provide a variety of detail about each task and to freely
adjust the level of effort and impact associated with each task. 

The application was made using the Python Flask framework. Each task is saved in a table connected SQLite database.
The interactive graph rendered by the application is created using the D3 library.

###### Starting and Using the Application

Clone the repository and use the requirements file to install the needed libraries The application can be run one of two ways:

Navigate into the application directory and run:

`python app.py`

OR

`set FLASK_APP=app.py`

`flask run`

The application will start up on localhost port 5000.

The home page indicates that every available table is listed in the left-hand box. These tables are pulled from the
application's SQLite database; any new tables will automatically be added to this database. When a new table is created,
the user has the opportunity to add up to 4 optional fields for the tasks (Department, Subject, Deadline, Notes) in 
addition to the 2 non-optional fields (Task, Description). 

If Deadline, Subject, or Department is selected, a color scale is added to the resulting graph; for Deadline, the color 
scale corresponds to proximity to the deadline, otherwise, the scale is corresponds to unique values. If none of these
fields is selected, colors are assigned randomly.

###### Actions

Adding a task:

* To add a new task to the chart, click the Add New Task button in the top right menu. A square will appear in the 
upper-left corner of the graph and a form will appear under the menu. Once the form is submitted, the task is added and
can be moved.

* Alternatively, a new task can be added by double-clicking on the graph.

* A new task can be added directly to the Unassigned container by double-clicking in the container; the form is the same.

**NOTE** New tasks can't be added directly to the Completed container.

Dragging on the Graph:

* Squares can be dragged anywhere in the graph with the mouse and their coordinates (effort and impact values) will 
automatically update.

* Squares can be dragged off the chart to be added to the Unassigned or Completed containers

Updating a task:

* To update the information of a task on the graph, click on its square and a form will appear that allows the user to
select which field should be updated and enter the new value.

* To update a task in the Unassigned container, click on the task to be changed and the update form will appear.

**NOTE** Tasks in the Completed container can't be updated.

Deleting a Task:

* In order to delete a task, click it so that the update form opens then press the Delete button.

**NOTE** Tasks in the Completed container can't be deleted.

Moving a task:

* Tasks on the graph can be moved by dragging the corresponding square with the mouse. Moving squares within the graph
will update the coordinates. Moving them outside the graph allows them to be added to the Unassigned or Completed
containers

* Tasks in the Completed or Unassigned containers can be moved by clicking and dragging the task with the mouse. They can
be moved between containers or back to the chart

**NOTE** When a task is moved to the Completed container, the current date will be recorded as when the task 
was completed.

See All Tasks:

* Clicking the Show All button in the top right menu will bring up a table of the tasks currently on the graph. the number
next to each task corresponds to the number on the task's square on the graph. Clicking the Description option in the 
small menu above the table will show each task's description.

Hovering:

* When the mouse pointer hovers on a square, all information for the corresponding task is displayed on the right.

* When the mouse pointer hovers on a color scale, the value corresponding to that color block will be displayed.

Downloading Task info:

* A CSV file containing all the task information for the rendered table can be downloaded by clicking the Download
button in the upper right menu.

