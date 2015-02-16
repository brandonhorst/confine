var _ = require('lodash')

function isInteger(value) {
  return _.isFinite(value) && Math.floor(value) === value
}

module.exports = {
  integer: {
    validate: _.partial(validate, _, _, isInteger),
    validateSchema: _.partial(validateSchema, _, isInteger)
  },
  number: {
    validate: _.partial(validate, _, _, _.isFinite),
    validateSchema: _.partial(validateSchema, _, _.isFinite)
  }
}

function validate (obj, s, validator) {
  return (
    validator(obj) &&
    (_.isUndefined(s.max) || obj <= s.max) &&
    (_.isUndefined(s.min) || obj >= s.min)
  )
}

function validateSchema (s, validator) {
  return (
    (_.isUndefined(s.max) || validator(s.max)) &&
    (_.isUndefined(s.min) || validator(s.min)) &&
    (_.isUndefined(s.max) || _.isUndefined(s.min) || s.max >= s.min)
  )
}
