import { Selection, BaseType, rgb, RGBColor, HSLColor } from "d3";

import { FluentD3GetSet, makeFluentD3GetSet } from "./fluentD3GetSet";

interface Render<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
}

export interface Donut3DDatum {
    color: string | RGBColor | HSLColor;
    name?: string;
    value: number;
}

export interface Donut3DLabelFormatter {
    (name: string, value: number, percentage: number): string;
}

export interface RenderDonutChart3D<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>
    extends Render<GElement, Datum, PElement, PDatum> {
    data: FluentD3GetSet<this, Donut3DDatum[]>;
    height: FluentD3GetSet<this, string | null>;
    labelFormat: FluentD3GetSet<this, Donut3DLabelFormatter | null>;
    width: FluentD3GetSet<this, string | null>;
}

export function donutChart3d<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let data: Donut3DDatum[] = [];
    let height: string | null = null;
    let labelFormat: Donut3DLabelFormatter | null = null;
    let width: string | null = null;

    const render: RenderDonutChart3D<GElement, Datum, PElement, PDatum> = (s) => {
        const donutSegments = getDonutSegments(data, labelFormat);
        renderX3D(s, donutSegments, height, width);
    }

    render.data = makeFluentD3GetSet(render, () => data, value => data = value);
    render.height = makeFluentD3GetSet(render, () => height, value => height = value);
    render.labelFormat = makeFluentD3GetSet(render, () => labelFormat, value => labelFormat = value);
    render.width = makeFluentD3GetSet(render, () => width, value => width = value);

    return render;
}

interface DonutSegment {
    color: RGBColor;
    label: string;
    length: number;
    start: number;
}

function getDonutSegments(data: Donut3DDatum[], labelFormat: Donut3DLabelFormatter | null): DonutSegment[] {
    const donutSegments: DonutSegment[] = [];

    if (data.length) {
        const cumulativeValues = [0];
        data.forEach(datum => cumulativeValues.push(cumulativeValues[cumulativeValues.length - 1] + datum.value));

        const totalValue = cumulativeValues[cumulativeValues.length - 1];

        const valueToAngleRatio = 2 * Math.PI / totalValue;

        for (let i = 0; i < data.length; i++) {
            const datum = data[i];

            const start = cumulativeValues[i] * valueToAngleRatio;
            const length = datum.value * valueToAngleRatio;

            const color = typeof datum.color === "string"
                ? rgb(datum.color)
                : datum.color.rgb();

            const label = labelFormat ? labelFormat(datum.name || "", datum.value, datum.value / totalValue * 100) : "";

            donutSegments.push({ color, length, label, start });
        }
    }

    return donutSegments;
}

function renderX3D<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(
    s: Selection<GElement, Datum, PElement, PDatum>,
    donutSegments: DonutSegment[],
    height: string | null,
    width: string | null
): void {
    s.selectAll("x3d")
    .data([donutSegments])
    .join("x3d")
      .attr("height", () => height)
      .attr("width", () => width)
    .call(renderScene);
}

function renderScene<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, DonutSegment[], PElement, PDatum>
): void {
    s.selectAll("scene")
    .data(d => [d])
    .join("scene")
    .call(renderDonutChart);
}

function renderDonutChart<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, DonutSegment[], PElement, PDatum>
): void {
    s.selectAll("group.donut-chart")
    .data(d => [d])
    .join("group")
      .attr("class", "donut-chart")
    .call(renderDonutChartSegments);
}

function renderDonutChartSegments<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, DonutSegment[], PElement, PDatum>
): void {
    s.selectAll("transform.donut-chart-segment")
    .data(d => d)
    .join("transform")
      .attr("class", "donut-chart-segment")
    .call(s =>
        s.transition()
          .attr("rotation", d => `0 0 1 ${(Math.PI / 2) - d.start}`)
    )
    .call(s =>
        s.selectAll("shape.donut-chart-segment-torus")
        .data(d => [d])
        .join("shape")
          .attr("class", "donut-chart-segment-torus")
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
    .call(renderDonutChartSegmentLabels);
}

function renderDonutChartSegmentLabels<GElement extends BaseType, PElement extends BaseType, PDatum>(
    s: Selection<GElement, DonutSegment, PElement, PDatum>
): void {
    const labelOffset = 2.5;
    s.selectAll("transform.donut-chart-segment-label")
    .data(d => d.label ? [d] : [])
    .join("transform")
      .attr("class", "donut-chart-segment-label")
      .attr("translation", `${labelOffset} 0 0`)
      .attr("center", `${-labelOffset} 0 0`)
      .attr("rotation", d => `0 0 1 ${-d.length / 2}`)
    .call(s =>
        s.selectAll("shape.donut-chart-segment-label-line")
        .data(d => [d])
        .join("shape")
          .attr("class", "donut-chart-segment-label-line")
        .call(s =>
            s.selectAll("lineset")
            .data(d => [d])
            .join("lineset")
              .attr("vertexCount", "3 3")
            .call(s =>
                s.selectAll("coordinate")
                .data(d => [d])
                .join("coordinate")
                  .attr("point", "0 0 0 -1 0 0")
            )
        )
    )
    .call(s =>
        s.selectAll("shape.donut-chart-segment-label-text")
        .data(d => [d])
        .join("shape")
          .attr("class", "donut-chart-segment-label-text")
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
