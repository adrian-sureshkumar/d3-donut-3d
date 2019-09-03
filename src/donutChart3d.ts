import { Selection, BaseType, rgb, RGBColor, HSLColor } from "d3";

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

export interface DonutChart3dRenderFn<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>
    extends RenderFn<GElement, Datum, PElement, PDatum> {
    data: FluentD3GetSet<this, DonutChart3dDatum[]>;
    height: FluentD3GetSet<this, string | null>;
    labelFormat: FluentD3GetSet<this, DonutChart3dLabelFormatter | null>;
    width: FluentD3GetSet<this, string | null>;
}

export function donutChart3d<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
): DonutChart3dRenderFn<GElement, Datum, PElement, PDatum> {
    let data: DonutChart3dDatum[] = [];
    let height: string | null = null;
    let labelFormat: DonutChart3dLabelFormatter | null = null;
    let width: string | null = null;

    const renderFn: DonutChart3dRenderFn<GElement, Datum, PElement, PDatum> = (s) => {
        const chartSegments = getChartSegments(data, labelFormat);
        renderX3d(s, chartSegments, height, width);
    }

    renderFn.data = makeFluentD3GetSet(renderFn, () => data, value => data = value);
    renderFn.height = makeFluentD3GetSet(renderFn, () => height, value => height = value);
    renderFn.labelFormat = makeFluentD3GetSet(renderFn, () => labelFormat, value => labelFormat = value);
    renderFn.width = makeFluentD3GetSet(renderFn, () => width, value => width = value);

    return renderFn;
}

interface ChartSegment {
    color: RGBColor;
    label: string;
    length: number;
    start: number;
}

function getChartSegments(data: DonutChart3dDatum[], labelFormat: DonutChart3dLabelFormatter | null): ChartSegment[] {
    const chartSegments: ChartSegment[] = [];

    if (data.length) {
        const cumulativeValues = [0];
        data.forEach((datum, i) => cumulativeValues.push(cumulativeValues[i] + datum.value));

        const total = cumulativeValues[cumulativeValues.length - 1];

        const valueToAngleRatio = 2 * Math.PI / total;

        data.forEach((datum, i) => {
            const percentage = datum.value / total * 100;

            const start = cumulativeValues[i] * valueToAngleRatio;
            const length = datum.value * valueToAngleRatio;

            const color = typeof datum.color === "string"
                ? rgb(datum.color)
                : datum.color.rgb();

            const label = labelFormat
                ? labelFormat(datum.name || "", datum.value, percentage)
                : "";

            chartSegments.push({ start, length, color, label });
        });
    }

    return chartSegments;
}

function renderX3d<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
    s: Selection<GElement, Datum, PElement, PDatum>,
    chartSegments: ChartSegment[],
    height: string | null,
    width: string | null
): void {
    s.selectAll("x3d")
    .data([chartSegments])
    .join("x3d")
      .style("height", () => height)
      .style("width", () => width)
    .call(renderScene);
}

function renderScene<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, ChartSegment[], PElement, PDatum>
): void {
    s.selectAll("scene")
    .data(d => [d])
    .join("scene")
    .call(renderChart);
}

function renderChart<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, ChartSegment[], PElement, PDatum>
): void {
    s.selectAll("group.chart")
    .data(d => [d])
    .join("group")
      .attr("class", "chart")
    .call(renderChartSegments);
}

function renderChartSegments<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, ChartSegment[], PElement, PDatum>
): void {
    s.selectAll("transform.chart-segment")
    .data(d => d)
    .join("transform")
      .attr("class", "chart-segment")
    .call(s =>
        s.transition()
          .attr("rotation", d => `0 0 1 ${(Math.PI / 2) - d.start}`)
    )
    .call(s =>
        s.selectAll("shape.chart-segment-torus")
        .data(d => [d])
        .join("shape")
          .attr("class", "chart-segment-torus")
        .call(s =>
            s.selectAll("torus")
            .data(d => [d])
            .join("torus")
              .attr("useGeoCache", false)
            .transition()
              .attr("angle", d => `${d.length}`)
        )
        .call(s =>
            s.selectAll("appearance")
            .data(d => [d])
            .join("appearance")
            .call(s =>
                s.selectAll("material")
                .data(d => [d])
                .join("material")
                  .attr("diffuseColor", d => `${d.color.r / 255} ${d.color.g / 255} ${d.color.b / 255}`)
                  .attr("transparency", d => `${1 - d.color.opacity}`)
            )
        )
    )
    .call(renderChartSegmentLabels);
}

function renderChartSegmentLabels<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, ChartSegment, PElement, PDatum>
): void {
    const labelOffset = 2.5;
    s.selectAll("transform.chart-segment-label")
    .data(d => d.label ? [d] : [])
    .join("transform")
      .attr("class", "chart-segment-label")
      .attr("translation", `${labelOffset} 0 0`)
      .attr("center", `${-labelOffset} 0 0`)
      .attr("rotation", d => `0 0 1 ${-d.length / 2}`)
    .call(s =>
        s.selectAll("shape.chart-segment-label-line")
        .data(d => [d])
        .join("shape")
          .attr("class", "chart-segment-label-line")
        .call(s =>
            s.selectAll("lineset")
            .data(d => [d])
            .join("lineset")
              .attr("vertexCount", "2")
            .call(s =>
                s.selectAll("coordinate")
                .data(d => [d])
                .join("coordinate")
                  .attr("point", "-0.1 0 0 -1 0 0")
            )
        )
    )
    .call(s =>
        s.selectAll("shape.chart-segment-label-text")
        .data(d => [d])
        .join("shape")
          .attr("class", "chart-segment-label-text")
        .call(s =>
            s.selectAll("appearance")
            .data(d => [d])
            .join("appearance")
            .call(s =>
                s.selectAll("material")
                .data(d => [d])
                .join("material")
                  .attr("diffuseColor", "0 0 0")
            )
        )
        .call(s =>
            s.selectAll("text")
            .data(d => [d])
            .join("text")
              .attr("string", d => d.label)
              .attr("solid", false)
            .call(s =>
                s.selectAll("fontstyle")
                .data(d => [d])
                .join("fontstyle")
                  .attr("family", "sans-serif")
                  .attr("justify", '"begin" "middle"')
                  .attr("size", "0.25")
            )
        )
    )
}
