# `confine` finely-tuned configuration

[![Build Status](https://img.shields.io/travis/brandonhorst/confine.svg?style=flat)](https://travis-ci.org/brandonhorst/confine)
[![Coverage Status](https://img.shields.io/coveralls/brandonhorst/confine.svg?style=flat)](https://coveralls.io/r/brandonhorst/confine)
[![npm](http://img.shields.io/npm/v/confine.svg?style=flat)]()

We live in a post-Sublime Text age. The cool way to store persistant state is in raw JSON. `confine` makes it easy to make some simple assertions about what is in that JSON before passing it to your application logic.

Clearly specifying configuration also gives us power when it comes to GUI auto-generation. For example, see [`react-confine`](https://github.com/brandonhorst/react-confine).

`confine` works similarly to the [Config system](https://atom.io/docs/api/v0.179.0/Config) in the Atom editor, but with no type coercion. It is also modular and extendable, with support for custom types. `confine` also supports the `null` type.

## Installation

```sh
npm install confine
```

## Usage

```js
var Confine = require('confine')
var confine = new Confine()
var schema = {
  type: 'object',
  properties: {
    name: {type: 'string'},
    age: {type: 'integer', min: 0, max: 120},
    income: {type: 'number', min: 0},
    universe: {type: 'string', enum: ['Marvel', 'DC']},
    living: {type: 'boolean', default: true},
    alterEgos: {type: 'array', items: {type: 'string'}},
    location: {
      type: 'object',
      properties: {
        city: {type: 'string'},
        state: {type: 'string', regex: /[A-Z]{2}/}
      }
    }
  }
}

var object = {
  name: 'Peter Parker',
  age: 17,
  income: 38123.52,
  alterEgos: ['Spider-Man'],
  universe: 'Marvel',
  location: {city: 'New York', state: 'NY'},
  girlfriend: 'Mary Jane'
}

console.log(confine.validateSchema(schema)) // true
console.log(confine.normalize(object, schema)) /* {
  name: 'Peter Parker',
  age: 17,
  income: 38123.52,
  living: true,
  alterEgos: ['Spider-Man'],
  universe: 'Marvel',
  location: {city: 'New York', state: 'NY'}
} */
```

## Methods

#### `confine.validateSchema(schema)`

- Returns a `boolean` indicating if `schema` is valid. This should be checked for any untrusted schema before calling any other method - using an invalid schema with the other `confine` methods results in undetermined behavior.

#### `confine.validate(obj, schema)`

- Returns a `boolean` indicating if `obj` is valid according to `schema`.
- A schema being valid means that `_.isEqual(confine.normalize(obj, schema), obj)`. That is, `normalize`ing the object will not change it.

#### `confine.normalize(obj, schema)`

- Returns an adjusted representation of `obj`, removing invalid or unnecessary fields and filling in defaults.
- Please note that you do not need to check `validate` before calling `normalize`. `normalize` expects an invalid `obj`, and will adjust it appropriately. You still must call `validateSchema`, though.

## Confine Schemas

Confine uses a simplified version of JSON Schema to describe JSON objects. Each schema is a JSON object that contains a `type` property. 7 types are built-in, and custom types can also be added. Types may make use of additional properties, as defined below. Additionally, all types make use of 2 additional properties: `default` and `enum`.

- `default` is an object that will be returned by `confine.normalize` or `confine.getDefault` if the provided input is `undefined`. It must be a valid object itself (that is to say, `confine.validate(schema.default, schema)` must return `true`).
- `enum` is an array that enumerates all possible options the value can take. Any input not listed in this array will be rejected. Every array emtry must be a valid object itself (that is to say, `_.every(schema.enum, function (e) {return confine.validate(e, schema)})` must return `true`.

Please see `test/test.js` for examples of all of these types in use.

### `object`

Specifies a JSON object mapping string keys to any JSON entity. `properties` should be itself an object mapping string keys to sub-schemas.

```js
{ type: 'object'
  properties: {
    myInt: { type: 'integer' }
    myString: { type: 'string' } } }

// { myInt: 3, myString: 'something' }
```

### `array`

Specifies a JSON array - an ordered list of entities, all of the same type. `items` should be a single sub-schema that all array entries match.

```js
{ type: 'array',
  items: { type: 'integer' } }

// [ 1, 2, 3 ]
```

### `number`

Specifies a JSON number (integer or decimal). This is held to the same limitations of all numbers in Javascript. `max` and `min` can (inclusively) limit possible number ranges.

```js
{ type: 'number',
  min: 1.5,
  max: 11 }

// 7.2
```

### `integer`

Specifies an integer. This is held to the same limitations of all integers in Javascript. `max` and `min` can (inclusively) limit possible number ranges.

```js
{ type: 'integer',
  min: 4,
  max: 8 }

// 6
```

### `string`

Specifies a JSON string. `regex` can limit the possible input given a Javascript RegExp object, or a string that can be evaulated as a regular expression.

```js
{ type: 'string',
  regex: /.*/ }

// 'something'
```

### `boolean`

Specifies a JSON boolean.

```js
{ type: 'boolean' }

/// false
```

### `null`

Specifies JSON null.

```js
{ type: 'null' }

/// null
```

- `null` works slightly differently than other types. `confine.normalize(obj, {type: 'null'})` will *always* return `null`, even if `_.isUndefined(obj)`. Thus, `confine.validate(undefined, {type: 'null'})` returns `false`.
- This means that `confine.normalize(obj, {type: ['string', 'null']})` will never return `undefined`. If `obj` is not a valid `string`, it will return `null`. This is a good way of ensuring that there is *something* in the `normalize` output (even if it's `null`).

### Multiple types

`type` can be an array of type names. All type names must be valid. When `normalize`ing `undefined`, the returned value will be the first one that does not return `undefined`, or `undefined` if all types do.

Please note that because `number` includes integers, `{type: ['number', 'integer]}` is strictly equivalent to `{type: 'number'}` alone.

## Custom Types

You can add custom types by setting properties on `confine.types`. By default, it understands `integer`, `number`, `string`, `boolean`, `array`, `object`, and `null`. A custom type is simply an object that contains the following functions.

```js
confine.types['typeName'] = {
  validateSchema: function (schema, confine) {...},
  validate: function (obj, schema, confine) {...},
  normalize: function (obj, schema, confine) {...} // optional
}

```

#### `validateSchema(schema, confine)`

- Should return a boolean indicating if `schema` is valid.
- `confine` is provided for subschema parsing (see `lib/array`).

#### `validate(obj, schema, confine)`

- should return a boolean indiciating if the `obj` fits `schema`.
- `confine` is provided for subschema parsing (see `lib/array`).

#### `normalize(obj, schema, confine) // optional`
- should return a version of obj adjusted to fit the schema
- if not provided, `normalize` will return `default` if it exists, or `undefined`
- do not use this to coerce values - this should only be used for adjusting subschema parsing
- see `lib/object` for an example
