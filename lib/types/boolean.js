var _ = require('lodash')

module.exports = {
  validate: function (obj) {
    return _.isBoolean(obj)
  },
  validateSchema: function () {
    return true
  }
}
