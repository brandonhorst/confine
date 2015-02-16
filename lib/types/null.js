var _ = require('lodash')

module.exports = {
  validate: function (obj) {
    return _.isNull(obj)
  },
  validateSchema: function () {
    return true
  },
  normalize: function () {
    return null
  }
}
