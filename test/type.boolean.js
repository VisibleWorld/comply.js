/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var booleanType = Schema.type.Boolean;
var expect = require('chai').expect;

describe('Schema.type', function() {
    describe('Boolean()', function() {
        var schema = new Schema({
            foo: booleanType(),
        });

        it('should allow no arguments', function() {
            var object = {
                foo: true,
            };

            var result = schema.test(object);

            expect(result.valid).to.be.true;
        });

        it('should fail when passed undefined', function() {
            var object = {
                foo: undefined,
            };

            var result = schema.test(object);

            expect(result.valid).to.be.false;
        });

        it('should fail when passed null', function() {
            var object = {
                foo: null,
            };

            var result = schema.test(object);

            expect(result.valid).to.be.false;
        });

        it('should sanitize falsey values to false', function() {
            expect(schema.test({foo: false}).object.foo).to.be.false;
            expect(schema.test({foo: 0}).object.foo).to.be.false;
            expect(schema.test({foo: ''}).object.foo).to.be.false;
            expect(schema.test({foo: NaN}).object.foo).to.be.false;
        });

        it('should sanitize truthy values to true', function() {
            expect(schema.test({foo: true}).object.foo).to.be.true;
            expect(schema.test({foo: 1}).object.foo).to.be.true;
            expect(schema.test({foo: []}).object.foo).to.be.true;
            expect(schema.test({foo: 'abc'}).object.foo).to.be.true;
            expect(schema.test({foo: {}}).object.foo).to.be.true;
        });
    });
});
