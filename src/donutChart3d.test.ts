import { select, BaseType } from "d3";
import faker from "faker";

import { donutChart3d, RenderDonutChart3D, Donut3DDatum } from "./donutChart3d";

const data: Donut3DDatum[] = [{
    value: 75
}, {
    value: 150
}, {
    value: 135
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
        const heightAttribute = x3dElement && x3dElement.attributes.getNamedItem("height");
        expect(heightAttribute && heightAttribute.value).toBe(height);
    })

    it("should set the width of the x3d element", () => {
        const widthAttribute = x3dElement && x3dElement.attributes.getNamedItem("width");
        expect(widthAttribute && widthAttribute.value).toBe(width);
    })

    it("should create a scene element", () => {
        expect(sceneElement).not.toBeNull();
    })

    it("should create a group element representing each datum", () => {
        expect(groupElements).toHaveLength(data.length);
    })

    describe.each(data.map((_, i) => (i)))
    ("group element %#", (i) => {
        let groupElement: Element;
        let rootTransformElement: Element | null;
        let shapeElement: Element | null;
        let torusElement: Element | null;

        beforeAll(() => {
            groupElement = groupElements[i];
            rootTransformElement = groupElement.querySelector("transform");
            shapeElement = groupElement.querySelector("transform > shape");
            torusElement = groupElement.querySelector("transform > shape > torus");
        });

        it("should have a root transform element rotated about the z-axis to the start of the donut segment", () => {
            expect(rootTransformElement).not.toBeNull();

            const angle = (data.slice(0, i).map(datum => datum.value).reduce((sum, value) => sum + value, 0) / 360) * 2 * Math.PI;
            const rotationAttribute = rootTransformElement && rootTransformElement.attributes.getNamedItem("rotation");
            const rotationAttributeValues = rotationAttribute && rotationAttribute.value.split(" ").map(Number);
            expect(rotationAttributeValues && rotationAttributeValues[0]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[1]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[2]).toBe(1);
            expect(rotationAttributeValues && rotationAttributeValues[3]).toBeCloseTo(angle, 9);
        });

        it("should have a shape element representing the donut segment", () => {
            expect(shapeElement).not.toBeNull();
        });

        it("should have a torus element with the angle set to the donut segment size", () => {
            expect(torusElement).not.toBeNull();

            const angle = (data[i].value / 360) * 2 * Math.PI;
            const angleAttribute = torusElement && torusElement.attributes.getNamedItem("angle");
            expect(angleAttribute && Number(angleAttribute.value)).toBeCloseTo(angle, 9);
        });
    });
});
