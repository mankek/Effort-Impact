# !/usr/bin/python
from .app_methods import Database, effort_impact, colors, clean_result
from flask import Flask, render_template, request, redirect, url_for, send_from_directory
import os

app = Flask(__name__)

'TODO: Use Ajax request to check new table name prior to submission. Put table names in quotes to avoid invalid ' \
    'names. Continue new table construction.'


db_folder = "\\".join(os.path.dirname(os.path.abspath(__file__)).split("\\")[0:]) + r"\Database"
current_db = "DB_1.sqlite"
db_obj = Database(db_folder, current_db)


# Get the table of tasks
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    table_list = db_obj.get_tables()
    if table_list == "No tables":
        table_list = []
    return render_template("index.html", table_list=table_list)


@app.route('/new', methods=['POST', 'GET'])
def new():
    if request.method == 'GET':
        rec_data = request.args
        new_name = rec_data['name']
        table_exists = db_obj.check_for_table(new_name)
        return str(table_exists)
    if request.method == 'POST':
        optional_fields = ["DepField", "SubjectField", "DeadlineField", "NotesField"]
        required_fields = ["Task", "Effort", "Impact", "Description", "Complete", "Date_Completed", "Unplaced"]
        for i in optional_fields:
            if request.form[i] != "No":
                required_fields.append(i)
        new_name = request.form['new_name']
        new_name = '"' + new_name + '"'
        db_obj.new_table(new_name, required_fields)
        return redirect(url_for("show", table=new_name))


# # Loads existing chart
# @app.route("/chart", methods=['POST'])
# def view():
#     # Defines which fields are optional for task sheet and which must be each in task sheet
#     optional_fields = ["DepField", "SubjectField", "DeadlineField", "NotesField"]
#     required_fields = {"Task": [], "Effort": [], "Impact": [], "Description": []}
#     # If request is to load a chosen existing file:
#     if request.form['action'] == 'submit':
#         pass
#         # # checks the file location, extension, and fields
#         # if app_methods.file_check(request.form['file']):
#         #     file = request.form['file']
#         #     return redirect(url_for("show", filename=file))
#         # # if file fails checks, redirects to home page
#         # else:
#         #     return redirect(url_for("index"))
#     # If request is to delete a chosen existing file
#     elif request.form['action'] == 'delete':
#         pass
#         # file = request.form['file']
#         # app_methods.Table(file).delete_table()
#         # return redirect(url_for('index'))


@app.route("/chart/<table>", methods=['GET'])
def show(table):
    fields = db_obj.get_fields(table)
    table_tasks, completed_tasks, unplaced_tasks = db_obj.load_table(table, fields)
    x, y = effort_impact(table_tasks)
    dl_colors, sj_colors, dp_colors = colors(table_tasks)
    new_tasks = clean_result(table_tasks)
    return render_template("chart.html", x=x, y=y, result=new_tasks, dl_colors=dl_colors, sj_colors=sj_colors,
                           dp_colors=dp_colors, name=table, fields=fields, file=table,
                           completed=clean_result(completed_tasks), unplaced=clean_result(unplaced_tasks))

