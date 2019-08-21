import { Selection, BaseType, rgb, RGBColor, HSLColor, select } from "d3";

import { FluentD3GetSet, makeFluentD3GetSet } from "./fluentD3GetSet";

interface Render<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
> {
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

export interface RenderDonutChart3D<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
> extends Render<GElement, Datum, PElement, PDatum> {
    data: FluentD3GetSet<this, Donut3DDatum[]>;
    height: FluentD3GetSet<this, string | null>;
    labelFormat: FluentD3GetSet<this, Donut3DLabelFormatter | null>;
    width: FluentD3GetSet<this, string | null>;
}

interface DonutSegment {
    color: RGBColor;
    length: number;
    start: number;
}

function getDonutSegments(data: Donut3DDatum[]): DonutSegment[] {
    const donutSegments: DonutSegment[] = [];

    if (data.length) {
        const cumulativeValues = [0];
        data.forEach(datum => cumulativeValues.push(cumulativeValues[cumulativeValues.length - 1] + datum.value));

        const valueToAngleRatio = 2 * Math.PI / cumulativeValues[cumulativeValues.length - 1];

        for (let i = 0; i < data.length; i++) {
            const datum = data[i];

            const start = cumulativeValues[i] * valueToAngleRatio;
            const length = datum.value * valueToAngleRatio;

            const color = typeof datum.color === "string"
                ? rgb(datum.color)
                : datum.color.rgb();

            donutSegments.push({ color, length, start });
        }
    }

    return donutSegments;
}

export function donutChart3d<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
>(): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let data: Donut3DDatum[] = [];
    let height: string | null = null;
    let labelFormat: Donut3DLabelFormatter | null = null;
    let width: string | null = null;

    const labelOffset = 2.5;

    const render: RenderDonutChart3D<GElement, Datum, PElement, PDatum> = function (selection) {
        const donutSegments = getDonutSegments(data);

        const x3d = selection.selectAll("x3d")
            .data([donutSegments])
            .join("x3d")
              .attr("height", () => height)
              .attr("width", () => width);

        const scene = x3d.selectAll("scene")
            .data(d => [d])
            .join("scene");

        const group = scene.selectAll("group")
            .data(d => d)
            .join("group");

        const transform = group.selectAll("transform")
            .data(d => [d])
            .join("transform")
              .attr("rotation", d => `0 0 1 ${(Math.PI / 2) - d.start}`);

        const shape = transform.selectAll("shape")
            .data(d => [d])
            .join("shape");

        const torus = shape.selectAll("torus")
            .data(d => [d])
            .join("torus")
              .attr("angle", d => d.length);

        const appearance = shape.selectAll("appearance")
            .data(d => [d])
            .join("appearance");

        const material = appearance.selectAll("material")
            .data(d => [d])
            .join("material")
              .attr("diffuseColor", d => `${d.color.r / 255} ${d.color.g / 255} ${d.color.b / 255}`)
              .attr("transparency", d => `${1 - d.color.opacity}`);

        transform.call(function renderLabel(s) {
            s.selectAll("transform")
                .data(d => [d])
                .join("transform")
                  .attr("translation", `${labelOffset} 0 0`)
                  .attr("center", `${-labelOffset} 0 0`)
                  .attr("rotation", d => `0 0 1 ${-d.length / 2}`)
                .call(function renderLine(s) {
                    s.selectAll("shape.label-line")
                    .data(d => [d])
                    .join("shape")
                      .attr("class", "label-line")
                    .selectAll("lineset")
                    .data(d => [d])
                    .join("lineset")
                      .attr("vertexCount", "3 3")
                    .selectAll("coordinate")
                    .data(d => [d])
                    .join("coordinate")
                      .attr("point", "0 0 0 -1 0 0");
                })
                .call(function renderText(selection) {
                    const shape = selection.selectAll("shape.label-text")
                        .data(d => [d])
                        .join("shape")
                          .attr("class", "label-text");

                    shape.selectAll("appearance")
                        .data(d => [d])
                        .join("appearance")
                        .selectAll("material")
                        .data(d => [d])
                        .join("material")
                          .attr("diffuseColor", "0 0 0");

                    shape.selectAll("text")
                        .data(d => [d])
                        .join("text")
                          .attr("string", d => d.length)
                          .attr("solid", false)
                        .selectAll("fontstyle")
                        .data(d => [d])
                        .join("fontstyle")
                          .attr("family", "sans-serif")
                          .attr("justify", '"begin" "middle"')
                          .attr("size", "0.25");
                });
            });
    };

    render.data = makeFluentD3GetSet(render, () => data, value => data = value);
    render.height = makeFluentD3GetSet(render, () => height, value => height = value);
    render.labelFormat = makeFluentD3GetSet(render, () => labelFormat, value => labelFormat = value);
    render.width = makeFluentD3GetSet(render, () => width, value => width = value);

    return render;
}
