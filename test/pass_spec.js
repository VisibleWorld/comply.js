'use strict';

var Schema = require('../lib'),
    PassType = Schema.type.Pass,
    expect = require('chai').expect;

describe('Schema', function() {
    describe('.test()', function () {
        describe('Pass()', function () {

            it('should validate undefined', function () {
                var schema = new Schema({ 'foo': PassType() });

                var result = schema.test({ 'foo': undefined });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(undefined);
            });

            it('should validate null', function () {
                var schema = new Schema({ 'foo': PassType() });

                var result = schema.test({ 'foo': null });

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.be.null;
            });

            it('should validate some value', function () {
                var schema = new Schema({ 'foo': PassType() }),
                    o = { 'foo': 3 };

                var result = schema.test(o);

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(o.foo);
            });

            it('should validate some object', function () {
                var schema = new Schema({ 'foo': PassType() }),
                    o = { 'foo': { 'bar': 6 } };

                var result = schema.test(o);

                expect(result.valid).to.be.true;
                expect(result.object.foo).to.equal(o.foo);
            });

        });
    });
});
