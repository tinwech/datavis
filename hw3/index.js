var data = {};
var corr = {};

const duration = 300;

const svg = d3.select('svg');

const fields = ['Length', 'Diameter', 'Height', 'Whole_weight', 'Shucked_weight', 'Viscera_weight', 'Shell_weight', 'Rings'];
const classes = ['Male', 'Female', 'Infant'];
classes.forEach(c => {
  data[c] = {};
  fields.forEach(f => {
    data[c][f] = [];
  })
})
const color = d3.scaleSequential()
  .interpolator(d3.interpolateInferno)
  .domain([0, 1]);

const pcorr = (x, y) => {
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0,
    sumY2 = 0;
  const minLength = x.length = y.length = Math.min(x.length, y.length),
    reduce = (xi, idx) => {
      const yi = y[idx];
      sumX += xi;
      sumY += yi;
      sumXY += xi * yi;
      sumX2 += xi * xi;
      sumY2 += yi * yi;
    }
  x.forEach(reduce);
  return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
};

var mouseX;
var mouseY;

svg.on('mousemove', function () {
  mouseX = d3.mouse(this)[0];
  mouseY = d3.mouse(this)[1];
});

var tooltip = d3.select('#plot').append('div')
  .style("opacity", 0)
  .attr("id", "myTooltip")
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("position", "fixed")
  .style("width", "240px");

