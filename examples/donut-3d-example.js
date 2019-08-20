const d3 = require("d3");
const { donutChart3d } = require("../lib");

const chart = donutChart3d();

d3.select("#chart-root").call(chart);