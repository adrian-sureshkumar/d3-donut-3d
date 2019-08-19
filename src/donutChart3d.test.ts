import { select } from "d3";

import donutChart3d from "./donutChart3d";

it("should return a render function", () => {
    const chart = donutChart3d();
    expect(typeof chart).toBe("function");
});

describe("when the chart is rendered", () => {
    let root: HTMLDivElement;

    beforeAll(() => {
        root = document.createElement("div")
        document.body.append(root);

        const chart = donutChart3d<HTMLDivElement, null, null, undefined>();
        chart(select(root));
    });

    afterAll(() => {
        root.remove();
    });

    it("should create an x3d element", () => {
        expect(root.querySelector("x3d")).not.toBeNull();
    })
});
