import { select, BaseType } from "d3";
import faker from "faker";

import { donutChart3d, RenderDonutChart3D, Donut3DDatum } from "./donutChart3d";

const data: Donut3DDatum[] = [{
    value: faker.random.number()
}, {
    value: faker.random.number()
}, {
    value: faker.random.number()
}];

const height = `${faker.random.number()}px`;
const width = `${faker.random.number()}px`;

describe("property getters/setters", () => {
    let chart: RenderDonutChart3D<BaseType, null, BaseType, null>;

    beforeEach(() => {
        chart = donutChart3d();
    });

    describe.each`
        property    | defaultValue | value
        ${"data"}   | ${[]}        | ${data}
        ${"height"} | ${"600px"}   | ${height}
        ${"width"}  | ${"800px"}   | ${width}
    `("$property", ({ property, defaultValue, value }: {
        property: keyof typeof chart;
        defaultValue: any;
        value: any;
    }) => {
        describe("when called with no value", () => {
            it("should return the value of the property", () => {
                expect(chart[property]()).toEqual(defaultValue);
            });
        });

        describe("when called with a value", () => {
            let result: ReturnType<typeof chart[typeof property]>;

            beforeEach(() => {
                result = chart[property](value);
            });

            it("it should update the value of the property", () => {
                expect(chart[property]()).toEqual(value);
            });

            it("should return the chart on which it was called", () => {
                expect(result).toBe(chart);
            });
        });
    });
});

describe("when the chart is rendered", () => {
    let root: HTMLDivElement;
    let chart: RenderDonutChart3D<HTMLDivElement, null, null, undefined>;

    beforeEach(() => {
        root = document.createElement("div")
        document.body.append(root);

        chart = donutChart3d<HTMLDivElement, null, null, undefined>();
        chart(select(root));
    });

    afterEach(() => {
        root.remove();
    });

    it("should create an x3d element", () => {
        expect(root.querySelector("x3d")).not.toBeNull();
    })
});
