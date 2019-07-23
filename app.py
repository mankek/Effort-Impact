# !/usr/bin/python
from App.api import app

# imports the flask app from api.py and runs in debug mode
if __name__ == '__main__':
    app.run(debug=1)

