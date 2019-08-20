const d3 = require("d3");
const { donutChart3d } = require("../lib");

const chart = donutChart3d()
    .data([
        { value: 45 },
        { value: 90 },
        { value: 180 },
        { value: 135 }
    ])
    .height("600px")
    .width("800px");

d3.select("#chart-root").call(chart);