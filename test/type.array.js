/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var arrayType = Schema.type.Array;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Array type', function() {
    it('should allow no arguments', function() {
        var schema = new Schema({
            foo: arrayType(),
        });

        var object = {
            foo: [1, 2, 3],
        };

        var result = schema.test(object);

        expect(result.valid).to.be.true;
    });

    it('should check minimum length', function() {
        var schema = new Schema({
            foo: arrayType(2),
        });

        var validObject = {
            foo: [1, 2, 3],
        };

        var invalidObject = {
            foo: [1],
        };

        expect(schema.test(validObject).valid).to.be.true;
        expect(schema.test(invalidObject).valid).to.be.false;
    });

    it('should check minimum and maximum lengths', function() {
        var schema = new Schema({
            foo: arrayType(2, 4),
        });

        var validObject = {
            foo: [1, 2, 3],
        };

        var invalidObject = {
            foo: [1, 2, 3, 4, 5, 6],
        };

        expect(schema.test(validObject).valid).to.be.true;
        expect(schema.test(invalidObject).valid).to.be.false;
    });

    it('should check minimum length and per-element validator', function() {
        var v = sinon.stub().returns(true);

        var schema = new Schema({
            foo: arrayType(2, v),
        });

        var object = {
            foo: [1, 2, 3],
        };

        schema.test(object);

        sinon.assert.calledThrice(v);
    });

    it('should check minimum and maximum lengths and per-element validator', function() {
        var v = sinon.stub().returns(true);

        var schema = new Schema({
            foo: arrayType(2, 4, v),
        });

        var object = {
            foo: [1, 2, 3],
        };

        schema.test(object);

        sinon.assert.calledThrice(v);
    });

    it('should check multiple validators', function() {
        var v1 = sinon.stub().returns(true);
        var v2 = sinon.stub().returns(true);

        var schema = new Schema({
            foo: arrayType(2, 4, v1, v2),
        });

        var object = {
            foo: [1, 2, 3],
        };

        schema.test(object);

        sinon.assert.calledThrice(v1);
        sinon.assert.calledThrice(v2);
    });

    it('should apply schema to elements', function() {
        var v = sinon.stub().returns(true);
        var elementSchema = new Schema({
            bar: v,
        });
        var schema = new Schema({
            foo: arrayType(elementSchema),
        });

        var object = {
            foo: [
                { bar: 1 },
                { bar: 'x' },
                { bar: [] },
            ],
        };

        schema.test(object);

        sinon.assert.calledThrice(v);
        sinon.assert.calledWith(v, 1);
        sinon.assert.calledWith(v, 'x');
        sinon.assert.calledWith(v, []);
    });

    it('should check that target is array', function() {
        var schema = new Schema({
            foo: arrayType(),
        });

        var validObject = {
            foo: [],
        };

        var invalidObject = {
            foo: 1,
        };

        expect(schema.test(validObject).valid).to.be.true;
        expect(schema.test(invalidObject).valid).to.be.false;
    });

    it('should coerce target to array', function() {
        var schema = new Schema({
            foo: arrayType(),
        });

        var normalArray = {
            foo: [],
        };

        var pseudoArray = (function() {
            return {
                foo: arguments,
            };
        })();

        expect(schema.test(normalArray).object.foo).to.be.instanceof(Array);
        expect(schema.test(pseudoArray).object.foo).to.be.instanceof(Array);
    });
});
