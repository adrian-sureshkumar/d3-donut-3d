import * as d3 from "d3";
import { Selection, BaseType, RGBColor, HSLColor } from "d3";

import { FluentD3GetSet, makeFluentD3GetSet } from "./d3-utils/FluentD3GetSet";
import { RenderFn } from "./d3-utils/RenderFn";

export interface DonutChart3dDatum {
    color: string | RGBColor | HSLColor;
    name?: string;
    value: number;
}

export interface DonutChart3dLabelFormatter {
    (name: string, value: number, percentage: number): string;
}

export interface DonutChart3dRenderFn<GElement extends BaseType, PElement extends BaseType>
    extends RenderFn<GElement, unknown, PElement, unknown> {
    data: FluentD3GetSet<this, DonutChart3dDatum[]>;
    height: FluentD3GetSet<this, string | null>;
    labelFormat: FluentD3GetSet<this, DonutChart3dLabelFormatter | null>;
    transitionDuration: FluentD3GetSet<this, number>;
    width: FluentD3GetSet<this, string | null>;
}

const minorRadius = 0.5;
const majorRadius = 1;
const outerRadius = majorRadius + minorRadius;

const labelOffset = 1.5;

export function donutChart3d<GElement extends BaseType, PElement extends BaseType>(
): DonutChart3dRenderFn<GElement, PElement> {
    let data: DonutChart3dDatum[] = [];
    let height: string | null = null;
    let labelFormat: DonutChart3dLabelFormatter | null = null;
    let transitionDuration: number = d3.transition().duration();
    let width: string | null = null;

    const renderFn: DonutChart3dRenderFn<GElement, PElement> = 
        selection => renderX3d(selection, getChartSeries());

    renderFn.data = makeFluentD3GetSet(renderFn, () => data, value => data = value);
    renderFn.height = makeFluentD3GetSet(renderFn, () => height, value => height = value);
    renderFn.labelFormat = makeFluentD3GetSet(renderFn, () => labelFormat, value => labelFormat = value);
    renderFn.transitionDuration = makeFluentD3GetSet(renderFn, () => transitionDuration, value => transitionDuration = value);
    renderFn.width = makeFluentD3GetSet(renderFn, () => width, value => width = value);

    return renderFn;

    interface ChartSeries {
        color: RGBColor;
        label: string;
        sliceLength: number;
        sliceStart: number;
    }

    function getChartSeries(): ChartSeries[] {
        const chartSeries: ChartSeries[] = [];

        if (data.length) {
            const cumulativeValues = [0];
            data.forEach((datum, i) => cumulativeValues.push(cumulativeValues[i] + datum.value));

            const total = cumulativeValues[cumulativeValues.length - 1];

            const valueToAngleRatio = 2 * Math.PI / total;

            data.forEach((datum, i) => {
                const percentage = datum.value / total * 100;

                const sliceStart = cumulativeValues[i] * valueToAngleRatio;
                const sliceLength = datum.value * valueToAngleRatio;

                const color = typeof datum.color === "string"
                    ? d3.rgb(datum.color)
                    : datum.color.rgb();

                const label = labelFormat
                    ? labelFormat(datum.name || "", datum.value, percentage)
                    : "";

                chartSeries.push({ sliceStart, sliceLength, color, label });
            });
        }

        return chartSeries;
    }

    function renderX3d<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, unknown, PElement, unknown>,
        chartSeries: ChartSeries[]
    ): void {
        s.selectAll("x3d")
        .data([chartSeries])
        .join("x3d")
          .style("height", () => height)
          .style("width", () => width)
          .call(renderScene);
    }

    function renderScene<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries[], PElement, unknown>
    ): void {
        s.selectAll("scene")
        .data(d => [d])
        .join("scene")
          .call(renderChart);
    }

    function renderChart<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries[], PElement, ChartSeries[]>
    ): void {
        s.selectAll("group.chart")
        .data(d => [d])
        .join("group")
          .attr("class", "chart")
          .call(renderChartSeries);
    }

    function renderChartSeries<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries[], PElement, ChartSeries[]>
    ): void {
        s.selectAll("transform.chart-series")
        .data(d => d)
        .join("transform")
          .attr("class", "chart-series")
          .call(s => s
            .transition()
              .duration(transitionDuration)
              .attr("rotation", d => `0 0 1 ${(Math.PI / 2) - d.sliceStart}`)
          )
          .call(renderChartSeriesSlices)
          .call(renderChartSeriesLabels);
    }

    function renderChartSeriesSlices<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries, PElement, ChartSeries[]>
    ): void {
        s.selectAll("shape.chart-series-slice")
        .data(d => [d])
        .join("shape")
          .attr("class", "chart-series-slice")
          .call(s => s
            .selectAll("torus")
            .data(d => [d])
            .join("torus")
              .attr("innerRadius", minorRadius) // Note: In X3DOM this actually defines the minor radius.
              .attr("outerRadius", majorRadius) // Note: In X3DOM this actually defines the major radius.
              .attr("useGeoCache", false)
            .transition()
              .duration(transitionDuration)
              .attr("angle", d => `${d.sliceLength}`)
          )
          .call(s => s
            .selectAll("appearance")
            .data(d => [d])
            .join("appearance")
            .selectAll("material")
            .data(d => [d])
            .join("material")
              .attr("diffuseColor", d => `${d.color.r / 255} ${d.color.g / 255} ${d.color.b / 255}`)
              .attr("transparency", d => `${1 - d.color.opacity}`)
          );
    }

    function renderChartSeriesLabels<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries, PElement, ChartSeries[]>
    ): void {
        s.selectAll("transform.chart-series-label")
        .data(d => d.label ? [d] : [])
        .join("transform")
          .attr("class", "chart-series-label")
          .call(s => s
            .transition()
              .duration(transitionDuration)
              .attr("rotation", d => `0 0 1 ${-d.sliceLength / 2}`)
          )
        .call(renderChartSeriesLabelLines)
        .call(renderChartSeriesLabelText);
    }

    function renderChartSeriesLabelLines<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries, PElement, ChartSeries>
    ): void {
        s.selectAll("shape.chart-series-label-line")
        .data(d => [d])
        .join("shape")
          .attr("class", "chart-series-label-line")
          .call(s => s
            .selectAll("lineset")
            .data(d => [d])
            .join("lineset")
              .attr("vertexCount", "2")
            .selectAll("coordinate")
            .data(d => [d])
            .join("coordinate")
              .attr("point", `${ outerRadius } 0 0 ${ outerRadius + labelOffset } 0 0`)
          )
          .call(s => s
            .selectAll("appearance")
            .data(d => [d])
            .join("appearance")
            .selectAll("material")
            .data(d => [d])
            .join("material")
              .attr("emissiveColor", "0.75 0.75 0.75")
          );
    }

    function renderChartSeriesLabelText<GElement extends BaseType, PElement extends BaseType>(
        s: Selection<GElement, ChartSeries, PElement, ChartSeries>
    ): void {
        s.selectAll("transform.chart-series-label-text")
        .data(d => [d])
        .join("transform")
          .attr("class", "chart-series-label-text")
          .attr("translation", `${outerRadius + labelOffset} 0 0`)
          .call(s => s
            .transition()
              .duration(transitionDuration)
              .attr("rotation", d => `0 0 1 ${-(Math.PI / 2) + d.sliceStart + d.sliceLength / 2}`)
          )
        .selectAll("shape")
        .data(d => [d])
        .join("shape")
          .call(s => s
            .selectAll("text")
            .data(d => [d])
            .join("text")
              .attr("string", d => d.label)
              .attr("solid", false)
            .selectAll("fontstyle")
            .data(d => [d])
            .join("fontstyle")
              .attr("family", "sans-serif")
              .attr("justify", '"middle" "middle"')
              .attr("size", "0.25")
          )
          .call(s => s
            .selectAll("appearance")
            .data(d => [d])
            .join("appearance")
            .selectAll("material")
            .data(d => [d])
            .join("material")
              .attr("diffuseColor", "0 0 0")
          );
    }
}
