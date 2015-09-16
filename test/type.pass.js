/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var passType = Schema.type.Pass;
var expect = require('chai').expect;

describe('Schema.type', function() {
    describe('Pass()', function() {
        var schema = new Schema({ foo: passType() });

        it('should not validate undefined', function() {
            var result = schema.test({ foo: undefined });

            expect(result.valid).to.be.false;
        });

        it('should not validate null', function() {
            var result = schema.test({ foo: null });

            expect(result.valid).to.be.false;
        });

        it('should validate false', function() {
            var result = schema.test({ foo: false });

            expect(result.valid).to.be.true;
        });

        it('should validate 0', function() {
            var result = schema.test({ foo: 0 });

            expect(result.valid).to.be.true;
        });

        it('should validate empty array', function() {
            var result = schema.test({ foo: []});

            expect(result.valid).to.be.true;
        });

        it('should validate some value', function() {
            var o = { foo: 3 };

            var result = schema.test(o);

            expect(result.valid).to.be.true;
            expect(result.object.foo).to.equal(o.foo);
        });

        it('should validate some object', function() {
            var o = { foo: { bar: 6 } };

            var result = schema.test(o);

            expect(result.valid).to.be.true;
            expect(result.object.foo).to.equal(o.foo);
        });

    });
});
