var _ = require('lodash')
var n = require('../utils').n

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isArray(obj) &&
      _.every(obj, function (item) {
        return manager.validate(item, schema.items)
      })
    )
  },
  validateSchema: function (schema, manager) {
    return (
      !n(schema.items) &&
      manager.validateSchema(schema.items)
    )
  },
  normalize: function (obj, schema, manager) {
    return _.chain(obj).map(function (value) {
      return manager.normalize(value, schema.items)
    }).filter(_.negate(n)).value()
  },
  getDefault: function (schema, manager) {
    return []
  }
}
