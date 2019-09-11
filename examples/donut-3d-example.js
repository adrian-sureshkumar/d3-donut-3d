const { scaleOrdinal } = require("d3-scale");
const { schemeCategory10 } = require("d3-scale-chromatic");
const { select } = require("d3-selection");
const { interval } = require("d3-timer");

const { donutChart3d } = require("../lib");

const colorScale = scaleOrdinal(schemeCategory10);

const data = Array(26).fill(null).map((_, i) => ({
    color: colorScale(i),
    name: String.fromCharCode("A".charCodeAt() + i),
    value: 1
}));

const chartRoot = select("#chart-root");

const chart = donutChart3d()
    .data(data)
    .labelFormat((name, _value, percentage) => `${name} (${percentage.toFixed(0)}%)`)
    .transitionDuration(500)
    .height("100%")
    .width("100%");

function render() {
    data.forEach(datum => datum.value = Math.random());
    chartRoot.call(chart);
}

render();
interval(render, 3000);