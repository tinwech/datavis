import { pageWidth, scatterColor, show } from "./utils.js";
import { render as drawHistogram } from "./histogram.js";
import { classes, scatterProp } from "./utils.js";

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

const scatter = d3.selectAll('svg');
scatter.on('mousemove', function (d) {
    tooltip
        .style("left", (d3.mouse(scatter.node())[0] + 80) + "px")
        .style("top", (d3.mouse(scatter.node())[1] - 1050) + "px")
})

export const render = (plot, dataAll, type, xAxisLabel, yAxisLabel, width, height, density = false, small = false) => {
    plot.selectAll("*").remove();

    let margin = { top: 60, right: 80, bottom: 120, left: 200 };
    let circleRadius = 5;

    let data;
    if (small) {
        margin = { top: 0, right: 0, bottom: 0, left: 0 };
        data = dataAll.sort(() => 0.5 - Math.random()).slice(0, 1000);
        circleRadius = 1;
    }
    else {
        data = dataAll;
    }
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xValue = (d) => d[xAxisLabel];
    const yValue = (d) => d[yAxisLabel];

    const clip_id = Math.random();
    plot.append("defs").append("clipPath")
        .attr("id", "clip-" + clip_id)
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)

    const g = plot.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('rect')
        .attr('id', xAxisLabel + '-' + yAxisLabel)
        .attr('class', 'background corr-rect')
        .attr('width', innerWidth)
        .attr('height', innerHeight)
        .attr("rx", 4)
        .attr("ry", 4)
        .style("stroke-width", 4)
        .style("stroke", "none")
        .on('mouseover', function (d) {
            d3.selectAll(`#${xAxisLabel}-${yAxisLabel}`).style('stroke', 'black')
        })
        .on('mouseleave', function (d) {
            d3.selectAll(`#${xAxisLabel}-${yAxisLabel}`).style('stroke', 'none')
        })
        .on('click', function (d) {
            if (small) {
                const scatter = d3.select('#scatter');
                scatter.call(render, dataAll, type, xAxisLabel, yAxisLabel, pageWidth(), 500);
                scatterProp['click'] = true;
                scatterProp['xAxisLabel'] = xAxisLabel;
                scatterProp['yAxisLabel'] = yAxisLabel;
                scatterProp['density'] = false;
            }
        })



    // x axis
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, xValue))
        .range([0, innerWidth])
        .nice();

    const xAxis = d3.axisBottom(xScale)
        .tickSize(-innerHeight)
        .tickPadding(15);

    const xAxisG = g.append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
    xAxisG.selectAll('.domain').remove();

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


    const xHisto = g.append('g')
        .attr('transform', `translate(0, ${innerHeight})`)
    const yHisto = g.append('g')

    if (!small) {
        xHisto.call(drawHistogram, data, xAxisLabel, xScale, innerWidth, 100);
        yHisto.call(drawHistogram, data, yAxisLabel, yScale, innerHeight, 100, true);
        xAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', 100)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);
        yAxisG.append('text')
            .attr('class', 'axis-label')
            .attr('y', -130)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabel);
    }
    else {
        yAxisG.selectAll('.tick').remove();
        xAxisG.selectAll('.tick').remove();
    }
    xAxisG.selectAll('.tick text').remove();
    yAxisG.selectAll('.tick text').remove();

    if (!density) {
        // data points
        const circles = g.selectAll('circle').data(data)
            .enter().append('circle')
            .filter(d => show[d[type]])
            .attr('cy', d => yScale(yValue(d)))
            .attr('cx', d => xScale(xValue(d)))
            .attr('r', circleRadius)
            .attr('fill', d => scatterColor(d[type]))
            .attr('opacity', 0.5)
            .attr('clip-path', `url(#clip-${clip_id})`)

        if (!small) {
            circles.on('mouseover', function (d) {
                d3.select(this).style('opacity', 1);
                tooltip.style('opacity', 1)
                tooltip.html(`artists: ${d.artists}<br>
                track genre: ${d.track_genre}<br>
                track name: ${d.track_name}<br>
                ${xAxisLabel}: ${xValue(d)}<br>
                ${yAxisLabel}: ${yValue(d)}`)
            }).on('mouseleave', function (d) {
                d3.select(this).style('opacity', 0.5);
                tooltip.style('opacity', 0)
            })

            const brush = d3.brush()
                .extent([[0, 0], [innerWidth, innerHeight]])
                .on('end', end)
            g.call(brush)
            g.selectAll("circle").raise();
            var idleTimeout
            function idled() { idleTimeout = null; }
            function end() {
                const extent = d3.event.selection
                let selected = [];

                // If no selection, back to initial coordinate. Otherwise, update X axis domain
                if (!extent) {
                    if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
                    xScale.domain(d3.extent(data, xValue));
                    yScale.domain(d3.extent(data, yValue));
                    selected = data;
                } else {
                    function isBrushed(brush_coords, cx, cy) {
                        var x0 = brush_coords[0][0],
                            x1 = brush_coords[1][0],
                            y0 = brush_coords[0][1],
                            y1 = brush_coords[1][1];
                        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
                    }
                    data.forEach(d => {
                        if (isBrushed(extent, xScale(xValue(d)), yScale(yValue(d)))) {
                            selected.push(d);
                        }
                    });
                    xScale.domain([xScale.invert(extent[0][0]), xScale.invert(extent[1][0])]);
                    yScale.domain([yScale.invert(extent[1][1]), yScale.invert(extent[0][1])]);
                    g.call(brush.move, null)
                }

                // Update axis and circle position
                xAxisG.transition().duration(1000)
                    .call(d3.axisBottom(xScale)
                        .tickSize(-innerHeight)
                        .tickPadding(15));
                xAxisG.selectAll('.tick text').remove();
                yAxisG.transition().duration(1000)
                    .call(d3.axisLeft(yScale)
                        .tickSize(-innerWidth)
                        .tickPadding(10));
                yAxisG.selectAll('.tick text').remove();
                g.selectAll("circle")
                    .transition().duration(1000)
                    .attr("cx", function (d) { return xScale(xValue(d)); })
                    .attr("cy", function (d) { return yScale(yValue(d)); })

                xHisto.call(drawHistogram, selected, xAxisLabel, xScale, innerWidth, 100);
                yHisto.call(drawHistogram, selected, yAxisLabel, yScale, innerHeight, 100, true);
            }
        }
    }
    else {
        // color palette for density
        const densityColor = d3.scaleSequential()
            .interpolator(d3.interpolateOranges)
            .domain([0, 1]);

        // compute the density data
        const densityData = d3.contourDensity()
            .x(function (d) { return xScale(xValue(d)); })
            .y(function (d) { return yScale(yValue(d)); })
            .size([innerWidth, innerHeight])
            .bandwidth(25)
            (data)

        // show the shape!
        g.insert("g", "g")
            .selectAll("path")
            .data(densityData)
            .enter().append("path")
            .attr("d", d3.geoPath())
            .attr("fill", function (d) { return densityColor(d.value); })
            .attr('clip-path', `url(#clip-${clip_id})`)
    }
};
