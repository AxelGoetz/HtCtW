function getRequest(url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(xmlHttp.responseText);
  };

  xmlHttp.open('GET', url, true); // true for asynchronous
  xmlHttp.send(null);
}

// Takes all of the stations and adds them to header
function processStations(stations) {
  stations = JSON.parse(stations).result;
  stations.sort(function(a, b) { return a.id - b.id; });
  var stationElem = $('#stations');
  for (var i = 0; i < stations.length; i++) {
    var id = stations[i].id;
    var newElem = '<li><a href="/visualisation/' + id + '">Bike Alert ' + id + '</a></li>';
    stationElem.append(newElem);
  }
}

getRequest('/stations', processStations);
