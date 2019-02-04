# !/usr/bin/python
import pandas
import os
import datetime

# Defines path to Task sheets within application directory
out_path = ("\\").join(os.path.dirname(os.path.abspath(__file__)).split("\\")[0:-1]) + r"\Task Sheets"


# Finds all task sheets with proper extension and adds them to a list. Returns list
def file_find():
    task_sheets = []
    for _, _, filename in os.walk(out_path):
        for file in filename:
            if file.split(".")[-1] == "xlsx":
                task_sheets.append(file)
    return task_sheets


# Checks if the chosen file is in the Task Sheet folder, has the proper extension, and the required fields
def file_check(file):
    if not os.path.exists(os.path.join(out_path, file)):
        print("file is not from Task Sheet folder")
        return False
    if file.split(".")[-1] != "xlsx":
        print("file is not an excel file with the .xlsx extension")
        return False
    file_frame = pandas.read_excel(os.path.join(out_path, file), index=0)
    frame_fields = list(file_frame)
    if ("Description" not in frame_fields) or ("Task" not in frame_fields) or ("Effort" not in frame_fields) or \
            ("Impact" not in frame_fields):
        print("file is missing required fields")
        return False
    else:
        return True


# Sanitizes file name input
def file_name(name):
    bad_characters = ["?", "/", "\\", "*", ":", "|", "<", ">", '"']
    for i in bad_characters:
        if name.find(i) != -1:
            name = name.replace(i, " ")
            file_name(name)
        else:
            continue
    return name


# Checks if new file already exists; appends name with number if it does
def file_exist(file):
    index = 2
    while os.path.exists(os.path.join(out_path, file)):
        if index == 2:
            file_title = file.split(".")[0] + "_" + str(index)
        else:
            file_title = "_".join(file.split("_")[0:-1]) + "_" + str(index)
        file = file_title + ".xlsx"
        index = index + 1
    return file


def new_table(new_name, fields):
    path = os.path.join(out_path, new_name)
    df = pandas.DataFrame(fields)
    writer = pandas.ExcelWriter(path, engine='xlsxwriter')
    df.to_excel(writer, sheet_name='Sheet1')
    writer.save()


class Table(object):

    def __init__(self, filename):
        self.name = filename
        self.path = os.path.join(out_path, filename)
        self.list = pandas.read_excel(self.path, index=0)
        self.fields = list(self.list)


    # Loads the excel sheet where tasks are stored, formats them as a list of dictionaries; also returns field names
    def load_table(self):
        # Update deadlines in task_list
        if "Deadline" in self.fields:
            for s in range(0, (self.list.shape[0])):
                line = self.list['Deadline'][s]
                if line == "No Deadline":
                    continue
                else:
                    line = line.split('_')
                    date = line[0].split('-')
                    time = line[1].split(':')
                    new_diff = due_day(int(date[0]), int(date[1]), int(date[2]), int(time[0]))
                    line[2] = new_diff
                    self.list.loc[s, ['Deadline']] = '_'.join(line)

        # Form list of results
        tasks = []
        for t in range(0, (self.list.shape[0])):
            task = []
            for i in self.fields:
                task.append({i: str(self.list[i][t])})
            while len(task) != 1:
                task[0].update(task[1])
                del task[1]
            tasks.append(task[0])
        return tasks, self.fields

    # Updates the specified field of the specified task
    def update_table(self, task_id, field, content):
        if int(task_id) in self.list.index:
            if str(field) in self.fields:
                self.list.loc[int(task_id), field] = content
                writer = pandas.ExcelWriter(self.path)
                self.list.to_excel(writer)
                writer.save()
            else:
                print("improper field")
        else:
            new_task_id = str(int(task_id) - 1)
            self.update_table(new_task_id, field, content)
            print("index " + str(task_id) + " was not present, so went with next lowest index")

    # Takes the new task and adds it to the excel sheet
    def add_to_table(self, new_task):
        row_number = self.list.shape[0]
        for t in new_task.keys():
            self.list.loc[row_number, t] = new_task[t]
        writer = pandas.ExcelWriter(self.path)
        self.list.to_excel(writer)
        writer.save()
        return "Table saved!"

    # Deletes a selected task from the excel sheet
    def delete_from_table(self, task_id):
        if task_id in self.list.index:
            self.list.drop(index=task_id, inplace=True)
            self.list.reset_index(drop=True, inplace=True)
            writer = pandas.ExcelWriter(self.path)
            self.list.to_excel(writer)
            writer.save()
            return "Table saved"
        else:
            new_task_id = task_id - 1
            self.delete_from_table(new_task_id)
            print("index " + str(task_id) + " was not present, so went with next lowest index")


# Extracts the Effort, Impact data and returns it as [x], [y] lists
def effort_impact(dict_list):
    effort = []
    impact = []
    for i in dict_list:
        eff = i["Effort"]
        im = i["Impact"]
        effort.append(float(eff))
        impact.append(float(im))
    return effort, impact


# Provides deadline/subject info for color scale
def colors(tasks):
    dl_colors = []
    sj_col = []
    if len(tasks) == 0:
        return dl_colors, sj_col

    for i in tasks:
        if 'Deadline' in i.keys():
            due = i['Deadline'].split('_')[-1].split(" ")
            if due[1][0] == 'h':
                dl_colors.append((int(due[0])/24) * 0.0027397260273973)
            elif due[1][0] == 'd':
                color_val = int(due[0]) * 0.0027397260273973
                if color_val <= 1:
                    dl_colors.append(color_val)
                else:
                    dl_colors.append(1)
            elif due[0][0] == 'N':
                dl_colors.append(1)
            elif due[1][0] == 'i':
                dl_colors.append(0)
            elif due[1][0] == 't':
                dl_colors.append(.00136)
        else:
            break

    sj_list = list()
    for s in tasks:
        if 'Subject' in s.keys():
            if s['Subject'] not in sj_list:
                sj_list.append(s['Subject'])
        else:
            return dl_colors, sj_col
    col_div = 1/20
    sj_col_index = dict()
    index = 1
    for t in sj_list:
        sj_col_index[t] = index * col_div
        index += 1
    for u in tasks:
        sub = u['Subject']
        sj_col.append(round(sj_col_index[sub], 2))

    return dl_colors, sj_col


# Changes Deadline date to days/hours until due
def due_day(year, month, day, hour):
    x = datetime.datetime(year, month, day, hour)
    y = datetime.datetime.today()
    u = datetime.date(year, month, day)
    v = datetime.date.today()
    if u > v:
        t = x - y
        one_day = datetime.timedelta(days=1)
        if t < one_day:
            return str(round(t.seconds/3600)) + ' hours left!'
        elif t == one_day:
            return str(t.days) + ' day left'
        else:
            return str(t.days) + ' days and ' + str(round((int(t.seconds)/3600))) + ' hours left!'
    elif v > u or y > x:
        return "Task is past due"
    elif v == u:
        return "Due today!"


# Removes Effort, Impact values
def clean_result(dict_list):
    new_result = dict_list
    for i in new_result:
        i.pop("Effort")
        i.pop("Impact")
    return new_result


















