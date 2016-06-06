from flask import Flask, render_template, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os


app = Flask(__name__)
app.config.from_object(os.environ['APP_SETTINGS'])
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

from models import *


def getSpeed(request):
    if 'speed' in request.form:
        return request.form['speed']
    return None


def parseDate(dateString):
    if dateString == '':
        return None
    return datetime.strptime(
        "Tue, 22 Nov 2011 06:00:00 GMT", "%a, %d %b %Y %H:%M:%S %Z")


def addStation(request):
    print request.form
    station = Station(request.form['latitude'], request.form['longitude'])
    db.session.add(station)
    db.session.commit()


def addRecording(request, station_id):
    speed = getSpeed(request)
    recording = Recording(station_id, parseDate(request.form['datetime']), speed)
    db.session.add(recording)
    db.session.commit()


@app.route('/')
def root():
    return "Yow"


@app.route('/stations', methods=['GET', 'POST'])
def stations():
    if request.method == 'POST':
        addStation(request)

    records = db.session.query(Station)

    def extract_dict(record):
        result = record.as_dict()
        return result

    return jsonify(result=map(extract_dict, records))


@app.route('/recordings', methods=['GET', 'POST'])
def recordings():
    records = db.session.query(Recording)

    def extract_dict(record):
        result = record.as_dict()
        return result

    return jsonify(result=map(extract_dict, records))


@app.route('/stations/<int:station_id>', methods=['GET', 'POST'])
def getRecordingsForStation(station_id):
    if request.method == 'POST':
        addRecording(request, station_id)

    records = db.session.query(Recording).filter(
        Recording.station == station_id)

    def extract_dict(record):
        result = record.as_dict()
        return result

    return jsonify(result=map(extract_dict, records))


if __name__ == '__main__':
    app.run()
