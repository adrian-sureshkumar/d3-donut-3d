import * as d3 from "d3";
import { BaseType } from "d3";
import * as faker from "faker";

import { donutChart3d, DonutChart3dRenderFn, DonutChart3dDatum, DonutChart3dLabelFormatter } from "./donutChart3d";

const data: DonutChart3dDatum[] = [{
    color: "red",
    value: 1
}, {
    color: "rgba(0, 255, 0, 0.5)",
    value: 2
}, {
    color: d3.rgb(0, 0, 255, 0),
    value: 3
}];

const labelFormat: DonutChart3dLabelFormatter = (name, value, percentage) => `${name}: ${value} (${percentage})`;

const transitionDuration = faker.random.number();

const height = `${faker.random.number()}px`;
const width = `${faker.random.number()}px`;

describe("property getters/setters", () => {
    let chart: DonutChart3dRenderFn<BaseType, BaseType>;

    beforeEach(() => {
        chart = donutChart3d();
    });

    describe.each`
        property                | defaultValue                  | value
        ${"data"}               | ${[]}                         | ${data}
        ${"height"}             | ${null}                       | ${height}
        ${"labelFormat"}        | ${null}                       | ${labelFormat}
        ${"transitionDuration"} | ${d3.transition().duration()} | ${transitionDuration}
        ${"width"}              | ${null}                       | ${width}
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
    let x3dElement: HTMLElement | null;
    let sceneElement: HTMLElement | null;
    let chartElement: HTMLElement | null;
    let chart: DonutChart3dRenderFn<HTMLDivElement, null>;

    beforeAll(() => {
        root = document.createElement("div")
        document.body.append(root);

        chart = donutChart3d<HTMLDivElement, null>()
            .data(data)
            .height(height)
            .width(width);

        chart(d3.select(root));
        d3.timerFlush();

        x3dElement = root.querySelector("x3d");
        sceneElement = x3dElement && x3dElement.querySelector("scene");
        chartElement = sceneElement && sceneElement.querySelector(".chart");
    });

    afterAll(() => {
        root.remove();
    });

    it("should create an x3d element", () => {
        expect(x3dElement).not.toBeNull();
    })

    it("should set the height of the x3d element", () => {
        expect(x3dElement && x3dElement.style.height).toBe(height);
    })

    it("should set the width of the x3d element", () => {
        expect(x3dElement && x3dElement.style.width).toBe(width);
    })

    it("should create a scene element", () => {
        expect(sceneElement).not.toBeNull();
    })

    it("should create a root element for the chart", () => {
        expect(chartElement).not.toBeNull();
    })

    it("should create an element representing each series", () => {
        expect(chartElement && chartElement.childNodes).toHaveLength(data.length);
    })

    describe.each(data.map((_, i) => (i)))
    ("series element %#", (i) => {
        let rootTransformElement: HTMLElement | null;
        let torusElement: HTMLElement | null;
        let materialElement: HTMLElement | null;

        beforeAll(() => {
            rootTransformElement = chartElement && chartElement.querySelector(`transform:nth-child(${i + 1})`);
            torusElement = rootTransformElement && rootTransformElement.querySelector("shape > torus");
            materialElement = rootTransformElement && rootTransformElement.querySelector("shape > appearance > material");
        });

        it("should have a root transform element rotated about the z-axis to the start of the slice", () => {
            expect(rootTransformElement).not.toBeNull();

            const angle = (1/4 - (i === 0 ? 0 : i === 1 ? 1/6 : 1/2)) * (2 * Math.PI);
            const rotationAttribute = rootTransformElement && rootTransformElement.attributes.getNamedItem("rotation");
            const rotationAttributeValues = rotationAttribute && rotationAttribute.value.split(" ").map(Number);
            expect(rotationAttributeValues && rotationAttributeValues[0]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[1]).toBe(0);
            expect(rotationAttributeValues && rotationAttributeValues[2]).toBe(1);
            expect(rotationAttributeValues && rotationAttributeValues[3]).toBeCloseTo(angle, 9);
        });

        it("should have a torus element with the angle set to the slice length", () => {
            expect(torusElement).not.toBeNull();

            const angle = ((i + 1) / 6) * (2 * Math.PI);
            const angleAttribute = torusElement && torusElement.attributes.getNamedItem("angle");
            expect(angleAttribute && Number(angleAttribute.value)).toBeCloseTo(angle, 9);
        });

        it("should have a material element representing the color of the series", () => {
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
