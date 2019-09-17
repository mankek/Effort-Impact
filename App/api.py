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
        required_fields = ["Task", "Effort", "Impact", "Description",
                           "Completed", "Date_Completed", "Unplaced"]
        for i in optional_fields:
            if request.form[i] != "No":
                required_fields.append(request.form[i])
        new_name = request.form['new_name']
        new_name = '"' + new_name + '"'
        db_obj.new_table(new_name, required_fields)
        return redirect(url_for("show", table=new_name))


# Loads existing chart
@app.route("/chart", methods=['POST'])
def view():
    # If request is to load a chosen existing file:
    if request.form['action'] == 'submit':
        table = request.form['table']
        return redirect(url_for("show", table=table))
    # If request is to delete a chosen existing file
    elif request.form['action'] == 'delete':
        table = request.form['table']
        db_obj.delete_table(table)
        return redirect(url_for('index'))


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


# Add a task to the table
@app.route('/new/<table>', methods=['POST'])
def add_new(table):
    fields = db_obj.get_fields(table)
    fields.remove("Task_ID")
    # dictionary that holds the info for the new task
    new_task = dict()
    sheet = request.form["sheet"]
    if sheet == "Unplaced":
        new_task["Unplaced"] = "1"
    else:
        new_task["Unplaced"] = "0"
    new_task["Impact"] = "16"
    new_task["Effort"] = "0"
    new_task["Completed"] = "0"
    new_task["Date_Completed"] = "NULL"
    non_var_fields = ["Unplaced", "Impact", "Effort", "Completed", "Date_Completed"]
    var_fields = [s for s in fields if s not in non_var_fields]
    # iterates through the fields of the current task sheet
    for i in var_fields:
        # if deadline was unchosen, task has no deadline
        if i == 'Deadline':
            if request.form[i] == "":
                data = "\"No Deadline\""
            else:
                if request.form['time'] == "":
                    due_time = "00:00"
                else:
                    due_time = request.form['time']
                data = "\"" + request.form[i] + ' ' + due_time + "\""
        else:
            data = "\"" + request.form[i] + "\""
        # process form data is added to new task dictionary
        new_task[i] = data
    # new task is added to task sheet
    db_obj.add_task(table, new_task, fields)
    return redirect(url_for("show", table=table))


# Update existing task
@app.route('/update/<table>', methods=['GET', 'POST'])
def update(table):
    # if task has been moved on chart
    if request.method == "GET":
        # get dictionary of new effort & impact coordinates and task info
        change = request.args
        # if effort or impact values are beyond boundaries, set them to max/min values
        eff = change['Effort']
        im = change['Impact']
        task_id = change['Id']
        # updates task sheet with new effort & impact values
        db_obj.update_table(table, task_id, "Effort", eff)
        db_obj.update_table(table, task_id, "Impact", im)
        return redirect(url_for("show", table=table))
    # if task fields have been changed
    if request.method == "POST":
        task_id = request.form["id"]
        field = request.form["Field"]
        content = "\"" + request.form["Content"] + "\""
        # if deadline was unchosen, task has no deadline
        # else check for a due time and format the deadline and find amount of time until due
        if field == "Deadline":
            if content == "":
                content = "\"No Deadline\""
            else:
                if request.form["up_time"] == "":
                    due_time = "00:00"
                else:
                    due_time = request.form["up_time"]
                content = "\"" + content + ' ' + due_time + "\""
        db_obj.update_table(table, task_id, field, content)
        return redirect(url_for("show", table=table))


# Delete a task from the table
@app.route('/delete/<table>', methods=['GET'])
def delete_task(table):
    delete_info = request.args
    task_id = delete_info["Id"]
    # # parses task id to get task location
    # if len(delete_info["Id"].split("-")) > 1:
    #     task_id = int(delete_info["Id"].split("-")[-1])
    #     sheet = delete_info["Id"].split("-")[0]
    # else:
    #     task_id = int(delete_info["Id"])
    #     sheet = "Graph"
    # deletes task from sheet
    db_obj.delete_task(table, task_id)
    return redirect(url_for("show", table=table))


# Move a task in or out of storage
@app.route('/move/<table>', methods=['GET'])
def move_task(table):
    move_info = request.args
    # gets location of task
    src = move_info["Data"].split("-")[0]
    # gets numerical id of task
    task_id = move_info["Data"].split("-")[-1]
    # gets location task will be moved to
    dest = move_info["Dest"]
    # moves task in task sheet
    db_obj.move_task(table, src, dest, task_id)
    return redirect(url_for("show", table=table))


# @app.route('/download/<filename>', methods=['GET'])
# def download(filename):
#     # returns the current task sheet file
#     return send_from_directory(directory="Task-Sheets", filename=str(filename), as_attachment=True)

