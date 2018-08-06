This project is focused on the creation of an application (Python-Flask) to alter an Excel File containing information on tasks (fields: Effort, Impact, Deadline, Subject); will aim to make the 
application restful. The other primary goal is to allow for display of this data in an interactive graph (matplotlib).

Current Progress:

Creation of README and Excel file

Initialization of app and loading of (unformatted) table contents

Can add and delete tasks

Deadline field includes a date and the number of days/hours left until deadline (and this dynamically updates each time the page is loaded)

Generates a graph in a seperate window that graphs Effort vs. Impact with Task displayed when a point is hovered over.

Can update specific fields of a specific task

When a point on the graph is hovered over, it shows all info for that task