# # Update existing task
# @app.route('/update/<filename>', methods=['GET', 'POST'])
# def update(filename):
#     # if task has been moved on chart
#     if request.method == "GET":
#         # get dictionary of new effort & impact coordinates and task info
#         change = request.args
#         # if effort or impact values are beyond boundaries, set them to max/min values
#         eff = change['Effort']
#         if float(eff) > 16:
#             eff = str(16)
#         elif float(eff) < 0:
#             eff = str(0)
#         im = change['Impact']
#         if float(im) > 16:
#             im = str(16)
#         elif float(im) < 0:
#             im = str(0)
#         task_id = change['Id']
#         sheet = "Graph"
#         # updates task sheet with new effort & impact values
#         app_methods.Table(filename).update_table(task_id, "Effort", eff, sheet)
#         app_methods.Table(filename).update_table(task_id, "Impact", im, sheet)
#         return redirect(url_for("show", filename=filename))
#     # if task fields have been changed
#     if request.method == "POST":
#         task_id = request.form["id"]
#         field = request.form["Field"]
#         content = request.form["Content"]
#         # if deadline was unchosen, task has no deadline
#         # else check for a due time and format the deadline and find amount of time until due
#         if field == "Deadline":
#             if content == "":
#                 content = "No Deadline"
#             else:
#                 due_date = content.split('-')
#                 if request.form["up_time"] == "":
#                     due_time = ["00", "00"]
#                 else:
#                     due_time = request.form["up_time"].split(":")
#                 diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]), int(due_time[0]))
#                 content = content + '_' + ":".join(due_time) + "_" + diff
#         # parses task id to identify task location
#         if len(task_id.split("-")) > 1:
#             sheet = task_id.split("-")[0]
#             task_id = task_id.split("-")[-1]
#         else:
#             sheet = "Graph"
#         # updates task sheet
#         app_methods.Table(filename).update_table(task_id, field, content, sheet)
#         return redirect(url_for("show", filename=filename))
#
#
# # Add a task to the table
# @app.route('/new/<filename>', methods=['POST'])
# def add_new(filename):
#     # dictionary that holds the info for the new task
#     new_task = dict()
#     sheet = request.form["sheet"]
#     new_task["Impact"] = "16"
#     new_task["Effort"] = "0"
#     # iterates through the fields of the current task sheet
#     for i in app_methods.Table(filename).fields:
#         # if deadline was unchosen, task has no deadline
#         # else check for a due time and format the deadline and find amount of time until due
#         if i == 'Deadline':
#             if request.form[i] == "":
#                 data = "No Deadline"
#             else:
#                 due_date = request.form[i].split('-')
#                 if request.form['time'] == "":
#                     due_time = ["00", "00"]
#                 else:
#                     due_time = request.form['time'].split(':')
#                 diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]), int(due_time[0]))
#                 data = request.form[i] + '_' + ":".join(due_time) + '_' + diff
#         # effort & impact coordinates are set above
#         elif (i == "Effort") or (i == "Impact"):
#             continue
#         else:
#             data = request.form[i]
#         # process form data is added to new task dictionary
#         new_task[i] = data
#     # new task is added to task sheet
#     app_methods.Table(filename).add_to_table(new_task, sheet)
#     return redirect(url_for("show", filename=filename))
#
#
# # Delete a task from the table
# @app.route('/delete/<filename>', methods=['GET'])
# def delete_task(filename):
#     delete_info = request.args
#     # parses task id to get task location
#     if len(delete_info["Id"].split("-")) > 1:
#         task_id = int(delete_info["Id"].split("-")[-1])
#         sheet = delete_info["Id"].split("-")[0]
#     else:
#         task_id = int(delete_info["Id"])
#         sheet = "Graph"
#     # deletes task from sheet
#     app_methods.Table(filename).delete_from_table(task_id, sheet)
#     return redirect(url_for("show", filename=filename))
#
#
# # Move a task in or out of storage
# @app.route('/move/<filename>', methods=['GET'])
# def move_task(filename):
#     move_info = request.args
#     # gets location of task
#     src = move_info["Data"].split("-")[0]
#     # gets numerical id of task
#     task_id = int(move_info["Data"].split("-")[-1])
#     # gets location task will be moved to
#     dest = move_info["Dest"]
#     # moves task in task sheet
#     app_methods.Table(filename).move_sheets(src, dest, task_id)
#     return redirect(url_for("show", filename=filename))
#
#
# @app.route('/download/<filename>', methods=['GET'])
# def download(filename):
#     # returns the current task sheet file
#     return send_from_directory(directory="Task-Sheets", filename=str(filename), as_attachment=True)

