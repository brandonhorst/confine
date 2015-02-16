/*eslint-env mocha*/
var chai = require('chai')
var expect = chai.expect
var Confine = require('..')

chai.config.includeStack = true

describe('builtins', function () {
  var s = new Confine()
  describe('general', function () {
    it('validate', function () {
      // undefined inputs are only valid if no default is provided
      expect(s.validate(undefined, {type: 'string'})).to.be.true
      expect(s.validate(undefined, {type: 'string', default: 'test'})).to.be.false
    })
    it('validateSchema', function () {
      // enum must be an array
      expect(s.validateSchema({type: 'integer', enum: 2})).to.be.false

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

  describe('null', function () {
    it('validate type', function () {
      var schema = {type: 'null'}
      expect(s.validate(null, schema)).to.be.true
      expect(s.validate(undefined, schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate({}, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate([true], schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'null'})).to.be.true
    })
    it('normalize', function () {
      expect(s.normalize(undefined, {type: 'null'})).to.be.null
      expect(s.normalize(null, {type: 'null'})).to.be.null
      expect(s.normalize('3', {type: 'null'})).to.be.null
      expect(s.normalize({}, {type: 'null'})).to.be.null
      expect(s.normalize(undefined, {type: ['string', 'null']})).to.be.null
      expect(s.normalize(undefined, {type: ['null', 'array']})).to.be.null
      expect(s.normalize(undefined, {type: ['array', 'null']})).to.eql([])
      expect(s.normalize([], {type: ['null', 'array']})).to.eql([])
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
      expect(s.validateSchema({type: 'array', items: {type: 'flobnarb'}})).to.be.false
      expect(s.validateSchema({type: 'array'})).to.be.false
    })
    it('normalize', function () {
      // returns empty array
      expect(s.normalize([], {type: 'array', items: {type: 'integer'}})).to.eql([])
      expect(s.normalize(null, {type: 'array', items: {type: 'integer'}})).to.eql([])
      expect(s.normalize(undefined, {type: 'array', items: {type: 'integer'}})).to.eql([])
      expect(s.normalize([], {type: 'array', items: {type: 'integer', default: 3}})).to.eql([])
      expect(s.normalize(null, {type: 'array', items: {type: 'integer', default: 3}})).to.eql([])
      expect(s.normalize(undefined, {type: 'array', items: {type: 'integer', default: 3}})).to.eql([])
      // maps children to their defaults
      expect(s.normalize([null], {type: 'array', items: {type: 'integer', default: 3}})).to.eql([3])
      // ignores undefineds
      expect(s.normalize([3, undefined], {type: 'array', items: {type: 'integer'}})).to.eql([3])
    })
  })

  describe('object', function () {
    it('validate type', function () {
      var schema = {type: 'object', properties: {myInt: {type: 'integer'}}}
      // accepts missing properties
      expect(s.validate({}, schema)).to.be.true
      expect(s.validate({myInt: 1}, schema)).to.be.true

      // rejects additional properties
      expect(s.validate({myInt: 1, another: 2}, schema)).to.be.false

      expect(s.validate({myInt: '1'}, schema)).to.be.false
      expect(s.validate([], schema)).to.be.false
      expect(s.validate('str', schema)).to.be.false
      expect(s.validate(false, schema)).to.be.false
      expect(s.validate(1, schema)).to.be.false
      expect(s.validate(/.*/, schema)).to.be.false
    })
    it('validateSchema', function () {
      expect(s.validateSchema({type: 'object', properties: {myInt: {type: 'integer'}}})).to.be.true
      expect(s.validateSchema({type: 'object', properties: {myInt: {type: 'flobnarb'}}})).to.be.false
      expect(s.validateSchema({type: 'object', properties: {myInt: {type: 'flobnarb'}}})).to.be.false
      expect(s.validateSchema({type: 'object'})).to.be.false
    })
    it('normalize', function () {
      // sets defaults
      expect(s.normalize({}, {type: 'object', properties: {test: {type: 'integer', default: 3}}})).to.eql({test: 3})
      expect(s.normalize(null, {type: 'object', properties: {test: {type: 'integer', default: 3}}})).to.eql({test: 3})
      expect(s.normalize(undefined, {type: 'object', properties: {test: {type: 'integer', default: 3}}})).to.eql({test: 3})
      // ignores empties
      expect(s.normalize({}, {type: 'object', properties: {test: {type: 'integer'}}})).to.eql({})
      expect(s.normalize({test: undefined}, {type: 'object', properties: {test: {type: 'integer'}}})).to.eql({})
      // removes extras
      expect(s.normalize({not: 3}, {type: 'object', properties: {test: {type: 'integer'}}})).to.eql({})
    })
  })

  describe('multiple', function () {
    it('validateSchema', function () {
      expect(s.validateSchema({type: ['integer', 'string']})).to.be.true
      expect(s.validateSchema({type: ['integer']})).to.be.true
      expect(s.validateSchema({type: ['integer', 'string'], max: 3})).to.be.true
      expect(s.validateSchema({type: ['integer', 'flobnarb']})).to.be.false

      expect(s.validateSchema({type: ['integer', 'string'], default: 3})).to.be.true
      expect(s.validateSchema({type: ['integer', 'string'], default: 'test'})).to.be.true

      expect(s.validateSchema({type: ['integer', 'string'], enum: ['test']})).to.be.true
      expect(s.validateSchema({type: ['integer', 'string'], enum: [3]})).to.be.true
      expect(s.validateSchema({type: ['integer', 'string'], enum: [3, 'test']})).to.be.true
    })
    it('validate', function () {
      expect(s.validate(1, {type: ['integer', 'string']})).to.be.true
      expect(s.validate('test', {type: ['integer', 'string']})).to.be.true
      expect(s.validate('test', {type: ['integer', 'string'], max: 4})).to.be.true
      expect(s.validate(5, {type: ['integer', 'string'], max: 4})).to.be.false
      expect(s.validate(false, {type: ['integer', 'string']})).to.be.false
      expect(s.validate({}, {type: ['integer', 'string']})).to.be.false
      expect(s.validate([], {type: ['integer', 'string']})).to.be.false
      expect(s.validate(3.2, {type: ['integer', 'string']})).to.be.false
      expect(s.validate(null, {type: ['integer', 'string']})).to.be.false
    })

    it('normalize', function () {
      // when normalizing undefined, the result should the first in the list not undefined
      expect(s.normalize(undefined, {type: ['integer', 'string']})).to.be.undefined
      expect(s.normalize(undefined, {type: ['array', 'integer']})).to.eql([])
      expect(s.normalize(undefined, {type: ['integer', 'array']})).to.eql([])
      expect(s.normalize(undefined, {type: ['integer', 'array', 'object']})).to.eql([])

      expect(s.normalize(undefined, {type: ['string', 'integer'], default: 3})).to.equal(3)
      expect(s.normalize(undefined, {type: ['string', 'integer'], default: 'test'})).to.equal('test')
      expect(s.normalize(3, {type: ['integer', 'string']})).to.equal(3)
      expect(s.normalize('test', {type: ['integer', 'string']})).to.equal('test')

      expect(s.normalize(3, {type: ['integer', 'string'], enum: [3, 'test']})).to.equal(3)
      expect(s.normalize('test', {type: ['integer', 'string'], enum: [3, 'test']})).to.equal('test')

      expect(s.normalize(3, {type: ['null', 'integer']})).to.equal(3)
    })
  })
})
