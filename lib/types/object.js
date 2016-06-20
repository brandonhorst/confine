var _ = require('lodash')

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isPlainObject(obj) &&
      _.every(obj, _.negate(_.isUndefined)) &&
      _.every(obj, function (value, key) {
        return _.has(schema.properties, key)
      }) &&
      _.every(schema.properties, function (propSchema, propName) {
        return manager.validate(obj[propName], propSchema)
      })
    )
  },
  validateSchema: function (schema, manager) {
    return (
      !_.isUndefined(schema.properties) &&
      _.every(schema.properties, manager.validateSchema.bind(manager))
    )
  },
  normalize: function (obj, schema, manager) {
    var realObj = obj || {}
    return _.chain(schema.properties)
      .mapValues(function (subSchema, propName) {
        return manager.normalize(realObj[propName], subSchema)
      })
      .omitBy(_.isUndefined)
      .value()
  },
  clean: function (obj, schema, manager) {
    if (obj) {
      return _.chain(obj)
        .mapValues(function (property, propName) {
          var subSchema = schema.properties[propName]
          if (subSchema) {
            return manager.clean(property, subSchema)
          } else {
            return property
          }
        })
        .omitBy(_.isUndefined)
        .value()
    }
  }
}