const drawScatter = (g, idx, xAxisLabel, yAxisLabel, value, x, y, width, height) => {

  const margin = { top: 20, right: 10, bottom: 28, left: 35 };
  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  const scatterData = []
  for (i in data[classes[idx]][xAxisLabel]) {
    var dict = {}
    dict[xAxisLabel] = data[classes[idx]][xAxisLabel][i];
    dict[yAxisLabel] = data[classes[idx]][yAxisLabel][i];
    scatterData.push(dict);
  }

  const xValue = (d) => d[xAxisLabel];
  const yValue = (d) => d[yAxisLabel];

  const circleRadius = 1;

  const title = `${yAxisLabel} vs. ${xAxisLabel}`


  const scatter = g.append('g')
    .attr('id', 'scatter')
    .attr('pointer-events', 'none')
    .attr('transform', `translate(${x + margin.left}, ${y + margin.top})`);

  scatter.append('text')
    .text(title)
    .attr('id', 'title')
    .attr('text-anchor', 'left')
    .attr('font-size', '0.6em')
    .attr('transform', `translate(0, -5)`);
  console.log(scatter.select('#title').node().getComputedTextLength());

  // x axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(scatterData, xValue))
    .range([0, width])
    .nice();

  console.log(xScale);

  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickSize(-height)
    .tickPadding(10);

  const xAxisG = scatter.append('g').call(xAxis)
    .attr('transform', `translate(0,${height})`);

  // y axis
  const yScale = d3.scaleLinear()
    .domain(d3.extent(scatterData, yValue))
    .range([height, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .ticks(5)
    .tickSize(-width)
    .tickPadding(10);

  const yAxisG = scatter.append('g').call(yAxis);

  // data points
  scatter.selectAll('circle').data(scatterData)
    .enter().append('circle')
    .attr('cy', d => yScale(yValue(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('r', circleRadius)
    .attr('opacity', 0.3)

  if (value < 0.7) {
    scatter.selectAll('text')
      .style('fill', 'white');
    scatter.selectAll('circle')
      .style('fill', 'white');
  }
};


const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 500;

  const margin = { top: 120, right: 200, bottom: 80, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // draw legend
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "linear-gradient");
  linearGradient.selectAll("stop")
    .data([
      { offset: "0%", color: color(0) },
      { offset: "12.5%", color: color(0.125) },
      { offset: "25%", color: color(0.25) },
      { offset: "37.5%", color: color(0.375) },
      { offset: "50%", color: color(0.50) },
      { offset: "62.5%", color: color(0.625) },
      { offset: "75%", color: color(0.75) },
      { offset: "87.5%", color: color(0.875) },
      { offset: "100%", color: color(1) }
    ])
    .enter().append("stop")
    .attr("offset", function (d) { return d.offset; })
    .attr("stop-color", function (d) { return d.color; });

  const legendG = svg.append("g")
    .attr("class", "legendWrapper")
    .attr('transform', `translate(${40}, 30)`);

  legendG.append('text')
    .text('correlation coefficient')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2 - 40}, -5)`);

  legendG.append("rect")
    .attr("width", width - 80)
    .attr("height", 15)
    .style("fill", "url(#linear-gradient)")
    .style('opacity', 0.8);

  const legendScale = d3.scaleLinear()
    .range([0, width - 80])
    .domain([0, 1]);

  legendG.append('g')
    .attr('transform', `translate(0, 20)`)
    .call(d3.axisBottom(legendScale)
      .tickFormat(d => d)
      .tickSize(0)
      .ticks(5)
    )
    .select('.domain').remove();

  const xScale = d3.scaleBand()
    .range([0, innerWidth / 3])
    .domain(fields)
    .padding(0.05);
  const yScale = d3.scaleBand()
    .range([0, innerHeight])
    .domain(fields)
    .padding(0.05);

  for (let idx = 0; idx < 3; idx++) {
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left + idx * (innerWidth / 3 + 80)},${margin.top})`);

    const xAxisG = g.append("g") // Add the X Axis
      .attr("transform", "translate(0," + (innerHeight) + ")")
      .call(d3.axisBottom(xScale).tickSize(0));
    xAxisG.select('.domain').remove()
    xAxisG.selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-30)");

    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(0))
      .select('.domain').remove();

    const mouseover = function (d) {

      const title = `${d.x} vs. ${d.y}`
      g.append('text')
        .text(title)
        .attr('id', 'title')
        .attr('text-anchor', 'left')
        .attr('font-size', '0.6em')
        .attr('transform', `translate(0, -5)`);
      const text_width = g.select('#title').node().getComputedTextLength();
      g.selectAll('#title').remove();

      var width = xScale.bandwidth() * 4;
      var height = yScale.bandwidth() * 4;
      if (width < text_width + 45) {
        width += text_width - width + 45;
      }
      width = width > height ? width : height;
      height = width > height ? width : height;

      const offsetX = mouseX < innerWidth / 2 ? 0 : width - xScale.bandwidth();
      const offsetY = fields.indexOf(d.y) < fields.length / 2 ? 0 : height - yScale.bandwidth();

      g.raise();
      d3.select(this)
        .raise()
        .transition().duration(duration)
        .style("opacity", 1)
        .style("stroke", "black")
        .attr("x", function (d) { return xScale(d.x) - offsetX })
        .attr("y", function (d) { return yScale(d.y) - offsetY })
        .attr('width', width)
        .attr('height', height);

      drawScatter(
        g,
        idx,
        d.x,
        d.y,
        d.value,
        xScale(d.x) - offsetX,
        yScale(d.y) - offsetY,
        width,
        height);


      const triangle = d3.symbol().type(d3.symbolTriangle).size(100);
      if (legendG.select('#pointer').empty()) {
        legendG.append("path")
          .attr('id', 'pointer')
          .attr("d", triangle)
          .attr("fill", "gray")
          .attr("transform", `translate(${legendScale(d.value)}, 25)scale(0.5, 1)`);
        legendG.append('text')
          .text(Math.round(d.value * 10000) / 10000)
          .attr('id', 'pointer_text')
          .attr('text-anchor', 'middle')
          .attr("transform", `translate(${legendScale(d.value)}, 45)`)
          .style('font-size', '0.8em');
      }
      else {
        legendG.select('#pointer')
          .transition().duration(duration)
          .attr("transform", `translate(${legendScale(d.value)}, 25)scale(0.5, 1)`);
        legendG.select('#pointer_text')
          .transition().duration(duration)
          .text(Math.round(d.value * 10000) / 10000)
          .attr("transform", `translate(${legendScale(d.value)}, 45)`);
      }
    }
    const mouseleave = function (d) {
      d3.select(this).transition().duration(duration)
        .style("opacity", 0.8)
        .style("stroke", "none")
        .attr("x", function (d) { return xScale(d.x) })
        .attr("y", function (d) { return yScale(d.y) })
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth());

      d3.selectAll('#scatter').remove();
    }

    // add text
    g.selectAll()
      .data(corr[classes[idx]], function (d) { return d.x + ':' + d.y; })
      .enter()
      .append("text")
      .attr("x", function (d) { return xScale(d.x) + xScale.bandwidth() / 2 })
      .attr("y", function (d) { return yScale(d.y) + yScale.bandwidth() / 2 })
      .text(d => Math.round(d.value * 100) / 100)
      .attr('text-anchor', 'middle')
      .attr('font-size', '0.6em');

    // draw rectangles
    g.selectAll()
      .data(corr[classes[idx]], function (d) { return d.x + ':' + d.y; })
      .enter()
      .append("rect")
      .attr("x", function (d) { return xScale(d.x) })
      .attr("y", function (d) { return yScale(d.y) })
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("width", xScale.bandwidth())
      .attr("height", yScale.bandwidth())
      .style("fill", function (d) { return color(d.value) })
      .style("stroke-width", 4)
      .style("stroke", "none")
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mouseleave", mouseleave);

    g.append('text')
      .attr('x', 0)
      .attr('y', -20)
      .attr('font-size', '1.5em')
      .text(classes[idx]);
  }

};

// load data
d3.text('https://tinwech.github.io/datavis/data/abalone.data')
  .then(text => {
    const csv = d3.csvParseRows(text);
    for (const row of csv) {
      for (let i = 1; i < fields.length + 1; i++) {
        switch (row[0]) {
          case 'M':
            data['Male'][fields[i - 1]].push(+row[i]);
            break;
          case 'F':
            data['Female'][fields[i - 1]].push(+row[i]);
            break;
          case 'I':
            data['Infant'][fields[i - 1]].push(+row[i]);
            break;
        }
      }
    }
    for (let idx = 0; idx < 3; idx++) {
      corr[classes[idx]] = [];
      for (let i = 0; i < fields.length; i++) {
        for (let j = 0; j < fields.length; j++) {
          corr[classes[idx]].push({
            x: fields[j],
            y: fields[i],
            value: pcorr(data[classes[idx]][fields[i]], data[classes[idx]][fields[j]])
          })
        }
      }
    }
    render();
  });

window.onresize = () => { render() }
