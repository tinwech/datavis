export const getUnique = (value, index, array) => {
    return array.indexOf(value) === index;
}

export const pcorr = (x, y) => {
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
        }
    x.forEach(reduce);
    return (minLength * sumXY - sumX * sumY) / Math.sqrt((minLength * sumX2 - sumX * sumX) * (minLength * sumY2 - sumY * sumY));
};

export const pageWidth = () => {
    const plot = d3.select('#plot').node();
    return plot.getBoundingClientRect().width;
}

export const show = {}

export const classes = [
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
]

export const scatterProp = {};

export const scatterColor = d3.scaleOrdinal()
    .domain(classes)
    .range(d3.schemeCategory20)
