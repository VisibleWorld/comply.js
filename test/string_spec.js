'use strict';

var Schema = require('../lib').Schema,
    String = require('../lib').String,
    expect = require('chai').expect,
    sinon = require('sinon');

describe('Schema', function() {
    describe('.test()', function() {
        describe('String()', function() {

            it('should allow no arguments', function () {
                var schema = new Schema({ 'foo': String() });

                var result = schema.test({'foo': 'abc'});

                expect(result.valid).to.be.true;
            });

            it('should check length with 1 numeric argument', function() {
                var schema = new Schema({
                    'foo': String(5)
                });

                var invalid = schema.test({
                        'foo': '123456'
                    }),
                    valid = schema.test({
                        'foo': '1234'
                    });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check minimum and maximum length with 2 numeric arguments', function() {
                var schema = new Schema({
                    'foo': String(3, 5)
                });

                var minInvalid = schema.test({
                        'foo': '12'
                    }),
                    maxInvalid = schema.test({
                        'foo': '123456'
                    }),
                    valid = schema.test({
                        'foo': '1234'
                    });

                expect(minInvalid.valid).to.be.false;
                expect(maxInvalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should test regex with 1 regex argument', function() {
                var schema = new Schema({
                    'foo': String(/a[0-9]z/)
                });

                var invalid = schema.test({
                        'foo': '000'
                    }),
                    valid = schema.test({
                        'foo': 'a2z'
                    });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should coerce value to string', function () {
                var schema = new Schema({ 'foo': String() });

                var result = schema.test({ 'foo': 10 });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal('10');
            });

            it('should accept variadic arguments as additional validators', function () {
                var v1 = sinon.stub().returns(true),
                    v2 = sinon.stub().returns(true),
                schema = new Schema({ 'foo': String(/a[0-9]z/, v1, v2) });

                var result = schema.test({ 'foo': 'a2z' });

                expect(result.valid).to.be.true;
                sinon.assert.calledOnce(v1);
                sinon.assert.calledOnce(v2);
            });
        });
    });
});
