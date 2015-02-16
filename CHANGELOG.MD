#CHANGELOG

## 3.0
- Added multiple types
- Formalized null behavior with multiple types
- *breaking* `confine.validate(undefined, {schema: x, default: y})` now returns `false` if '`_.isUndefined(y)`, or if `x` is `array`, `object`, or `null`.
- *breaking* `confine.validate(ary, {schema: 'array', items: x})` returns `false` if `ary` has any `undefined` elements.
- *breaking* `confine.validate(obj, {schema: 'object'}, properties: x)` returns `false` if `obj` has any `undefined` values.
- *breaking* `confine.validate(obj, {schema: 'object', properties: props})` returns `false` if `obj` has any properties not in `props`.

## 2.0

- Added `null` type. Previously, `null` was treated the same as `undefined`. Now they behave differently.
- Removed `getDefault`
