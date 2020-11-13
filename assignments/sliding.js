

var data;
var slider = document.getElementById("myRange");
var margin, svg, x, y, dates, datesScale, totalsScale;

slider.oninput = function() {
  document.getElementById("display_image").src = "images/" + this.value + ".jpg";
  updateOnChange(this.value);
  updateTitle(this.value)
};

// main async function, used to wait for completion of asynch tasks
(async function() {
  google.charts.load('current');
  // load and prepare trending data
  await setUpQuery('https://docs.google.com/spreadsheets/d/1SAhVGMKe2m7iZmse-gxdnW3Uv4pOQK23gzi_2rHmoNM/gviz/tq?sheet=Steps',
'select *');
  data = parseSteps(createTable(await getQuery()));

  setUpData(data);


  updateOnChange(1)
  updateTitle(1)


})();
// TODO: change to have a different object for each date and total
function parseSteps(data) {
  return data.map(
    e => {
      return {date: e[0], time1: e[1], time2: e[2], steps: e[3], total: e[4]}
    }
  )
}

function setUpData(data) {
  var tempDate = data.map(
    e => {
      return e.date
    }
  )

  var tempTotals = data.map(
    e => {
      return e.total
    }
  )

  dates = tempDate.filter((item, i, ar) => ar.indexOf(item) === i);
  datesScale = d3.scaleOrdinal()
    .domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
    .range(dates)

  var totals = tempTotals.filter((item, i, ar) => ar.indexOf(item) === i);
  totalsScale = d3.scaleOrdinal()
    .domain([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
    .range(totals)

}

function updateTitle(value) {
  var date = datesScale(value)
  d3.select("#title").html("Day " + value + " - " + date
  + "<br>Total Steps: " + totalsScale(value))
}

function updateOnChange(value) {
  var date = datesScale(value)
  var filteredData = data.filter(
    e => {
      return e.date == date
    }
  )
  d3.select("#my_dataviz").html("")
  update(filteredData)
}

function setUpSvg(data) {
  // with code from https://www.d3-graph-gallery.com/graph/circular_barplot_basic.html
  // set the dimensions and margins of the graph
  margin = {top: 0, right: 10, bottom: 10, left: 10},
  width = 1000 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom,
  innerRadius = 80,
  outerRadius = Math.min(width, height) / 2;   // the outerRadius goes from the middle of the SVG area to the border

  // append the svg object to the body of the page
  svg = d3.select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + ( height/2 -200 )+ ")"); // Add 100 on Y translation, cause upper bars are longer

  x = d3.scaleBand()
  .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
  .align(0)                  // This does nothing ?
  .domain( data.map(function(d) { return d.time1 }) ); // The domain of the X axis is the list of states.

  // Y scale
  y = d3.scaleRadial()
  .range([innerRadius, outerRadius])   // Domain will be define later.
  .domain([0, 3500]); // Domain of Y is from 0 to the max seen in the data

}

function update(data) {
  setUpSvg(data)
  // bars
  svg.append("g")
  .selectAll("path")
  .data(data)
  .enter()
  .append("path")
  .attr("fill", "#FFFF00")
  .attr("d", d3.arc()     // imagine your doing a part of a donut plot
  .innerRadius(innerRadius)
  .outerRadius(function(d) { return y(d.steps); })
  .startAngle(function(d) { return x(d.time1); })
  .endAngle(function(d) { return x(d.time1) + x.bandwidth(); })
  .padAngle(0.01)
  .padRadius(innerRadius))


  // Add the labels
svg.append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
      .attr("text-anchor", function(d) { return (x(d.time1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
      .attr("transform", function(d) { return "rotate(" + ((x(d.time1) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d.steps)+10) + ",0)"; })
    .append("text")
      .text(function(d){return(d.time1)})
      .attr("transform", function(d) { return (x(d.time1) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
      .style("font-size", "15px")
      .style("fill", "white")
      .attr("alignment-baseline", "middle")

}
