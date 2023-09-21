var data;

const svg = d3.select('svg');

const classes = ['setosa', 'versicolor', 'virginica']
const color = d3.scaleOrdinal()
  .domain(classes)
  .range(["red", "green", "blue"])

var xAxisLabel = $("input[name='x-axis']:checked").val()
var yAxisLabel = $("input[name='y-axis']:checked").val()

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 500;

  const margin = { top: 40, right: 100, bottom: 80, left: 100 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xValue = (d) => d[xAxisLabel];
  const yValue = (d) => d[yAxisLabel];
  const classValue = (d) => d.class;

  const circleRadius = 10;

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // x axis
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);

  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);
  xAxisG.select('.domain').remove();
  xAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('y', 70)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .text(xAxisLabel);

  // y axis
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.append('g').call(yAxis);
  yAxisG.selectAll('.domain').remove();
  yAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('y', -80)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text(yAxisLabel);

  // data points
  g.selectAll('circle').data(data)
    .enter().append('circle')
    .attr('cy', d => yScale(yValue(d)))
    .attr('cx', d => xScale(xValue(d)))
    .attr('r', circleRadius)
    .attr('fill', d => color(classValue(d)));

  // legend
  const legendG = g.append('g')
    .attr('transform', `translate(20, 20)`);
  for (let i = 0; i < classes.length; i++) {
    legendG.append("circle")
      .attr("cx", 0)
      .attr("cy", i * 20)
      .attr("r", 6)
      .style("fill", color(classes[i]));
    legendG.append("text")
      .attr("x", 20)
      .attr("y", i * 20)
      .text(classes[i])
      .style("font-size", "15px")
      .attr("alignment-baseline", "middle");
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

$("input[name='x-axis']").click(function () {
  xAxisLabel = $("input[name='x-axis']:checked").val();
  render();
});

$("input[name='y-axis']").click(function () {
  yAxisLabel = $("input[name='y-axis']:checked").val();
  render();
});

window.onresize = () => { render() }
