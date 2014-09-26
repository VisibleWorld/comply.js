'use strict';

var Schema = require('../lib'),
    NumberType = Schema.type.Number,
    expect = require('chai').expect,
    sinon = require('sinon');

describe('Schema', function () {
    describe('.test()', function () {
        describe('Number()', function () {

            it('should allow no arguments', function () {
                var schema = new Schema({ 'foo': NumberType() });

                var result = schema.test({ 'foo': 10 });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10);
            });

            it('should coerce value to number', function () {
                var schema = new Schema({ 'foo': NumberType() });

                var result = schema.test({ 'foo': '10' });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10);
            });

            it('should check minimum and maximum with 2 numeric arguments', function () {
                var schema = new Schema({ 'foo': NumberType(5, 10) });

                var minInvalid = schema.test({ 'foo': 3 }),
                    maxInvalid = schema.test({ 'foo': 12 }),
                    valid = schema.test({ 'foo': 7 });

                expect(minInvalid.valid).to.be.false;
                expect(maxInvalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check minimum with integer minimum and wildcard maximum', function () {
                var schema = new Schema({'foo': NumberType(5, '*') });

                var invalid = schema.test({ 'foo': 3 }),
                    valid = schema.test({ 'foo': 32768 });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should check maximum with wildcard minimum and integer maximum', function () {
                var schema = new Schema({ 'foo': NumberType('*', 10) });

                var invalid = schema.test({ 'foo': 12 }),
                    valid = schema.test({ 'foo': 7 });

                expect(invalid.valid).to.be.false;
                expect(valid.valid).to.be.true;
            });

            it('should accept variadic arguments as additional validators', function () {
                var v1 = sinon.stub().returns(true),
                    v2 = sinon.stub().returns(true),
                schema = new Schema({ 'foo': NumberType(1, '*', v1, v2) });

                var result = schema.test({ 'foo': 10});

                expect(result.valid).to.be.true;
                sinon.assert.calledOnce(v1);
                sinon.assert.calledOnce(v2);
            });

            it('should coerce value to float', function () {
                var schema = new Schema({ 'foo': NumberType() });

                var result = schema.test({ 'foo': '10.123' });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(10.123);
            });
        });
    });
});
