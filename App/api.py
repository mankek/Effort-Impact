# !/usr/bin/python
from App import app_methods
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)


# Get the table of tasks
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    sheet_list = app_methods.file_find()
    return render_template("index.html", sheet_list=sheet_list)


# Loads new or existing chart
@app.route("/chart", methods=['POST'])
def view():
    # Defines which fields are optional for task sheet and which must be each in task sheet
    optional_fields = ["DepField", "SubjectField", "DeadlineField", "NotesField"]
    required_fields = {"Task": [], "Effort": [], "Impact": [], "Description": []}

    # If request is to load a chosen existing file:
    if request.form['action'] == 'submit':
        # checks the file location, extension, and fields
        if app_methods.file_check(request.form['file']):
            file = request.form['file']
            return redirect(url_for("show", filename=file))
        # if file fails checks, redirects to home page
        else:
            return redirect(url_for("index"))
    # If request is to create new file:
    elif request.form['action'] == 'new':
        # sanitizes the input file name
        new_name = request.form['new_name'] + ".xlsx"
        # checks if a file with the same name already exists
        clean_new_name = app_methods.file_name(new_name)
        existing_clean_new_name = app_methods.file_exist(clean_new_name)
        # checks if any of the optional fields were chosen
        for i in optional_fields:
            if request.form[i] != "No":
                required_fields[request.form[i]] = []
        # creates a new task sheet
        app_methods.new_table(existing_clean_new_name, required_fields)
        file = existing_clean_new_name
        return redirect(url_for("show", filename=file))


@app.route("/chart/<filename>", methods=['GET'])
def show(filename):
    try:
        # Gets the task and field data and deadline flag for the chosen/created sheet
        result, names = app_methods.Table(filename).load_table()
        # Gets the effort and Impact values for each task
        x, y = app_methods.effort_impact(result)
        # Determines color scale values for data
        dl_colors, sj_colors = app_methods.colors(result)
        # Removes effort, impact values from results so they aren't displayed with the task info
        new_result = app_methods.clean_result(result)
        return render_template("chart.html", x=x, y=y, result=new_result, dl_colors=dl_colors, sj_colors=sj_colors,
                               name=filename.split(".")[0], fields=names, file=filename)
    except FileNotFoundError:
        return redirect(url_for("index"))


# Update existing task
@app.route('/update/<filename>', methods=['GET', 'POST'])
def update(filename):
    if request.method == "GET":
        change = request.args
        eff = change['Effort']
        if float(eff) > 16:
            eff = str(16)
        elif float(eff) < 0:
            eff = str(0)
        im = change['Impact']
        if float(im) > 16:
            im = str(16)
        elif float(im) < 0:
            im = str(0)
        task_id = change['Id']
        app_methods.Table(filename).update_table(task_id, "Effort", eff)
        app_methods.Table(filename).update_table(task_id, "Impact", im)
        return redirect(url_for("show", filename=filename))
    if request.method == "POST":
        task_id = request.form["id"]
        field = request.form["Field"]
        content = request.form["Content"]
        if field == "Deadline":
            if content == "":
                content = "No Deadline"
            else:
                due_time = request.form["up_time"].split(":")
                due_date = content.split('-')
                diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]), int(due_time[0]))
                content = content + '_' + request.form["up_time"] + "_" + diff
        app_methods.Table(filename).update_table(task_id, field, content)
        return redirect(url_for("show", filename=filename))


# Add a task to the table
@app.route('/new/<filename>', methods=['POST'])
def add_new(filename):
    new_task = dict()
    new_task["Impact"] = "16"
    new_task["Effort"] = "0"
    for i in app_methods.Table(filename).fields:
        if i == 'Deadline':
            if request.form[i] == "":
                data = "No Deadline"
            else:
                due_date = request.form[i].split('-')
                due_time = request.form['time'].split(':')
                diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]), int(due_time[0]))
                data = request.form[i] + '_' + request.form['time'] + '_' + diff
        elif (i == "Effort") or (i == "Impact"):
            continue
        else:
            data = request.form[i]
        new_task[i] = data
    app_methods.Table(filename).add_to_table(new_task)
    return redirect(url_for("show", filename=filename))


# Delete a task from the table
@app.route('/delete/<filename>', methods=['GET'])
def delete_task(filename):
    delete_info = request.args
    task_id = int(delete_info["Id"])
    app_methods.Table(filename).delete_from_table(task_id)
    return redirect(url_for("show", filename=filename))


