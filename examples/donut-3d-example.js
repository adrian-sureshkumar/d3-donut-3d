const d3 = require("d3");
const faker = require("faker");
const { donutChart3d } = require("../lib");

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const data = Array(10).fill(null).map((_, i) => ({
    color: colorScale(i),
    name: faker.commerce.product(),
    value: 1
}));

const chart = donutChart3d()
    .data(data)
    .labelFormat((name, value, percentage) => `${name} (${percentage.toFixed(0)}%)`)
    .height("600px")
    .width("800px");

function render() {
    data.forEach(datum => datum.value = Math.random());
    d3.select("#chart-root").call(chart);
}

render();
d3.interval(render, 2000);