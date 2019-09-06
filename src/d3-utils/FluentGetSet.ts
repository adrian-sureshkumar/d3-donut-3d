export interface FluentGetSet<Self extends {}, Value> {
    (): Value;
    (value: Value): Self;
    (...args: [] | [Value]): Value | Self;
}

export function makeFluentGetSet<Self extends {}, Value>(
    self: Self,
    get: () => Value,
    set: (value: Value) => void
): FluentGetSet<Self, Value> {
    function fluentGetSet(): Value;
    function fluentGetSet(value: Value): Self;
    function fluentGetSet(...args: [] | [Value]): Value | Self {
        if (!args.length) {
            return get();
        }

        const [ value ] = args;
        set(value);
        return self;
    }

    return fluentGetSet;
}

export function makeFluentGetSetProp<Self, Props, Prop extends keyof Props>(
    self: Self,
    props: Props,
    prop: Prop
): FluentGetSet<Self, Props[Prop]> {
    return makeFluentGetSet(self, () => props[prop], value => props[prop] = value);
}
