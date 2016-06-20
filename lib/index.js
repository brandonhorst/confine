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

function arrayify (arg) {
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
      (!_.isUndefined(schema.default) && !this.validate(schema.default, _.omit(schema, 'default'))) ||
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
  return _.isEqual(obj, this.normalize(obj, schema))
}

Confine.prototype.normalize = function (obj, schema) {
  var types = arrayify(schema.type)
  var hasNormalize = _.partial(_.has, _, 'normalize')

  var typeChain = _.chain(types).map(_.propertyOf(this.types))

  if (_.some(typeChain.invokeMap('validate', obj, schema, this).value())) {
    return obj
  } else if (!_.isUndefined(schema.default)) {
    return schema.default
  } else if (typeChain.some(hasNormalize).value()) {
    return typeChain
      .filter(hasNormalize)
      .invokeMap('normalize', obj, schema, this)
      .find(_.negate(_.isUndefined))
      .value()
  }
}

Confine.prototype.clean = function (obj, schema) {
  var types = arrayify(schema.type)
  var hasClean = _.partial(_.has, _, 'clean')

  var typeChain = _.chain(types).map(_.propertyOf(this.types))

  if (_.some(typeChain.invokeMap('validate', obj, schema, this).value())) {
    return obj
  } else if (typeChain.some(hasClean).value()) {
    return typeChain
      .filter(hasClean)
      .invokeMap('clean', obj, schema, this)
      .find(_.negate(_.isUndefined))
      .value()
  }

}

module.exports = Confine
