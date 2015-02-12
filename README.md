# simple-json-schema
We live in a post-Sublime Text age. The cool way to store persistant state is in raw JSON. `simple-json-schema` makes it easy to make some simple assertions about what is in that JSON before passing it to your application logic.

It works similar to the [Config system in the Atom Editor](https://atom.io/docs/api/v0.179.0/Config) but without coercion and with custom types.

## Installation

```sh
npm install simple-json-schema
```

## Usage

```js
var parser = new (require('./.'))()
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

console.log(parser.validateSchema(schema)) // true
console.log(parser.validate(object, schema)) // true
console.log(parser.normalize(object, schema)) /* {
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

#### `parser.validateSchema(schema)`

- Returns a boolean indicating if `schema` is valid.

#### `parser.validate(obj, schema)`

- Returns a boolean indicating if `obj` is valid according to `schema`

#### `parser.normalize(obj, schema)`

- Returns an adjusted representation of `obj`, filling in defaults and removing unnecessary fields.
- Throws an error if `validateSchema` returns `false`

## Custom Types

You can add custom types to the parser by setting properties on `parser.types`. By default, it understands `integer`, `number`, `string`, `boolean`, `array`, and `object`. You can also `delete` those types if you need to.

```js
parser.types['typeName'] = {
  validateSchema: function (schema, parser) {...},
  validate: function (obj, schema, parser) {...},
  normalize: function (obj, schema, parser) {...} // optional
}
```

#### `validateSchema(schema, parser)`

- Should return a boolean indicating if `schema` is valid.
- `parser` is provided for subschema parsing (see `lib/array`).

#### `validate(obj, schema, parser)`

- should return a boolean indiciating if the `obj` fits `schema`.
- `parser` is provided for subschema parsing (see `lib/array`).

#### `normalize(obj, schema, parser) // optional`
- should return a version of obj adjusted to fit the schema
- if not provided, `normalize` will return `default` if it exists, or `undefined`
- do not use this to coerce values - this should only be used for adjusting subschema parsing
- see `lib/object` for an example
