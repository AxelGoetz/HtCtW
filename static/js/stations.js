// JS to render map in stations.html

// Create map
var myMap = L.map('mapid').setView([51.525, -0.135], 14);

// Get tiles from mapbox
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
  maxZoom: 18,
  id: 'axelg123.0b4em7h9',
  accessToken: 'pk.eyJ1IjoiYXhlbGcxMjMiLCJhIjoiY2lwNGYxZG0yMDAwOHc1bTFndnNrZ3owbCJ9.W9E8FuzZPBNUE65SoP30KA'
}).addTo(myMap);

function getRequest(url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(xmlHttp.responseText);
  };

  xmlHttp.open('GET', url, true); // true for asynchronous
  xmlHttp.send(null);
}


// Takes all of the stations and adds markers to the map
function processStations(stations) {
  stations = JSON.parse(stations);
  for (var i = 0; i < stations.result.length; i++) {
    var marker = L.marker([stations.result[i].latitude, stations.result[i].longitude]).addTo(myMap);
    var id = stations.result[i].id;
    marker.bindPopup("<a href='/visualisation/" + id + "'> Data for sensor " + id + "</a>");
  }
}

getRequest('/stations', processStations);
