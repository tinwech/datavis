import { show } from "./utils";

export const render = (plot, data, label, xScale, width, height, rotate = false) => {
    plot.selectAll('*').remove()

    const histogram = d3.histogram()
        .value(function (d) { return d[label]; })
        .domain(xScale.domain())
    // .thresholds(xScale.ticks(20));

    const margin = { top: 10, right: 0, bottom: 40, left: 0 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    let g;
    if (rotate) {
        g = plot.append('g')
            .attr('transform', `translate(${-margin.top}, 0)rotate(90)`)
    }
    else {
        g = plot.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`)
    }

    const bins = histogram(data.filter(d => show[d['track_genre']]));

    xScale.nice();
    const yScale = d3.scaleLinear()
        .range([innerHeight, 0]);
    yScale.domain([0, d3.max(bins, d => d.length)]).nice();
    const xAxisG = g.append("g")
        .attr('transform', `translate(0, ${innerHeight})`)
        .call(d3.axisBottom(xScale));

    const yAxisG = g.append("g")
        .call(d3.axisLeft(yScale).ticks(3));
    if (rotate) {
        xAxisG.selectAll('text')
            .attr('text-anchor', 'end')
            .attr('transform', `translate(-12, 10)rotate(-90)`)
    }

    xAxisG.selectAll('line').style('stroke', 'black')
    yAxisG.selectAll('line').style('stroke', 'black')

    // append the bar rectangles to the svg element
    g.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) {
            if (rotate) {
                // return "translate(" + xScale(d.x1) + "," + yScale(d.length) + ")";
                return "translate(" + xScale(d.x1) + "," + yScale(d.length) + ")";
            }
            return "translate(" + xScale(d.x0) + "," + yScale(d.length) + ")";
        })
        .attr("width", function (d) {
            if (rotate) {
                return xScale(d.x0) - xScale(d.x1) - 1;
            }
            return xScale(d.x1) - xScale(d.x0) - 1;
        })
        .attr("height", function (d) { return innerHeight - yScale(d.length); })
        .style("fill", "#69b3a2")
}
