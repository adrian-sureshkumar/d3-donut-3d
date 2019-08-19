import donutChart3d from "./donutChart3d";

it("should return a function", () => {
    const chart = donutChart3d();
    expect(typeof chart).toBe("function");
});
