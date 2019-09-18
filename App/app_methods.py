# !/usr/bin/python
# import pandas
import os
import datetime
import sqlite3

# db_folder_test = "\\".join(os.path.dirname(os.path.abspath(__file__)).split("\\")[0:]) + r"\Database"
# current_db_test = "DB_1.sqlite"


def database_check(path_in):
    try:
        if not os.path.exists(path_in):
            conn = sqlite3.connect(path_in)
            conn.commit()
            conn.close()
    except sqlite3.OperationalError:
        print(path_in)


class Database(object):

    def __init__(self, db_folder, current_db):
        self.db_path = os.path.join(db_folder, current_db)
        database_check(self.db_path)

    def get_tables(self):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''SELECT name FROM sqlite_master WHERE type='table';''')
        results = db_cursor.fetchall()
        db_conn.commit()
        db_conn.close()
        tables = []
        if results:
            for i in results:
                if i[0] != "sqlite_sequence":
                    tables.append(i[0])
            return tables
        else:
            return "No tables"

    def check_for_table(self, table_name):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''SELECT name FROM sqlite_master WHERE type='table' AND name='{''' + table_name + '''}\'''')
        table = db_cursor.fetchall()
        db_conn.commit()
        db_conn.close()
        if table:
            return True
        else:
            return False

    def new_table(self, table_name, table_fields):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        field_string = "Task_ID INTEGER PRIMARY KEY AUTOINCREMENT, " + ", ".join(table_fields)
        db_cursor.execute('''CREATE TABLE ''' + table_name + ''' (''' + field_string + ''')''')

    def get_fields(self, table):
        fields = []
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''PRAGMA table_info(''' + table + ''')''')
        results = db_cursor.fetchall()
        db_conn.commit()
        db_conn.close()
        for i in results:
            fields.append(i[1])
            # if i[1] != "Task_ID":
            #     fields.append(i[1])
        return fields

    def load_table(self, table_name, fields):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''SELECT ''' + ", ".join(fields) + ''' FROM ''' + table_name)
        results = db_cursor.fetchall()
        db_conn.commit()
        db_conn.close()
        graph = []
        complete = []
        unplaced = []
        for task in results:
            task_dict = format_task(task, fields)
            complete_status = task[5]
            unplaced_status = task[7]
            if complete_status != 0:
                complete.append(task_dict)
            elif unplaced_status != 0:
                unplaced.append(task_dict)
            else:
                graph.append(task_dict)
        return graph, complete, unplaced

    def delete_table(self, table_name):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''DROP TABLE ''' + table_name)
        db_conn.commit()
        db_conn.close()

    def add_task(self, table, new_task, fields):
        values = []
        for i in fields:
            if i != "Task_ID":
                values.append(new_task[i])
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''INSERT INTO ''' + table + ''' (''' + ",".join(fields) + ''') ''' + ''' VALUES ''' + '''('''
                          + ",".join(values) + ''')''')
        db_conn.commit()
        db_conn.close()

    def update_table(self, table, task_id, field, new_value):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''UPDATE ''' + table + ''' SET ''' + field + ''' = ''' + new_value +
                          ''' WHERE Task_ID = ''' + task_id)
        db_conn.commit()
        db_conn.close()

    def delete_task(self, table, task_id):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        db_cursor.execute('''DELETE FROM ''' + table + ''' WHERE Task_ID = ''' + task_id)
        db_conn.commit()
        db_conn.close()

    def move_task(self, table, src, dest, task_id):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        if dest == "Graph":
            db_cursor.execute('''UPDATE ''' + table + ''' SET ''' + src + ''' = 0 WHERE Task_ID = ''' + task_id)
        else:
            db_cursor.execute('''UPDATE ''' + table + ''' SET ''' + dest + ''' = 1 WHERE Task_ID = ''' + task_id)
            if src != "Graph":
                db_cursor.execute('''UPDATE ''' + table + ''' SET ''' + src + ''' = 0 WHERE Task_ID = ''' + task_id)
        db_conn.commit()
        db_conn.close()

    def download_table(self, table):
        db_conn = sqlite3.connect(self.db_path)
        db_cursor = db_conn.cursor()
        file_folder = "\\".join(os.path.dirname(os.path.abspath(__file__)).split("\\")[0:]) + r"\static\Table_Download"
        with open(os.path.join(file_folder, table + ".csv"), 'w') as table_file:
            db_cursor.execute('''PRAGMA table_info(Test)''')
            table_info = db_cursor.fetchall()
            table_fields = [s[1] for s in table_info]
            table_file.write(",".join(table_fields) + "\n")
            db_cursor.execute('''SELECT * FROM ''' + table)
            results = db_cursor.fetchall()
            for result in results:
                result_string = [str(i) for i in result]
                table_file.write(",".join(result_string) + "\n")
        db_conn.commit()
        db_conn.close()

# print(Database(db_folder_test, current_db_test).check_for_table("test"))

# # print(pandas.__version__)
# # checks version of pandas available
# if "0.21.0" < pandas.__version__:
#     old_pandas = False
# else:
#     old_pandas = True


def format_task(task_in, fields_in):
    task_dict = dict()
    if "DeadlineField" in fields_in:
        dl_place = fields_in.index("DeadlineField")
    else:
        dl_place = None
    for index, value in enumerate(task_in):
        if index == dl_place:
            date = value.split(" ")[0]
            year = date.split("-")[0]
            month = date.split("-")[1]
            day = date.split("\t")[2]
            time = value.split(" ")[1]
            hour = time.split(":")[0]
            task_dict[fields_in[index]] = due_day(year, month, day, hour)
        else:
            try:
                task_dict[fields_in[index]] = value
            except IndexError:
                print(fields_in)
                print(task_in)
                print(index)
                print(value)
    return task_dict


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
    dp_col = []

    if len(tasks) == 0:
        return dl_colors, sj_col, dp_col

    for i in tasks:
        # checks if deadline is a field
        if 'Deadline' in i.keys():
            due = i['Deadline'].split('_')[-1].split(" ")
            # checks if amount of time until deadline is in hours or days
            if due[1][0] == 'h':
                dl_colors.append((int(due[0])/24) * 0.0027397260273973)
            elif due[1][0] == 'd':
                color_val = int(due[0]) * 0.0027397260273973
                if color_val <= 1:
                    dl_colors.append(color_val)
                else:
                    dl_colors.append(1)
            # checks if there is no deadline
            elif due[0][0] == 'N':
                dl_colors.append(1)
            # checks if task is past due
            elif due[1][0] == 'i':
                dl_colors.append(0)
            # checks if task is due today
            elif due[1][0] == 't':
                dl_colors.append(.00136)
        else:
            break

    # defines the number of available categories for categorical axis
    col_div = 1 / 20
    sj_list = list()
    # iterates through tasks and adds the unique subjects to a list
    for s in tasks:
        if 'Subject' in s.keys():
            if s['Subject'] not in sj_list:
                sj_list.append(s['Subject'])
        else:
            break
    if len(sj_list) > 0:
        sj_col_index = dict()
        index = 1
        # every unique subject is assigned a number id in a dictionary that corresponds to a color value
        for t in sj_list:
            sj_col_index[t] = index * col_div
            index += 1
        # for every task, the color value of the subject is found, rounded and saved in a list
        for u in tasks:
            sub = u['Subject']
            sj_col.append(round(sj_col_index[sub], 2))

    dp_list = list()
    # iterates through tasks and adds unique departments to a list
    for a in tasks:
        if 'Department' in a.keys():
            if a['Department'] not in dp_list:
                dp_list.append(a['Department'])
        else:
            return dl_colors, sj_col, dp_col
    dp_col_index = dict()
    index2 = 1
    # every unique subject is assigned a color value
    for b in dp_list:
        dp_col_index[b] = index2 * col_div
        index2 += 1
    # for every task, the color value of the department is rounded and saved in a list
    for c in tasks:
        dep = c['Department']
        dp_col.append(round(dp_col_index[dep], 2))

    return dl_colors, sj_col, dp_col


# Changes Deadline date to days/hours until due
def due_day(year, month, day, hour):
    x = datetime.datetime(year, month, day, hour)
    y = datetime.datetime.today()
    u = datetime.date(year, month, day)
    v = datetime.date.today()
    # if the deadline date is larger (in the future) than today's date
    if u > v:
        # finds the time difference between the deadline datetime and today's datetime
        t = x - y
        one_day = datetime.timedelta(days=1)
        # if the time difference is less than one day
        # time until due is given in hours
        if t < one_day:
            return str(round(t.seconds/3600)) + ' hours left!'
        # if the time difference is one day
        elif t == one_day:
            return str(t.days) + ' day left'
        # if the time difference is greater than one day
        else:
            return str(t.days) + ' days and ' + str(round((int(t.seconds)/3600))) + ' hours left!'
    # if the deadline date or datetime is less than (in the past) today's date or datetime
    elif v > u or y > x:
        return "Task is past due"
    # if the deadline date and today's date are the same
    elif v == u:
        return "Due today!"


# Removes Effort, Impact values so that
# they aren't shown to the user
def clean_result(dict_list):
    new_result = dict_list
    for i in new_result:
        i.pop("Effort")
        i.pop("Impact")
    return new_result


















