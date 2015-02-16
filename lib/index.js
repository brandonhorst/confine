var _ = require('lodash')

var defaultSchemas = {
  array: require('./types/array'),
  boolean: require('./types/boolean'),
  integer: require('./types/number').integer,
  null: require('./types/null'),
  number: require('./types/number').number,
  object: require('./types/object'),
  string: require('./types/string')
}

function arrayify(arg) {
  return _.isArray(arg) ? arg : [arg]
}

function Confine () {
  this.types = defaultSchemas
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

  var types = arrayify(schema.type)

  if (!_.every(types, _.partial(_.has, this.types))) return false

  return _.some(types, function (type) {
    return self.types[type].validateSchema(schema, self)
  })
}

Confine.prototype.validate = function (obj, schema) {
  if (_.isUndefined(obj)) return true

  var self = this
  var types = arrayify(schema.type)

  return _.some(types, function (type) {
    return self.types[type].validate(obj, schema, self)
  })
}

Confine.prototype.normalize = function (obj, schema) {
  var self = this
  var types = arrayify(schema.type)

  return _.chain(types)
  .map(_.propertyOf(this.types))
  .map(function (type) {
    if (type.normalize) {
      return type.normalize(obj, schema, self)
    } else if (!_.isUndefined(obj) && self.validate(obj, schema)) {
      return obj
    } else {
      return schema.default
    }
  }).find(_.negate(_.isUndefined))
  .value()
}

module.exports = Confine
