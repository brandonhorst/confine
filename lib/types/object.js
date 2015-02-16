var _ = require('lodash')

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isPlainObject(obj) &&
      _.every(schema.properties, function (value, key) {
        return _.isUndefined(obj[key]) || manager.validate(obj[key], value)
      })
    )
  },
  validateSchema: function (schema, manager) {
    return (
      !_.isUndefined(schema.properties) &&
      _.every(schema.properties, function (value) {
        return manager.validateSchema(value)
      })
    )
  },
  normalize: function (obj, schema, manager) {
    var realObj = obj || {}
    return _.chain(schema.properties)
      .mapValues(function (subSchema, propName) {
        return manager.normalize(realObj[propName], subSchema)
      })
      .omit(_.isUndefined)
      .value()
  }
}
