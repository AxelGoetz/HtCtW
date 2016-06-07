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
    """
    Parsing a data string (can return none)
    """
    if dateString == '':
        return None
    return datetime.strptime(
        dateString, "%a, %d %b %Y %H:%M:%S %Z")


def addStation(request):
    """
    Adds a station to the database if the server
    receives a post request with the appropriary
    variables:
    latitude (float), longitude (float)
    Returns json object with result: success or failure
    """
    keys = request.form.keys()
    if 'latitude' in keys and 'longitude' in keys:
        station = Station(request.form['latitude'], request.form['longitude'])
        db.session.add(station)
        db.session.commit()
        return jsonify({'result': 'success'})
    return jsonify({'result': 'failure'})


def addRecording(request, station_id):
    """
    Adds a recording for a particular station
    when the server receives a post request with
    speed (int), datetime (Datetime)
    Returns json object with result: success or failure
    """
    keys = request.form.keys()
    if 'datetime' in keys and 'speed' in keys:
        speed = getSpeed(request)
        recording = Recording(station_id, parseDate(request.form['datetime']), speed)
        db.session.add(recording)
        db.session.commit()
        return jsonify({'result': 'success'})
    return jsonify({'result': 'failure'})

@app.route('/')
def root():
    return render_template('stations.html')


@app.route('/stations', methods=['GET', 'POST'])
def stations():
    if request.method == 'POST':
        return addStation(request)

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
        return addRecording(request, station_id)

    records = db.session.query(Recording).filter(
        Recording.station == station_id)

    def extract_dict(record):
        result = record.as_dict()
        return result

    return jsonify(result=map(extract_dict, records))


@app.route('/visualisation', methods=['GET'])
def vis():
    return render_template('map-visualisation.html')


@app.route('/visualisation/<int:station_id>', methods=['GET'])
def visualisation(station_id):
    return render_template(
        'visualisation.html', station_id=station_id)


@app.route('/documentation', methods=['GET'])
def documentation():
    return render_template('documentation.html')

if __name__ == '__main__':
    app.run()
