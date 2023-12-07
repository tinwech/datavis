(function () {
    'use strict';

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
            };
        x.forEach(reduce);
        return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
    };

    const pageWidth = () => {
        const plot = d3.select('#plot').node();
        return plot.getBoundingClientRect().width;
    };

    const show = {};

    const classes = [
        "acoustic",
        "afrobeat",
        "alt-rock",
        "alternative",
        "ambient",
        "anime",
        "black-metal",
        "bluegrass",
        "blues",
        "brazil",
        "breakbeat",
        "british",
        "cantopop",
        "chicago-house",
        "children",
        "chill",
        "classical",
        "club",
        "comedy",
        "country",
        "dance",
        "dancehall",
        "death-metal",
        "deep-house",
        "detroit-techno",
        "disco",
        "disney",
        "drum-and-bass",
        "dub",
        "dubstep",
        "edm",
        "electro",
        "electronic",
        "emo",
        "folk",
        "forro",
        "french",
        "funk",
        "garage",
        "german",
        "gospel",
        "goth",
        "grindcore",
        "groove",
        "grunge",
        "guitar",
        "happy",
        "hard-rock",
        "hardcore",
        "hardstyle",
        "heavy-metal",
        "hip-hop",
        "honky-tonk",
        "house",
        "idm",
        "indian",
        "indie-pop",
        "indie",
        "industrial",
        "iranian",
        "j-dance",
        "j-idol",
        "j-pop",
        "j-rock",
        "jazz",
        "k-pop",
        "kids",
        "latin",
        "latino",
        "malay",
        "mandopop",
        "metal",
        "metalcore",
        "minimal-techno",
        "mpb",
        "new-age",
        "opera",
        "pagode",
        "party",
        "piano",
        "pop-film",
        "pop",
        "power-pop",
        "progressive-house",
        "psych-rock",
        "punk-rock",
        "punk",
        "r-n-b",
        "reggae",
        "reggaeton",
        "rock-n-roll",
        "rock",
        "rockabilly",
        "romance",
        "sad",
        "salsa",
        "samba",
        "sertanejo",
        "show-tunes",
        "singer-songwriter",
        "ska",
        "sleep",
        "songwriter",
        "soul",
        "spanish",
        "study",
        "swedish",
        "synth-pop",
        "tango",
        "techno",
        "trance",
        "trip-hop",
        "turkish",
        "world-music"
    ];

    const scatterProp = {};

    const scatterColor = d3.scaleOrdinal()
        .domain(classes)
        .range(d3.schemeCategory20);

    const render$3 = (plot, data, label, xScale, width, height, rotate = false) => {
        plot.selectAll('*').remove();

        const histogram = d3.histogram()
            .value(function (d) { return d[label]; })
            .domain(xScale.domain());
        // .thresholds(xScale.ticks(20));

        const margin = { top: 10, right: 0, bottom: 40, left: 0 };
        const innerHeight = height - margin.top - margin.bottom;

        let g;
        if (rotate) {
            g = plot.append('g')
                .attr('transform', `translate(${-margin.top}, 0)rotate(90)`);
        }
        else {
            g = plot.append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);
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
                .attr('transform', `translate(-12, 10)rotate(-90)`);
        }

        xAxisG.selectAll('line').style('stroke', 'black');
        yAxisG.selectAll('line').style('stroke', 'black');

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
            .style("fill", "#69b3a2");
    };

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
            .style("top", (d3.mouse(scatter.node())[1] - 1050) + "px");
    });

    const render$2 = (plot, dataAll, type, xAxisLabel, yAxisLabel, width, height, density = false, small = false) => {
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
            .attr("height", innerHeight);

        const g = plot.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

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
                d3.selectAll(`#${xAxisLabel}-${yAxisLabel}`).style('stroke', 'black');
            })
            .on('mouseleave', function (d) {
                d3.selectAll(`#${xAxisLabel}-${yAxisLabel}`).style('stroke', 'none');
            })
            .on('click', function (d) {
                if (small) {
                    const scatter = d3.select('#scatter');
                    scatter.call(render$2, dataAll, type, xAxisLabel, yAxisLabel, pageWidth(), 500);
                    scatterProp['click'] = true;
                    scatterProp['xAxisLabel'] = xAxisLabel;
                    scatterProp['yAxisLabel'] = yAxisLabel;
                    scatterProp['density'] = false;
                }
            });



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
            .call(xAxis);
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
            .attr('transform', `translate(0, ${innerHeight})`);
        const yHisto = g.append('g');

        if (!small) {
            xHisto.call(render$3, data, xAxisLabel, xScale, innerWidth, 100);
            yHisto.call(render$3, data, yAxisLabel, yScale, innerHeight, 100, true);
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
                .attr('clip-path', `url(#clip-${clip_id})`);

            if (!small) {
                circles.on('mouseover', function (d) {
                    d3.select(this).style('opacity', 1);
                    tooltip.style('opacity', 1);
                    tooltip.html(`artists: ${d.artists}<br>
                track genre: ${d.track_genre}<br>
                track name: ${d.track_name}<br>
                ${xAxisLabel}: ${xValue(d)}<br>
                ${yAxisLabel}: ${yValue(d)}`);
                }).on('mouseleave', function (d) {
                    d3.select(this).style('opacity', 0.5);
                    tooltip.style('opacity', 0);
                });

                const brush = d3.brush()
                    .extent([[0, 0], [innerWidth, innerHeight]])
                    .on('end', end);
                g.call(brush);
                g.selectAll("circle").raise();
                var idleTimeout;
                function idled() { idleTimeout = null; }
                function end() {
                    const extent = d3.event.selection;
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
                        g.call(brush.move, null);
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
                        .attr("cy", function (d) { return yScale(yValue(d)); });

                    xHisto.call(render$3, selected, xAxisLabel, xScale, innerWidth, 100);
                    yHisto.call(render$3, selected, yAxisLabel, yScale, innerHeight, 100, true);
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
                (data);

            // show the shape!
            g.insert("g", "g")
                .selectAll("path")
                .data(densityData)
                .enter().append("path")
                .attr("d", d3.geoPath())
                .attr("fill", function (d) { return densityColor(d.value); })
                .attr('clip-path', `url(#clip-${clip_id})`);
        }
    };

    const color = d3.scaleSequential()
        // .interpolator(d3.interpolateYlOrRd)
        .interpolator(d3.interpolateRdBu)
        .domain([1, -1]);


    const render$1 = (plot, data, type, columns, width, height) => {
        plot.selectAll("*").remove();

        const margin = { top: 50, right: 50, bottom: 10, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const corr = [];
        for (let i = 0; i < columns.length; i++) {
            for (let j = 0; j < columns.length; j++) {
                const selected = data.filter(d => show[d[type]]);
                corr.push({
                    x: columns[j],
                    y: columns[i],
                    value: pcorr(selected.map(d => d[columns[i]]), selected.map(d => d[columns[j]]))
                });
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
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xAxisG = g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).tickSize(0));
        xAxisG.select('.domain').remove();
        xAxisG.selectAll("text").remove();

        const yAxisG = g.append('g')
            .call(d3.axisLeft(yScale).tickSize(0));
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
                d3.selectAll(`#${d.x}-${d.y}`).style('stroke', 'black');
                d3.selectAll(`#${d.x}-${d.x}`).style('stroke', 'black');
                d3.selectAll(`#${d.y}-${d.y}`).style('stroke', 'black');
            })
            .on('mouseleave', function (d) {
                d3.selectAll(`#${d.x}-${d.y}`).style('stroke', 'none');
                d3.selectAll(`#${d.x}-${d.x}`).style('stroke', 'none');
                d3.selectAll(`#${d.y}-${d.y}`).style('stroke', 'none');
            })
            .on('click', function (d) {
                const scatter = d3.select('#scatter');
                scatter.call(render$2, data, type, d.x, d.y, width, 500, true);
                scatterProp['click'] = true;
                scatterProp['xAxisLabel'] = d.x;
                scatterProp['yAxisLabel'] = d.y;
                scatterProp['density'] = true;
            });

        for (let i = 0; i < columns.length; i++) {
            for (let j = i + 1; j < columns.length; j++) {
                const sub = g.append('g')
                    .attr('transform', `translate(${xScale(columns[j])}, ${yScale(columns[i])})`);
                sub.call(render$2, data, type, columns[i], columns[j], xScale.bandwidth(), yScale.bandwidth(), false, true);
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

    let data = [];
    let columns = ['popularity', 'duration_ms', 'danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'mode', 'explicit'];
    let group = 'track_genre';
    classes.forEach(d => show[d] = true);

    const render = () => {
      const corr = d3.select('#corr');
      console.log(group);
      corr.call(render$1, data, group, columns, pageWidth(), 500);
      d3.select('.sbl-circ').style('display', 'none');
    };

    // load data
    d3.csv('http://vis.lab.djosix.com:2023/data/spotify_tracks.csv', function (error, csv) {
      csv = csv.filter(d => {
        columns.forEach(c => {
          if (!isNaN(+d[c])) {
            d[c] = +d[c];
          }
        });
        if (d['explicit'] == "True") {
          d['explicit'] = 1;
        }
        else {
          d['explicit'] = 0;
        }
        return d;
      });
      // csv = csv.sort(() => 0.5 - Math.random()).slice(0, 1000);
      data = csv;
      console.log(data);
      generateCheckboxes();
      render();
    });

    window.onresize = () => { render(); };

    function generateCheckboxes() {
      let htmlStr = `<div class="form-check">
                <input class="form-check-input" type="checkbox" id="check-all-classes" checked>
                <label class="form-check-label" for="check-all-classes">
                  Select all
                </label>
              </div>`;
      for (let i = 0; i < classes.length; i++) {
        htmlStr += `<div class="form-check">
                <input class="form-check-input classes-checkbox" type="checkbox" 
                  value="${classes[i]}" id="check-${classes[i]}" checked 
                  onchange="updateCheckbox(value)" style="background-color: ${scatterColor(classes[i])};">
                <label class="form-check-label" for="check-${classes[i]}">
                  ${classes[i]}
                </label>
              </div>`;
      }
      document.getElementById('class-list').innerHTML = htmlStr;
      $('#check-all-classes').click(function () {
        const status = $(this).prop('checked');
        $(".form-check-input.classes-checkbox").prop('checked', status);
        classes.forEach(s => show[s] = status);
        const scatter = d3.select('#scatter');
        if (scatterProp['click'] == true) {
          scatter.call(render$2,
            data,
            group,
            scatterProp['xAxisLabel'],
            scatterProp['yAxisLabel'],
            pageWidth(),
            500,
            scatterProp['density']);
        }
        render();
      });
    }

    function updateCheckbox(key) {
      console.log(key);
      show[key] = !show[key];
      if (scatterProp['click'] == true) {
        const scatter = d3.select('#scatter');
        scatter.call(render$2,
          data,
          group,
          scatterProp['xAxisLabel'],
          scatterProp['yAxisLabel'],
          pageWidth(),
          500,
          scatterProp['density']);
      }
      render();
    }

    window.updateCheckbox = updateCheckbox;

})();
