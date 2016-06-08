var stations = [];
var recordings = [];

// -----------------------------------------------
// Get all of the data

var requestsDone = 0;

function processStation(station) {
  stations = JSON.parse(station).result;
  requestsDone += 1;
  sortData();
}

function processRecordings(recording) {
  recordings = JSON.parse(recording).result;
  requestsDone += 1;
  sortData();
}

function sortData() {
  if (requestsDone != 2) {
    return;
  }

  for (var i = 0; i < stations.length; i++) {
    stations[i].recordings = [];
    for (var j = 0; j < recordings.length; j++) {
      if(stations[i].id == recordings[j].station) {
        stations[i].recordings.push(recordings[j]);
      }
    }
  }
  drawVisualisations();
}

function collectData() {
  getRequest('/stations', processStation);
  getRequest('/recordings', processRecordings);
}

// -----------------------------------------------
// General map function

function drawMap(id) {
  var myMap = L.map(id).setView([51.525, -0.135], 16);

  // Get tiles from mapbox
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'axelg123.0b4em7h9',
    accessToken: 'pk.eyJ1IjoiYXhlbGcxMjMiLCJhIjoiY2lwNGYxZG0yMDAwOHc1bTFndnNrZ3owbCJ9.W9E8FuzZPBNUE65SoP30KA'
  }).addTo(myMap);

  return myMap;
}

// -----------------------------------------------
// Pass frequency map

function drawFrequencyMap() {
  var map = drawMap('map1');
  for (var i = 0; i < stations.length; i++) {
    var minArea = stations[i].recordings.length / 5;
    if (minArea === 0) minArea = 2;
    var circle = L.circle([stations[i].latitude, stations[i].longitude], minArea, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5
    }).addTo(map);
    var id = stations[i].id;
    circle.bindPopup("<p style='color:black'>The amount of cyclists passed is: <b>" + stations[i].recordings.length +
      "</b>. Click <a href='/visualisation/" + id + "'>here</a> for more data on Bike Alert " + id + "</p>");
  }
}

// -----------------------------------------------
// Speed map

function getAverageSpeed(station) {
  var totalSpeed = 0;
  for (var i = 0; i < station.recordings.length; i++) {
    totalSpeed += station.recordings[i].speed;
  }
  return Math.round(totalSpeed / station.recordings.length);
}

function drawSpeedMap() {
  var map = drawMap('map2');
  for (var i = 0; i < stations.length; i++) {
    var speed = getAverageSpeed(stations[i]);
    var minArea = speed;
    if (speed === 0){ minArea = 2; }
    else if (isNaN(speed)) { minArea = 2; speed = 0; }
    var circle = L.circle([stations[i].latitude, stations[i].longitude], minArea, {
      color: 'red',
      fillColor: '#f03',
      fillOpacity: 0.5
    }).addTo(map);
    var id = stations[i].id;
    circle.bindPopup("<p style='color:black'>The average speed is: <b>" + speed +
      " km/h</b>. Click <a href='/visualisation/" + id + "'>here</a> for more data on Bike Sensor " + id + "</p>");
  }
}

// -----------------------------------------------
// Main

function drawVisualisations() {
  drawFrequencyMap();
  drawSpeedMap();
}

function main() {
  collectData();
}

main();
