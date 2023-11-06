let data = [];
let graph = { "nodes": [], "links": [] };
const svg = d3.select('svg');
const attrs = ['buying', 'maintenance', 'doors', 'persons', 'luggage boot', 'safety']
const level = {
  'buying': ['low', 'med', 'high', 'vhigh'],
  'maintenance': ['low', 'med', 'high', 'vhigh'],
  'doors': ['2', '3', '4', '5more'],
  'persons': ['2', '4', 'more'],
  'luggage boot': ['small', 'med', 'big'],
  'safety': ['low', 'med', 'high'],
}

const color = {
  'buying': d3.scaleOrdinal()
    .domain(level['buying'])
    .range(d3.schemeReds[4]),
  'maintenance': d3.scaleOrdinal()
    .domain(level['maintenance'])
    .range(d3.schemeBlues[4]),
  'doors': d3.scaleOrdinal()
    .domain(level['doors'])
    .range(d3.schemeGreens[4]),
  'persons': d3.scaleOrdinal()
    .domain(level['persons'])
    .range(d3.schemePurples[3]),
  'luggage boot': d3.scaleOrdinal()
    .domain(level['luggage boot'])
    .range(d3.schemeOranges[3]),
  'safety': d3.scaleOrdinal()
    .domain(level['safety'])
    .range(d3.schemeGreys[3]),
}

const val = {
  'low': 0,
  'small': 0,
  '2': 0,
  'med': 1,
  '3': 1,
  'high': 2,
  '4': 2,
  'vhigh': 3,
  '5more': 3,
  'more': 3,
  'big': 3,
}

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
    .style("left", (d3.mouse(svg.node())[0] + 80) + "px")
    .style("top", (d3.mouse(svg.node())[1] - 850) + "px")
})

