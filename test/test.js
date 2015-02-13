/*eslint-env mocha*/
var chai = require('chai')
var expect = chai.expect
var SchemaManager = require('..')

chai.config.includeStack = true

describe('builtins', function () {
  var s = new SchemaManager()
  describe('general', function () {
    it('getDefault', function () {
      var schema = {type: 'integer', default: 4}
      expect(s.getDefault(schema)).to.equal(4)
    })
    it('validate', function () {
      // null inputs are always valid
      expect(s.validate(null, {type: 'string'})).to.be.true
      expect(s.validate(undefined, {type: 'string'})).to.be.true
    })
    it('validateSchema', function () {
      // default must be in enum
      expect(s.validateSchema({type: 'integer', enum: [1, 2], default: 2})).to.be.true
      expect(s.validateSchema({type: 'integer', enum: [0, 1], default: 2})).to.be.false

      // default must be valid
      expect(s.validateSchema({type: 'integer', default: 1, max: 2})).to.be.true
      expect(s.validateSchema({type: 'integer', default: 1, min: 2})).to.be.false

      // all enums must be valid
      expect(s.validateSchema({type: 'integer', enum: [1, 2], max: 2})).to.be.true
      expect(s.validateSchema({type: 'integer', enum: [0, 1], min: 2})).to.be.false

      // enum must be unique
      expect(s.validateSchema({type: 'integer', enum: [0, 0]})).to.be.false

      // types must exist
      expect(s.validateSchema({type: 'flobnarb'})).to.be.false
    })
    it('normalize', function () {
      expect(s.normalize(undefined, {type: 'integer'})).to.be.undefined
      expect(s.normalize(null, {type: 'integer'})).to.be.undefined
      expect(s.normalize('x', {type: 'integer'})).to.be.undefined
      expect(s.normalize(undefined, {type: 'integer', default: 3})).to.be.equal(3)
      expect(s.normalize(null, {type: 'integer', default: 3})).to.be.equal(3)
      expect(s.normalize('x', {type: 'integer', default: 3})).to.equal(3)

      expect(s.normalize(3, {type: 'integer'})).to.equal(3)

      expect(function () {
        s.normalize({type: 'flobnarb'})
      }).to.throw(Error)
    })
  })

  describe('integer', function () {
    it('validate type', function () {
      var schema = {type: 'integer'}
      expect(s.validateSchema(schema)).to.be.true
      expect(s.validate(1, schema)).to.be.true
      expect(s.validate('1', schema)).to.be.false
      expect(s.validate('1ab', schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
      expect(s.validate(1.1, schema)).to.be.false
      expect(s.validate(-1.2, schema)).to.be.false
      expect(s.validate(true, schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate([1], schema)).to.be.false
    })
    it('validate min', function () {
      var schema = {type: 'integer', min: 2}
      expect(s.validateSchema(schema)).to.be.true
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate(2, schema)).to.be.true
      expect(s.validate(3, schema)).to.be.true
    })
    it('validate max', function () {
      var schema = {type: 'integer', max: 0}
      expect(s.validateSchema(schema)).to.be.true
      expect(s.validate(-1, schema)).to.be.true
      expect(s.validate(0, schema)).to.be.true
      expect(s.validate(1, schema)).to.be.false
    })
    it('validate max + min', function () {
      var schema = {type: 'integer', min: 1, max: 3}
      expect(s.validateSchema(schema)).to.be.true
      expect(s.validate(0, schema)).to.be.false
      expect(s.validate(1, schema)).to.be.true
      expect(s.validate(3, schema)).to.be.true
      expect(s.validate(4, schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'integer'})).to.be.true
      expect(s.validateSchema({type: 'integer', min: 3})).to.be.true
      expect(s.validateSchema({type: 'integer', max: 2})).to.be.true
      expect(s.validateSchema({type: 'integer', max: 3, min: 2})).to.be.true
      expect(s.validateSchema({type: 'integer', max: 2, min: 3})).to.be.false
      expect(s.validateSchema({type: 'integer', default: '4'})).to.be.false
      expect(s.validateSchema({type: 'integer', default: 1.4})).to.be.false
      expect(s.validateSchema({type: 'integer', max: '4'})).to.be.false
      expect(s.validateSchema({type: 'integer', max: 1.4})).to.be.false
      expect(s.validateSchema({type: 'integer', min: '4'})).to.be.false
      expect(s.validateSchema({type: 'integer', min: 1.4})).to.be.false
    })
  })

  describe('number', function () {
    it('validate type', function () {
      var schema = {type: 'number'}
      expect(s.validate(1, schema)).to.be.true
      expect(s.validate(1.1, schema)).to.be.true
      expect(s.validate(-1.2, schema)).to.be.true
      expect(s.validate('1', schema)).to.be.false
      expect(s.validate('1ab', schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
      expect(s.validate(true, schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate([1], schema)).to.be.false
    })
    it('validate min', function () {
      var schema = {type: 'number', min: 2.2}
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate(2, schema)).to.be.false
      expect(s.validate(3, schema)).to.be.true
    })
    it('validate max', function () {
      var schema = {type: 'number', max: 0.5}
      expect(s.validate(-1, schema)).to.be.true
      expect(s.validate(0, schema)).to.be.true
      expect(s.validate(1, schema)).to.be.false
    })
    it('validate min + max', function () {
      var schema = {type: 'number', min: 1.5, max: 3.5}
      expect(s.validate(0, schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate(2, schema)).to.be.true
      expect(s.validate(3, schema)).to.be.true
      expect(s.validate(4, schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'number'})).to.be.true
      expect(s.validateSchema({type: 'number', min: 2.5})).to.be.true
      expect(s.validateSchema({type: 'number', max: 3.5})).to.be.true
      expect(s.validateSchema({type: 'number', max: 3.5, min: 2.5})).to.be.true
      expect(s.validateSchema({type: 'number', max: 2.5, min: 3.5})).to.be.false
      expect(s.validateSchema({type: 'number', default: '4'})).to.be.false
      expect(s.validateSchema({type: 'number', max: '4'})).to.be.false
      expect(s.validateSchema({type: 'number', min: '4'})).to.be.false
    })
  })

  describe('string', function () {
    it('validate type', function () {
      var schema = {type: 'string'}
      expect(s.validate('1', schema)).to.be.true
      expect(s.validate('1ab', schema)).to.be.true
      expect(s.validate('str', schema)).to.be.true
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
      expect(s.validate(-1.2, schema)).to.be.false
      expect(s.validate(true, schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate(['str'], schema)).to.be.false
    })
    it('validate regex', function () {
      var schemas = [
        {type: 'string', regex: /a/},
        {type: 'string', regex: 'a'}
      ]
      schemas.forEach(function (schema) {
        expect(s.validate('a', schema)).to.be.true
        expect(s.validate('abc', schema)).to.be.true
        expect(s.validate('b', schema)).to.be.false
      })
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'string'})).to.be.true
      expect(s.validateSchema({type: 'string', regex: 'a'})).to.be.true
      expect(s.validateSchema({type: 'string', regex: /a/})).to.be.true
      expect(s.validateSchema({type: 'string', regex: 4})).to.be.false
      expect(s.validateSchema({type: 'string', regex: '\\'})).to.be.false
    })
  })

  describe('boolean', function () {
    it('validate type', function () {
      var schema = {type: 'boolean'}
      expect(s.validate(true, schema)).to.be.true
      expect(s.validate(false, schema)).to.be.true
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate([true], schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'boolean'})).to.be.true
    })
  })

  describe('array', function () {
    it('validate type', function () {
      var schema = {type: 'array', items: {type: 'integer'}}
      expect(s.validate([], schema)).to.be.true
      expect(s.validate([1, 2, 3], schema)).to.be.true
      expect(s.validate(['1'], schema)).to.be.false
      expect(s.validate([1, '2'], schema)).to.be.false
      expect(s.validate([1, [2, 3]], schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'array', items: {type: 'integer'}})).to.be.true
      expect(s.validateSchema({type: 'array'})).to.be.false
    })
  })

  describe('object', function () {
    it('validate type', function () {
      var schema = {type: 'object', properties: {myInt: {type: 'integer'}}}
      // accepts missing properties
      expect(s.validate({}, schema)).to.be.true
      expect(s.validate({myInt: 1}, schema)).to.be.true
      // accepts additional properties
      expect(s.validate({myInt: 1, another: 2}, schema)).to.be.true
      expect(s.validate({myInt: '1'}, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate(/.*/, schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'object', properties: {myInt: {type: 'integer'}}})).to.be.true
      expect(s.validateSchema({type: 'object'})).to.be.false
    })
    it('normalize', function () {
      // sets defaults
      expect(s.normalize({}, {type: 'object', properties: {test: {type: 'integer', default: 3}}})).to.eql({test: 3})
      // ignores empties
      expect(s.normalize({}, {type: 'object', properties: {test: {type: 'integer'}}})).to.eql({})
      // removes extras
      expect(s.normalize({not: 3}, {type: 'object', properties: {test: {type: 'integer'}}})).to.eql({})
    })
  })
})
