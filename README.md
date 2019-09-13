# d3-donut-3d
Library for rendering 3D donut charts with [D3](https://d3js.org/) using [X3DOM](www.x3dom.org).

## Getting Started

Install with npm: `npm install @adrian-sureshkumar/d3-donut-3d`

Include [X3DOM](www.x3dom.org) in the head of your HTML:

```
<script src="http://www.x3dom.org/release/x3dom.js"></script>
<link rel="stylesheet" href="http://www.x3dom.org/release/x3dom.css">
```

Include `donutChart3d` in your JavaScript code:

```
// CommonJS module syntax
const { donutChart3d } = require("@adrian-sureshkumar/d3-donut-3d");

// ES module syntax
import { donutChart3d } from "@adrian-sureshkumar/d3-donut-3d";
```

Configure chart using `donutChart3d`:

```
const chart = donutChart3d();

// Series data
const data = [{
    color: "red",
    name: "Red Series",
    value: 1
}, {
    color: "rgb(0, 255, 0)",
    name: "Green Series",
    value: 2
}, {
    color: d3.rgb(0, 0, 255),
    name: "Blue Series",
    value: 3
}];

chart.data(data);

// Label format
// - Defaults to showing no labels when not specified.
// - Return an empty string to hide label for a particular series.
function labelFormat(name, value, percentage) {
    // e.g. Red Series: 1 (16.7%)
    return `${name}: ${value} (${percentage.toFixed(1)}%)`
}

chart.labelFormat(labelFormat);

// Duration of transition animations when data is updated
// - Defaults to the D3 transition default when not specified.
// - Can be set to 0 to disable animation.
chart.transitionDuration(500)

// Height and width
chart.height("100%")
chart.width("100%");
```

Apply chart to a selection:

```
selection.call(chart);
```

## Building Examples

Clone the git repository:

~~~
git clone https://github.com/adrian-sureshkumar/d3-donut-3d.git
~~~

Install dependencies:

~~~
npm install
~~~

Build the code:

~~~
npm run build
~~~

Create JavaScript bundles for the examples:

~~~
npm run bundle:examples
~~~