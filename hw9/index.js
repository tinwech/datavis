import { render as drawCorr } from "./correlation.js"
import { render as drawScatter } from "./scatter.js";
import { pageWidth, classes, show, scatterProp, scatterColor } from "./utils.js";

let data = [];
let columns = ['popularity', 'duration_ms', 'danceability', 'energy', 'key', 'loudness', 'speechiness', 'acousticness', 'instrumentalness', 'liveness', 'valence', 'tempo', 'time_signature', 'mode', 'explicit']
let group = 'track_genre';
classes.forEach(d => show[d] = true)

const render = () => {
  const corr = d3.select('#corr');
  console.log(group)
  corr.call(drawCorr, data, group, columns, pageWidth(), 500);
  d3.select('.sbl-circ').style('display', 'none');
};

// load data
d3.csv('https://tinwech.github.io/datavis/data/spotify_tracks.csv', function (error, csv) {
  csv = csv.filter(d => {
    columns.forEach(c => {
      if (!isNaN(+d[c])) {
        d[c] = +d[c];
      }
    })
    if (d['explicit'] == "True") {
      d['explicit'] = 1;
    }
    else {
      d['explicit'] = 0;
    }
    return d;
  })
  // csv = csv.sort(() => 0.5 - Math.random()).slice(0, 1000);
  data = csv;
  console.log(data);
  generateCheckboxes();
  render();
})

window.onresize = () => { render() }

function generateCheckboxes() {
  let htmlStr = `<div class="form-check">
                <input class="form-check-input" type="checkbox" id="check-all-classes" checked>
                <label class="form-check-label" for="check-all-classes">
                  Select all
                </label>
              </div>`
  for (let i = 0; i < classes.length; i++) {
    htmlStr += `<div class="form-check">
                <input class="form-check-input classes-checkbox" type="checkbox" 
                  value="${classes[i]}" id="check-${classes[i]}" checked 
                  onchange="updateCheckbox(value)" style="background-color: ${scatterColor(classes[i])};">
                <label class="form-check-label" for="check-${classes[i]}">
                  ${classes[i]}
                </label>
              </div>`
  }
  document.getElementById('class-list').innerHTML = htmlStr;
  $('#check-all-classes').click(function () {
    const status = $(this).prop('checked');
    $(".form-check-input.classes-checkbox").prop('checked', status);
    classes.forEach(s => show[s] = status);
    const scatter = d3.select('#scatter');
    if (scatterProp['click'] == true) {
      scatter.call(drawScatter,
        data,
        group,
        scatterProp['xAxisLabel'],
        scatterProp['yAxisLabel'],
        pageWidth(),
        500,
        scatterProp['density']);
    }
    render();
  })
}

function updateCheckbox(key) {
  console.log(key);
  show[key] = !show[key];
  if (scatterProp['click'] == true) {
    const scatter = d3.select('#scatter');
    scatter.call(drawScatter,
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

window.updateCheckbox = updateCheckbox
