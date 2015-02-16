var _ = require('lodash')

module.exports = {
  validate: function (obj, s) {
    return (
      _.isString(obj) &&
      (_.isUndefined(s.regex) || !!obj.match(s.regex))
    )
  },
  validateSchema: function (s) {
    // creating a RegExp with an invalid string throws
    if (!_.isUndefined(s.regex) && _.isString(s.regex)) {
      try {
        /* eslint no-new: 0 */
        new RegExp(s.regex)
      } catch (e) {
        return false
      }
    }
    return _.isUndefined(s.regex) || _.isString(s.regex) || _.isRegExp(s.regex)
  }
}
