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
        ${"height"} | ${null}      | ${height}
        ${"width"}  | ${null}      | ${width}
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
    let x3dElement: Element | null;
    let sceneElement: Element | null;
    let groupElements: NodeListOf<Element>;
    let chart: RenderDonutChart3D<HTMLDivElement, null, null, undefined>;

    beforeAll(() => {
        root = document.createElement("div")
        document.body.append(root);

        chart = donutChart3d<HTMLDivElement, null, null, undefined>()
            .data(data)
            .height(height)
            .width(width);

        chart(select(root));

        x3dElement = root.querySelector("x3d");
        sceneElement = root.querySelector("x3d > scene");
        groupElements = root.querySelectorAll("x3d > scene > group");
    });

    afterAll(() => {
        root.remove();
    });

    it("should create an x3d element", () => {
        expect(x3dElement).not.toBeNull();
    })

    it("should set the height of the x3d element", () => {
        const heightAttr = x3dElement && x3dElement.attributes.getNamedItem("height");
        expect(heightAttr && heightAttr.value).toBe(height);
    })

    it("should set the width of the x3d element", () => {
        const widthAttr = x3dElement && x3dElement.attributes.getNamedItem("width");
        expect(widthAttr && widthAttr.value).toBe(width);
    })

    it("should create a scene element", () => {
        expect(sceneElement).not.toBeNull();
    })

    it("should create a group element for each datum", () => {
        expect(groupElements).toHaveLength(data.length);
    })
});
