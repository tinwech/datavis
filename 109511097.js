let data = []
let schools = []
let label = 'scores_overall'
let strmap = {}
let name2row = {}

const toScore = (s) => {
  return +s.split('–')[0];
}

function sort() {
  data.sort((a, b) => {
    return a[label] - b[label]
  });
  schools = []
  data.forEach(d => schools.push(d['name']));
}

const svg = d3.select('svg');

const columns = ['scores_teaching', 'scores_research', 'scores_citations', 'scores_industry_income', 'scores_international_outlook']
const weight = {
  'scores_teaching': 0.3,
  'scores_research': 0.3,
  'scores_citations': 0.3,
  'scores_industry_income': 0.025,
  'scores_international_outlook': 0.075,
}
const columnShort = {
  'scores_teaching': 'teaching',
  'scores_research': 'research',
  'scores_citations': 'citations',
  'scores_industry_income': 'industry income',
  'scores_international_outlook': 'international outlook',
}

const color = d3.scaleOrdinal()
  .domain(columns)
  .range(["#E3BA22", "#E6842A", "#137B80", "#8E6C8A", "#BD2D28"])

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
    .style("top", (d3.mouse(svg.node())[1] - 50080) + "px")
})

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 50000;

  const margin = { top: 30, right: 150, bottom: 80, left: 250 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  svg.append('rect')
    .attr('id', 'background')
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr('fill', '#EFECEA')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // x axis
  const xScale = d3.scaleLinear()
    .domain([0, 100])
    .range([0, innerWidth])
    .nice();

  const xAxis = d3.axisTop(xScale)
    .tickSize(-innerHeight)
    .tickPadding(10);

  g.append('g')
    .call(xAxis)
    .selectAll('.domain')
    .remove();

  const rankScale = d3.scaleBand()
    .range([0, innerHeight])
    .domain(Array.from(Array(data.length).keys()))
    .padding(0.05);

  const rankAxis = g.append('g')
    .attr('transform', `translate(${innerWidth},0)`)
  rankAxis.call(d3.axisRight(rankScale).tickFormat(d => '# ' + (d + 1)))
  rankAxis.selectAll('.domain').remove();

  const yScale = d3.scaleBand()
    .range([innerHeight, 0])
    .domain(schools)
    .padding(0.05);

  const yAxis = g.append('g')
  yScale.domain(schools);
  yAxis.transition()
    .duration(1000)
    .call(d3.axisLeft(yScale)
      .tickFormat(d => strmap[d]));
  yAxis.selectAll('.domain').remove();

  const tooltipInfo = (name) => {
    const d = name2row[name];
    let info = d['name'] + '<br>';
    info += 'overall：' + d['scores_overall'];
    return info;
  }

  yAxis.selectAll('text')
    .on('mouseover', function (d) {
      tooltip
        .html(`${tooltipInfo(strmap[d3.select(this).text()])}`)
        .style('opacity', 1)
    })
    .on('mouseleave', function (d) {
      tooltip.style('opacity', 0)
    })

  const rectInfo = (name, field) => {
    const d = name2row[name];
    let info = d['name'] + '<br>';
    info += columnShort[field] + '：' + d[field] + ' * ' + weight[field] + ' = ' + d[field] * weight[field];
    return info;
  }

  function drawRect(xOffset, school, field) {
    g.append('rect')
      .attr('x', xOffset)
      .attr('y', yScale(school['name']) + 5)
      .attr('width', xScale(school[field]) * weight[field])
      .attr('height', yScale.bandwidth() - 10)
      .style('fill', color(field))
      .on('mouseover', function (d) {
        d3.select(this)
          .raise()
          .style('stroke', 'black')
          .style('stroke-width', '2px')
        tooltip
          .html(`${rectInfo(school['name'], field)}`)
          .style('opacity', 1)
      })
      .on('mouseleave', function (d) {
        d3.select(this)
          .style('opacity', 1)
          .style('stroke', 'none')
        tooltip.style('opacity', 0)
      })

    xOffset += xScale(school[field]) * weight[field]
    return xOffset
  }

  for (i in data) {
    let offset = 0;
    for (j in columns) {
      offset = drawRect(offset, data[i], columns[j])
    }
  }

  function update() {
    sort();
    yScale.domain(schools);
    yAxis.transition()
      .duration(1000)
      .call(d3.axisLeft(yScale)
        .tickFormat(d => strmap[d]));
    yAxis.selectAll('.domain').remove();

    g.selectAll('rect').remove();

    for (i in data) {
      let offset = 0;
      for (j in columns) {
        offset = drawRect(offset, data[i], columns[j])
      }
    }

  }

  $("input[name='inlineRadioOptions']").click(function () {
    label = $("input[name='inlineRadioOptions']:checked").val();
    if (label != 'scores_overall') {
      const idx = columns.indexOf(label);
      const temp = columns[idx];
      columns[idx] = columns[0];
      columns[0] = temp;
    }
    update();
  });
};

// load data
d3.csv('http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv')
  .then(csv => {
    csv.forEach(row => {
      if (row['rank'] == 'Reporter') return;
      row['scores_overall'] = 0
      columns.forEach(c => {
        row[c] = +row[c];
        row['scores_overall'] += row[c] * weight[c];
      })
      data.push(row);
      if (row['name'].length > 30) {
        strmap[row['name'].slice(0, 30) + '...'] = row['name'];
        strmap[row['name']] = row['name'].slice(0, 30) + '...';
      }
      else {
        strmap[row['name']] = row['name'];
      }
      name2row[row['name']] = row;
    })
    sort();
    render();
  });

window.onresize = () => { render() }
