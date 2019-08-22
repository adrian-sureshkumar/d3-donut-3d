const d3 = require("d3");
const { donutChart3d } = require("../lib");

const data = [{
    color: "#FF0000",
    name: "Red",
    value: 1
}, {
    color: "#00FF00",
    name: "Green",
    value: 1
}, {
    color: "#0000FF",
    name: "Blue",
    value: 1
}, {
    color: "#FF00FF",
    name: "Magenta",
    value: 1
}, {
    color: "#FFFF00",
    name: "Yellow",
    value: 1
}, {
    color: "#00FFFF",
    name: "Cyan",
    value: 1
}];

const chart = donutChart3d()
    .data(data)
    .labelFormat((name, value, percentage) => `${name} - ${percentage.toFixed(0)}%`)
    .height("600px")
    .width("800px");

function render() {
    data.forEach(datum => datum.value = Math.random());
    d3.select("#chart-root").call(chart);
}

render();
d3.interval(render, 2000);