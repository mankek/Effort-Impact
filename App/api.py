# !/usr/bin/python
from App import app_methods
from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

chosen_file = {}


# Get the table of tasks
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET', 'POST'])
def index():
    sheet_list = app_methods.file_find()
    return render_template("index.html", sheet_list=sheet_list)


# Loads new or existing chart
@app.route("/chart", methods=['GET', 'POST'])
def view():
    optional_fields = ["DepField", "SubjectField", "DeadlineField", "NotesField"]
    required_fields = {"Task": [], "Effort": [], "Impact": [], "Description": []}

    if request.method == 'POST':
        if request.form['action'] == 'submit':
            if app_methods.file_check(request.form['file']):
                file = request.form['file']
            else:
                return redirect(url_for("index"))
        elif request.form['action'] == 'new':
            new_name = request.form['new_name'] + ".xlsx"
            clean_new_name = app_methods.file_name(new_name)
            existing_clean_new_name = app_methods.file_exist(clean_new_name)
            for i in optional_fields:
                if request.form[i] != "No":
                    required_fields[request.form[i]] = []
            app_methods.new_table(existing_clean_new_name, required_fields)
            file = existing_clean_new_name
        chosen_file["file"] = file
        return redirect(url_for("view"))
    if request.method == 'GET':
        try:
            result, names, DL_flag = app_methods.Table(chosen_file["file"]).load_table()
            x, y = app_methods.effort_impact(result)
            if DL_flag:
                colors = app_methods.deadline_colors(result)
            else:
                colors = []
            new_result = app_methods.clean_result(result)
            return render_template("chart.html", x=x, y=y, result=new_result, colors=colors, name=chosen_file["file"].split(".")[0], DL_flag=DL_flag, fields=names)
        except FileNotFoundError:
            return redirect(url_for("index"))
        except KeyError:
            return redirect(url_for("index"))


# Update existing task
@app.route('/update', methods=['GET', 'POST'])
def update():
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
        app_methods.Table(chosen_file["file"]).update_table(task_id, "Effort", eff)
        app_methods.Table(chosen_file["file"]).update_table(task_id, "Impact", im)
        return redirect(url_for("view"))
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
        app_methods.Table(chosen_file["file"]).update_table(task_id, field, content)
        return redirect(url_for("view"))


# Add a task to the table
@app.route('/new', methods=['POST'])
def add_new():
    new_task = dict()
    new_task["Impact"] = "16"
    new_task["Effort"] = "0"
    for i in app_methods.Table(chosen_file["file"]).fields:
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
    app_methods.Table(chosen_file["file"]).add_to_table(new_task)
    return redirect(url_for("view"))


# Delete a task from the table
@app.route('/delete', methods=['GET'])
def delete_task():
    delete_info = request.args
    task_id = int(delete_info["Id"])
    app_methods.Table(chosen_file["file"]).delete_from_table(task_id)
    return redirect(url_for("view"))