const render = () => {
  svg.selectAll("*").remove();

  const plot = d3.select('#plot').node();
  let width = plot.getBoundingClientRect().width;
  let height = 500;

  const margin = { top: 30, right: 80, bottom: 30, left: 80 };

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const nodeWidth = 33;
  const nodePadding = 30;

  // build sankey graph
  const sankey = d3.sankey()
    .nodeWidth(nodeWidth)
    .nodePadding(nodePadding)
    .size([innerWidth, innerHeight])
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);

  // get x positions of nodes
  const x = d3.keys(d3.nest()
    .key(d => d.x)
    .object(graph.nodes));
  x.forEach((d, i) => x[i] = +d);
  x.sort((a, b) => a - b);
  let xPose = {}
  attrs.forEach((d, i) => {
    xPose[d] = x[i];
  })

  const drag = d3.drag();

  const labelG = g.selectAll('.label')
    .data(attrs)
    .enter()
    .append('g')
    .attr('class', 'label')
    .attr('transform', d => `translate(${xPose[d] + nodeWidth / 2}, ${innerHeight + 30})`)
  labelG.call(drag)
  labelG.append('text')
    .text(d => d)
    .attr('text-anchor', 'middle')

  let legendG = {};
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    legendG[attr] = g.append('g')
      .attr('transform', `translate(${xPose[attr] + nodeWidth / 2 - 5}, 5)`)
    legendG[attr].append('g')
      .attr('transform', `translate(0, ${innerHeight + 30})`)
      .selectAll('legend')
      .data(level[attr])
      .enter()
      .append('text')
      .attr('class', 'legend')
      .attr('x', 0)
      .attr('y', (d, idx) => idx * 20 + 20)
      .attr('text-anchor', 'left')
      .text(d => d)
    legendG[attr].append('g')
      .attr('transform', `translate(-10, ${innerHeight + 25})`)
      .selectAll('dot')
      .data(level[attr])
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', 0)
      .attr('cy', (d, idx) => idx * 20 + 20)
      .attr('r', 5)
      .style('fill', d => color[attr](d))
  }

  // drag legend
  let dragging = {}
  function getPose(d) {
    return dragging[d] == null ? xPose[d] : dragging[d];
  }
  drag.on('drag', function (d) {
    console.log('drag');
    dragging[d] = d3.event.x;
    d3.select(this)
      .attr('transform', d => `translate(${getPose(d) + nodeWidth / 2}, ${innerHeight + 30})`)
    legendG[d]
      .attr('transform', `translate(${getPose(d) + nodeWidth / 2 - 5}, 5)`)
  }).on('end', function (d) {
    console.log('end');
    attrs.sort((a, b) => getPose(a) - getPose(b));
    buildGraph(data);
    render();
  })

  // linear gradient color for the link
  var defs = svg.append("defs");
  var grads = defs.selectAll("linearGradient")
    .data(graph.links)
    .enter()
    .append("linearGradient")
    .attr("id", d => `lg-${d.id}`)
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("x1", function (d) { return d.source.x; })
    .attr("y1", function (d) { return d.source.y; })
    .attr("x2", function (d) { return d.target.x; })
    .attr("y2", function (d) { return d.target.y; });
  grads.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", function (d) {
      return (d.source.x <= d.target.x) ? d.source.color : d.target.color
    });
  grads.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", function (d) {
      return (d.source.x > d.target.x) ? d.source.color : d.target.color
    });

  // add in the links
  var link = g.append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", sankey.link())
    .style("stroke", d => `url(#lg-${d.id})`)
    .style("stroke-width", d => Math.max(1, d.dy))
    .sort((a, b) => b.dy - a.dy)
    // display tooltip
    .on('mouseover', function (d) {
      d3.select(this).raise();
      tooltip.style('opacity', 1);
      tooltip.html(
        `Source: ${d.source.cat}, ${d.source.level} (${(d.value / d.source.value * 100).toFixed(2)}%)<br>
      Target: ${d.target.cat}, ${d.target.level} (${(d.value / d.target.value * 100).toFixed(2)}%)<br>
      Number of samples: ${d.value}`
      )
    })
    .on('mouseleave', function (d) {
      tooltip.style('opacity', 0);
    });

  // add in the nodes
  var node = g.append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
    .call(d3.drag()
      .subject(d => d)
      .on("start", function () { this.parentNode.appendChild(this); })
      .on("drag", dragmove)
    )

  // append rect to node
  node.append("rect")
    .attr("height", d => d.dy)
    .attr("width", sankey.nodeWidth())
    .style("fill", d => d.color)
    .style("stroke", d => d3.rgb(d.color).darker(2))
    // display tooltip
    .on('mouseover', function (d) {
      tooltip.style('opacity', 1);
      tooltip.html(
        `Number of samples: ${d.value}`
      )
    })
    .on('mouseleave', function (d) {
      tooltip.style('opacity', 0);
    });

  // append text to node
  node.append("text")
    .attr("x", -6)
    .attr("y", function (d) { return d.dy / 2; })
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("transform", null)
    .text(function (d) { return d.level; })
    .filter(function (d) { return d.x < width / 2; })
    .attr("x", 6 + sankey.nodeWidth())
    .attr("text-anchor", "start");

  // drag the node
  function dragmove(d) {
    d3.select(this)
      .attr("transform", `translate(${d.x},${(d.y = Math.max(0, Math.min(innerHeight - d.dy, d3.event.y)))})`);
    sankey.relayout();
    link.attr("d", sankey.link())
      .style("stroke", d => `url(#lg-${d.id})`)
  }
};

function buildGraph(data) {
  let links = {};
  graph.nodes = [];
  graph.links = [];
  data.forEach(row => {
    for (let i = 0; i < attrs.length; i++) {
      graph.nodes.push({ "name": `${attrs[i]}-${row[attrs[i]]}` })
      if (i < attrs.length - 1) {
        const source = `${attrs[i]}-${row[attrs[i]]}`;
        const target = `${attrs[i + 1]}-${row[attrs[i + 1]]}`;
        links[source + ':' + target] = links[source + ':' + target] + 1 || 1;
      }
    }
  })

  graph.nodes = d3.keys(d3.nest()
    .key(d => d.name)
    .object(graph.nodes));
  graph.nodes.sort((a, b) => val[b.split('-')[1]] - val[a.split('-')[1]])

  let id = 0;
  for (const [key, value] of Object.entries(links)) {
    const [source, target] = key.split(':');
    graph.links.push({
      "source": graph.nodes.indexOf(source),
      "target": graph.nodes.indexOf(target),
      "value": value,
      "id": id,
    });
    id++;
  }
  graph.nodes.forEach((d, i) => {
    const [cat, level] = d.split('-');
    graph.nodes[i] = {
      "name": d,
      "cat": cat,
      "level": level,
      "color": color[cat](level),
    };
  })
}

// load data
d3.text('http://vis.lab.djosix.com:2023/data/car.data', function (error, text) {
  const csv = d3.csvParseRows(text);
  csv.forEach(row => {
    data.push({
      "buying": row[0],
      "maintenance": row[1],
      "doors": row[2],
      "persons": row[3],
      "luggage boot": row[4],
      "safety": row[5],
    })
  })
  buildGraph(data)
  render();
})

window.onresize = () => { render() }
