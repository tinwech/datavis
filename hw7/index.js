let data
let loading = true

let timeRange = [new Date('2017'), new Date('2018')]
let band = 3
let groupType = 'station'

const svg = d3.select('svg');
let stations = ['Jongno-gu', 'Jung-gu', 'Yongsan-gu', 'Eunpyeong-gu', 'Seodaemun-gu', 'Mapo-gu', 'Seongdong-gu', 'Gwangjin-gu', 'Dongdaemun-gu', 'Jungnang-gu', 'Seongbuk-gu', 'Gangbuk-gu', 'Dobong-gu', 'Nowon-gu', 'Yangcheon-gu', 'Gangseo-gu', 'Guro-gu', 'Geumcheon-gu', 'Yeongdeungpo-gu', 'Dongjak-gu', 'Gwanak-gu', 'Seocho-gu', 'Gangnam-gu', 'Songpa-gu', 'Gangdong-gu']
let show = {}
stations.forEach(s => show[s] = true)
let columns = ['SO2', 'NO2', 'O3', 'CO', 'PM10', 'PM2.5']
columns.forEach(c => show[c] = true)
const color = d3.scaleOrdinal()
  .domain(columns)
  .range(d3.schemeCategory10)

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
  left = d3.mouse(svg.node())[0] + 50
  if (left > 300) {
    left -= 300;
  }
  tooltip
    .style("left", (left) + "px")
    .style("top", (d3.mouse(svg.node())[1] - 5100) + "px")
})

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  const width = plot.getBoundingClientRect().width;
  const height = 5000;

  const margin = { top: 60, right: 50, bottom: 80, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  if (loading) {
    return;
  }

  d3.select('.sbl-circ').style('display', 'none');

  const subWidth = innerWidth
  const subHeight = 30
  const pad = 1;

  // x axis
  const xScale = d3.scaleTime()
    .domain(timeRange)
    .range([0, subWidth])
  const xAxis = d3.axisTop(xScale)
    .tickFormat(d => d3.timeFormat("%Y/%m")(d))
    .ticks(5)
    .tickPadding(10);
  g.append('g')
    .call(xAxis)
    .attr('id', 'x-axis');


  // set position of each horizon plot
  let idx;
  let ypos = {}
  idx = 0;
  if (groupType == 'station') {
    for (let i = 0; i < stations.length; i++) {
      for (let j = 0; j < columns.length; j++) {
        if (!show[stations[i]] || !show[columns[j]]) continue;
        ypos[stations[i] + columns[j]] = idx * (subHeight + pad);
        idx++;
      }
    }
  }
  else {
    for (let i = 0; i < columns.length; i++) {
      for (let j = 0; j < stations.length; j++) {
        if (!show[stations[j]] || !show[columns[i]]) continue;
        ypos[stations[j] + columns[i]] = idx * (subHeight + pad);
        idx++;
      }
    }

  }

  // group the data base on station
  const groups = data.reduce((groups, d) => {
    const group = (groups[d.Address] || []);
    group.push(d);
    groups[d.Address] = group;
    return groups;
  }, {});


  // draw horizon plot
  idx = 0;
  for (let i = 0; i < stations.length; i++) {
    const series = groups[stations[i]];
    for (let j = 0; j < columns.length; j++) {
      if (!show[stations[i]] || !show[columns[j]]) continue;

      // clip the drawing out of this range
      const clip = g.append("defs").append("svg:clipPath")
        .attr("id", "clip" + idx)
        .append("svg:rect")
        .attr("width", subWidth)
        .attr("height", subHeight)
        .attr("x", 0)
        .attr("y", 0);

      // subplot
      const plot = g.append('g')
        .attr('transform', `translate(0,${ypos[stations[i] + columns[j]]})`)
        .attr('clip-path', `url(#clip${idx})`)


      // get the maximum value
      const max = d3.max(series, d => d[columns[j]])

      // y axis
      const yScale = d3.scaleLinear()
        .domain([0, max])
        .range([subHeight, 0])

      // draw area for each band
      for (let k = 0; k < band; k++) {
        plot.append("path")
          .datum(series)
          .attr("id", "path" + k)
          .attr("fill", color(columns[j]))
          .style("opacity", 1 / band)
          .attr("stroke", color(columns[j]))
          .attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x(d => xScale(d.date))
            .y0(subHeight)
            .y1(d => yScale(Math.max(0, d[columns[j]] * band - max * k)))
          )
      }

      plot.append('text')
        .text(`${columns[j]}, ${stations[i]}`)
        .style('font-size', '0.8em')
        .attr('transform', `translate(5,20)`);

      // tooltip
      plot.append('rect')
        .attr("width", subWidth)
        .attr("height", subHeight)
        .style("opacity", 0)
        .on("mouseover", function (d) {
          tooltip.style('opacity', 1);
          let mouseX = d3.mouse(plot.node())[0];
          plot.append('line')
            .attr('x1', mouseX)
            .attr('x2', mouseX)
            .attr('y1', 0)
            .attr('y2', subHeight)
            .style('stroke-width', '2px')
            .style('stroke', 'black');
          d3.select(this).raise();
        })
        .on("mouseleave", function (d) {
          d3.selectAll('line').remove();
          tooltip.style('opacity', 0);
        })
        .on("mousemove", function (d) {
          let mouseX = d3.mouse(plot.node())[0];
          d3.select('line')
            .attr('x1', mouseX)
            .attr('x2', mouseX);
          tooltip.html(() => {
            let minDate = new Date();
            let minVal = Math.abs(mouseX - xScale(minDate));
            let val;
            for (let i = 1; i < series.length; i++) {
              if (minVal > Math.abs(mouseX - xScale(series[i].date))) {
                minVal = Math.abs(mouseX - xScale(series[i].date));
                minDate = series[i].date
                val = series[i][columns[j]]
              }
            }
            info = `${d3.timeFormat("%Y/%m/%d")(minDate)}<br>`
            info += `Station: ${stations[i]}<br>`
            info += `${columns[j]}: ${val}<br>`
            return info;
          });
        })

      idx++;
    }
  }

};

