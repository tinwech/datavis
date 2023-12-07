const svg = d3.select('svg');

const columns = ['sepal width', 'sepal length', 'petal width', 'petal length'];
const classes = ['Iris-setosa', 'Iris-versicolor', 'Iris-virginica'];
const color = d3.scaleOrdinal()
  .domain(classes)
  .range(["#E6842A", "#137B80", "#8E6C8A"]);

// tooltip
let tooltip = d3.select("#plot")
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

let brushedSubplot;
let selectedData;

function drawBrush(plot, width, height, circles, xScale, yScale, xAxisLabel, yAxisLabel) {
  const brush = d3.brush()
    .extent([[0, 0], [width, height]])
    .on("start", start)
    .on("brush", brushing);

  plot.call(brush);

  function start() {
    if (brushedSubplot !== undefined && brushedSubplot.attr('id') != plot.attr('id')) {
      brushedSubplot
        .selectAll('circle')
        .classed('selected', false);
      brushedSubplot.call(brush.move, [[0, 0], [1, 1]]);
    }
  }

  function brushing() {
    extent = d3.event.selection;
    circles.classed("selected", d => isBrushed(extent, xScale(d[xAxisLabel]), yScale(d[yAxisLabel])));
    selectedData = [];
    circles.each(d => {
      if (isBrushed(extent, xScale(d[xAxisLabel]), yScale(d[yAxisLabel]))) {
        selectedData.push(d);
      }
    });
    drawBigScatter(selectedData, xAxisLabel, yAxisLabel);
    brushedSubplot = plot;
  }

  function isBrushed(brush_coords, cx, cy) {
    var x0 = brush_coords[0][0],
      x1 = brush_coords[1][0],
      y0 = brush_coords[0][1],
      y1 = brush_coords[1][1];
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
  }
}

