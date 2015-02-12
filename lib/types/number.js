var _ = require('lodash')
var n = require('../utils').n

module.exports = {
  validate: function (obj, s) {
    var validator = s.type === 'integer' ? Number.isInteger : _.isFinite

    return (
      validator(obj) &&
      (n(s.enum) || s.enum.indexOf(obj) > -1) &&
      (n(s.max) || obj <= s.max) &&
      (n(s.min) || obj >= s.min)
    )
  },

  validateSchema: function (s) {
    var validator = s.type === 'integer' ? Number.isInteger : _.isFinite

    return (
      (n(s.max) || validator(s.max)) &&
      (n(s.min) || validator(s.min)) &&
      (n(s.max) || n(s.min) || s.max >= s.min)
    )
  }
}