// convert mm/dd/yyyy to Date
const getDate = (s) => {
  const date = s.split(' ');
  return new Date(date[0]);
}

render();

// load data
console.time();
d3.csv('https://tinwech.github.io/datavis/data/air-pollution.csv')
  // d3.csv('./air-pollution.csv')
  .then(csv => {
    loading = true;
    csv.forEach(row => {
      row['date'] = getDate(row['Measurement date']);
      row['Address'] = row['Address'].split(',')[2].trim()
      row['SO2'] = +row['SO2'];
      row['NO2'] = +row['NO2'];
      row['O3'] = +row['O3'];
      row['CO'] = +row['CO'];
      row['PM10'] = +row['PM10'];
      row['PM2.5'] = +row['PM2.5'];
    })
    // TODO: avg or mean
    data = alasql('select * from ? where SO2 > 0 and NO2 > 0 and O3 > 0 and CO > 0 and PM10 > 10 and [PM2.5] > 0', [csv]);
    data = alasql('select date, Address, AVG(SO2) as SO2, AVG(NO2) as NO2, AVG(O3) as O3, AVG(CO) as CO, AVG(PM10) as PM10, AVG([PM2.5]) as [PM2.5] from ? group by date, Address', [data]);
    loading = false;
    console.log(data);
    console.timeEnd();
    render();
  });

window.onresize = () => { render() }


function timestamp(str) {
  return new Date(str).getTime();
}

var timeSlider = document.getElementById('slider-time');
noUiSlider.create(timeSlider, {
  connect: true,
  range: {
    min: timestamp('2017'),
    max: timestamp('2020')
  },
  step: 24 * 60 * 60 * 1000,
  margin: 30 * 24 * 60 * 60 * 1000,
  start: [timestamp('2017'), timestamp('2018')],
});

var dateValues = [
  document.getElementById('event-start'),
  document.getElementById('event-end')
];

var formatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full'
});

timeSlider.noUiSlider.on('update', function (values, handle) {
  timeRange[handle] = new Date(+values[handle]);
  dateValues[handle].innerHTML = d3.timeFormat("%Y/%m/%d")(new Date(+values[handle]));
});

timeSlider.noUiSlider.on('set', function (values, handle) {
  d3.select('.sbl-circ').style('display', 'inline-block');
  render();
})

var bandSlider = document.getElementById('slider-band');
noUiSlider.create(bandSlider, {
  start: 3,
  connect: [true, false],
  range: {
    'min': 1,
    'max': 7
  },
  step: 1,
});

bandSlider.noUiSlider.on('update', function (values, handle) {
  bandValue = document.getElementById('event-band');
  bandValue.innerHTML = Math.round(values[handle]);
});

bandSlider.noUiSlider.on('set', function (values, handle) {
  band = Math.round(values[handle]);
  render();
})

let htmlStr = `<div class="form-check">
                <input class="form-check-input" type="checkbox" id="check-all-station" checked>
                <label class="form-check-label" for="check-all-station">
                  Select all
                </label>
              </div>`
for (i in stations) {
  htmlStr += `<div class="form-check">
                <input class="form-check-input station-checkbox" type="checkbox" value="${stations[i]}" id="check-${stations[i]}" checked onchange="updateCheckbox(value)">
                <label class="form-check-label" for="check-${stations[i]}">
                  ${stations[i]}
                </label>
              </div>`
}
document.getElementById('stationsList').innerHTML = htmlStr;
$('#check-all-station').click(function () {
  const status = $(this).prop('checked');
  $(".form-check-input.station-checkbox").prop('checked', status);
  stations.forEach(s => show[s] = status);
  render();
})

htmlStr = `<div class="form-check">
                <input class="form-check-input" type="checkbox" id="check-all-pollutant" checked>
                <label class="form-check-label" for="check-all-pollutant">
                  Select all
                </label>
              </div>`
for (i in columns) {
  htmlStr += `<div class="form-check">
                <input class="form-check-input pollutant-checkbox" type="checkbox" value="${columns[i]}" id="check-${columns[i]}" checked onchange="updateCheckbox(value)">
                <label class="form-check-label" for="check-${columns[i]}">
                  ${columns[i]}
                </label>
              </div>`
}
document.getElementById('pollutantsList').innerHTML = htmlStr;
$('#check-all-pollutant').click(function () {
  const status = $(this).prop('checked');
  $(".form-check-input.pollutant-checkbox").prop('checked', status);
  columns.forEach(s => show[s] = status);
  render();
})

function updateCheckbox(key) {
  show[key] = !show[key];
  render();
}

function updateRadio(value) {
  groupType = value;
  render();
}

