var _ = require('lodash')
var n = require('../utils').n

module.exports = {
  validate: function (obj, s) {
    return (
      _.isString(obj) &&
      (n(s.regex) || !!obj.match(s.regex))
    )
  },
  validateSchema: function (s) {
    // creating a RegExp with an invalid string throws
    if (!n(s.regex) && _.isString(s.regex)) {
      try {
        /* eslint no-new: 0 */
        new RegExp(s.regex)
      } catch (e) {
        return false
      }
    }
    return n(s.regex) || _.isString(s.regex) || _.isRegExp(s.regex)
  }
}
