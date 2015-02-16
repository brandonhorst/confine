var _ = require('lodash')

function isInteger(value) {
  return _.isNumber(value) && isFinite(value) && Math.floor(value) === value
}

module.exports = {
  validate: function (obj, s) {
    var validator = s.type === 'integer' ? isInteger : _.isFinite

    return (
      validator(obj) &&
      (_.isUndefined(s.max) || obj <= s.max) &&
      (_.isUndefined(s.min) || obj >= s.min)
    )
  },

  validateSchema: function (s) {
    var validator = s.type === 'integer' ? Number.isInteger : _.isFinite

    return (
      (_.isUndefined(s.max) || validator(s.max)) &&
      (_.isUndefined(s.min) || validator(s.min)) &&
      (_.isUndefined(s.max) || _.isUndefined(s.min) || s.max >= s.min)
    )
  }
}
