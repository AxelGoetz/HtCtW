/*
  IDEAS:
    - Histogram of amount of bikes that pass every hour
    - Map with how many bikes pass each station
*/

var records = [];

function getRequest(url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
          callback(xmlHttp.responseText);
  };

  xmlHttp.open('GET', url, true); // true for asynchronous
  xmlHttp.send(null);
}

// Gets a dictionary with the hour at key
function getDictByHour(records) {
  orderedRecords = {};
  for (var i = 0; i < records.length; i++) {
    records[i].datetime = new Date(records[i].datetime);
    if (records[i].datetime.getHours() in orderedRecords) {
      orderedRecords[records[i].datetime.getHours()].push(records[i]);
    } else {
      orderedRecords[records[i].datetime.getHours()] = [records[i]];
    }
  }

  return orderedRecords;
}

// Takes all of the records and stores in global var
function processRecords(recordsString) {
  records = JSON.parse(recordsString).result;
  orderedRecords = getDictByHour(records);

  // TODO: Call draw function
}

function main() {
  getRequest('/stations/' + stationId, processRecords);
}

main();
