var _ = require('lodash')
var n = require('../utils').n

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isPlainObject(obj) &&
      _.every(schema.properties, function (value, key) {
        return n(obj[key]) || manager.validate(obj[key], value)
      })
    )
  },
  validateSchema: function (schema, manager) {
    return (
      !n(schema.properties) &&
      _.every(schema.properties, function (value) {
        return manager.validateSchema(value)
      })
    )
  },
  normalize: function (obj, schema, manager) {
    return _.chain(schema.properties).mapValues(function (value, key) {
      return manager.normalize(obj[key], value)
    }).omit(_.isUndefined).value()
  }
}