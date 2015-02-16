var _ = require('lodash')

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isPlainObject(obj) &&
      _.every(obj, _.negate(_.isUndefined)) &&
      _.every(obj, function (value, key) {
        return _.has(schema.properties, key)
      }) &&
      _.every(schema.properties, function (value, key) {
        return manager.validate(obj[key], value)
      })
    )
  },
  validateSchema: function (schema, manager) {
    return (
      !_.isUndefined(schema.properties) &&
      _.every(schema.properties, manager.validateSchema, manager)
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
