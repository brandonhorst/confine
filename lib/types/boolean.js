var _ = require('lodash')

module.exports = {
  validate: function (obj, s) {
    return _.isBoolean(obj)
  },
  validateSchema: function (s) {
    return true
  }
}
