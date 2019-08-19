export interface GetterSetter<T, V> {
    (): V;
    (value: V): T;
    (value: V | undefined): V | T;
}

export function getterSetter<T, V>(obj: T, getter: () => V, setter: (value: V) => void): GetterSetter<T, V> {
    function getterSetter(): V;
    function getterSetter(value: V): T;
    function getterSetter(value: V | undefined = undefined): V | T {
        if (value === undefined) {
            return getter();
        }
        setter(value);
        return obj;
    }

    return getterSetter;
}
