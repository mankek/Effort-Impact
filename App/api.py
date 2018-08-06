# !/usr/bin/python
from App import app_methods
from flask import Flask, render_template, jsonify, request, redirect, url_for

app = Flask(__name__)


# Get the table of tasks
@app.route('/', methods=['GET'])
@app.route('/index', methods=['GET'])
def view():
    result, names = app_methods.load_table()
    for i in result:
        line = i['Deadline'].split('\n')
        date = line[0].split('-')
        new_diff = app_methods.due_day(int(date[0]), int(date[1]), int(date[2]))
        line[1] = new_diff
        i['Deadline'] = '\n'.join(line)
    return render_template("index.html", result=result, names=names, length=len(result))


# Update existing task
@app.route('/update', methods=['POST'])
def update():
    task_id = request.form["id"]
    field = request.form["Field"]
    content = request.form["Content"]
    if field == "Deadline":
        due_date = content.split('-')
        diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]))
        content = content + '\n' + diff
    app_methods.update_table(task_id, field, content)
    return redirect(url_for("view"))


# Add a task to the table
@app.route('/new', methods=['POST'])
def add_new():
    new_task = {}
    field_names = ['Task', 'Description', 'Effort', 'Impact', 'Deadline', 'Subject', 'Notes']
    due_date = request.form['Deadline'].split('-')
    diff = app_methods.due_day(int(due_date[0]), int(due_date[1]), int(due_date[2]))
    for i in field_names:
        if i == 'Deadline':
            data = request.form[i] + '\n' + diff
        else:
            data = request.form[i]
        new_task[i] = data
    app_methods.add_to_table(new_task)
    return redirect(url_for('view'))


# Delete a task from the table
@app.route('/delete', methods=['POST'])
def delete_task():
    task_id = int(request.form["taskid"])
    app_methods.delete_from_table(task_id)
    return redirect(url_for('view'))


# Visualize the tasks as a graph
@app.route('/graph', methods=['POST'])
def graph_tasks():
    app_methods.graph()
    return redirect(url_for('view'))