function drawBigScatter(data, xAxisLabel, yAxisLabel) {
  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 400;
  const margin = { top: 0, right: 110, bottom: 80, left: 135 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  svg.select('#scatter').remove()
  const scatter = svg.append('g')
    .attr('id', 'scatter')
    .attr('transform', `translate(${margin.left},${700 + margin.top})`);

  scatter
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("height", innerHeight)
    .attr("width", innerWidth)
    .style("fill", "#EFECEA")

  scatter.append('text')
    .text(xAxisLabel)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.2em')
    .attr('fill', 'black')
    .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`);
  scatter.append('text')
    .text(yAxisLabel)
    .attr('text-anchor', 'middle')
    .attr('font-size', '1.2em')
    .attr('fill', 'black')
    .attr('transform', `translate(-40, ${innerHeight / 2})rotate(-90)`);

  // x axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[xAxisLabel]))
    .range([0, innerWidth])
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(10);

  const xAxisG = scatter.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
  xAxisG.select('.domain').remove();
  xAxisG.selectAll('line')
    .style('stroke', 'white');

  // y axis
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[yAxisLabel]))
    .range([innerHeight, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = scatter.append('g').call(yAxis);
  yAxisG.select('.domain').remove();
  yAxisG.selectAll('line')
    .style('stroke', 'white');


  const bold = (str) => {
    return "<strong>" + str + "</strong>";
  }

  const tooltipInfo = (d) => {
    let info = `<strong>type：<font style: color=${color(d.class)}>${d.class}</font></strong><br>`;
    for (let i in columns) {
      if (columns[i] == xAxisLabel || columns[i] == yAxisLabel) {
        info += bold(columns[i] + "：" + d[columns[i]] + "<br>");
      }
      else {
        info += columns[i] + "：" + d[columns[i]] + "<br>";
      }
    }
    return info;
  }

  // data points
  const circles = scatter.append('g')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cy', d => yScale(d[yAxisLabel]))
    .attr('cx', d => xScale(d[xAxisLabel]))
    .attr('r', 10)
    .attr('fill', d => color(d.class))
    .attr('opacity', 0.5)
    .on('mouseover', function (d) {
      d3.select(this).attr('opacity', 1);
      tooltip
        .html(tooltipInfo(d))
        .style('opacity', 1);
    })
    .on('mouseleave', function (d) {
      d3.select(this).attr('opacity', 0.5);
      tooltip.style('opacity', 0);
    });

  scatter.on('mousemove', function (d) {
    tooltip
      .style("left", (d3.mouse(this)[0] - 50) + "px")
      .style("top", (d3.mouse(this)[1] - 900) + "px")
  })
}

function drawScatter(plot, data, xAxisLabel, yAxisLabel, width, height) {
  plot.selectAll('*').remove();
  // x axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[xAxisLabel]))
    .range([0, width])
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .ticks(3)
    .tickPadding(10);

  plot.append('g').call(xAxis)
    .attr('transform', `translate(0, ${height})`);

  // y axis
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[yAxisLabel]))
    .range([height, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .ticks(3)
    .tickPadding(10);

  plot.append('g').call(yAxis);

  // data points
  const circles = plot.append('g')
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cy', d => yScale(d[yAxisLabel]))
    .attr('cx', d => xScale(d[xAxisLabel]))
    .attr('r', 4)
    .attr('fill', d => color(d.class))
    .attr('opacity', 0.5);

  plot.call(drawBrush, width, height, circles, xScale, yScale, xAxisLabel, yAxisLabel);
}

function drawHistogram(plot, data, field, width, height) {
  // x axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d[field]))
    .range([0, width])
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .ticks(3)
    .tickPadding(10);

  plot.append('g').call(xAxis)
    .attr('transform', `translate(0, ${height})`);

  const histogram = d3.histogram()
    .value(d => d[field])
    .domain(xScale.domain())
    .thresholds(xScale.ticks(15));

  var bins = histogram(data);

  // y axis
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .ticks(3)
    .tickPadding(10);

  plot.append('g').call(yAxis);

  const tooltipInfo = (d) => {
    let info = "<strong>" + field + "</strong> ";
    info += "[" + d.x0 + ", " + d.x1 + ")<br>";
    info += "total：" + d.length + "<br>";
    let count = {};
    let cnt = 0;
    for (let i in classes) {
      count[classes[i]] = 0;
    }
    for (let i in data) {
      if (d.x0 <= data[i][field] && data[i][field] < d.x1) {
        count[data[i].class] += 1;
        cnt += 1;
      }
    }
    for (let i in classes) {
      info += `<font style: color=${color(classes[i])}>` + classes[i] + "：" + count[classes[i]] + "</font><br>";
    }
    return info;
  }

  plot.append('g')
    .selectAll("rect")
    .data(bins)
    .enter()
    .append("rect")
    .attr("x", 1)
    .attr("transform", function (d) {
      return `translate(${xScale(d.x0)
        }, ${yScale(d.length)
        })`;
    })
    .attr("width", function (d) { return xScale(d.x1) - xScale(d.x0); })
    .attr("height", function (d) { return height - yScale(d.length); })
    .style("fill", "gray")
    .style('opacity', 0.5)
    .style('stroke', 'white')
    .on('mouseover', function (d) {
      d3.select(this).style('opacity', 1);
      tooltip
        .html(tooltipInfo(d))
        .style('opacity', 1);
    })
    .on('mouseleave', function (d) {
      d3.select(this).style('opacity', 0.5);
      tooltip.style('opacity', 0);
    });
  svg.on('mousemove', function (d) {
    tooltip
      .style("left", (d3.mouse(svg.node())[0] + 50) + "px")
      .style("top", (d3.mouse(svg.node())[1] - 1600) + "px")
  })
}
const render = (data) => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 700;

  const margin = { top: 40, right: 100, bottom: 50, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const splom = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  const subplotWidth = innerWidth / 4;
  const subplotHeight = innerHeight / 4;
  const subplotMargin = { top: 10, right: 10, bottom: 30, left: 40 };
  const subplotInnerWidth = subplotWidth - subplotMargin.left - subplotMargin.right;
  const subplotInnerHeight = subplotHeight - subplotMargin.top - subplotMargin.bottom;
  splom.selectAll()
    .data(columns).enter()
    .append('text')
    .text(d => d)
    .attr('font-size', '1.2em')
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(${columns.indexOf(d) * subplotWidth + subplotMargin.left + subplotInnerWidth / 2}, ${innerHeight + 20})`);
  splom.selectAll()
    .data(columns).enter()
    .append('text')
    .text(d => d)
    .attr('font-size', '1.2em')
    .attr('text-anchor', 'middle')
    .attr('transform', d => `translate(0, ${columns.indexOf(d) * subplotHeight + subplotMargin.top + subplotInnerHeight / 2})rotate(-90)`);

  for (i in columns) {
    for (j in columns) {
      const subplot = splom.append('g')
        .attr('id', 'subplot' + i + j)
        .attr('transform', `translate(${i * subplotWidth + subplotMargin.left}, ${j * subplotHeight + subplotMargin.top})`);
      if (i == j) {
        subplot.call(drawHistogram, data, columns[i], subplotInnerWidth, subplotInnerHeight);
      }
      else {
        subplot.call(drawScatter, data, columns[i], columns[j], subplotInnerWidth, subplotInnerHeight);
      }
    }
  }

  // legend
  const legendG = splom.append('g')
    .attr('transform', `translate(50, -15)`);
  for (let i = 0; i < classes.length; i++) {
    const space = 120;
    legendG.append("circle")
      .attr("cx", i * space)
      .attr("cy", 0)
      .attr("r", 6)
      .style("fill", color(classes[i]));
    legendG.append("text")
      .attr("x", 15 + i * space)
      .attr("y", 0)
      .text(classes[i])
      .style("font-size", "0.8em")
      .attr("alignment-baseline", "middle");
  }

  svg.append('g')
    .attr('id', 'scatter')
    .attr('transform', `translate(${margin.left}, ${height + margin.top})`);

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
    render(data);
    window.onresize = () => { render(data) }
  });

