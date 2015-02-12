var _ = require('lodash')
var u = require('./utils')
var SchemaValidationError = require('./error').SchemaValidation

var defaultSchemas = {
  integer: require('./types/number'),
  number: require('./types/number'),
  boolean: require('./types/boolean'),
  object: require('./types/object'),
  string: require('./types/string'),
  array: require('./types/array')
}

function SchemaManager () {
  this.types = defaultSchemas
}

SchemaManager.prototype.validate = function (obj, schema) {
  return this.types[schema.type].validate(obj, schema, this)
}

SchemaManager.prototype.validateSchema = function (schema) {
  var self = this
  // because we are validating with un-validated schemas, they may throw
  try {
    if (
      // if there is a default and enum, default must be part of the enum
      (!u.n(schema.default) && !u.n(schema.enum) && schema.enum.indexOf(schema.default) === -1) ||
      // if there is a default, it must validate
      (!u.n(schema.default) && !this.validate(schema.default, schema)) ||
      // if there is an enum, each item must validate
      (!u.n(schema.enum) && !_.every(schema.enum, function (e) {
        return self.validate(e, schema)
      }))
    ) {
      return false
    }
  } catch (e) {
    return false
  }

  var type = this.types[schema.type]
  return type ? type.validateSchema(schema, this) : false
}

SchemaManager.prototype.normalize = function (obj, schema) {
  if (!this.validateSchema(schema)) {
    throw new SchemaValidationError(schema)
  }

  var type = this.types[schema.type]

  if (!u.n(obj) && this.validate(obj, schema)) {
    return type.normalize ? type.normalize(obj, schema, this) : obj
  } else {
    return this.getDefault(schema)
  }
}

SchemaManager.prototype.getDefault = function (schema) {
  if (!u.n(schema.default)) {
    return schema.default
  } else {
    return // undefined
  }
}

module.exports = SchemaManager
