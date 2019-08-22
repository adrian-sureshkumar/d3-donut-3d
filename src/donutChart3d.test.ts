import { select, BaseType, rgb, timerFlush } from "d3";
import faker from "faker";

import { donutChart3d, RenderDonutChart3D, Donut3DDatum, Donut3DLabelFormatter } from "./donutChart3d";

const data: Donut3DDatum[] = [{
    color: "red",
    value: 1
}, {
    color: "rgba(0, 255, 0, 0.5)",
    value: 2
}, {
    color: rgb(0, 0, 255, 0),
    value: 3
}];

const labelFormat: Donut3DLabelFormatter = (name, value, percentage) => `${name}: ${value} (${percentage})`;

const height = `${faker.random.number()}px`;
const width = `${faker.random.number()}px`;

describe("property getters/setters", () => {
    let chart: RenderDonutChart3D<BaseType, null, BaseType, null>;

    beforeEach(() => {
        chart = donutChart3d();
    });

    describe.each`
        property         | defaultValue | value
        ${"data"}        | ${[]}        | ${data}
        ${"height"}      | ${null}      | ${height}
        ${"labelFormat"} | ${null}      | ${labelFormat}
        ${"width"}       | ${null}      | ${width}
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

        timerFlush();
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
        let torusElement: Element | null;
        let materialElement: Element | null;

        beforeAll(() => {
            groupElement = groupElements[i];
            rootTransformElement = groupElement.querySelector("transform");
            torusElement = groupElement.querySelector("transform > shape > torus");
            materialElement = groupElement.querySelector("transform > shape > appearance > material");
        });

        it("should have a root transform element rotated about the z-axis to the start of the donut segment", () => {
            expect(rootTransformElement).not.toBeNull();

            const angle = (1/4 - (i === 0 ? 0 : i === 1 ? 1/6 : 1/2)) * (2 * Math.PI);
            const rotationAttribute = rootTransformElement && rootTransformElement.attributes.getNamedItem("rotation");
            const rotationAttributeValues = rotationAttribute && rotationAttribute.value.split(" ").map(Number);
            expect(rotationAttributeValues && rotationAttributeValues[0]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[1]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[2]).toBe(1);
            expect(rotationAttributeValues && rotationAttributeValues[3]).toBeCloseTo(angle, 9);
        });

        it("should have a torus element with the angle set to the donut segment size", () => {
            expect(torusElement).not.toBeNull();

            const angle = ((i + 1) / 6) * (2 * Math.PI);
            const angleAttribute = torusElement && torusElement.attributes.getNamedItem("angle");
            expect(angleAttribute && Number(angleAttribute.value)).toBeCloseTo(angle, 9);
        });

        it("should have a material element representing the color of the donut segment", () => {
            expect(materialElement).not.toBeNull();

            const red = i === 0 ? 1 : 0;
            const green = i === 1 ? 1 : 0;
            const blue = i === 2 ? 1 : 0;
            const transparency = i / 2;

            const diffuseColorAttribute = materialElement && materialElement.attributes.getNamedItem("diffuseColor");
            const diffuseColorAttributeValues = diffuseColorAttribute && diffuseColorAttribute.value.split(" ").map(Number);
            expect(diffuseColorAttributeValues && diffuseColorAttributeValues[0]).toBeCloseTo(red, 9);
            expect(diffuseColorAttributeValues && diffuseColorAttributeValues[1]).toBeCloseTo(green, 9);
            expect(diffuseColorAttributeValues && diffuseColorAttributeValues[2]).toBeCloseTo(blue, 9);

            const transparencyAttribute = materialElement && materialElement.attributes.getNamedItem("transparency");
            const transparencyAttributeValue = transparencyAttribute && Number(transparencyAttribute.value);
            expect(transparencyAttributeValue).toBeCloseTo(transparency, 9);
        });
    });
});
