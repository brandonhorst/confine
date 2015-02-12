var inherits = require('util').inherits

function SchemaValidationError (s) {
  Error.call(this)
  this.message = 'Invalid Schema:' + s
}
inherits(SchemaValidationError, Error)

module.exports = {
  SchemaValidation: SchemaValidationError
}
