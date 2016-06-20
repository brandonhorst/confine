var _ = require('lodash')

function arrayToPairs (value, key) {
  return [key, value]
}

module.exports = {
  validate: function (obj, schema, manager) {
    return (
      _.isArray(obj) &&
      _.every(obj, _.negate(_.isUndefined)) &&
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
  },
  clean: function (obj, schema, manager) {
    if (obj) {
      var cleanedItems = _.map(obj, _.bind(manager.clean, manager, _, schema.items))
      if (_.some(cleanedItems, _.isUndefined)) {
        var length = cleanedItems.length
        var pairs = _.chain(cleanedItems)
          .map(arrayToPairs)
          .filter(function (pair) { return !_.isUndefined(pair[1]) })
          .fromPairs()
          .value()
        return _.assign(pairs, {length: length})
      } else {
        return cleanedItems
      }

    }
  }
}
