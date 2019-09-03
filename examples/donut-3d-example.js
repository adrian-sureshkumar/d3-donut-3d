const d3 = require("d3");
const { donutChart3d } = require("../lib");

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const data = Array(10).fill(null).map((_, i) => ({
    color: colorScale(i),
    name: String.fromCharCode("A".charCodeAt() + i),
    value: 1
}));

const chartRoot = d3.select("#chart-root");

const chart = donutChart3d()
    .data(data)
    .labelFormat((name, value, percentage) => `${name} (${percentage.toFixed(0)}%)`)
    .height(`100%`)
    .width(`100%`);

function render() {
    data.forEach(datum => datum.value = Math.random());
    chartRoot.call(chart);
}

render();
d3.interval(render, 3000);