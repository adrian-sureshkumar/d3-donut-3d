import { BaseType, Selection } from "d3";

import { FluentD3GetSet } from "./FluentD3GetSet";

export type RenderFn<GElement extends BaseType, Datum, PElement extends BaseType, PDatum, Props = {}> = {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
} & {
    [Key in keyof Props]: FluentD3GetSet<RenderFn<GElement, Datum, PElement, PDatum, Props>, Props[Key]>
}
