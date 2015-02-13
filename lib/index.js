var _ = require('lodash')
var n = require('./utils').n
var SchemaValidationError = require('./error').SchemaValidation

var defaultSchemas = {
  integer: require('./types/number'),
  number: require('./types/number'),
  boolean: require('./types/boolean'),
  object: require('./types/object'),
  string: require('./types/string'),
  array: require('./types/array')
}

function Confine () {
  this.types = defaultSchemas
}

Confine.prototype.validate = function (obj, schema) {
  if (n(obj)) return true
  return this.types[schema.type].validate(obj, schema, this)
}

Confine.prototype.validateSchema = function (schema) {
  var self = this
  // because we are validating with un-validated schemas, they may throw
  try {
    if (
      // if there is a default and enum, default must be part of the enum
      (!n(schema.default) && !n(schema.enum) && schema.enum.indexOf(schema.default) === -1) ||
      // if there is a default, it must validate
      (!n(schema.default) && !this.validate(schema.default, schema)) ||
      // if there is an enum, each item must validate
      (!n(schema.enum) && !_.every(schema.enum, function (e) {
        return self.validate(e, schema)
      })) ||
      // every enum must be unique
      (!n(schema.enum) && !_.isEqual(_.uniq(schema.enum), schema.enum))
    ) {
      return false
    }
  } catch (e) {
    return false
  }

  var type = this.types[schema.type]
  return type ? type.validateSchema(schema, this) : false
}

Confine.prototype.normalize = function (obj, schema) {
  if (!this.validateSchema(schema)) {
    throw new SchemaValidationError(schema)
  }

  var type = this.types[schema.type]

  if (!n(obj) && this.validate(obj, schema)) {
    return type.normalize ? type.normalize(obj, schema, this) : obj
  } else {
    return this.getDefault(schema)
  }
}

Confine.prototype.getDefault = function (schema) {
  if (!n(schema.default)) {
    return schema.default
  } else if (this.types[schema.type].getDefault) {
    return this.types[schema.type].getDefault(schema, this)
  }
  // else return undefined
}

module.exports = Confine
