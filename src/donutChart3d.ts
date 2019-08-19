import { Selection, BaseType } from "d3";

import { GetterSetter, getterSetter } from "./getterSetter";

interface Render<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
}

export interface Donut3DDatum {
    value: number;
}

export interface RenderDonutChart3D<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> extends Render<GElement, Datum, PElement, PDatum> {
    data: GetterSetter<this, Donut3DDatum[]>;
    height: GetterSetter<this, string>;
    width: GetterSetter<this, string>;
}

export default function donutChart3d<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let data: Donut3DDatum[] = [];
    let height = "600px";
    let width = "800px";

    const render: RenderDonutChart3D<GElement, Datum, PElement, PDatum> = function(selection) {
        const x3dDataJoin = selection.selectAll("x3d")
            .data([data]);

        x3dDataJoin.enter().append("x3d");
    };

    render.height = getterSetter(render, () => height, value => height = value);
    render.width = getterSetter(render, () => width, value => width = value);
    render.data = getterSetter(render, () => data, value => data = value);

    return render;
};

