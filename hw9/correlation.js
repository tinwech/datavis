import { render as drawScatter } from "./scatter.js";
import { pcorr, show, scatterProp } from "./utils.js";

const color = d3.scaleSequential()
    // .interpolator(d3.interpolateYlOrRd)
    .interpolator(d3.interpolateRdBu)
    .domain([1, -1]);


export const render = (plot, data, type, columns, width, height) => {
    plot.selectAll("*").remove();

    const margin = { top: 50, right: 50, bottom: 10, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const corr = [];
    for (let i = 0; i < columns.length; i++) {
        for (let j = 0; j < columns.length; j++) {
            const selected = data.filter(d => show[d[type]])
            corr.push({
                x: columns[j],
                y: columns[i],
                value: pcorr(selected.map(d => d[columns[i]]), selected.map(d => d[columns[j]]))
            })
        }
    }

    const xScale = d3.scaleBand()
        .range([0, innerWidth])
        .domain(columns)
        .padding(0.05);
    const yScale = d3.scaleBand()
        .range([0, innerHeight])
        .domain(columns)
        .padding(0.05);

    const g = plot.append('g')
        .attr("transform", `translate(${margin.left},${margin.top})`)

    const xAxisG = g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale).tickSize(0));
    xAxisG.select('.domain').remove();
    xAxisG.selectAll("text").remove();

    const yAxisG = g.append('g')
        .call(d3.axisLeft(yScale).tickSize(0))
    yAxisG.select('.domain').remove();
    yAxisG.selectAll("text").remove();

    // add text
    g.selectAll()
        .data(corr, function (d) { return d.x + ':' + d.y; })
        .enter()
        .append("text")
        .filter(d => columns.indexOf(d.y) >= columns.indexOf(d.x))
        .attr('id', d => d.x + '-' + d.y)
        .attr('class', 'corr-text')
        .attr("x", function (d) { return xScale(d.x) + xScale.bandwidth() / 2 })
        .attr("y", function (d) { return yScale(d.y) + yScale.bandwidth() / 2 })
        .text(d => {
            if (d.x == d.y) {
                return d.x;
            }
            else {
                return Math.round(d.value * 100) / 100;
            }
        })
        .attr('text-anchor', 'middle')
        .attr('font-size', '0.6em');

    // draw rectangles
    g.selectAll()
        .data(corr, function (d) { return d.x + ':' + d.y; })
        .enter()
        .append("rect")
        .filter(d => columns.indexOf(d.y) > columns.indexOf(d.x))
        .attr('id', d => d.x + '-' + d.y)
        .attr('class', 'corr-rect')
        .attr("x", function (d) { return xScale(d.x) })
        .attr("y", function (d) { return yScale(d.y) - 3 })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .style("fill", function (d) {
            if (d.x == d.y) {
                return "none";
            }
            return color(d.value)
        })
        .style("stroke-width", 4)
        .style("stroke", "none")
        .style("opacity", 0.8)
        .on('mouseover', function (d) {
            d3.selectAll(`#${d.x}-${d.y}`).style('stroke', 'black')
            d3.selectAll(`#${d.x}-${d.x}`).style('stroke', 'black')
            d3.selectAll(`#${d.y}-${d.y}`).style('stroke', 'black')
        })
        .on('mouseleave', function (d) {
            d3.selectAll(`#${d.x}-${d.y}`).style('stroke', 'none')
            d3.selectAll(`#${d.x}-${d.x}`).style('stroke', 'none')
            d3.selectAll(`#${d.y}-${d.y}`).style('stroke', 'none')
        })
        .on('click', function (d) {
            const scatter = d3.select('#scatter');
            scatter.call(drawScatter, data, type, d.x, d.y, width, 500, true);
            scatterProp['click'] = true;
            scatterProp['xAxisLabel'] = d.x;
            scatterProp['yAxisLabel'] = d.y;
            scatterProp['density'] = true;
        })

    for (let i = 0; i < columns.length; i++) {
        for (let j = i + 1; j < columns.length; j++) {
            const sub = g.append('g')
                .attr('transform', `translate(${xScale(columns[j])}, ${yScale(columns[i])})`);
            sub.call(drawScatter, data, type, columns[i], columns[j], xScale.bandwidth(), yScale.bandwidth(), false, true);
        }
    }


    // draw legend
    const defs = g.append("defs");
    const linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    linearGradient.selectAll("stop")
        .data([
            { offset: "0%", color: color(-1) },
            { offset: "12.5%", color: color(-0.75) },
            { offset: "25%", color: color(-0.5) },
            { offset: "37.5%", color: color(-0.25) },
            { offset: "50%", color: color(0) },
            { offset: "62.5%", color: color(0.25) },
            { offset: "75%", color: color(0.50) },
            { offset: "87.5%", color: color(0.75) },
            { offset: "100%", color: color(1) }
        ])
        .enter().append("stop")
        .attr("offset", function (d) { return d.offset; })
        .attr("stop-color", function (d) { return d.color; });

    const legendG = g.append("g")
        .attr("class", "legendWrapper")
        .attr('transform', `translate(0, -20)`);

    legendG.append("rect")
        .attr("width", innerWidth)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)")
        .style('opacity', 0.8);

    const legendScale = d3.scaleLinear()
        .range([0, innerWidth])
        .domain([-1, 1]);

    legendG.append('g')
        .call(d3.axisTop(legendScale)
            .tickFormat(d => d)
            .tickSize(0)
        )
        .select('.domain').remove();
};
