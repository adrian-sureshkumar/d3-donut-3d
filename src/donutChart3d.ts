import { Selection, BaseType } from "d3";

interface Render<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
}

interface GetterSetter<T, V> {
    (): V;
    (value: V): T;
}

interface Series {
    value: number;
}

interface RenderDonutChart3D<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> extends Render<GElement, Datum, PElement, PDatum> {
    series: GetterSetter<this, Series[]>;
}

export default function donutChart3d<GElement extends BaseType, Datum, PElement extends BaseType, PDatum>(): RenderDonutChart3D<GElement, Datum, PElement, PDatum> {
    let series: Series[] = [];

    type Render = RenderDonutChart3D<GElement, Datum, PElement, PDatum>;
    const render: Render = function(selection) {
        const x3dDataJoin = selection.selectAll("x3d")
            .data([series]);

        x3dDataJoin.enter().append("x3d");
    };

    function seriesGetterSetter(): Series[];
    function seriesGetterSetter(value: Series[]): Render;
    function seriesGetterSetter(value: Series[] | undefined = undefined): Series[] | Render {
        if (value === undefined) return series;
        series = value;
        return render;
    };

    render.series = seriesGetterSetter;

    return render;
};

