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
    height: FluentD3GetSet<this, string>;
    width: FluentD3GetSet<this, string>;
}

export function donutChart3d<
    GElement extends BaseType,
    Datum,
    PElement extends BaseType,
    PDatum
>(): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let data: Donut3DDatum[] = [];
    let height = "600px";
    let width = "800px";

    const render: RenderDonutChart3D<GElement, Datum, PElement, PDatum> = function (selection) {
        const x3dDataJoin = selection.selectAll("x3d")
            .data([data]);

        x3dDataJoin.enter().append("x3d")
            .merge(x3dDataJoin)
              .attr("height", height)
              .attr("width", width);

        x3dDataJoin.remove();
    };

    render.height = makeFluentD3GetSet(render, () => height, value => height = value);
    render.width = makeFluentD3GetSet(render, () => width, value => width = value);
    render.data = makeFluentD3GetSet(render, () => data, value => data = value);

    return render;
};

