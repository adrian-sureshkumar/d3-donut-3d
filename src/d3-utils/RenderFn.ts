import { BaseType, Selection } from "d3";

export interface RenderFn<GElement extends BaseType, Datum, PElement extends BaseType, PDatum> {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
}
