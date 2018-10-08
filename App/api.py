# !/usr/bin/python
from App import app_methods
from flask import Flask, render_template, jsonify, request, redirect, url_for
import json
import time

app = Flask(__name__)


# Get the table of tasks
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def index():
    return render_template("index.html")


chosen_file = {}


@app.route("/chart", methods=['POST'])
def view():
    if request.form['action'] == 'submit':
        file = request.form['file']
    elif request.form['action'] == 'new':
        new_name = request.form['new_name'] + ".xlsx"
        app_methods.new_table(new_name)
        file = new_name
    chosen_file[0] = file
    try:
        result, names = app_methods.Table(file).load_table()
        x, y = app_methods.effort_impact(result)
        colors = app_methods.deadline_colors(result)
        new_result = app_methods.clean_result(result)
        return render_template("chart.html", x=x, y=y, result=new_result, colors=colors, name=file.split(".")[0])
    except FileNotFoundError:
        return redirect(url_for("index"))


# Update existing task
@app.route('/update', methods=['POST'])
def update():
    if request.json:
        change = request.json
        eff = change['Effort']
        im = change['Impact']
        task_id = change['Id']
        app_methods.Table(chosen_file[0]).update_table(task_id, "Effort", eff)
        app_methods.Table(chosen_file[0]).update_table(task_id, "Impact", im)
    else:
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
        app_methods.Table(chosen_file[0]).update_table(task_id, field, content)
    return redirect(url_for("view"))


# Add a task to the table
new_task = {}


@app.route('/new', methods=['POST'])
def add_new():
    ajax_names = ['Impact', 'Effort']
    form_names = ['Task', 'Description', 'Deadline', 'Subject', 'Notes']
    if request.json:
        for i in ajax_names:
            data = request.json[i]
            new_task[i] = data
    else:
        for i in form_names:
            if i == 'Deadline':
                if request.form[i] == "":
                    data = "No Deadline"
                else:
                    due_date = request.form[i].split('-')
                    due_time = request.form['time'].split(':')
                    diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]), int(due_time[0]))
                    data = request.form[i] + '_' + request.form['time'] + '_' + diff
            else:
                data = request.form[i]
            new_task[i] = data
        app_methods.Table(chosen_file[0]).add_to_table(new_task)
    return redirect(url_for("view"))


# Delete a task from the table
@app.route('/delete', methods=['POST'])
def delete_task():
    delete_info = request.json
    task_id = int(json.dumps(delete_info["Id"]))
    app_methods.Table(chosen_file[0]).delete_from_table(task_id)
    return "done!"


