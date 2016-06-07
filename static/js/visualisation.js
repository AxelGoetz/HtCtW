/*
  IDEAS:
    - Histogram of amount of bikes that pass every hour
    - Map with how many bikes pass each station
*/

var records = [];
var histogramRecords = [];

// Getting data and extracting it
// --------------------------------------------------

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

function processOrderedRecords(records) {
  histogramRecords = [];
  for (var key in records) {
    histogramRecords.push({ 'hour': parseInt(key), 'amount': records[key].length });
  }
}

// Takes all of the records and stores in global var
function processRecords(recordsString) {
  records = JSON.parse(recordsString).result;
  var orderedRecords = getDictByHour(records);
  processOrderedRecords(orderedRecords);
  drawVisualisations();
}

// D3 drawing
// --------------------------------------------------

// Get the bounds of the svg and the g element
// in the svg in order to allow for margins
function getBounds() {
  var body = d3.select('body');
  var bounds = body.node().getBoundingClientRect();

  var bound = { height: bounds.height, width: bounds.width, margin:
    { top: 30, right: 60, bottom: 30, left: 60 }};

  bound.height -= 100; // because of header
  bound.width -= (bound.margin.left + bound.margin.right);
  bound.height -= (bound.margin.top + bound.margin.bottom);

  return bound;
}

// Removes any old svg's and then adds a new one
function addNewSVG(bounds, title) {
  var body = d3.select('#histogram');

  body.append('h1').text(title);
  var svg = body.append('svg');

  svg
    .attr('width', bounds.width + bounds.margin.left + bounds.margin.right)
    .attr('height', bounds.height + bounds.margin.top + bounds.margin.bottom);

  return svg.append('g')
    .attr('transform', 'translate(' + bounds.margin.left + ',' + bounds.margin.top + ')');
}

// Histogram
// --------------------------------------------------

function drawBars(g, x, y, data, bounds) {
  var width = x(1) - x(0);

  var bar = g.selectAll('.bar')
      .data(data)
    .enter().append('g')
      .attr('class', 'bar')
      .attr('transform', function(d) { return 'translate(' + x(d.hour) + ',' + y(d.amount) + ')'; });

  bar.append("rect")
  .attr("x", 1)
  .attr("width", width - 1)
  .attr("height", function(d) { return bounds.height - y(d.amount); });

  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", width / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return d.amount; });

}

function drawHistogram() {
  var bounds = getBounds();
  var g = addNewSVG(bounds, 'Histogram');
  var data = histogramRecords;

  var x = d3.scale.linear()
    .domain([0, 24])
    .range([0, bounds.width]);

  var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.amount; })])
    .range([bounds.height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

  drawBars(g, x, y, data, bounds);

  g.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + bounds.height + ")")
      .style("fill", "white")
      .call(xAxis);

  g.append("g")
      .attr("class", "y axis")
      .style("fill", "white")
      .call(yAxis);
}

// Facts
// --------------------------------------------------
// Gets the amount of hours that the station has been installed
function getAmountOfHours() {
  var firstDay = d3.min(records, function(d) { return d.datetime });
  console.log(firstDay);
  var lastDay = new Date();
  return Math.round((lastDay-firstDay)/(1000*60*60));
}

function drawFacts() {
  var facts = d3.select('#listFacts');
  var totalBikes = 0;
  for (var i = 0; i < histogramRecords.length; i++) {
    totalBikes += histogramRecords[i].amount;
  }
  var bikesPerHour = totalBikes / getAmountOfHours();
  var totalSpeed = 0;
  for (var i = 0; i < records.length; i++) { totalSpeed += records[i].speed; }
  var averageSpeed = totalSpeed / records.length;

  var temp = facts.append('p')
    .text('Total cyclists passed: ')
      .append('b')
      .text(totalBikes);

  facts.append('p')
    .text('Average cyclists/hr: ')
      .append('b')
      .text(bikesPerHour.toFixed(2));

  facts.append('p')
    .text('Average speed: ')
      .append('b')
      .text(averageSpeed.toFixed(2) + ' km/h');
}


// Main
// --------------------------------------------------
function drawVisualisations() {
  drawFacts();
  drawHistogram();
}

function main() {
  getRequest('/stations/' + stationId, processRecords);
}

main();
