var _ = require('lodash')

var defaultSchemas = {
  array: require('./types/array'),
  boolean: require('./types/boolean'),
  integer: require('./types/number'),
  null: require('./types/null'),
  number: require('./types/number'),
  object: require('./types/object'),
  string: require('./types/string')
}

function Confine () {
  this.types = defaultSchemas
}

Confine.prototype.validate = function (obj, schema) {
  if (_.isUndefined(obj)) return true
  return this.types[schema.type].validate(obj, schema, this)
}

Confine.prototype.validateSchema = function (schema) {
  var self = this
  // because we are validating with un-validated schemas, they may throw
  try {
    if (
      // if there is an enum, it must be an array
      (!_.isUndefined(schema.enum) && !_.isArray(schema.enum)) ||
      // if there is a default and enum, default must be part of the enum
      (!_.isUndefined(schema.default) && !_.isUndefined(schema.enum) && !_.includes(schema.enum, schema.default)) ||
      // if there is a default, it must validate
      (!_.isUndefined(schema.default) && !this.validate(schema.default, schema)) ||
      // if there is an enum, each item must validate
      (!_.isUndefined(schema.enum) && !_.every(schema.enum, function (e) {
        return self.validate(e, schema)
      })) ||
      // every enum must be unique
      (!_.isUndefined(schema.enum) && !_.isEqual(_.uniq(schema.enum), schema.enum))
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
  var type = this.types[schema.type]

  if (type.normalize) {
    return type.normalize(obj, schema, this)
  } else if (!_.isUndefined(obj) && this.validate(obj, schema)) {
    return obj
  } else {
    return schema.default
  }
}

module.exports = Confine
