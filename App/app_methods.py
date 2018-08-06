# !/usr/bin/python
import pandas
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import mpld3
import datetime


file_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'Tasks.xlsx')
task_list = pandas.read_excel(file_path, index=0)
task_fields = list(task_list)


# Loads the excel sheet where tasks are stored, formats them as a list of dictionaries; also returns field names
def load_table():
    tasks = []
    for s in range(0, (task_list.shape[0])):
        task = []
        for i in task_fields:
            task.append({i: str(task_list[i][s])})
        while len(task) != 1:
            task[0].update(task[1])
            del task[1]
        tasks.append(task[0])
    return tasks, task_fields


# Updates the specified field of the specified task
def update_table(task_id, field, content):
    task_list.loc[int(task_id), field] = content
    writer = pandas.ExcelWriter(file_path)
    task_list.to_excel(writer)
    writer.save()


# Takes the new task and adds it to the excel sheet
def add_to_table(new_task):
    row_number = task_list.shape[0]
    for t in new_task.keys():
        task_list.loc[row_number, t] = new_task[t]
    writer = pandas.ExcelWriter(file_path)
    task_list.to_excel(writer)
    writer.save()
    return "Table saved!"


# Deletes a selected task from the excel sheet
def delete_from_table(task_id):
    task_list.drop(index=task_id, inplace=True)
    task_list.reset_index(drop=True, inplace=True)
    writer = pandas.ExcelWriter(file_path)
    task_list.to_excel(writer)
    writer.save()
    return "Table saved"


# Creates graph based on Effort and Impact
def graph():
    css = """
        table
        {
          border-collapse: collapse;
        }
        th
        {
          color: #89A9E1;
          background-color: #5D749D;
        }
        td
        {
          background-color: #C9D8F2;
        }
        table, th, td
        {
          font-family:Arial, Helvetica, sans-serif;
          border: 1px solid black;
          text-align: center;
        }
        """
    sizes = []
    for i in task_list['Deadline']:
        due = i.split('\n')[1].split(" ")
        if due[1][0] == 'h':
            sizes.append((1 / (int(due[0]) / 24)) * 100)
        elif due[1][0] == 'd':
            sizes.append((1 / (int(due[0]))) * 100)
        elif due[1][0] == 'i':
            sizes.append(300)
    colors = [t > 100 for t in sizes]
    fig, ax = plt.subplots(subplot_kw=dict(facecolor='#EEEEEE'))
    scatter = ax.scatter(task_list['Impact'].tolist(), task_list['Effort'].tolist(), s=sizes, c=colors)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 10)
    plt.ylabel('Effort', fontsize=15)
    plt.xlabel('Impact', fontsize=15)
    labels = []
    for i in range(0, task_list.shape[0]):
        label = task_list.ix[[i], :].T
        label.columns = ['Row {0}'.format(i)]
        labels.append(label.to_html())
    tooltip = mpld3.plugins.PointHTMLTooltip(scatter, labels=labels, voffset=10, hoffset=10, css=css)
    mpld3.plugins.connect(fig, tooltip)
    mpld3.show()
    return "yes"


# Changes Deadline date to days/hours until due
def due_day(year, month, day):
    x = datetime.datetime(year, month, day)
    y = datetime.datetime.today()
    if x > y:
        t = x - y
        one_day = datetime.timedelta(days=1)
        if t < one_day:
            return str(round(t.seconds/3600)) + ' hours left!'
        elif t == one_day:
            return str(t.days) + ' day left'
        else:
            return str(t.days) + ' days left!'
    elif y > x:
        return "Task is past due"


