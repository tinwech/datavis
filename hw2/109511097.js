var data;

const svg = d3.select('svg');

var columns = ['sepal length', 'sepal width', 'petal length', 'petal width'];
const classes = ['setosa', 'versicolor', 'virginica'];
const color = d3.scaleOrdinal()
  .domain(classes)
  .range(["#E6842A", "#137B80", "#8E6C8A"]);

var sym =
  d3.symbol().type(d3.symbolTriangle).size(80);

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 400;

  const margin = { top: 80, right: 80, bottom: 70, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  var xScale = d3.scalePoint()
    .range([0, innerWidth])
    .padding(1)
    .domain(columns);

  var yScale = {}
  for (var i = 0; i < 4; i++) {
    yScale[columns[i]] = d3.scaleLinear()
      .domain(d3.extent(data, function (data) {
        return data[columns[i]];
      }))
      .range([innerHeight, 0])
      .nice();
  }

  // draw axes
  const axisG = g.selectAll('axis')
    .data(columns)
    .enter().append("g")
    .attr("transform", d => `translate(${xScale(d)}, 0)`)
    .each(function (d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); })

  axisG.append('text')
    .attr('class', 'axis-label')
    .attr('transform', `translate(0, ${innerHeight + 40})`)
    .attr('text-anchor', 'middle')
    .text(d => d);

  const rightButtons = g.selectAll()
    .data(columns)
    .enter()
    .append("path")
    .attr("d", sym)
    .attr("value", d => d)
    .attr("fill", "black")
    .attr('opacity', 0.2)
    .attr("transform", d => `translate(${xScale(d) + 55}, ${innerHeight + 35})rotate(90)scale(0.8,1)`)
    .on('mouseover', function () {
      d3.select(this).attr('opacity', 1);
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 0.2);
    })
    .on('click', function (d) {
      var from = columns.indexOf(d3.select(this).attr('value'));
      var to = (from + 1) % 4;
      var temp = columns[from];
      columns[from] = columns[to];
      columns[to] = temp;
      // render();
      update();
    });

  const leftButtons = g.selectAll()
    .data(columns)
    .enter()
    .append("path")
    .attr("d", sym)
    .attr("value", d => d)
    .attr("fill", "black")
    .attr('opacity', 0.2)
    .attr("transform", d => `translate(${xScale(d) - 55}, ${innerHeight + 35})rotate(-90)scale(0.8,1)`)
    .on('mouseover', function () {
      d3.select(this).attr('opacity', 1);
    })
    .on('mouseleave', function () {
      d3.select(this).attr('opacity', 0.2);
    })
    .on('click', function (d) {
      var from = columns.indexOf(d3.select(this).attr('value'));
      var to = (from + 3) % 4;
      var temp = columns[from];
      columns[from] = columns[to];
      columns[to] = temp;
      // render();
      update();
    });


  // tooltip
  var tooltip = d3.select("#plot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style('position', 'relative')
    .style('width', 'auto');

  // draw lines
  function path(d) {
    return d3.line()(columns.map(function (p) { return [xScale(p), yScale[p](d[p])]; }));
  }
  const lines = g.selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", d => d.class)
    .style("fill", "none")
    .style("stroke", function (d) { return (color(d.class)) })
    .style("opacity", 0.4)
    .on('mouseover', function (d) {
      d3.select(this)
        .style('opacity', 1)
        .style('stroke-width', 3);
      lines.filter(function () {
        return d3.select(this).attr('id') != d.class;
      }).style('stroke', 'gray');
    })
    .on('mousemove', function (d) {
      var text = "<strong>class:</strong> " + d.class + "<br>";
      for (i in columns) {
        text += "<strong>" + columns[i] + ":</strong> " + d[columns[i]] + "<br>"
      }
      tooltip
        .html(text)
        .style('opacity', 1)
        .style("left", (d3.mouse(this)[0] - 150) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        .style("top", (d3.mouse(this)[1] - 450) + "px")
    })
    .on('mouseleave', function (d) {
      tooltip
        .style('opacity', 0);
      d3.select(this)
        .style('opacity', 0)
        .style('stroke-width', 3);
      lines.filter(function () {
        return d3.select(this).attr('id') != d.class;
      }).style('stroke', d => color(d.class));
    })

  // legends
  const legendG = g.append('g')
    .attr('transform', `translate(${xScale(columns[0])}, -40)`);
  for (let i = 0; i < classes.length; i++) {
    const space = 100;
    legendG.append("circle")
      .attr("cx", i * space)
      .attr("cy", 0)
      .attr("r", 6)
      .style("fill", color(classes[i]));
    legendG.append("text")
      .attr("x", i * space + 10)
      .attr("y", 0)
      .text(classes[i])
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
  }

  function update() {
    xScale = d3.scalePoint()
      .range([0, innerWidth])
      .padding(1)
      .domain(columns);

    yScale = {}
    for (var i = 0; i < 4; i++) {
      yScale[columns[i]] = d3.scaleLinear()
        .domain(d3.extent(data, function (data) {
          return data[columns[i]];
        }))
        .range([innerHeight, 0])
        .nice();
    }

    axisG.transition().duration(500)
      .attr("transform", d => `translate(${xScale(d)}, 0)`)
      .each(function (d) { d3.select(this).call(d3.axisLeft().scale(yScale[d])); });

    lines.transition().duration(500)
      .attr('d', path);

    rightButtons.attr("transform", d => `translate(${xScale(d) + 55}, ${innerHeight + 35})rotate(90)`);

    leftButtons.attr("transform", d => `translate(${xScale(d) - 55}, ${innerHeight + 35})rotate(30)`)
  }

};

// load data
d3.csv('http://vis.lab.djosix.com:2023/data/iris.csv')
  .then(csv => {
    data = csv.filter(d => {
      if (d.class !== undefined) {
        csv.columns.slice(0, -1).forEach((c) => {
          d[c] = +d[c];
        });
        return d;
      }
    });
    render();
  });

window.onresize = () => { render() }
