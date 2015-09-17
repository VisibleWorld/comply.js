/* global describe, it */
/* jshint expr: true */

'use strict';

var Schema = require('../lib');
var dynamicType = Schema.type.Dynamic;
var expect = require('chai').expect;
var sinon = require('sinon');

describe('Schema.type', function() {
    describe('Dynamic()', function() {

        it('should choose rule', function() {
            var v1 = sinon.stub().returns(true);
            var v2 = sinon.stub().returns(true);
            var v1IfValueIs3 = function(value) {
                if (value === 3) {
                    return v1;
                }

                return v2;
            };

            var schema = new Schema({ foo: dynamicType(v1IfValueIs3) });

            schema.test({ foo: 3 });

            sinon.assert.calledOnce(v1);
            expect(v2.callCount).to.equal(0);
        });
    });
});
