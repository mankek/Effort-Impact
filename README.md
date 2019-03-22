This project is focused on the creation of an application (Python-Flask) to alter an Excel File containing information on tasks (fields: Effort, Impact, 
Deadline, Subject, Notes); The other primary goal is to allow for display of this data in an interactive graph (D3).


**Starting and Using the Application**

This application comes with a requirements file that provides all the dependencies needed. Once cloned
and with the virtual environment running, the application can be run one of two ways:

Navigate into the application directory and run:


    py -3 app.py

OR

Navigate into the application, set and run it as a flask app:


    set FLASK_APP=app.py
    
    flask run

The application will start up on port 5000.

The home page indicates that a task sheet must be selected from the Task Sheet folder; this folder is located
in the application directory and may be empty; any new sheets created automatically go into this folder. When a new sheet is created a user has the opportunity to add up to 4 optional fields (Department, Subject, Deadline, Notes) 
in addition to the 2 non-optional fields (Task, Description). If the deadline, subject, or department field is selected, a color scale corresponding to the date automatically appears; otherwise, colors are random.
It is recommended that new sheets be made using the application rather than externally in Excel, to ensure that it is
parsed properly by the program.

**Actions**

Adding a new task:

* Double click anywhere in the graph, the square for it will appear in the corner of the graph (left 0, top 0) and the
 form will appear on the right-hand side. Once submitted, the square can be dragged anywhere in the graph.

  Double click anywhere in the Unassigned container and the form will appear on the left-hand side.

  **NOTE** New tasks can't be added directly to the Completed Container

Dragging on the graph

* Squares can be dragged anywhere in the graph and their coordinates will automatically update and they will remain there.

Updating a Task:

* To change task information, click on a square and a form will appear that allows you to choose the field you want
  to update and input the value you wish to update it with. If you click the "Click me to change the Deadline!" button, the
  input changes to allow you to choose a date and the Field to Be Changed field is automatically populated.

* To change a task in the Unassigned section, click on the task and a form will appear that allows you to choose the
  field you want to update and the input the value you wish to update it with.

  **NOTE** Tasks in the completed section can't be updated.

Deleting a Task:

* Pressing the Delete button while having the update form open will delete the selected square/task.

Moving a Task:

* Pressing Ctrl + c while having the update form open will move a selected square's information to the Completed
  section and remove it from the graph.

  Pressing Ctrl + u while having the update form open will move a selected square's information to the Unassigned
  section and remove it from the graph.

  Tasks in the Unassigned or Completed sections can be moved via dragging.

  **NOTE** Moving a task to the Completed section through either dragging or keypress will cause the Completed field of
  the task to automatically be populated with the current date and time of the movement.

See All Tasks:

* Pressing the Enter button will show a table of all task names or task descriptions and the id of the square corresponding
  to the task, with the squares having their respective ids displayed next to them on the graph. Pressing the Enter
  button a second time will hide the id tags and table.

Hovering:

* When hovering on squares, their task info is displayed. When hovering on a color scale, the corresponding information
 for that color block is displayed.

Downloading Task sheets

* Clicking on the link at the top of the Instructions that says "Download Task Files" will download the Excel workbook that
  contains the task sheets (graphed, unassigned, and completed on different sheets).

**Testing** 

For testing I used a suite of Postman request tests that test the application's ability to create a new file, add tasks, 
update tasks, move tasks, delete tasks, and delete a task sheet. These tests are split into 5 folders; **NOTE**, the *Add two, update two, remove
two*, *Delete error*, *Update bounds*, and *Delete Task Sheet* tests will fail if the *New Task Sheet* test is not run first, so it's best to run the
entire collection together.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/5eb29fa63ae358f00da0)

