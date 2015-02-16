var _ = require('lodash')

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isArray(obj) &&
      _.every(obj, _.bind(manager.validate, manager, _, schema.items))
    )
  },
  validateSchema: function (schema, manager) {
    return manager.validateSchema(schema.items)
  },
  normalize: function (obj, schema, manager) {
    return _.chain(obj)
      .map(_.bind(manager.normalize, manager, _, schema.items))
      .reject(_.isUndefined)
      .value()
  }
}
