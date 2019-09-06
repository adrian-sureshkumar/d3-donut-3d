import { BaseType, Selection } from "d3";

import { FluentGetSet } from "./FluentGetSet";

export type RenderFn<GElement extends BaseType, Datum, PElement extends BaseType, PDatum, Props = {}> = {
    (selection: Selection<GElement, Datum, PElement, PDatum>): void;
} & {
    [Key in keyof Props]: FluentGetSet<RenderFn<GElement, Datum, PElement, PDatum, Props>, Props[Key]>
}
