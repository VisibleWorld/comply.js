/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var passType = Schema.type.Pass;
var expect = require('chai').expect;

describe('Schema', function() {
    describe('.test()', function() {
        describe('Pass()', function() {

            it('should validate undefined', function() {
                var schema = new Schema({ foo: passType() });

                var result = schema.test({ foo: undefined });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(undefined);
            });

            it('should validate null', function() {
                var schema = new Schema({ foo: passType() });

                var result = schema.test({ foo: null });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.be.null;
            });

            it('should validate some value', function() {
                var schema = new Schema({ foo: passType() });
                var o = { foo: 3 };

                var result = schema.test(o);

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(o.foo);
            });

            it('should validate some object', function() {
                var schema = new Schema({ foo: passType() });
                var o = { foo: { bar: 6 } };

                var result = schema.test(o);

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(o.foo);
            });

        });
    });
});
