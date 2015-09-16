/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var numberType = Schema.type.Number;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Schema', function() {
    describe('.test()', function() {
        describe('Number()', function() {

            it('should allow no arguments', function() {
                var schema = new Schema({ foo: numberType() });

                var result = schema.test({ foo: 10 });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10);
            });

            it('should coerce value to number', function() {
                var schema = new Schema({ foo: numberType() });

                var result = schema.test({ foo: '10' });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10);
            });

            it('should check minimum and maximum with 2 numeric arguments', function() {
                var schema = new Schema({ foo: numberType(5, 10) });

                var minInvalid = schema.test({ foo: 3 });
                var maxInvalid = schema.test({ foo: 12 });
                var valid = schema.test({ foo: 7 });

                expect(minInvalid.valid).to.be.false;
                expect(maxInvalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check minimum with integer minimum', function() {
                var schema = new Schema({foo: numberType(2)});

                var invalid = schema.test({ foo: 1 });
                var valid = schema.test({ foo: 3 });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check minimum with integer minimum and wildcard maximum', function() {
                var schema = new Schema({foo: numberType(5, '*') });

                var invalid = schema.test({ foo: 3 });
                var valid = schema.test({ foo: 32768 });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check maximum with wildcard minimum and integer maximum', function() {
                var schema = new Schema({ foo: numberType('*', 10) });

                var invalid = schema.test({ foo: 12 });
                var valid = schema.test({ foo: 7 });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should accept variadic arguments as additional validators', function() {
                var v1 = sinon.stub().returns(true);
                var v2 = sinon.stub().returns(true);
                var schema = new Schema({ foo: numberType(1, '*', v1, v2) });

                var result = schema.test({ foo: 10});

                expect(result.valid).to.be.true;
                sinon.assert.calledOnce(v1);
                sinon.assert.calledOnce(v2);
            });

            it('should ignore non-function variadic arguments as additional validators', function() {
                var v1 = sinon.stub().returns(true);
                var v2 = sinon.stub().returns(true);
                var schema = new Schema({
                    foo: numberType(1, '*', v1, 2, undefined, false, v2, []),
                });
                var obj = {
                    foo: 3,
                };

                var result = schema.test(obj);

                expect(result.valid).to.be.true;
                sinon.assert.calledOnce(v1);
                sinon.assert.calledWith(v1, 3);
                sinon.assert.calledOnce(v2);
                sinon.assert.calledWith(v2, 3);
            });

            it('should coerce value to float', function() {
                var schema = new Schema({ foo: numberType() });

                var result = schema.test({ foo: '10.123' });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10.123);
            });

            it('should fail when passed NaN', function() {
                var schema = new Schema({ foo: numberType() });

                var result = schema.test({ foo: NaN});

                expect(result.valid).to.be.false;
            });

            it('should fail when passed a string', function() {
                var schema = new Schema({ foo: numberType() });

                var result = schema.test({ foo: 'random string'});

                expect(result.valid).to.be.false;
            });
        });
    });
});
