import { Selection, BaseType, rgb, RGBColor, HSLColor } from "d3";

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
    value: number;
}

export interface RenderDonutChart3D<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
    > extends Render<GElement, Datum, PElement, PDatum> {
    data: FluentD3GetSet<this, Donut3DDatum[]>;
    height: FluentD3GetSet<this, string | null>;
    width: FluentD3GetSet<this, string | null>;
}

export function donutChart3d<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
>(): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let data: Donut3DDatum[] = [];
    let height: string | null = null;
    let width: string | null = null;

    const render: RenderDonutChart3D<GElement, Datum, PElement, PDatum> = function (selection) {
        const valueSum = data.map(datum => datum.value).reduce((sum, value) => sum + value, 0);
        const valueToAngleRatio = 2 * Math.PI / valueSum;

        const x3d = selection.selectAll("x3d")
            .data([data])
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
            .data((d, i) => [{ data: d, index: i }])
            .join("transform")
              .attr("rotation", (d) => {
                  const previousValueSum = data.slice(0, d.index)
                    .map(datum => datum.value)
                    .reduce((sum, value) => sum + value, 0);
                  return `0 0 1 ${(Math.PI / 2) - previousValueSum * valueToAngleRatio}`
              });

        const shape = transform.selectAll("shape")
            .data(d => [d])
            .join("shape");

        const torus = shape.selectAll("torus")
            .data(d => [d])
            .join("torus")
              .attr("angle", d => d.data.value * valueToAngleRatio);

        const appearance = shape.selectAll("appearance")
            .data(d => [d])
            .join("appearance");

        const material = appearance.selectAll("material")
            .data(d => [d])
            .join("material")
              .attr("diffuseColor", d => {
                  const rgbColor = typeof d.data.color === "string" ? rgb(d.data.color) : d.data.color.rgb();
                  return `${rgbColor.r / 255} ${rgbColor.g / 255} ${rgbColor.b / 255}`;
               })
               .attr("transparency", d => {
                  const rgbColor = typeof d.data.color === "string" ? rgb(d.data.color) : d.data.color.rgb();
                  return `${1 - rgbColor.opacity}`;
              });
    };

    render.height = makeFluentD3GetSet(render, () => height, value => height = value);
    render.width = makeFluentD3GetSet(render, () => width, value => width = value);
    render.data = makeFluentD3GetSet(render, () => data, value => data = value);

    return render;
};

