import { Selection, BaseType } from "d3";

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
        const x3d = selection.selectAll("x3d")
            .data([data])
            .join("x3d")
              .attr("height", () => height)
              .attr("width", () => width);

        const scene = x3d.selectAll("scene")
            .data(d => [d])
            .join("scene");
    };

    render.height = makeFluentD3GetSet(render, () => height, value => height = value);
    render.width = makeFluentD3GetSet(render, () => width, value => width = value);
    render.data = makeFluentD3GetSet(render, () => data, value => data = value);

    return render;
};

