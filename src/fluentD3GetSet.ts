export interface FluentD3GetSet<Self extends {}, Value> {
    (): Value;
    (value: Value): Self;
    (...args: [] | [Value]): Value | Self;
}

export function makeFluentD3GetSet<Self extends {}, Value>(
    self: Self,
    get: () => Value,
    set: (value: Value) => void
): FluentD3GetSet<Self, Value> {
    function fluentD3GetSet(): Value;
    function fluentD3GetSet(value: Value): Self;
    function fluentD3GetSet(...args: [] | [Value]): Value | Self {
        if (!args.length) {
            return get();
        }

        const [ value ] = args;
        set(value);
        return self;
    }

    return fluentD3GetSet;
}
