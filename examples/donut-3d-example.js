const d3 = require("d3");
const { donutChart3d } = require("../lib");

const chart = donutChart3d()
    .data([{
        color: "#FF0000",
        value: 45
    }, {
        color: "#00FF00",
        value: 90
    }, {
        color: "#0000FF",
        value: 135
    }, {
        color: "#FFFF00",
        value: 60
    }, {
        color: "#FF00FF",
        value: 30
    }])
    .height("600px")
    .width("800px");

d3.select("#chart-root").call(chart);