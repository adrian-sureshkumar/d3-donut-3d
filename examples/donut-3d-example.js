const d3 = require("d3");
const { donutChart3d } = require("../lib");

const chart = donutChart3d()
    .height("600px")
    .width("800px");

d3.select("#chart-root").call(chart);