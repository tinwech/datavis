let data = []
let dates = []
let obj = {}
let key = 'house'

const svg = d3.select('svg');
const columns = ['house', 'unit', '1 bedrooms', '2 bedrooms', '3 bedrooms', '4 bedrooms', '5 bedrooms']
const color = d3.scaleOrdinal()
  .domain(columns)
  .range(d3.schemePaired)

const tooltip = d3.select("#plot")
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

svg.on('mousemove', function (d) {
  tooltip
    .style("left", (d3.mouse(svg.node())[0] + 50) + "px")
    .style("top", (d3.mouse(svg.node())[1] - 550) + "px")
})

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 500;

  const margin = { top: 30, right: 200, bottom: 80, left: 200 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // background
  g.append('rect')
    .attr('id', 'background')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', '#EFECEA');

  // x axis
  const xScale = d3.scaleTime()
    .domain(d3.extent(data, d => d['date']))
    .range([0, innerWidth]);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(innerHeight)
    .tickPadding(10);

  g.append('g')
    .call(xAxis)
    .selectAll('.domain')
    .remove();

  g.append('text')
    .text('Time (year)')
    .attr('text-anchor', 'middle')
    .attr('x', innerWidth / 2)
    .attr('y', innerHeight + 50)

  g.append('text')
    .text('MA ($)')
    .attr('transform', `translate(-50, ${innerHeight / 2})rotate(-90)`)
    .attr('text-anchor', 'middle')

  // y axis
  const yScale = d3.scaleLinear()
    .domain([-2500000, 2500000])
    .range([innerHeight, 0]);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickFormat(d => d3.format(".2s")(d))
    .tickPadding(10);

  g.append('g')
    .call(yAxis)
    .selectAll('.domain')
    .remove();

  // stack the data
  let stackedData = d3.stack()
    .offset(d3.stackOffsetSilhouette)
    .keys(columns)
    (data);

  // generate area
  const area = d3.area()
    .x(d => xScale(d.data.date))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  // get mouse position relative to the plot
  let mouseX = 0;
  g.on('mousemove', function (d) {
    mouseX = d3.mouse(g.node())[0];
    tooltip.html(tooltipInfo());
  })

  // generate tooltip info
  const tooltipInfo = () => {
    let minDate = dates[0];
    let minVal = Math.abs(mouseX - xScale(minDate));
    for (let i = 1; i < dates.length; i++) {
      if (minVal > Math.abs(mouseX - xScale(dates[i]))) {
        minVal = Math.abs(mouseX - xScale(dates[i]));
        minDate = dates[i];
      }
    }
    let info = `<strong>${key}</strong><br>`;
    info += `date : ${minDate.toLocaleDateString('en-US')}<br>`;
    info += `MA : ${obj[minDate][key]}`;
    return info;
  }

  // draw theme rivers
  const rivers = g.selectAll("mylayers")
    .data(stackedData)
    .enter()
    .append("path")
    .attr("class", "river")
    .style("fill", d => color(d.key))
    .attr("d", area)
    .on("mouseover", function (d) {
      key = d.key
      tooltip.style('opacity', 1);
      d3.selectAll('.river')
        .style('opacity', 0.2);
      d3.select(this)
        .style('stroke-width', '2px')
        .style('stroke', 'black')
        .style('opacity', 1);
    })
    .on("mouseleave", function (d) {
      tooltip.style('opacity', 0);
      d3.selectAll('.river')
        .style('opacity', 1);
      d3.select(this)
        .style('stroke', 'none');
    })

  // legends
  let dragging = {}
  const position = (d) => {
    return dragging[d] == null ? 200 - columns.indexOf(d) * 25 : dragging[d];
  }

  const drag = d3.drag();

  // legends
  const dots = g.selectAll("mydots")
    .data(columns)
    .enter()
    .append("circle")
    .attr("cx", innerWidth + 20)
    .attr("cy", d => position(d))
    .attr("r", 7)
    .style("fill", d => color(d))
    .call(drag)
  const labels = g.selectAll("mylabels")
    .data(columns)
    .enter()
    .append("text")
    .attr("x", innerWidth + 40)
    .attr("y", d => position(d))
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
    .call(drag)

  // update the chart
  function update() {
    dots.data(columns)
      .attr('cy', d => position(d))
      .style("fill", function (d) { return color(d) });
    labels.data(columns)
      .text(d => d)
      .attr("y", d => position(d))
    stackedData = d3.stack()
      .offset(d3.stackOffsetSilhouette)
      .keys(columns)
      (data);
    rivers.data(stackedData)
      .transition()
      .duration(300)
      .style("fill", d => color(d.key))
      .attr("d", area)
  }

  // drag legends
  drag
    .on('drag', function (d) {
      console.log(d)
      d3.select(this).attr("cy", d3.event.y);
      dragging[d] = d3.event.y;
      columns.sort((a, b) => position(b) - position(a));
      update();
    })
    .on('end', function (d) {
      console.log('end')
      delete dragging[d];
      update();
    });
};

// convert mm/dd/yyyy to Date
const getDate = (s) => {
  const nums = s.split('/');
  return new Date(nums[2], nums[1], nums[0]);
}

// load data
d3.csv('https://tinwech.github.io/datavis/data/ma_lga_12345.csv')
  .then(csv => {
    csv.forEach(row => {
      const date = getDate(row['saledate']);
      if (!(date in obj)) {
        dates.push(date);
        obj[date] = {
          'date': null,
          'house': 0,
          'unit': 0,
          '1 bedrooms': 0,
          '2 bedrooms': 0,
          '3 bedrooms': 0,
          '4 bedrooms': 0,
          '5 bedrooms': 0,
        }
      }
      obj[date]['date'] = date
      obj[date][row['bedrooms'] + ' bedrooms'] = +row['MA'];
      obj[date][row['type']] = +row['MA'];
    })
    data = Object.values(obj)
    data.sort((a, b) => {
      return a['date'] - b['date']
    })
    render();
  });

window.onresize = () => { render() }
